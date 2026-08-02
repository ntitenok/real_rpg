// game.js — логика экрана «В игре»

import { getCurrentUserId } from './auth.js';

// ===== МОК-ДАННЫЕ (будут заменены реальными) =====
let playerStats = {
    health: { current: 82, max: 100 },
    energy: { current: 54, max: 70 },
    damage: 12.5,
    evasion: 8,
    critical_damage: 1.8
};

let enemy = {
    name: 'Гоблин-разрушитель',
    health: { current: 40, max: 60 },
    damage: 6.2
};

let abilities = [
    { id: 'tomato', name: 'Помидор', icon: '🍅', status: 'active', cooldown: '17 мин' },
    { id: 'chocolate', name: 'Шоколадка', icon: '🍫', status: 'ready', cooldown: null },
    { id: 'alcohol', name: 'Алкоголь', icon: '🍺', status: 'cooldown', cooldown: '1ч 40м' },
    { id: 'command', name: 'Запомнил команду', icon: '📚', status: 'ready', cooldown: '3/5' }
];

let tasks = [
    {
        id: 1,
        title: 'Дописать модуль авторизации',
        description: 'Selene + pytest, покрыть негативные сценарии',
        skills: ['Одноручное оружие'],
        goalId: null,
        timer: { elapsed: 5025, started: true, paused: false, startTime: Date.now() - 5025 * 1000 },
        planned: 7200,
        complexity: { resistance: 50, importance: 50, urgency: 50 },
        completed: false
    },
    {
        id: 2,
        title: 'Пройти урок: SQL-джойны',
        description: 'Тема 4, практическая часть',
        skills: ['Магия'],
        goalId: null,
        timer: { elapsed: 0, started: false, paused: false, startTime: null },
        planned: 3600,
        complexity: { resistance: 40, importance: 30, urgency: 20 },
        completed: false
    }
];

let goals = [];
let allSkills = ['Гибкость мышления', 'Красноречие', 'Магия', 'Медитация', 'Одноручное оружие', 'Планирование', 'Скрытность', 'Стойкость'];
const timerIntervals = {};

// ===== API для целей =====
async function fetchGoals() {
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

async function createGoalOnServer(title, description) {
    const userId = getCurrentUserId();
    if (!userId) return null;
    try {
        const res = await fetch('/api/goals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, title, description })
        });
        if (!res.ok) throw new Error('Ошибка создания цели');
        return await res.json();
    } catch (e) {
        console.error(e);
        showToast('Ошибка при создании цели');
        return null;
    }
}

// ===== ОТРИСОВКА =====

function renderStats() {
    const block = document.getElementById('player-stats');
    if (!block) return;
    const s = playerStats;
    const hpPercent = (s.health.current / s.health.max) * 100;
    const energyPercent = (s.energy.current / s.energy.max) * 100;
    block.innerHTML = `
        <div class="sub-title"><svg viewBox="0 0 24 24" fill="none" stroke="#c9a866" stroke-width="1.6"><path d="M12 2l7 4v6c0 5-3 8-7 10-4-2-7-5-7-10V6z"/></svg>Параметры</div>
        <div class="stat-bar-wrap">
            <div class="stat-bar-top"><span><svg viewBox="0 0 24 24" fill="none" stroke="#c98686" stroke-width="1.6"><path d="M12 20s-7-4.4-7-10a4.5 4.5 0 018-2.8A4.5 4.5 0 0121 10c0 5.6-9 10-9 10z"/></svg>Здоровье</span><span>${s.health.current} / ${s.health.max}</span></div>
            <div class="bar-track"><div class="bar-fill hp" style="width:${hpPercent}%"></div></div>
        </div>
        <div class="stat-bar-wrap">
            <div class="stat-bar-top"><span><svg viewBox="0 0 24 24" fill="none" stroke="#4a8ab5" stroke-width="1.6"><path d="M13 2L4 14h6l-1 8 9-12h-6z"/></svg>Энергия</span><span>${s.energy.current} / ${s.energy.max}</span></div>
            <div class="bar-track"><div class="bar-fill energy" style="width:${energyPercent}%"></div></div>
        </div>
        <div class="stat-row"><svg viewBox="0 0 24 24" fill="none" stroke="#c9a866" stroke-width="1.6"><path d="M6 18L18 6M14 4l6 6"/></svg><span class="stat-name">Урон</span><span class="stat-val">${s.damage}</span></div>
        <div class="stat-row"><svg viewBox="0 0 24 24" fill="none" stroke="#c9a866" stroke-width="1.6"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/></svg><span class="stat-name">Уклонение</span><span class="stat-val">${s.evasion}%</span></div>
        <div class="stat-row"><svg viewBox="0 0 24 24" fill="none" stroke="#c9a866" stroke-width="1.6"><path d="M13 2L4 14h6l-1 8 9-12h-6z"/></svg><span class="stat-name">Крит. удар</span><span class="stat-val">×${s.critical_damage}</span></div>
    `;
}

