// ==UserScript==
// @name         IMDb Custom Button
// @namespace    http://tampermonkey.net/
// @version      1.9
// @description  Add custom button to IMDb pages for elderly users
// @author       You
// @match        https://www.imdb.com/title/tt*
// @match        https://www.imdb.com/title/tt*/*
// @match        https://www.imdb.com/chart/*
// @match        https://www.imdb.com/chart/*/*
// @icon         https://www.imdb.com/favicon.ico
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';
    
    // Add CSS styles for better cross-browser compatibility
    const css = `
        .custom-imdb-button {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 70px !important;
            height: 70px !important;
            border-radius: 50% !important;
            background-image: url('https://i.ibb.co/7Nzq0H4t/avatar.png') !important;
            background-size: cover !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
            border: 3px solid #fff !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
            text-decoration: none !important;
            margin-right: 15px !important;
            vertical-align: middle !important;
            flex-shrink: 0 !important;
            z-index: 10000 !important;
        }
        .custom-imdb-button:hover {
            transform: scale(1.1) !important;
            box-shadow: 0 6px 16px rgba(0,0,0,0.4) !important;
        }
        .custom-imdb-button:active {
            transform: scale(0.95) !important;
        }
        .custom-imdb-button.chart-size {
            width: 50px !important;
            height: 50px !important;
            margin-left: 10px !important;
            margin-right: 0 !important;
        }
        @media (prefers-reduced-motion: reduce) {
            .custom-imdb-button {
                transition: none !important;
            }
        }
    `;
    
    // Add styles to document
    if (typeof GM_addStyle !== "undefined") {
        GM_addStyle(css);
    } else {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }
    
    let buttonsAdded = false;
    let processedMovies = new Set();
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        setTimeout(() => {
            insertCustomButton();
            startContinuousScan();
            setupObservers();
        }, 100);
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
        if (document.querySelector('.custom-imdb-button')) return;
        
        const imdbId = window.location.pathname.match(/tt\d+/)?.[0];
        if (!imdbId) return;
        
        const button = createButton(imdbId);
        
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
                buttonsAdded = true;
                processedMovies.add(imdbId);
                return;
            }
        }
        
        // Fallback
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
        const movieLinks = document.querySelectorAll('a[href*="/title/tt"]');
        let addedAnyButtons = false;
        
        movieLinks.forEach((link) => {
            const href = link.getAttribute('href');
            const imdbIdMatch = href.match(/tt\d+/);
            
            if (imdbIdMatch) {
                const imdbId = imdbIdMatch[0];
                
                if (processedMovies.has(imdbId)) return;
                
                if (isMainMovieLink(link)) {
                    const movieContainer = link.closest('.ipc-lockup, .ipc-metadata-list-summary-item, .ipc-poster-card, [data-testid*="chart"]');
                    if (movieContainer && movieContainer.querySelector('.custom-imdb-button')) {
                        processedMovies.add(imdbId);
                        return;
                    }
                    
                    const button = createButton(imdbId);
                    button.classList.add('chart-size');
                    
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
        const linkClasses = link.classList;
        
        try {
            if (linkClasses.contains('ipc-title-link-wrapper')) {
                link.parentNode.insertBefore(button, link.nextSibling);
                return true;
            }
            else if (linkClasses.contains('ipc-lockup-overlay')) {
                const titleElement = findTitleElement(link);
                if (titleElement && titleElement.parentNode) {
                    titleElement.parentNode.insertBefore(button, titleElement.nextSibling);
                    return true;
                } else {
                    const container = link.closest('.ipc-lockup') || link.closest('.ipc-poster-card') || link.parentElement;
                    if (container && container.parentNode) {
                        container.parentNode.insertBefore(button, container.nextSibling);
                        return true;
                    }
                }
            }
            else if (linkClasses.contains('ipc-poster-card') || linkClasses.contains('ipc-primary-image-link')) {
                const container = link.closest('.ipc-poster-card') || link.parentElement;
                if (container && container.parentNode) {
                    container.parentNode.insertBefore(button, container.nextSibling);
                    return true;
                }
            }
            else if (link.parentNode) {
                link.parentNode.insertBefore(button, link.nextSibling);
                return true;
            }
        } catch (e) {
            console.warn('Error inserting button:', e);
        }
        
        return false;
    }
    
    function findTitleElement(link) {
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
        button.className = 'custom-imdb-button';
        
        // Add click effect
        button.addEventListener('click', function(e) {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
        
        return button;
    }
    
    function startContinuousScan() {
        insertCustomButton();
        
        const scanInterval = setInterval(() => {
            if (window.location.href.includes('/chart/')) {
                addButtonsToChartPage();
            }
        }, 1000);
        
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (window.location.href.includes('/chart/')) {
                    addButtonsToChartPage();
                }
            }, 300);
        });
        
        // Stop scanning if page changes
        window.addEventListener('beforeunload', () => {
            clearInterval(scanInterval);
        });
    }
    
    function setupObservers() {
        const observer = new MutationObserver((mutations) => {
            const hasNewContent = mutations.some(mutation => 
                mutation.addedNodes && mutation.addedNodes.length > 0
            );
            
            if (hasNewContent) {
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
        
        // SPA navigation detection
        let lastUrl = location.href;
        const navObserver = new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                buttonsAdded = false;
                processedMovies.clear();
                setTimeout(() => {
                    startContinuousScan();
                }, 1000);
            }
        });
        
        navObserver.observe(document, { 
            subtree: true, 
            childList: true 
        });
    }
    
})();
