import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onChildAdded } from "firebase/database";

// TODO: Замените этот объект на ваш!
// ID вашего проекта можно скопировать в настройках Firebase (шестеренка -> Настройки проекта -> Общие)
const firebaseConfig = {
  apiKey: "AIzaSyC0gnDfPZKdTRx0pQ1ExYtsv31z37V6XEY",
  authDomain: "shreknet-bloodline.firebaseapp.com",
  databaseURL: "https://shreknet-bloodline-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "shreknet-bloodline",
  storageBucket: "shreknet-bloodline.firebasestorage.app",
  messagingSenderId: "807684896663",
  appId: "1:807684896663:web:0271fdd772993dc13e76d2"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messagesRef = ref(db, 'messages'); // Ссылка на узел "messages" в базе данных

// --- РАБОТА С ИМЕНЕМ ПОЛЬЗОВАТЕЛЯ ---
let username = localStorage.getItem('chat_username');
if (!username) {
    username = prompt("Представьтесь, пожалуйста, как к вам обращаться?");
    if (username && username.trim() !== "") {
        localStorage.setItem('chat_username', username.trim());
    } else {
        username = "Гость";
    }
}
// Показываем имя в заголовке (опционально)
document.querySelector('.chat-header h2').innerHTML = `💬 Чат • ${escapeHtml(username)}`;

// --- ДАЛЕЕ ВАШ ОБЫЧНЫЙ КОД ДЛЯ ОТПРАВКИ И ПОЛУЧЕНИЯ СООБЩЕНИЙ ---
// ... (функция sendMessage, onChildAdded и т.д.)

// Спрашиваем имя пользователя
const username = prompt("Представьтесь, пожалуйста, как к вам обращаться?");
if (!username) {
    alert("Без имени нельзя! Обновите страницу и введите имя.");
    window.location.reload();
}

// === ОТПРАВКА СООБЩЕНИЯ ===
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-button');

function sendMessage() {
    const text = messageInput.value.trim();
    if (text === "") return;

    // Сохраняем объект с данными сообщения в базу Firebase
    push(messagesRef, {
        name: username,
        text: text,
        timestamp: Date.now() // ставим временную метку для сортировки
    });

    messageInput.value = ""; // Очищаем поле ввода
    messageInput.focus();    // Возвращаем фокус
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// === ПОЛУЧЕНИЕ СООБЩЕНИЙ В РЕАЛЬНОМ ВРЕМЕНИ ===
const messagesList = document.getElementById('messages-list');

// При загрузке страницы очищаем контейнер, но оставляем системное приветствие (по желанию)
const messagesList = document.getElementById('messages-list');
messagesList.innerHTML = '<div class="message system">Загрузка истории...</div>';

// Подписываемся на все сообщения (существующие + новые)
onChildAdded(messagesRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    // Убираем временное "Загрузка..." если это первое сообщение
    if (messagesList.children.length === 1 && messagesList.children[0].innerText.includes('Загрузка')) {
        messagesList.innerHTML = '';
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.innerHTML = `<strong>${escapeHtml(data.name)}</strong> ${escapeHtml(data.text)}`;
    messagesList.appendChild(messageDiv);
    messagesList.scrollTop = messagesList.scrollHeight;
});

// Простая защита от XSS-атак через экранирование HTML
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

;