function renderEnemy() {
    const block = document.getElementById('enemy-block');
    if (!block) return;
    const e = enemy;
    const hpPercent = (e.health.current / e.health.max) * 100;
    block.innerHTML = `
        <div class="sub-title"><svg viewBox="0 0 24 24" fill="none" stroke="#c9a866" stroke-width="1.6"><path d="M12 2c-2 3-5 3-5 7 0 3 2 5 5 5s5-2 5-5c0-4-3-4-5-7z"/><path d="M8 18h8l-1 3H9z"/></svg>Противник</div>
        <div style="display:flex; gap:14px; align-items:center;">
            <div class="enemy-portrait" style="width:84px; height:84px; flex-shrink:0;">
                <svg viewBox="0 0 24 24" fill="none" stroke="#d18a8a" stroke-width="1.4" style="width:38px;height:38px;"><path d="M12 2c-2.5 3-6 3-6 8 0 3.5 2.5 6 6 6s6-2.5 6-6c0-5-3.5-5-6-8z"/><circle cx="9.5" cy="9" r="1"/><circle cx="14.5" cy="9" r="1"/><path d="M9 13c1 1 5 1 6 0"/></svg>
            </div>
            <div style="flex:1; min-width:0;">
                <div class="enemy-name" style="text-align:left; margin-bottom:8px;">${e.name}</div>
                <div class="stat-bar-top" style="margin-bottom:4px;"><span>❤️ Здоровье</span><span>${e.health.current} / ${e.health.max}</span></div>
                <div class="bar-track"><div class="bar-fill hp" style="width:${hpPercent}%"></div></div>
                <div class="enemy-stat"><svg viewBox="0 0 24 24" fill="none" stroke="#c9a866" stroke-width="1.6"><path d="M6 18L18 6M14 4l6 6"/></svg>Урон противника: ${e.damage}</div>
            </div>
        </div>
    `;
}

function renderAbilities() {
    const container = document.getElementById('abilities-list');
    if (!container) return;
    container.innerHTML = abilities.map(a => `
        <div class="ability-card ${a.status}">
            <div class="a-icon">${a.icon}</div>
            <div class="a-name">${a.name}</div>
            <div class="a-status">${a.cooldown || 'Готово'}</div>
        </div>
    `).join('');
}

function renderTasks() {
    const container = document.getElementById('active-tasks-list');
    if (!container) return;
    const activeTasks = tasks.filter(t => !t.completed);
    if (activeTasks.length === 0) {
        container.innerHTML = '<p class="empty" style="padding:20px 0; color:#877a63;">Нет активных задач</p>';
        return;
    }
    container.innerHTML = activeTasks.map(task => {
        const elapsed = task.timer.elapsed;
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;
        const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        const planned = task.planned || 0;
        const progress = planned > 0 ? Math.min(100, (elapsed / planned) * 100) : 0;
        const complexityFactor = 1 + (task.complexity.resistance + task.complexity.importance + task.complexity.urgency) / 300;
        const xpTime = Math.round(elapsed * complexityFactor);
        const xpTimeStr = `${Math.floor(xpTime / 3600)}:${String(Math.floor((xpTime % 3600) / 60)).padStart(2, '0')}:${String(xpTime % 60).padStart(2, '0')}`;

        // eslint-disable-next-line no-useless-assignment
        let actionButtons = '';
        if (!task.timer.started) {
            actionButtons = `<button class="task-btn start" data-id="${task.id}" data-action="start"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5l11 7-11 7z"/></svg>Старт</button>`;
        } else if (task.timer.paused) {
            actionButtons = `
                <button class="task-btn resume" data-id="${task.id}" data-action="resume"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5l11 7-11 7z"/></svg>Продолжить</button>
                <button class="task-btn stop" data-id="${task.id}" data-action="stop"><svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12"/></svg>Стоп</button>
            `;
        } else {
            actionButtons = `
                <button class="task-btn pause" data-id="${task.id}" data-action="pause"><svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>Пауза</button>
                <button class="task-btn stop" data-id="${task.id}" data-action="stop"><svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12"/></svg>Стоп</button>
            `;
        }

        const skillTags = task.skills.map(s => `<span class="task-tag"><svg viewBox="0 0 24 24" fill="none" stroke="#a89a80" stroke-width="1.8"><path d="M6 18L18 6M14 4l6 6"/></svg>${s}</span>`).join('');
        const goal = goals.find(g => g.id === task.goalId);
        const goalTag = goal ? `<span class="task-tag"><svg viewBox="0 0 24 24" fill="none" stroke="#a89a80" stroke-width="1.8"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/></svg>${goal.title}</span>` : '';

        return `
            <div class="task-card">
                <div class="task-top">
                    <div>
                        <div class="task-title">${task.title}</div>
                        ${task.description ? `<div class="task-desc">${task.description}</div>` : ''}
                    </div>
                    <div class="task-timer">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#c9a866" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>
                        ${timeStr} <span class="mult">(×${complexityFactor.toFixed(1)} → ${xpTimeStr} XP)</span>
                    </div>
                </div>
                ${planned > 0 ? `<div class="task-progress"><div class="bar-track"><div class="bar-fill" style="width:${progress}%"></div></div></div>` : ''}
                <div class="task-meta">
                    ${skillTags}
                    ${goalTag}
                </div>
                <div class="task-actions">
                    ${actionButtons}
                </div>
            </div>
        `;
    }).join('');

    document.querySelectorAll('.task-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const id = parseInt(this.dataset.id);
            const action = this.dataset.action;
            handleTaskAction(id, action);
        });
    });
}

