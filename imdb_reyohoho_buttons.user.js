// ==UserScript==
// @name         IMDb Custom Button Failsafe Version
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  More reliable IMDb custom button script with multiple fallback methods for various browsers and page content loads
// @author       You
// @match        https://www.imdb.com/title/tt*
// @match        https://www.imdb.com/title/tt*/*
// @match        https://www.imdb.com/chart/*
// @match        https://www.imdb.com/chart/*/*
// @icon         https://www.imdb.com/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let processedMovies = new Set();
    let injectionAttempts = 0;
    const maxRetries = 5;
    let observerInitialized = false;

    // Start after DOM loaded + small delay for safety
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            initFailsafeInjection();
        }, 2000); // 2 seconds delay
    });

    // Main entry for failsafe injection
    function initFailsafeInjection() {
        // Avoid multiple initializations
        if (observerInitialized) return;
        observerInitialized = true;

        // Initial injection
        injectButtons();

        // Set up a mutation observer for dynamic loading
        setupMutationObserver();

        // Set up periodic retries as fallback
        retryInjectionPeriodically();

        // Monitor for SPA navigation
        monitorNavigation();
    }

    // Inject buttons based on current page
function injectButtons() {
    // Determine page type
    if (window.location.href.includes('/chart/')) {
        addButtonsToChartPage();
    } else {
        addButtonToTitlePage();
    }
}

// Retry function for delayed, multiple attempts
function retryInjectionPeriodically() {
    if (processedMovies.size >= 50 || injectionAttempts >= maxRetries) return;
    setTimeout(() => {
        injectButtons();
        injectionAttempts++;
        retryInjectionPeriodically();
    }, 1500); // every 1.5 seconds
}

