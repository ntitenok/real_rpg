// tasks.js — логика вкладки «Журнал»

import { getCurrentUserId } from './auth.js';

// ===== МОК-ДАННЫЕ =====
let journalTasks = [
    {
        id: 1,
        title: 'Обновить резюме',
        description: '',
        status: 'done',
        xp: 40,
        time: null,
        goalId: 'goal-1',
        skills: ['Красноречие']
    },
    {
        id: 2,
        title: 'Дописать модуль авторизации',
        description: 'Selene + pytest',
        status: 'progress',
        xp: 0,
        time: 5025,
        goalId: 'goal-1',
        skills: ['Одноручное оружие']
    }
];

let journalGoals = [];

// ===== API для целей =====
async function fetchGoalsForJournal() {
    const userId = getCurrentUserId();
    if (!userId) return [];
    try {
        const res = await fetch(`/api/goals?user_id=${userId}`);
        if (!res.ok) throw new Error('Ошибка загрузки целей');
        return await res.json();
    } catch (e) {
        console.error(e);
        return [];
    }
}

// ===== СОСТОЯНИЕ =====
let journalState = {
    mode: 'goals',
    search: '',
    statusFilter: 'all'
};

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

function getStatusIcon(status) {
    const icons = {
        done: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2.4"><path d="M5 12l4 4 10-10"/></svg>`,
        progress: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2.2"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>`,
        pending: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2.2"><circle cx="12" cy="12" r="8"/></svg>`
    };
    return icons[status] || icons.pending;
}