function renderGoal() {
    const block = document.getElementById('active-goal-block');
    if (!block) return;
    const activeGoal = goals.find(g => g.is_active === true);
    if (!activeGoal) {
        block.innerHTML = `
            <div class="sub-title"><svg viewBox="0 0 24 24" fill="none" stroke="#c9a866" stroke-width="1.6"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.6" fill="#c9a866"/></svg>Активная цель</div>
            <p style="color:#877a63; font-size:13px;">Нет активной цели</p>
        `;
        return;
    }
    const total = activeGoal.total_tasks || 0;
    const done = activeGoal.completed_tasks || 0;
    const progress = total > 0 ? Math.min(100, (done / total) * 100) : 0;

    block.innerHTML = `
        <div class="sub-title"><svg viewBox="0 0 24 24" fill="none" stroke="#c9a866" stroke-width="1.6"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.6" fill="#c9a866"/></svg>Активная цель</div>
        <div class="enemy-name" style="color:#f0dfa8; font-size: 14px; text-align:left; margin-bottom:0;">${activeGoal.title}</div>
        <div class="goal-progress-track"><div class="goal-progress-fill" style="width:${progress}%"></div></div>
        <div class="goal-label">${done} из ${total} задач выполнено</div>
    `;
}

async function renderGoalSelect() {
    const select = document.getElementById('add-goal');
    if (!select) return;
    const current = select.value;
    select.innerHTML = '<option value="">Без привязки</option>';
    goals.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g.id;
        opt.textContent = g.title;
        select.appendChild(opt);
    });
    if (current) select.value = current;
}

function renderSkillChecklist() {
    const container = document.getElementById('skills-checklist');
    if (!container) return;
    container.innerHTML = allSkills.map(skill => `
        <label class="skill-opt-row">
            <input type="checkbox" value="${skill}"> ${skill}
        </label>
    `).join('');
}

function renderAll() {
    renderStats();
    renderEnemy();
    renderAbilities();
    renderTasks();
    renderGoal();
    renderSkillChecklist();
    renderGoalSelect();
}

// ===== ДЕЙСТВИЯ С ЗАДАЧАМИ =====

function handleTaskAction(id, action) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    switch (action) {
        case 'start':
            if (!task.timer.started) {
                task.timer.started = true;
                task.timer.paused = false;
                task.timer.startTime = Date.now() - task.timer.elapsed * 1000;
                startTimerInterval(task.id);
            }
            break;
        case 'pause':
            if (task.timer.started && !task.timer.paused) {
                task.timer.paused = true;
                if (timerIntervals[task.id]) clearInterval(timerIntervals[task.id]);
                const now = Date.now();
                task.timer.elapsed = Math.floor((now - task.timer.startTime) / 1000);
            }
            break;
        case 'resume':
            if (task.timer.paused) {
                task.timer.paused = false;
                task.timer.startTime = Date.now() - task.timer.elapsed * 1000;
                startTimerInterval(task.id);
            }
            break;
        case 'stop':
            if (timerIntervals[task.id]) clearInterval(timerIntervals[task.id]);
            task.completed = true;
            showToast(`Задача "${task.title}" завершена! XP начислен.`);
            renderAll();
            break;
    }
    renderTasks();
}

