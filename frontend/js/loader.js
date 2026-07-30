// loader.js — загрузка HTML-шаблонов вкладок

const templateCache = {};

export async function loadTemplate(tabId) {
    // Если шаблон уже загружен, возвращаем его
    if (templateCache[tabId]) {
        return templateCache[tabId];
    }

    try {
        const response = await fetch(`/templates/${tabId}.html`);
        if (!response.ok) {
            throw new Error(`Шаблон ${tabId} не найден (${response.status})`);
        }
        const html = await response.text();
        templateCache[tabId] = html;
        return html;
    } catch (err) {
        console.error(`Ошибка загрузки шаблона ${tabId}:`, err);
        return `<div class="panel-head"><h2>Ошибка загрузки</h2></div><p class="empty">Не удалось загрузить содержимое вкладки.</p>`;
    }
}

// Функция для вставки шаблона в контейнер
export async function renderTab(tabId) {
    const container = document.getElementById(`tab-${tabId}`);
    if (!container) return;
    const html = await loadTemplate(tabId);
    container.innerHTML = html;
    container.dataset.loaded = 'true';
    // Генерируем событие о загрузке вкладки, чтобы другие модули могли инициализироваться
    const event = new CustomEvent('tabLoaded', { detail: { tabId } });
    document.dispatchEvent(event);
}