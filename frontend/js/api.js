// api.js — все запросы к серверу

const API_BASE = '';

async function request(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Ошибка ${res.status}: ${errorText}`);
    }
    return res.json();
}

// ===== ЦЕЛИ =====
export async function getGoals(userId) {
    return request(`/api/goals?user_id=${userId}`);
}

export async function createGoal(userId, title, description) {
    return request('/api/goals', 'POST', { user_id: userId, title, description });
}

// ===== ЗАДАЧИ (пока заглушки, позже добавим) =====
export async function getTasks(userId) {
    return request(`/api/tasks?user_id=${userId}`);
}

export async function createTask(taskData) {
    return request('/api/tasks', 'POST', taskData);
}

export async function updateTask(taskId, data) {
    return request(`/api/tasks/${taskId}`, 'PUT', data);
}

export async function deleteTask(taskId) {
    return request(`/api/tasks/${taskId}`, 'DELETE');
}