function startTimerInterval(taskId) {
    if (timerIntervals[taskId]) clearInterval(timerIntervals[taskId]);
    timerIntervals[taskId] = setInterval(() => {
        const task = tasks.find(t => t.id === taskId);
        if (!task || task.completed) {
            clearInterval(timerIntervals[taskId]);
            return;
        }
        if (!task.timer.paused && task.timer.started) {
            const now = Date.now();
            task.timer.elapsed = Math.floor((now - task.timer.startTime) / 1000);
            renderTasks();
        }
    }, 1000);
}

// ===== ДОБАВЛЕНИЕ ЗАДАЧИ / ЦЕЛИ =====

async function addItem() {
    const type = document.getElementById('add-type').value;
    const title = document.getElementById('add-title').value.trim();
    const desc = document.getElementById('add-desc').value.trim();

    if (!title) {
        showToast('Введите название');
        return;
    }

    if (type === 'goal') {
        const result = await createGoalOnServer(title, desc);
        if (result) {
            showToast(`Цель "${title}" добавлена`);
            document.getElementById('add-title').value = '';
            document.getElementById('add-desc').value = '';
            const updatedGoals = await fetchGoals();
            goals = updatedGoals;
            renderAll();
        }
        return;
    }

    // Добавление задачи
    const skillCheckboxes = document.querySelectorAll('#skills-checklist input[type="checkbox"]:checked');
    const skills = Array.from(skillCheckboxes).map(cb => cb.value);
    const goalSelect = document.getElementById('add-goal');
    const goalId = goalSelect.value ? parseInt(goalSelect.value) : null;
    const resistance = parseInt(document.getElementById('add-resistance').value);
    const importance = parseInt(document.getElementById('add-importance').value);
    const urgency = parseInt(document.getElementById('add-urgency').value);
    const plannedInput = document.getElementById('add-planned').value;
    let planned = 0;
    if (plannedInput) {
        const parts = plannedInput.split(':');
        if (parts.length === 2) {
            planned = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60;
        } else if (parts.length === 1) {
            planned = parseInt(parts[0]) * 3600;
        }
    }

    const newTask = {
        id: Date.now(),
        title: title,
        description: desc,
        skills: skills,
        goalId: goalId,
        timer: { elapsed: 0, started: false, paused: false, startTime: null },
        planned: planned,
        complexity: { resistance, importance, urgency },
        completed: false
    };
    tasks.push(newTask);
    showToast(`Задача "${title}" добавлена`);
    document.getElementById('add-title').value = '';
    document.getElementById('add-desc').value = '';
    renderAll();
}

function toggleFormFields() {
    const type = document.getElementById('add-type').value;
    const taskFields = document.getElementById('task-fields');
    if (type === 'goal') {
        taskFields.style.display = 'none';
    } else {
        taskFields.style.display = 'block';
    }
}

// ===== ВСПОМОГАТЕЛЬНЫЕ =====

function showToast(msg) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    } else {
        alert(msg);
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====

export async function initGame() {
    const loadedGoals = await fetchGoals();
    if (loadedGoals.length > 0) {
        goals = loadedGoals;
    } else {
        if (goals.length === 0) {
            goals = [{ id: 1, title: 'Найти работу QA-инженера', description: '', tasks: [], is_active: false }];
        }
    }

    tasks.forEach(task => {
        if (task.timer.started && !task.timer.paused && !task.completed) {
            startTimerInterval(task.id);
        }
    });

    renderAll();

    document.getElementById('add-type').addEventListener('change', toggleFormFields);
    document.getElementById('add-btn').addEventListener('click', addItem);

    document.getElementById('add-resistance').addEventListener('input', function () {
        document.getElementById('resistance-val').textContent = this.value;
    });
    document.getElementById('add-importance').addEventListener('input', function () {
        document.getElementById('importance-val').textContent = this.value;
    });
    document.getElementById('add-urgency').addEventListener('input', function () {
        document.getElementById('urgency-val').textContent = this.value;
    });

    toggleFormFields();
    console.log('Game module initialized');
}

document.addEventListener('tabLoaded', (e) => {
    if (e.detail.tabId === 'game') {
        initGame();
    }
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    const gameTab = document.getElementById('tab-game');
    if (gameTab && gameTab.dataset.loaded === 'true') {
        initGame();
    }
}