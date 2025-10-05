// ==UserScript==
// @name         Perplexity.ai Add Second Copy Button to Code Blocks ORANGE + LEFT WHITE FULL HEIGHT
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Adds a second "Copy" button at the end of each code fence and a full-height white sidebar button on the left side
// @author       Tampermonkey Script Creator
// @match        https://www.perplexity.ai/*
// @icon         https://www.perplexity.ai/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const observer = new MutationObserver(() => addCopyButtons());
    observer.observe(document.body, { childList: true, subtree: true });

    function addCopyButtons() {
        document.querySelectorAll('pre code').forEach(codeBlock => {
            const pre = codeBlock.parentElement;

            // Avoid duplicate buttons
            if (pre.querySelector('.tm-second-copy-btn')) return;

            // Positioning context and add left padding so code not hidden behind sidebar button
            pre.style.position = 'relative';
            pre.style.paddingLeft = '3.5em';

            // Right copy button with white background
            const copyBtn = document.createElement('button');
            copyBtn.textContent = 'Copy';
            copyBtn.className = 'tm-second-copy-btn';
            copyBtn.style.cssText = `
                display: block;
                margin: 8px auto 0 auto;
                padding: 4px 12px;
                background: #fff;
                color: #000;
                border: 1px solid #ccc;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            `;

            // Left full-height white sidebar copy button
            const leftBtn = document.createElement('button');
            leftBtn.textContent = 'Copy';
            leftBtn.className = 'tm-left-copy-btn';
            leftBtn.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                width: 3em;
                background: #fff;
                color: #000;
                border: 1px solid #ccc;
                border-radius: 4px 0 0 4px;
                cursor: pointer;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.9;
                z-index: 10;
                user-select: none;
                box-sizing: border-box;
            `;

            // Shared copy logic for buttons
            function handleCopy(btn) {
                navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                    const originalText = btn.textContent;
                    btn.textContent = 'Copied!';
                    btn.style.background = 'orange';
                    btn.style.color = '#fff';
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.background = '#fff';
                        btn.style.color = '#000';
                    }, 1200);
                });
            }

            copyBtn.addEventListener('click', () => handleCopy(copyBtn));
            leftBtn.addEventListener('click', () => handleCopy(leftBtn));

            // Add buttons to the block
            pre.appendChild(copyBtn);
            pre.appendChild(leftBtn);
        });
    }

    addCopyButtons();
})();