function formatTime(seconds) {
    if (!seconds) return '—';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

function filterTasks(tasks) {
    let filtered = tasks;
    if (journalState.search) {
        const q = journalState.search.toLowerCase();
        filtered = filtered.filter(t => t.title.toLowerCase().includes(q));
    }
    if (journalState.statusFilter !== 'all') {
        filtered = filtered.filter(t => t.status === journalState.statusFilter);
    }
    return filtered;
}

function renderGoalsMode(tasks) {
    const container = document.getElementById('journal-goals-list');
    if (!container) return;

    const filtered = filterTasks(tasks);
    const goalsMap = {};
    const noGoalTasks = [];

    filtered.forEach(task => {
        if (task.goalId) {
            if (!goalsMap[task.goalId]) goalsMap[task.goalId] = [];
            goalsMap[task.goalId].push(task);
        } else {
            noGoalTasks.push(task);
        }
    });

    let html = '';

    journalGoals.forEach(goal => {
        const goalTasks = goalsMap[goal.id] || [];
        const doneCount = goalTasks.filter(t => t.status === 'done').length;
        const total = goal.total_tasks || 0;
        const progress = total > 0 ? Math.min(100, (doneCount / total) * 100) : 0;

        html += `
            <div class="goal-group">
                <div class="goal-header">
                    <div class="goal-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#e8d5a0" stroke-width="1.5"><path d="M12 2l2.5 5.5L20 9l-4.2 4 1 6.2L12 16l-4.8 3.2 1-6.2L4 9l5.5-1.5z"/></svg></div>
                    <div class="goal-info">
                        <div class="goal-name">
                            ${escapeHtml(goal.title)}
                            ${goal.description ? `<div style="font-size:13px; color:#877a63; font-weight:normal; margin-top:4px;">${escapeHtml(goal.description)}</div>` : ''}
                            ${goal.is_active ? '' : '<span style="color:#877a63; font-size:12px;"> (неактивна)</span>'}
                        </div>
                        <div class="goal-progress-track"><div class="goal-progress-fill" style="width:${progress}%"></div></div>
                    </div>
                    <div class="goal-count">${doneCount} / ${total}</div>
                </div>
                <div class="goal-tasks">
                    ${goalTasks.length === 0
                ? '<div class="jtask-row" style="padding:9px 8px; color:#877a63; font-style:italic;">Нет задач</div>'
                : goalTasks.map(task => `
                            <div class="jtask-row ${task.status}">
                                <div class="status-icon">${getStatusIcon(task.status)}</div>
                                <div class="jtask-name">${escapeHtml(task.title)}</div>
                                <div class="jtask-tags">
                                    ${task.skills.map(s => `<div class="jtask-tag"><svg viewBox="0 0 24 24" fill="none" stroke="#a89a80" stroke-width="1.8"><path d="M6 18L18 6M14 4l6 6"/></svg>${escapeHtml(s)}</div>`).join('')}
                                </div>
                                <div class="jtask-xp">${task.status === 'done' ? `+${task.xp} XP` : (task.time ? formatTime(task.time) : '—')}</div>
                            </div>
                        `).join('')}
                </div>
            </div>
        `;
    });

    if (noGoalTasks.length > 0) {
        html += `
            <div class="goal-group">
                <div class="goal-header">
                    <div class="goal-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#8a7a63" stroke-width="1.5"><path d="M4 6h16M4 12h16M4 18h16"/></svg></div>
                    <div class="goal-info">
                        <div class="goal-name" style="color:#a89a80;">Без цели</div>
                        <div class="goal-progress-track"><div class="goal-progress-fill" style="width:100%; background:rgba(160,150,130,0.3);"></div></div>
                    </div>
                    <div class="goal-count">${noGoalTasks.length}</div>
                </div>
                <div class="goal-tasks">
                    ${noGoalTasks.map(task => `
                        <div class="jtask-row ${task.status}">
                            <div class="status-icon">${getStatusIcon(task.status)}</div>
                            <div class="jtask-name">${escapeHtml(task.title)}</div>
                            <div class="jtask-tags">
                                ${task.skills.map(s => `<div class="jtask-tag"><svg viewBox="0 0 24 24" fill="none" stroke="#a89a80" stroke-width="1.8"><path d="M6 18L18 6M14 4l6 6"/></svg>${escapeHtml(s)}</div>`).join('')}
                            </div>
                            <div class="jtask-xp">${task.status === 'done' ? `+${task.xp} XP` : (task.time ? formatTime(task.time) : '—')}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    if (!html) {
        html = `<p class="empty" style="padding:20px 0; color:#877a63;">Нет задач, соответствующих фильтрам</p>`;
    }

    container.innerHTML = html;
}

function renderAZMode(tasks) {
    const container = document.getElementById('journal-az-list');
    if (!container) return;

    const filtered = filterTasks(tasks);
    const sorted = [...filtered].sort((a, b) => a.title.localeCompare(b.title, 'ru'));

    const groups = {};
    sorted.forEach(task => {
        const letter = task.title.charAt(0).toUpperCase();
        if (!groups[letter]) groups[letter] = [];
        groups[letter].push(task);
    });

    const letters = Object.keys(groups).sort();
    if (letters.length === 0) {
        container.innerHTML = `<p class="empty" style="padding:20px 0; color:#877a63;">Нет задач, соответствующих фильтрам</p>`;
        return;
    }

    let html = '';
    letters.forEach(letter => {
        html += `<div class="az-letter">${letter}</div>`;
        groups[letter].forEach(task => {
            const goal = journalGoals.find(g => g.id === task.goalId);
            const goalLabel = goal ? goal.title : 'Без цели';
            html += `
                <div class="az-row ${task.status}">
                    <div class="status-icon">${getStatusIcon(task.status)}</div>
                    <div class="jtask-name">${escapeHtml(task.title)}</div>
                    <div class="az-goal-ref"><svg viewBox="0 0 24 24" fill="none" stroke="#877a63" stroke-width="2"><circle cx="12" cy="12" r="8"/></svg>${escapeHtml(goalLabel)}</div>
                </div>
            `;
        });
    });

    container.innerHTML = html;
}

function renderJournal() {
    const tasks = journalTasks;
    if (journalState.mode === 'goals') {
        document.getElementById('journal-goals-mode').style.display = 'block';
        document.getElementById('journal-az-mode').style.display = 'none';
        renderGoalsMode(tasks);
    } else {
        document.getElementById('journal-goals-mode').style.display = 'none';
        document.getElementById('journal-az-mode').style.display = 'block';
        renderAZMode(tasks);
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====

export async function initJournal() {
    const loadedGoals = await fetchGoalsForJournal();
    if (loadedGoals.length > 0) {
        journalGoals = loadedGoals;
    } else {
        journalGoals = [];
    }

    // Обработчики переключения режимов
    const toggleItems = document.querySelectorAll('#journal-mode-toggle .tab-toggle-item');
    toggleItems.forEach(item => {
        item.addEventListener('click', function () {
            toggleItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            journalState.mode = this.dataset.mode;
            renderJournal();
        });
    });

    const searchInput = document.getElementById('journal-search');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            journalState.search = this.value;
            renderJournal();
        });
    }

    const statusFilter = document.getElementById('journal-status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function () {
            journalState.statusFilter = this.value;
            renderJournal();
        });
    }

    renderJournal();
}

// Подписка на событие активации вкладки — срабатывает при каждом переключении
document.addEventListener('tabActivated', (e) => {
    if (e.detail.tabId === 'tasks') {
        initJournal(); // всегда обновляем данные при переходе на Журнал
    }
});

// Если вкладка уже активна при старте
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    const tasksTab = document.getElementById('tab-tasks');
    if (tasksTab && tasksTab.classList.contains('active')) {
        initJournal();
    }
}