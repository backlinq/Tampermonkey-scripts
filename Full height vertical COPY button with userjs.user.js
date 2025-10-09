// ==UserScript==
// @name         Megalodon Full Height Vertical Copy Button
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Full height vertical COPY button left to iframe on megalodon.jp with orange feedback + SAVE SCRIPT button
// @author       You
// @match        https://megalodon.jp/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let copyBtn, saveBtn;

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

    function saveAsUserJS() {
        const iframe = document.getElementById('iframe2');
        if (iframe && iframe.contentDocument) {
            try {
                const content = iframe.contentDocument.body.textContent || '';
                const trimmedContent = content.trim();
                
                if (!trimmedContent) {
                    throw new Error('No content found');
                }

                // Get the current page title for the filename
                const pageTitle = document.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
                const filename = `megalodon_script_${pageTitle}.user.js`;

                // Create the user.js script content with metadata
                const scriptContent = `// ==UserScript==
// @name         Megalodon Script - ${pageTitle}
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Script generated from Megalodon content
// @author       Generated from Megalodon
// @match        ${window.location.href}
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    // Content from Megalodon:
    ${trimmedContent.split('\n').map(line => `    // ${line}`).join('\n')}
})();`;

                // Create download link
                const blob = new Blob([scriptContent], { type: 'application/javascript' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                // Success feedback - blue pulse
                saveBtn.textContent = 'SAVED!';
                saveBtn.style.background = 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
                saveBtn.style.color = 'white';
                saveBtn.style.borderColor = '#1d4ed8';
                saveBtn.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.5)';

                // Haptic feedback
                if (navigator.vibrate) {
                    navigator.vibrate(40);
                }

                setTimeout(() => {
                    saveBtn.textContent = 'SAVE SCRIPT';
                    saveBtn.style.background = '#fff';
                    saveBtn.style.color = '#000';
                    saveBtn.style.borderColor = '#d1d5db';
                    saveBtn.style.boxShadow = '-2px 0 8px rgba(0,0,0,0.1)';
                }, 1000);

            } catch (err) {
                // Error feedback
                saveBtn.textContent = 'FAILED!';
                saveBtn.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
                saveBtn.style.color = 'white';
                saveBtn.style.borderColor = '#b91c1c';
                saveBtn.style.boxShadow = '0 0 15px rgba(220, 38, 38, 0.5)';

                if (navigator.vibrate) {
                    navigator.vibrate(60);
                }

                setTimeout(() => {
                    saveBtn.textContent = 'SAVE SCRIPT';
                    saveBtn.style.background = '#fff';
                    saveBtn.style.color = '#000';
                    saveBtn.style.borderColor = '#d1d5db';
                    saveBtn.style.boxShadow = '-2px 0 8px rgba(0,0,0,0.1)';
                }, 1000);
            }
        }
    }

    function createButton(text, onClick, leftPosition) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.cssText = `
            position: absolute;
            left: ${leftPosition};
            top: 0;
            height: 100%;
            width: 40px;
            background: #fff;
            color: #000;
            border: 2px solid #d1d5db;
            border-right: none;
            border-radius: 12px 0 0 12px;
            cursor: pointer;
            font-size: 12px;
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
            letter-spacing: 0.5px;
            text-transform: uppercase;
            box-shadow: -2px 0 8px rgba(0,0,0,0.1);
        `;

        // Click animation
        button.addEventListener('mousedown', () => {
            button.style.transform = 'scale(0.98)';
            button.style.background = text === 'COPY' ? '#fed7aa' : '#bfdbfe';
            button.style.transition = 'all 0.1s ease';
        });

        button.addEventListener('mouseup', () => {
            button.style.transform = 'scale(1)';
            button.style.background = '#fff';
            button.style.transition = 'all 0.3s ease';
        });

        // Hover effects
        button.addEventListener('mouseenter', () => {
            const hoverColor = text === 'COPY' 
                ? 'linear-gradient(135deg, #fff7ed, #fed7aa)'
                : 'linear-gradient(135deg, #eff6ff, #bfdbfe)';
            const borderColor = text === 'COPY' ? '#f97316' : '#3b82f6';
            
            button.style.background = hoverColor;
            button.style.opacity = '1';
            button.style.borderColor = borderColor;
            button.style.width = '42px';
            button.style.left = `calc(${leftPosition} - 1px)`;
            button.style.boxShadow = `-3px 0 12px rgba(${text === 'COPY' ? '249, 115, 22' : '59, 130, 246'}, 0.2)`;
        });

        button.addEventListener('mouseleave', () => {
            button.style.background = '#fff';
            button.style.opacity = '0.95';
            button.style.borderColor = '#d1d5db';
            button.style.width = '40px';
            button.style.left = leftPosition;
            button.style.boxShadow = '-2px 0 8px rgba(0,0,0,0.1)';
        });

        button.addEventListener('click', onClick);
        return button;
    }

    function addCopyButton() {
        const container = document.getElementById('iframe2-div');
        if (!container || document.querySelector('.tm-copy-btn')) return;

        // Create wrapper div to hold buttons and container
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
            position: relative;
            display: flex;
            align-items: stretch;
            width: 100%;
            margin-left: 90px;
        `;

        // Create buttons
        copyBtn = createButton('COPY', copyIframeContent, '-45px');
        copyBtn.className = 'tm-copy-btn';
        
        saveBtn = createButton('SAVE SCRIPT', saveAsUserJS, '-90px');
        saveBtn.className = 'tm-save-btn';
        saveBtn.style.fontSize = '11px';
        saveBtn.style.letterSpacing = '0.3px';

        // Insert wrapper before container and move container into wrapper
        container.parentNode.insertBefore(wrapper, container);
        wrapper.appendChild(container);
        wrapper.appendChild(copyBtn);
        wrapper.appendChild(saveBtn);
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
