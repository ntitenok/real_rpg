// tabs.js — переключение вкладок

import { renderTab } from './loader.js';

let isInitialized = false;

export function initTabs() {
    if (isInitialized) return;
    isInitialized = true;

    const menuItems = document.querySelectorAll('.menu-item');
    const contents = document.querySelectorAll('.tab-content');

    menuItems.forEach(item => {
        item.addEventListener('click', async () => {
            const tabId = item.dataset.tab;
            const target = document.getElementById(`tab-${tabId}`);
            if (!target) return;

            // Снимаем активные классы
            menuItems.forEach(i => i.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // Активируем текущий пункт меню
            item.classList.add('active');

            // Если контент ещё не загружен, загружаем
            if (!target.dataset.loaded) {
                await renderTab(tabId);
            }

            // Показываем вкладку
            target.classList.add('active');
        });
    });

    // Загружаем активную вкладку при старте (по умолчанию та, у которой class="active")
    const activeMenuItem = document.querySelector('.menu-item.active');
    if (activeMenuItem) {
        const activeTabId = activeMenuItem.dataset.tab;
        const activeContainer = document.getElementById(`tab-${activeTabId}`);
        if (activeContainer && !activeContainer.dataset.loaded) {
            renderTab(activeTabId).then(() => {
                activeContainer.classList.add('active');
            });
        }
    }
}

// Автоматическая инициализация после загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTabs);
} else {
    initTabs();
}