// auth.js — управление авторизацией

// Получаем элементы DOM
const authContainer = document.getElementById('auth-container');
const profileContainer = document.getElementById('profile-container');
const usernameDisplay = document.getElementById('username-display');
const authMessage = document.getElementById('auth-message');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const mainContent = document.getElementById('main-content'); // основной интерфейс

// При загрузке страницы проверяем, сохранён ли пользователь
const savedUser = localStorage.getItem('user');
if (savedUser) {
    const user = JSON.parse(savedUser);
    showProfile(user.username);
} else {
    // Если пользователь не сохранён, показываем авторизацию и скрываем основной контент
    showAuth();
}

// Функция показа профиля (вход выполнен)
function showProfile(username) {
    authContainer.style.display = 'none';        // скрываем форму авторизации
    profileContainer.style.display = 'block';    // показываем профиль
    mainContent.style.display = 'block';         // показываем основной интерфейс
    usernameDisplay.textContent = username;
}

// Функция показа авторизации (выход)
function showAuth() {
    authContainer.style.display = 'block';       // показываем форму авторизации
    profileContainer.style.display = 'none';     // скрываем профиль
    mainContent.style.display = 'none';          // скрываем основной интерфейс
    localStorage.removeItem('user');             // удаляем данные пользователя
}

// Регистрация
registerBtn.addEventListener('click', async () => {
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    if (!username || !password) {
        authMessage.textContent = 'Заполните оба поля';
        return;
    }
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            authMessage.textContent = data.message || 'Регистрация успешна! Теперь войдите.';
            document.getElementById('auth-username').value = '';
            document.getElementById('auth-password').value = '';
        } else {
            authMessage.textContent = data.error || 'Ошибка регистрации';
        }
    } catch (err) {
        authMessage.textContent = 'Ошибка сети';
        console.error(err);
    }
});

// Вход
loginBtn.addEventListener('click', async () => {
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    if (!username || !password) {
        authMessage.textContent = 'Заполните оба поля';
        return;
    }
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            // Сохраняем пользователя в localStorage (с userId)
            localStorage.setItem('user', JSON.stringify({ username: data.username, userId: data.user_id }));
            showProfile(data.username);
            authMessage.textContent = '';
        } else {
            authMessage.textContent = data.error || 'Ошибка входа';
        }
    } catch (err) {
        authMessage.textContent = 'Ошибка сети';
        console.error(err);
    }
});

// Выход
logoutBtn.addEventListener('click', () => {
    showAuth();
    authMessage.textContent = 'Вы вышли';
});

// Функция для получения userId из localStorage (полезна в других модулях)
export function getCurrentUserId() {
    const user = localStorage.getItem('user');
    if (user) {
        return JSON.parse(user).userId;
    }
    return null;
}

// Функция для получения username из localStorage
export function getCurrentUsername() {
    const user = localStorage.getItem('user');
    if (user) {
        return JSON.parse(user).username;
    }
    return null;
}