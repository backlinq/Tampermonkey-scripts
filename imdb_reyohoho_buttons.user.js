// ==UserScript==
// @name         IMDb Custom Button
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  Add custom button to IMDb pages for elderly users
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

    function insertCustomButton() {
        const currentUrl = window.location.href;

        // Check if we're on a chart page
        if (currentUrl.includes('/chart/')) {
            addButtonsToChartPage();
        } else {
            // Regular title page
            addButtonToTitlePage();
        }
    }

    function addButtonToTitlePage() {
        if (document.querySelector('[data-custom-imdb-button]')) return;

        // Extract IMDb ID from URL
        const imdbId = window.location.pathname.match(/tt\d+/)[0];
        const button = createButton(imdbId);
        button.setAttribute('data-custom-imdb-button', 'true');

        // Try multiple locations to insert the button
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
                // Create a container to hold button and title
                const container = document.createElement('div');
                container.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 10px;
                    flex-wrap: wrap;
                `;

                // Wrap the title and insert button
                titleElement.parentNode.insertBefore(container, titleElement);
                container.appendChild(titleElement);
                container.appendChild(button); // Button AFTER title
                buttonsAdded = true;
                processedMovies.add(imdbId);
                return;
            }
        }

        // Fallback for title page
        const fallbackContainer = document.querySelector('.sc-5be2ae66-0') ||
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
            buttonsAdded = true;
            processedMovies.add(imdbId);
        }
    }

    function addButtonsToChartPage() {
        // Find all movie links in the chart that haven't been processed
        const movieLinks = document.querySelectorAll('a[href*="/title/tt"]');

        let addedAnyButtons = false;

        movieLinks.forEach((link) => {
            const href = link.getAttribute('href');
            const imdbIdMatch = href.match(/tt\d+/);

            if (imdbIdMatch) {
                const imdbId = imdbIdMatch[0];

                // Skip if already processed
                if (processedMovies.has(imdbId)) return;

                // Check if this link is one of the main movie links we want
                if (isMainMovieLink(link)) {
                    // Check if button already exists for this specific movie element
                    const movieContainer = link.closest('.ipc-lockup, .ipc-metadata-list-summary-item, .ipc-poster-card, [data-testid*="chart"]');
                    if (movieContainer && movieContainer.querySelector('[data-custom-imdb-button]')) {
                        processedMovies.add(imdbId);
                        return;
                    }

                    const button = createButton(imdbId);
                    button.setAttribute('data-custom-imdb-button', 'true');

                    // Style for chart page - smaller but still visible
                    button.style.cssText += `
                        width: 50px;
                        height: 50px;
                        margin-left: 10px;
                        margin-right: 0;
                        flex-shrink: 0;
                        display: inline-block;
                    `;

                    // Insert button AFTER the title/link
                    if (insertButtonAfterTitle(link, button)) {
                        processedMovies.add(imdbId);
                        addedAnyButtons = true;
                    }
                }
            }
        });

        if (addedAnyButtons) {
            buttonsAdded = true;
        }
    }

    function isMainMovieLink(link) {
        // Check if this is one of the primary movie link types we want to target
        const classList = link.classList;

        return (
            // Overlay links (primary click target)
            classList.contains('ipc-lockup-overlay') ||
            // Title wrapper links
            classList.contains('ipc-title-link-wrapper') ||
            // Poster links
            classList.contains('ipc-poster-card') ||
            // Primary poster links
            classList.contains('ipc-primary-image-link') ||
            // Check if it's in a main chart item
            link.closest('.ipc-metadata-list-summary-item') ||
            link.closest('.ipc-poster-card') ||
            link.closest('.ipc-lockup') ||
            link.closest('[data-testid="chart-layout-main-column"]') ||
            // Fallback: check if it contains a title element
            link.querySelector('h3') ||
            link.querySelector('[data-testid="title"]')
        );
    }

    function insertButtonAfterTitle(link, button) {
        const linkClasses = link.classList;

        try {
            // Handle title wrapper links - insert after the title
            if (linkClasses.contains('ipc-title-link-wrapper')) {
                link.parentNode.insertBefore(button, link.nextSibling);
                return true;
            }
            // Handle overlay links - insert in the title area after the title text
            else if (linkClasses.contains('ipc-lockup-overlay')) {
                const titleElement = findTitleElement(link);
                if (titleElement && titleElement.parentNode) {
                    titleElement.parentNode.insertBefore(button, titleElement.nextSibling);
                    button.style.marginLeft = '10px';
                    return true;
                } else {
                    // Fallback: insert after the container
                    const container = link.closest('.ipc-lockup') || link.closest('.ipc-poster-card') || link.parentElement;
                    if (container && container.parentNode) {
                        container.parentNode.insertBefore(button, container.nextSibling);
                        return true;
                    }
                }
            }
            // Handle poster cards - insert after the poster container
            else if (linkClasses.contains('ipc-poster-card') || linkClasses.contains('ipc-primary-image-link')) {
                const container = link.closest('.ipc-poster-card') || link.parentElement;
                if (container && container.parentNode) {
                    container.parentNode.insertBefore(button, container.nextSibling);
                    return true;
                }
            }
            // Fallback: insert after the link
            else if (link.parentNode) {
                link.parentNode.insertBefore(button, link.nextSibling);
                return true;
            }
        } catch (e) {
            console.log('Error inserting button:', e);
        }

        return false;
    }

    function findTitleElement(link) {
        // Find the title element within the same movie card
        const container = link.closest('.ipc-lockup') || link.closest('.ipc-metadata-list-summary-item') || link.closest('.ipc-poster-card');
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

        // Base button styles
        button.style.cssText = `
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background-image: url('https://i.ibb.co/7Nzq0H4t/avatar.png');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            border: 3px solid #fff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            margin-right: 15px;
            vertical-align: middle;
            flex-shrink: 0;
        `;

        // Add hover effects
        button.addEventListener('mouseover', function() {
            this.style.transform = 'scale(1.1)';
            this.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
        });

        button.addEventListener('mouseout', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        });

        // Add click effect
        button.addEventListener('click', function(e) {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });

        return button;
    }

    // Function to scan for new movies periodically
    function startContinuousScan() {
        // Initial scan
        insertCustomButton();

        // Set up continuous scanning for dynamic content
        setInterval(() => {
            if (window.location.href.includes('/chart/')) {
                addButtonsToChartPage();
            }
        }, 1000); // Scan every second for new content

        // Also scan when user scrolls (for infinite scroll)
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (window.location.href.includes('/chart/')) {
                    addButtonsToChartPage();
                }
            }, 300);
        });
    }

    // Try to insert immediately with retries
    let attempts = 0;
    const maxAttempts = 3;

    function tryInsert() {
        if (document.body) {
            startContinuousScan();
        } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(tryInsert, 100);
        }
    }

    // Start immediately
    tryInsert();

    // Also watch for dynamic content changes
    const observer = new MutationObserver(function(mutations) {
        const hasNewContent = mutations.some(mutation =>
            mutation.addedNodes && mutation.addedNodes.length > 0
        );

        if (hasNewContent) {
            // Use a debounce to avoid multiple rapid executions
            clearTimeout(window.customButtonTimeout);
            window.customButtonTimeout = setTimeout(() => {
                if (window.location.href.includes('/chart/')) {
                    addButtonsToChartPage();
                }
            }, 500);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Re-initialize when navigating (for SPA)
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            // Reset and re-scan on navigation
            buttonsAdded = false;
            processedMovies.clear();
            setTimeout(() => {
                startContinuousScan();
            }, 1000);
        }
    }).observe(document, { subtree: true, childList: true });

})();
