// ==UserScript==
// @name         Yopass Script Copy Buttons
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Adds vertical copy button to Yopass script elements
// @author       Tampermonkey Script Creator
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?domain=tampermonkey.net
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const observer = new MutationObserver(() => addCopyButtons());
    observer.observe(document.body, { childList: true, subtree: true });

    function addCopyButtons() {
        document.querySelectorAll('div.bg-base-200.rounded-lg.p-6.text-lg.font-mono.whitespace-pre-wrap.min-h-\\[120px\\].text-base-content').forEach(scriptDiv => {
            // Avoid duplicate buttons
            if (scriptDiv.querySelector('.tm-copy-sidebar')) return;

            // Make container relative for positioning
            scriptDiv.style.position = 'relative';
            scriptDiv.style.paddingLeft = '3.5em';

            // Left full-height sidebar copy button
            const sidebarBtn = document.createElement('button');
            sidebarBtn.textContent = 'COPY';
            sidebarBtn.className = 'tm-copy-sidebar';
            sidebarBtn.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                width: 3em;
                background: #fff;
                color: #000;
                border: 1px solid #d1d5db;
                border-radius: 8px 0 0 8px;
                cursor: pointer;
                font-size: 11px;
                font-weight: 600;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.9;
                z-index: 10;
                user-select: none;
                box-sizing: border-box;
                transition: all 0.2s ease;
                writing-mode: vertical-rl;
                text-orientation: mixed;
                letter-spacing: 0.5px;
            `;

            // Hover effects
            sidebarBtn.addEventListener('mouseenter', () => {
                sidebarBtn.style.background = '#f8fafc';
                sidebarBtn.style.borderColor = '#9ca3af';
                sidebarBtn.style.opacity = '1';
            });
            sidebarBtn.addEventListener('mouseleave', () => {
                sidebarBtn.style.background = '#fff';
                sidebarBtn.style.borderColor = '#d1d5db';
                sidebarBtn.style.opacity = '0.9';
            });

            // Copy logic
            function handleCopy() {
                // Get only the script content, excluding the button text
                const scriptContent = scriptDiv.textContent.replace('COPY', '').trim();
                navigator.clipboard.writeText(scriptContent).then(() => {
                    const originalText = sidebarBtn.textContent;
                    const originalBackground = sidebarBtn.style.background;
                    const originalColor = sidebarBtn.style.color;

                    sidebarBtn.textContent = 'COPIED!';
                    sidebarBtn.style.background = 'orange';
                    sidebarBtn.style.color = '#fff';
                    sidebarBtn.style.borderColor = 'orange';

                    setTimeout(() => {
                        sidebarBtn.textContent = originalText;
                        sidebarBtn.style.background = originalBackground;
                        sidebarBtn.style.color = originalColor;
                        sidebarBtn.style.borderColor = '#d1d5db';
                    }, 1200);
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                    const originalText = sidebarBtn.textContent;
                    sidebarBtn.textContent = 'FAILED!';
                    sidebarBtn.style.background = '#ef4444';
                    sidebarBtn.style.color = '#fff';
                    setTimeout(() => {
                        sidebarBtn.textContent = originalText;
                        sidebarBtn.style.background = '#fff';
                        sidebarBtn.style.color = '#000';
                    }, 1200);
                });
            }

            sidebarBtn.addEventListener('click', handleCopy);

            // Add button to the container
            scriptDiv.appendChild(sidebarBtn);
        });
    }

    // Initial run
    addCopyButtons();
})();
