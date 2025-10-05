// ==UserScript==
// @name         IMDb Custom Button
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Add custom button to IMDb pages for elderly users
// @author       You
// @match        https://www.imdb.com/title/tt*
// @match        https://www.imdb.com/title/tt*/*
// @match        https://www.imdb.com/chart/*
// @match        https://www.imdb.com/chart/*/*
// @icon         https://www.imdb.com/favicon.ico
// @grant        GM_addStyle
// @grant        GM.xmlHttpRequest
// @run-at       document-start
// @noframes
// ==/UserScript==

(function() {
    'use strict';
    
    // Multiple initialization methods for cross-browser compatibility
    const initMethods = [
        // Method 1: DOMContentLoaded (standard)
        function() {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initializeScript);
            } else {
                initializeScript();
            }
        },
        
        // Method 2: window.onload (fallback)
        function() {
            window.addEventListener('load', initializeScript);
        },
        
        // Method 3: Direct execution with timeout (aggressive fallback)
        function() {
            setTimeout(initializeScript, 1000);
        },
        
        // Method 4: MutationObserver for dynamic content (modern browsers)
        function() {
            if (document.body) {
                initializeScript();
            } else {
                const bodyObserver = new MutationObserver(function(mutations, observer) {
                    if (document.body) {
                        observer.disconnect();
                        setTimeout(initializeScript, 100);
                    }
                });
                bodyObserver.observe(document.documentElement, { childList: true, subtree: true });
            }
        }
    ];
    
    // Try all initialization methods
    function initializeWithFallbacks() {
        for (let i = 0; i < initMethods.length; i++) {
            try {
                initMethods[i]();
                console.log('IMDb Custom Button: Initialization method', i + 1, 'executed');
                break;
            } catch (e) {
                console.warn('IMDb Custom Button: Initialization method', i + 1, 'failed:', e);
                // Continue to next method
            }
        }
    }
    
    // Start the initialization process
    if (typeof GM_info !== 'undefined') {
        // Running in Tampermonkey
        initializeWithFallbacks();
    } else {
        // Fallback for direct script injection
        window.addEventListener('load', initializeScript);
    }
    
    // Main script functionality
    function initializeScript() {
        // Prevent multiple initializations
        if (window.imdbCustomButtonInitialized) return;
        window.imdbCustomButtonInitialized = true;
        
        console.log('IMDb Custom Button: Initializing script');
        
        // Add CSS with multiple methods
        injectStyles();
        
        // Start the main functionality
        setTimeout(main, 50);
    }
    
    function injectStyles() {
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
        
        // Method 1: GM_addStyle (Tampermonkey)
        if (typeof GM_addStyle !== "undefined") {
            try {
                GM_addStyle(css);
                return;
            } catch (e) {
                console.warn('GM_addStyle failed, using fallback');
            }
        }
        
        // Method 2: Standard style element
        try {
            const style = document.createElement('style');
            style.type = 'text/css';
            style.textContent = css;
            
            // Multiple injection points
            const injectionPoints = [
                () => document.head.appendChild(style),
                () => document.documentElement.appendChild(style),
                () => document.body.appendChild(style)
            ];
            
            for (const inject of injectionPoints) {
                try {
                    inject();
                    break;
                } catch (e) {
                    // Continue to next injection point
                }
            }
        } catch (e) {
            console.error('All CSS injection methods failed');
        }
    }
    
    // Main script logic
    function main() {
        let buttonsAdded = false;
        let processedMovies = new Set();
        let scanInterval;
        
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
                if (titleElement && titleElement.parentNode) {
                    const container = document.createElement('div');
                    container.style.cssText = `
                        display: flex;
                        align-items: center;
                        gap: 15px;
                        margin-bottom: 10px;
                        flex-wrap: wrap;
                    `;
                    
                    try {
                        titleElement.parentNode.insertBefore(container, titleElement);
                        container.appendChild(titleElement);
                        container.appendChild(button);
                        buttonsAdded = true;
                        processedMovies.add(imdbId);
                        return;
                    } catch (e) {
                        console.warn('Failed to insert button for selector:', selector);
                    }
                }
            }
            
            // Fallback injection methods
            const fallbackContainers = [
                document.querySelector('.sc-5be2ae66-0'),
                document.querySelector('.title-overview'),
                document.querySelector('.titleBar'),
                document.querySelector('main'),
                document.body
            ];
            
            for (const container of fallbackContainers) {
                if (container) {
                    try {
                        const wrapper = document.createElement('div');
                        wrapper.style.cssText = `
                            display: flex;
                            align-items: center;
                            gap: 15px;
                            margin-bottom: 15px;
                            flex-wrap: wrap;
                        `;
                        wrapper.appendChild(button);
                        container.insertBefore(wrapper, container.firstChild);
                        buttonsAdded = true;
                        processedMovies.add(imdbId);
                        return;
                    } catch (e) {
                        // Try next container
                    }
                }
            }
        }
        
        function addButtonsToChartPage() {
            try {
                const movieLinks = document.querySelectorAll('a[href*="/title/tt"]');
                let addedAnyButtons = false;
                
                movieLinks.forEach((link) => {
                    const href = link.getAttribute('href');
                    const imdbIdMatch = href && href.match(/tt\d+/);
                    
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
            } catch (e) {
                console.warn('Error in addButtonsToChartPage:', e);
            }
        }
        
        function isMainMovieLink(link) {
            if (!link || !link.classList) return false;
            
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
            if (!link || !link.parentNode) return false;
            
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
                console.warn('Error inserting button after title:', e);
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
            
            scanInterval = setInterval(() => {
                if (window.location.href.includes('/chart/')) {
                    addButtonsToChartPage();
                }
            }, 1500);
            
            let scrollTimeout;
            window.addEventListener('scroll', () => {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    if (window.location.href.includes('/chart/')) {
                        addButtonsToChartPage();
                    }
                }, 400);
            });
        }
        
        function setupObservers() {
            try {
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
                        }, 600);
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
                        if (scanInterval) clearInterval(scanInterval);
                        setTimeout(() => {
                            startContinuousScan();
                        }, 1200);
                    }
                });
                
                navObserver.observe(document, { 
                    subtree: true, 
                    childList: true 
                });
            } catch (e) {
                console.warn('Observers not supported, using interval-based scanning only');
                startContinuousScan();
            }
        }
        
        // Start the main functionality
        startContinuousScan();
        setupObservers();
        
        // Final fallback: periodic full page scan
        setInterval(insertCustomButton, 5000);
    }
    
})();
