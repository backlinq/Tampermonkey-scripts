// ==UserScript==
// @name         Archive.ph Vertical Copy Buttons
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds vertical copy buttons to archive.ph and variants code blocks only
// @author       You
// @match        https://archive.ph/*
// @match        https://archive.today/*
// @match        https://archive.is/*
// @match        https://archive.vn/*
// @match        https://archive.md/*
// @match        https://archive.li/*
// @match        https://archive.fo/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const observer = new MutationObserver(() => addCopyButtons());
    observer.observe(document.body, { childList: true, subtree: true });

    function addCopyButtons() {
        // Target pre elements with monospace font styling on archive sites
        document.querySelectorAll('pre[style*="font-family:monospace"], pre[style*="font-family: monospace"]').forEach(preElement => {
            addCopyButtonToElement(preElement);
        });
    }

    function addCopyButtonToElement(element) {
        if (element.querySelector('.tm-copy-sidebar')) return;

        const originalContent = element.textContent;
        element.style.position = 'relative';
        element.style.paddingLeft = '3.5em';

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

        sidebarBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(originalContent).then(() => {
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
            }).catch(() => {
                sidebarBtn.textContent = 'FAILED!';
                sidebarBtn.style.background = '#ef4444';
                sidebarBtn.style.color = '#fff';
                setTimeout(() => {
                    sidebarBtn.textContent = 'COPY';
                    sidebarBtn.style.background = '#fff';
                    sidebarBtn.style.color = '#000';
                    sidebarBtn.style.borderColor = '#d1d5db';
                }, 1200);
            });
        });

        element.appendChild(sidebarBtn);
    }

    addCopyButtons();
})();
