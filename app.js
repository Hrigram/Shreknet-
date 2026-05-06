import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onChildAdded } from "firebase/database";

// Ваша обновлённая конфигурация
const firebaseConfig = {
  apiKey: "AIzaSyC0gnDfPZKdTRx0pQ1ExYtsv31z37V6XEY",
  authDomain: "shreknet-bloodline.firebaseapp.com",
  databaseURL: "https://shreknet-bloodline-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "shreknet-bloodline",
  storageBucket: "shreknet-bloodline.firebasestorage.app",
  messagingSenderId: "807684896663",
  appId: "1:807684896663:web:c9878ece00b2b69d3e76d2"
};

// Инициализация
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messagesRef = ref(db, 'messages');

// Запрашиваем имя
let username = localStorage.getItem('chat_name');
if (!username) {
    username = prompt("Введите ваше имя:");
    if (username) localStorage.setItem('chat_name', username);
    else username = "Гость";
}

// Показываем имя в заголовке
document.querySelector('.chat-header h2').innerHTML = `Чат • ${username}`;

// Элементы
const input = document.getElementById('message-input');
const btn = document.getElementById('send-button');
const container = document.getElementById('messages-list');

// Отправка
function sendMessage() {
    const text = input.value.trim();
    if (text === "") return;
    push(messagesRef, { name: username, text: text, time: Date.now() });
    input.value = "";
}

btn.onclick = sendMessage;
input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

// Получение сообщений
container.innerHTML = '<div class="message system">Подключение...</div>';
onChildAdded(messagesRef, (snap) => {
    const data = snap.val();
    if (!data) return;
    if (container.children.length === 1 && container.children[0].innerText === "Подключение...") {
        container.innerHTML = "";
    }
    const div = document.createElement('div');
    div.className = 'message';
    div.innerHTML = `<strong>${escapeHtml(data.name)}</strong> ${escapeHtml(data.text)}`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
});

function escapeHtml(s) {
    if (!s) return '';
    return s.replace(/[&<>]/g, function(c) {
        if (c === '&') return '&amp;';
        if (c === '<') return '&lt;';
        if (c === '>') return '&gt;';
        return c;
    });
}
