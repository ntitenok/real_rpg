// tabs.js — переключение вкладок

export function initTabs() {
    const menuItems = document.querySelectorAll('.menu-item');
    const contents = document.querySelectorAll('.tab-content');

    menuItems.forEach(btn => {
        btn.addEventListener('click', () => {
            // Убираем активные классы у всех кнопок и контента
            menuItems.forEach(b => b.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // Активируем текущую
            btn.classList.add('active');
            const tabId = btn.dataset.tab;
            const target = document.getElementById(`tab-${tabId}`);
            if (target) {
                target.classList.add('active');
            }
        });
    });
}