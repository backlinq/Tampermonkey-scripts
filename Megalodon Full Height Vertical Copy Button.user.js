// ==UserScript==
// @name         Megalodon Full Height Vertical Copy Button
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Full height vertical COPY button left to iframe on megalodon.jp with orange feedback
// @author       You
// @match        https://megalodon.jp/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function copyIframeContent() {
        const iframe = document.getElementById('iframe2');
        if (iframe && iframe.contentDocument) {
            try {
                const text = iframe.contentDocument.body.textContent || '';
                navigator.clipboard.writeText(text.trim()).then(() => {
                    // Success feedback - orange pulse
                    copyBtn.textContent = 'COPIED!';
                    copyBtn.style.background = 'linear-gradient(135deg, #f97316, #ea580c)';
                    copyBtn.style.color = 'white';
                    copyBtn.style.borderColor = '#ea580c';
                    copyBtn.style.boxShadow = '0 0 15px rgba(249, 115, 22, 0.5)';

                    // Subtle haptic feedback (single short vibration)
                    if (navigator.vibrate) {
                        navigator.vibrate(30);
                    }

                    setTimeout(() => {
                        copyBtn.textContent = 'COPY';
                        copyBtn.style.background = '#fff';
                        copyBtn.style.color = '#000';
                        copyBtn.style.borderColor = '#d1d5db';
                        copyBtn.style.boxShadow = '-2px 0 8px rgba(0,0,0,0.1)';
                    }, 800);
                });
            } catch (err) {
                // Error feedback - darker orange
                copyBtn.textContent = 'FAILED!';
                copyBtn.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
                copyBtn.style.color = 'white';
                copyBtn.style.borderColor = '#b91c1c';
                copyBtn.style.boxShadow = '0 0 15px rgba(220, 38, 38, 0.5)';

                // Slightly longer vibration for error
                if (navigator.vibrate) {
                    navigator.vibrate(50);
                }

                setTimeout(() => {
                    copyBtn.textContent = 'COPY';
                    copyBtn.style.background = '#fff';
                    copyBtn.style.color = '#000';
                    copyBtn.style.borderColor = '#d1d5db';
                    copyBtn.style.boxShadow = '-2px 0 8px rgba(0,0,0,0.1)';
                }, 800);
            }
        }
    }

    function addCopyButton() {
        const container = document.getElementById('iframe2-div');
        if (!container || document.querySelector('.tm-copy-btn')) return;

        // Create wrapper div to hold button and container
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
            position: relative;
            display: flex;
            align-items: stretch;
            width: 100%;
            margin-left: 45px;
        `;

        // Create full height vertical button
        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'COPY';
        copyBtn.className = 'tm-copy-btn';
        copyBtn.style.cssText = `
            position: absolute;
            left: -45px;
            top: 0;
            height: 100%;
            width: 40px;
            background: #fff;
            color: #000;
            border: 2px solid #d1d5db;
            border-right: none;
            border-radius: 12px 0 0 12px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.95;
            writing-mode: vertical-rl;
            text-orientation: mixed;
            user-select: none;
            z-index: 9999;
            transition: all 0.3s ease;
            letter-spacing: 1px;
            text-transform: uppercase;
            box-shadow: -2px 0 8px rgba(0,0,0,0.1);
        `;

        // Click animation - subtle orange tint
        copyBtn.addEventListener('mousedown', () => {
            copyBtn.style.transform = 'scale(0.98)';
            copyBtn.style.background = '#fed7aa';
            copyBtn.style.transition = 'all 0.1s ease';
        });

        copyBtn.addEventListener('mouseup', () => {
            copyBtn.style.transform = 'scale(1)';
            copyBtn.style.background = '#fff';
            copyBtn.style.transition = 'all 0.3s ease';
        });

        // Hover effects - subtle orange
        copyBtn.addEventListener('mouseenter', () => {
            copyBtn.style.background = 'linear-gradient(135deg, #fff7ed, #fed7aa)';
            copyBtn.style.opacity = '1';
            copyBtn.style.borderColor = '#f97316';
            copyBtn.style.width = '42px';
            copyBtn.style.left = '-46px';
            copyBtn.style.boxShadow = '-3px 0 12px rgba(249, 115, 22, 0.2)';
        });

        copyBtn.addEventListener('mouseleave', () => {
            copyBtn.style.background = '#fff';
            copyBtn.style.opacity = '0.95';
            copyBtn.style.borderColor = '#d1d5db';
            copyBtn.style.width = '40px';
            copyBtn.style.left = '-45px';
            copyBtn.style.boxShadow = '-2px 0 8px rgba(0,0,0,0.1)';
        });

        // Insert wrapper before container and move container into wrapper
        container.parentNode.insertBefore(wrapper, container);
        wrapper.appendChild(container);
        wrapper.appendChild(copyBtn);

        copyBtn.addEventListener('click', copyIframeContent);
    }

    // Wait for page to load and iframe to be available
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addCopyButton);
    } else {
        addCopyButton();
    }

    // Also try after a delay in case iframe loads later
    setTimeout(addCopyButton, 1000);
})();
