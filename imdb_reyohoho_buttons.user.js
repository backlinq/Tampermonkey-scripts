// ==UserScript==
// @name         IMDb Custom Button (Delayed Injection)
// @namespace    http://tampermonkey.net/
// @version      1.9
// @description  Add custom button to IMDb pages for elderly users (with delay and optimized injection)
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

    let buttonsAdded = false;
    let processedMovies = new Set();
    let observerStarted = false;

    // Add a small delay before scanning to give browsers time to load DOM
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            startInjection();
        }, 1500); // 1.5s delay
    });

    function startInjection() {
        if (observerStarted) return;
        observerStarted = true;

        insertCustomButton();
        setupMutationObserver();
    }

    function setupMutationObserver() {
        const observer = new MutationObserver(debounce(() => {
            insertCustomButton();
        }, 500));

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function insertCustomButton() {
        const currentUrl = window.location.href;
        if (currentUrl.includes('/chart/')) {
            addButtonsToChartPage();
        } else {
            addButtonToTitlePage();
        }
    }

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

    function addButtonsToChartPage() {
        const movieLinks = document.querySelectorAll('a[href*="/title/tt"]');
        let addedAnyButtons = false;

        movieLinks.forEach(link => {
            const imdbIdMatch = link.getAttribute('href').match(/tt\d+/);
            if (!imdbIdMatch) return;
            const imdbId = imdbIdMatch[0];

            if (processedMovies.has(imdbId)) return;
            if (isMainMovieLink(link)) {
                const movieContainer = link.closest('.ipc-lockup, .ipc-metadata-list-summary-item, .ipc-poster-card, [data-testid*="chart"]');
                if (movieContainer && movieContainer.querySelector('[data-custom-imdb-button]')) {
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

        if (addedAnyButtons) {
            buttonsAdded = true;
        }
    }

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
                const container = link.closest('.ipc-poster-card') || link.parentElement;
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

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

})();
