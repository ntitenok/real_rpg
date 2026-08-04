// tabs.js — переключение вкладок

import { renderTab } from './loader.js';

let isInitialized = false;

export function initTabs() {
    if (isInitialized) return;
    isInitialized = true;

    const menuItems = document.querySelectorAll('.menu-item');
    const contents = document.querySelectorAll('.tab-content');

    // Восстанавливаем сохранённую вкладку
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) {
        const savedBtn = document.querySelector(`.menu-item[data-tab="${savedTab}"]`);
        if (savedBtn) {
            // Активируем сохранённую вкладку (снимаем активные классы и ставим нужные)
            menuItems.forEach(i => i.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            savedBtn.classList.add('active');
            const target = document.getElementById(`tab-${savedTab}`);
            if (target) {
                target.classList.add('active');
                // Если шаблон не загружен, загружаем
                if (!target.dataset.loaded) {
                    renderTab(savedTab).then(() => {
                        target.classList.add('active');
                        // Диспатчим событие активации
                        const event = new CustomEvent('tabActivated', { detail: { tabId: savedTab } });
                        document.dispatchEvent(event);
                    });
                } else {
                    // Диспатчим событие активации
                    const event = new CustomEvent('tabActivated', { detail: { tabId: savedTab } });
                    document.dispatchEvent(event);
                }
            }
        }
    }

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

            // Сохраняем активную вкладку в localStorage
            localStorage.setItem('activeTab', tabId);

            // Генерируем событие о переключении вкладки
            const event = new CustomEvent('tabActivated', { detail: { tabId } });
            document.dispatchEvent(event);
        });
    });

    // Если сохранённой вкладки нет, загружаем активную по умолчанию
    if (!savedTab) {
        const activeMenuItem = document.querySelector('.menu-item.active');
        if (activeMenuItem) {
            const activeTabId = activeMenuItem.dataset.tab;
            const activeContainer = document.getElementById(`tab-${activeTabId}`);
            if (activeContainer && !activeContainer.dataset.loaded) {
                renderTab(activeTabId).then(() => {
                    activeContainer.classList.add('active');
                    const event = new CustomEvent('tabActivated', { detail: { tabId: activeTabId } });
                    document.dispatchEvent(event);
                });
            } else if (activeContainer) {
                const event = new CustomEvent('tabActivated', { detail: { tabId: activeTabId } });
                document.dispatchEvent(event);
            }
        }
    }
}

// Автоматическая инициализация после загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTabs);
} else {
    initTabs();
}