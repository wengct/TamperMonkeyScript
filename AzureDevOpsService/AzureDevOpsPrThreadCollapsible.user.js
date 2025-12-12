// ==UserScript==
// @name         Azure DevOps PR Thread Collapsible
// @source       https://github.com/wengct/TamperMonkeyScript/raw/main/AzureDevOpsService/AzureDevOpsPrThreadCollapsible.user.js
// @namespace    https://github.com/wengct/TamperMonkeyScript/raw/main/AzureDevOpsService/AzureDevOpsPrThreadCollapsible.user.js
// @version      1.0.2
// @description  Safely collapsible PR thread without breaking Azure DevOps layout
// @match        https://dev.azure.com/*
// @match        https://*.visualstudio.com/*
// @author       Chenting Weng
// @run-at       document-end
// @icon         https://www.google.com/s2/favicons?sz=64&domain=dev.azure.com
// ==/UserScript== 

(function () {
    'use strict';

    const THREAD_SELECTOR = ".repos-comment-card";
    const PREVIEW_HEIGHT = 150; // ← 摘要高度（px，可自行調整）

    function injectStyles() {
        const css = `
        /* ===== Toggle Button ===== */
        .fold-toggle {
            padding: 2px 6px;
            margin-bottom: 4px;
            font-size: 12px;
            cursor: pointer;
            background: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        .fold-toggle::after { content: " 🔽"; }
        .fold-toggle.collapsed::after { content: " ▶️"; }

        /* ===== Preview Mode (關鍵：只裁 markdown-content) ===== */
        .fold-target.fold-collapsed .markdown-content {
            max-height: ${PREVIEW_HEIGHT}px;
            overflow: hidden;
            position: relative;
        }

        /* 底部淡出提示（視覺告知還有內容） */
        .fold-target.fold-collapsed .markdown-content::after {
            content: "";
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: 40px;
            background: linear-gradient(
                rgba(255,255,255,0),
                rgba(255,255,255,1)
            );
            pointer-events: none;
        }
        `;
        const styleEl = document.createElement("style");
        styleEl.textContent = css;
        document.head.appendChild(styleEl);
    }

    function enhanceThreads() {
        document.querySelectorAll(THREAD_SELECTOR).forEach(card => {
            if (card.dataset.foldApplied) return;
            card.dataset.foldApplied = "1";

            // 🔑 真正安全的內容容器
            const viewer = card.querySelector(".repos-comment-viewer");
            if (!viewer) return;

            viewer.classList.add("fold-target", "fold-collapsed");

            // 🔑 安全插入按鈕的位置（不破壞 layout）
            const headerArea = card.querySelector(".bolt-card-content");
            if (!headerArea) return;

            const toggle = document.createElement("button");
            toggle.className = "fold-toggle collapsed";
            toggle.textContent = "詳細";
            toggle.title = "點擊可展開完整內容";

            headerArea.insertBefore(toggle, headerArea.firstChild);

            toggle.addEventListener("click", () => {
                viewer.classList.toggle("fold-collapsed");
                toggle.classList.toggle("collapsed");

                toggle.title = viewer.classList.contains("fold-collapsed")
                    ? "點擊可展開完整內容"
                    : "點擊可收合為摘要";
            });
        });
    }

    injectStyles();
    enhanceThreads();

    // 支援動態載入（PR 切換、Lazy load）
    const observer = new MutationObserver(() => enhanceThreads());
    observer.observe(document.body, { childList: true, subtree: true });

})();
