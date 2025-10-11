// ==UserScript==
// @name         IMDb Enhanced View Button
// @namespace    http://tampermonkey.net/
// @version      2.22
// @description  Add one-click access to enhanced movie view for better readability and experience
// @author       You
// @match        https://www.imdb.com/*
// @match        https://*.imdb.com/*
// @match        https://imdb.com/*
// @match        https://www-imdb-com.translate.goog/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let buttonsAdded = false;
    let processedMovies = new Set();

    // Check if current page is supported
    function isSupportedPage() {
        const path = window.location.pathname;
        return path.includes('/title/tt') || path.includes('/chart/');
    }

    function insertCustomButton() {
        if (!isSupportedPage()) return;

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

        // Try multiple locations to insert the button
        const selectors = [
            '[data-testid="hero-title-block__title"]',
            '.hero__title',
            '.title_wrapper h1',
            'h1[data-testid*="title"]',
            'h1',
            '.sc-b5e8e7ce-0',
            '.ipc-title__text'
        ];

        for (const selector of selectors) {
            const titleElement = document.querySelector(selector);
            if (titleElement && titleElement.textContent && titleElement.textContent.trim().length > 0) {
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
                buttonsAdded = true;
                processedMovies.add(imdbId);
                return;
            }
        }

        // Fallback for title page
        const fallbackContainers = [
            '.sc-b5e8e7ce-0',
            '.sc-5be2ae66-0',
            '.title-overview',
            '.titleBar',
            '.ipc-page-content-container',
            '[data-testid="hero-title-block"]'
        ];

        for (const containerSelector of fallbackContainers) {
            const container = document.querySelector(containerSelector);
            if (container) {
                const buttonContainer = document.createElement('div');
                buttonContainer.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 15px;
                    flex-wrap: wrap;
                `;
                buttonContainer.appendChild(button);
                container.insertBefore(buttonContainer, container.firstChild);
                buttonsAdded = true;
                processedMovies.add(imdbId);
                return;
            }
        }
    }

    function addButtonsToChartPage() {
        const movieSelectors = [
            '.ipc-metadata-list-summary-item',
            '.ipc-poster-card',
            '.ipc-lockup',
            '.lister-list tr',
            '[data-testid*="chart"] li',
            '.titleColumn',
            '.sc-b5e8e7ce-0'
        ];

        movieSelectors.forEach(selector => {
            const movieItems = document.querySelectorAll(selector);

            movieItems.forEach((item, index) => {
                const links = item.querySelectorAll('a[href*="/title/tt"]');

                links.forEach(link => {
                    const href = link.getAttribute('href');
                    const imdbIdMatch = href.match(/tt\d+/);

                    if (imdbIdMatch) {
                        const imdbId = imdbIdMatch[0];

                        if (processedMovies.has(imdbId)) return;

                        if (isMainMovieLink(link, item)) {
                            if (item.querySelector('[data-custom-imdb-button]')) {
                                processedMovies.add(imdbId);
                                return;
                            }

                            const button = createButton(imdbId);
                            button.setAttribute('data-custom-imdb-button', 'true');

                            button.style.cssText += `
                                width: 50px;
                                height: 50px;
                                margin-left: 10px;
                                margin-right: 0;
                                flex-shrink: 0;
                                display: inline-flex;
                                align-items: center;
                                justify-content: center;
                                border-radius: 8px;
                            `;

                            if (insertButtonInChartItem(item, link, button)) {
                                processedMovies.add(imdbId);
                                buttonsAdded = true;
                            }
                        }
                    }
                });
            });
        });
    }

    function isMainMovieLink(link, container) {
        const classList = link.classList;
        const href = link.getAttribute('href');

        const isBanned = href.includes('/reference') ||
                        href.includes('/keywords') ||
                        href.includes('/reviews') ||
                        href.includes('/trivia') ||
                        href.includes('/externalreviews');

        return !isBanned && (
            classList.contains('ipc-lockup-overlay') ||
            classList.contains('ipc-title-link-wrapper') ||
            classList.contains('ipc-poster-card') ||
            classList.contains('ipc-primary-image-link') ||
            classList.contains('sc-b5e8e7ce-0') ||
            container.querySelector('h3') ||
            container.querySelector('[data-testid="title"]') ||
            container.querySelector('.ipc-title__text') ||
            container.closest('.ipc-metadata-list-summary-item') ||
            container.closest('.ipc-poster-card') ||
            container.closest('.ipc-lockup') ||
            container.closest('.lister-list') ||
            container.closest('.sc-b5e8e7ce-0')
        );
    }

    function insertButtonInChartItem(item, link, button) {
        try {
            const titleSelectors = [
                'h3',
                '.ipc-title__text',
                '[data-testid="title"]',
                'a[href*="/title/tt"]',
                '.titleColumn a'
            ];

            for (const selector of titleSelectors) {
                const titleElement = item.querySelector(selector);
                if (titleElement && titleElement.textContent && titleElement.textContent.trim().length > 0) {
                    titleElement.parentNode.insertBefore(button, titleElement.nextSibling);
                    return true;
                }
            }

            item.appendChild(button);
            return true;

        } catch (e) {
            return false;
        }
    }

    function createButton(imdbId) {
        const reUrl = `https://reyohoho-gitlab.vercel.app/#imdb=${imdbId}`;
        const imageUrl = 'https://i.ibb.co/DH41jFJz/15193c61816da2c6ad602e627b01c926.jpg';

        const button = document.createElement('a');
        button.href = reUrl;
        button.target = '_blank';
        button.title = 'Open in Enhanced View';

        button.setAttribute('data-re-url', reUrl);
        button.setAttribute('data-imdb-id', imdbId);

        button.style.cssText = `
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 70px;
            height: 70px;
            border-radius: 8px;
            background-image: url('${imageUrl}');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            border: 3px solid #fff;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            margin-right: 15px;
            vertical-align: middle;
            flex-shrink: 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        `;

        button.addEventListener('mouseover', function() {
            this.style.transform = 'scale(1.1)';
            this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
        });

        button.addEventListener('mouseout', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        });

        return button;
    }

    function startContinuousScan() {
        if (!isSupportedPage()) return;

        // Initial scan
        insertCustomButton();

        // Optimized scanning for chart pages
        if (window.location.href.includes('/chart/')) {
            // Reduced scanning intervals
            setTimeout(() => addButtonsToChartPage(), 500);
            setTimeout(() => addButtonsToChartPage(), 1500);
            
            // Less frequent continuous scanning
            setInterval(() => {
                addButtonsToChartPage();
            }, 3000);
        }

        // Throttled scroll-based scanning
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (window.location.href.includes('/chart/')) {
                    addButtonsToChartPage();
                }
            }, 800);
        });
    }

    // Initialize
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startContinuousScan);
        } else {
            startContinuousScan();
        }
    }

    init();

    // Optimized MutationObserver
    const observer = new MutationObserver(function(mutations) {
        if (!isSupportedPage()) return;

        let shouldRescan = false;
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                shouldRescan = true;
                break;
            }
        }

        if (shouldRescan) {
            clearTimeout(window.customButtonTimeout);
            window.customButtonTimeout = setTimeout(() => {
                if (window.location.href.includes('/chart/')) {
                    addButtonsToChartPage();
                } else {
                    addButtonToTitlePage();
                }
            }, 500);
        }
    });

    // Start observing when body is available
    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Handle SPA navigation
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            buttonsAdded = false;
            processedMovies.clear();

            setTimeout(() => {
                if (isSupportedPage()) {
                    startContinuousScan();
                }
            }, 1000);
        }
    }).observe(document, { subtree: true, childList: true });

})();