// Set up mutation observer for dynamic content
function setupMutationObserver() {
    if (typeof MutationObserver === 'undefined') return; // skip if not supported
    const observer = new MutationObserver(() => {
        injectButtons(); // try to inject on DOM changes
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Monitoring navigation changes in SPA (like IMDb)
function monitorNavigation() {
    let lastUrl = location.href;
    new MutationObserver(() => {
        const currentUrl = location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            // Clear found movies for new page
            processedMovies.clear();
            // Retry injection after navigation
            setTimeout(() => {
                injectButtons();
            }, 1500);
        }
    }).observe(document, { subtree: true, childList: true });
}

// Add button to title page
function addButtonToTitlePage() {
    if (document.querySelector('[data-custom-imdb-button]')) return;

    const imdbIdMatch = window.location.pathname.match(/tt\d+/);
    if (!imdbIdMatch) return;
    const imdbId = imdbIdMatch[0];

    const button = createButton(imdbId);
    button.setAttribute('data-custom-imdb-button', 'true');

    const selectors = [
        '[data-testid="hero-title-block__title"]',
        '.hero__title',
        '.title_wrapper h1',
        'h1[data-testid*="title"]',
        'h1'
    ];

    for (const selector of selectors) {
        const titleElement = document.querySelector(selector);
        if (titleElement) {
            const container = document.createElement('div');
            container.style.cssText = `
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 10px;
                flex-wrap: wrap;
            `;
            titleElement.parentNode.insertBefore(container, titleElement);
            container.appendChild(titleElement);
            container.appendChild(button);
            processedMovies.add(imdbId);
            return;
        }
    }

    // fallback if main selectors not found
    const fallbackContainer =
        document.querySelector('.sc-5be2ae66-0') ||
        document.querySelector('.title-overview') ||
        document.querySelector('.titleBar') ||
        document.body;

    if (fallbackContainer) {
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 15px;
            flex-wrap: wrap;
        `;
        container.appendChild(button);
        fallbackContainer.insertBefore(container, fallbackContainer.firstChild);
        processedMovies.add(imdbId);
    }
}

// Add buttons to chart pages
function addButtonsToChartPage() {
    const movieLinks = document.querySelectorAll('a[href*="/title/tt"]');
    let addedAnyButtons = false;

    movieLinks.forEach(link => {
        const imdbIdMatch = link.getAttribute('href').match(/tt\d+/);
        if (!imdbIdMatch) return;

        const imdbId = imdbIdMatch[0];

        if (processedMovies.has(imdbId)) return;
        if (isMainMovieLink(link)) {
            const container = link.closest('.ipc-lockup, .ipc-metadata-list-summary-item, .ipc-poster-card, [data-testid*="chart"]');
            if (container && container.querySelector('[data-custom-imdb-button]')) {
                processedMovies.add(imdbId);
                return;
            }

            const button = createButton(imdbId);
            button.setAttribute('data-custom-imdb-button', 'true');
            button.style.cssText += `
                width: 50px;
                height: 50px;
                margin-left: 10px;
                flex-shrink: 0;
            `;

            if (insertButtonAfterTitle(link, button)) {
                processedMovies.add(imdbId);
                addedAnyButtons = true;
            }
        }
    });
}

// Helper functions (same as before)
function isMainMovieLink(link) {
    const classList = link.classList;
    return (
        classList.contains('ipc-lockup-overlay') ||
        classList.contains('ipc-title-link-wrapper') ||
        classList.contains('ipc-poster-card') ||
        classList.contains('ipc-primary-image-link') ||
        link.closest('.ipc-metadata-list-summary-item') ||
        link.closest('.ipc-poster-card') ||
        link.closest('.ipc-lockup') ||
        link.closest('[data-testid="chart-layout-main-column"]') ||
        link.querySelector('h3') ||
        link.querySelector('[data-testid="title"]')
    );
}

function insertButtonAfterTitle(link, button) {
    try {
        const linkClasses = link.classList;
        if (linkClasses.contains('ipc-title-link-wrapper')) {
            link.parentNode.insertBefore(button, link.nextSibling);
            return true;
        } else if (linkClasses.contains('ipc-lockup-overlay')) {
            const titleElement = findTitleElement(link);
            if (titleElement && titleElement.parentNode) {
                titleElement.parentNode.insertBefore(button, titleElement.nextSibling);
                return true;
            }
        } else if (linkClasses.contains('ipc-poster-card') || linkClasses.contains('ipc-primary-image-link')) {
            const container = link.closest('.ipc-poster-card') || link.parentNode;
            if (container && container.parentNode) {
                container.parentNode.insertBefore(button, container.nextSibling);
                return true;
            }
        } else if (link.parentNode) {
            link.parentNode.insertBefore(button, link.nextSibling);
            return true;
        }
    } catch (e) {
        console.log('Error inserting button:', e);
    }
    return false;
}

function findTitleElement(link) {
    const container = link.closest('.ipc-lockup') ||
                      link.closest('.ipc-metadata-list-summary-item') ||
                      link.closest('.ipc-poster-card');
    if (container) {
        return container.querySelector('h3') ||
               container.querySelector('[data-testid="title"]') ||
               container.querySelector('.ipc-title__text');
    }
    return null;
}

function createButton(imdbId) {
    const button = document.createElement('a');
    button.href = `https://reyohoho-gitlab.vercel.app/#imdb=${imdbId}`;
    button.target = '_blank';
    button.style.cssText = `
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 70px;
        height: 70px;
        border-radius: 50%;
        background-image: url('https://i.ibb.co/7Nzq0H4t/avatar.png');
        background-size: cover;
        border: 3px solid #fff;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
        margin-right: 15px;
    `;
    // hover effects
    button.addEventListener('mouseover', () => {
        button.style.transform = 'scale(1.1)';
    });
    button.addEventListener('mouseout', () => {
        button.style.transform = 'scale(1)';
    });
    button.addEventListener('click', () => {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => button.style.transform = 'scale(1)', 150);
    });
    return button;
}
