// ==UserScript==
// @name         Azure DevOps PR Thread Collapsible
// @source       https://github.com/wengct/TamperMonkeyScript/raw/main/AzureDevOpsService/AzureDevOpsPrThreadCollapsible.user.js
// @namespace    https://github.com/wengct/TamperMonkeyScript/raw/main/AzureDevOpsService/AzureDevOpsPrThreadCollapsible.user.js
// @version      1.0.0
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

    function injectStyles() {
        const css = `
        .fold-toggle {
            padding: 2px 6px;
            margin-bottom: 4px;
            font-size: 12px;
            cursor: pointer;
            background: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        .fold-toggle.collapsed::after { content: " ▶️"; }
        .fold-toggle::after { content: " 🔽"; }

        .fold-target.fold-collapsed {
            display: none !important;
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

            // 找到真正的內容容器（安全摺疊的部分）
            const viewer = card.querySelector(".repos-comment-viewer");
            if (!viewer) return;

            viewer.classList.add("fold-target");

            // 建立按鈕並放在同一區塊上方 → 不破壞佈局
            const toggle = document.createElement("button");
            toggle.className = "fold-toggle";
            toggle.textContent = "詳細";
            toggle.title = "展開或摺疊留言";


            // 插入 bolt-card-content 顯示區塊中（安全位置）
            const headerArea = card.querySelector(".bolt-card-content");
            if (!headerArea) return;

            headerArea.insertBefore(toggle, headerArea.firstChild);

            toggle.addEventListener("click", () => {
                viewer.classList.toggle("fold-collapsed");
                toggle.classList.toggle("collapsed");
            });
        });
    }

    injectStyles();
    enhanceThreads();

    const observer = new MutationObserver(() => enhanceThreads());
    observer.observe(document.body, { childList: true, subtree: true });

})();
