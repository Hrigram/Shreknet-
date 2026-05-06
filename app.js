
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onChildAdded } from "firebase/database";

// Ваша конфигурация Firebase (скопируйте из консоли)
const firebaseConfig = {
  apiKey: "AIzaSyC0gnDfPZKdTRx0pQ1ExYtsv31z37V6XEY",
  authDomain: "shreknet-bloodline.firebaseapp.com",
  databaseURL: "https://shreknet-bloodline-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "shreknet-bloodline",
  storageBucket: "shreknet-bloodline.firebasestorage.app",
  messagingSenderId: "807684896663",
  appId: "1:807684896663:web:0271fdd772993dc13e76d2"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messagesRef = ref(db, 'messages');

// --- ЗАПОМИНАНИЕ ИМЕНИ ---
let username = localStorage.getItem('chat_username');
if (!username) {
    username = prompt("Как вас зовут?");
    if (username && username.trim()) {
        localStorage.setItem('chat_username', username.trim());
        username = username.trim();
    } else {
        username = "Аноним";
    }
}
// Отобразим имя в шапке (добавьте в index.html элемент с id="username-display" или измените заголовок)
const headerTitle = document.querySelector('.chat-header h2');
if (headerTitle) headerTitle.innerHTML = `💬 Чат • ${escapeHtml(username)}`;

// --- ОТПРАВКА ---
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-button');

function sendMessage() {
    const text = messageInput.value.trim();
    if (text === "") return;
    push(messagesRef, {
        name: username,
        text: text,
        timestamp: Date.now()
    });
    messageInput.value = "";
    messageInput.focus();
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

// --- ПОЛУЧЕНИЕ СООБЩЕНИЙ (ИСТОРИЯ + НОВЫЕ) ---
const messagesList = document.getElementById('messages-list');
messagesList.innerHTML = '<div class="message system">Загрузка сообщений...</div>';

onChildAdded(messagesRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;
    
    // Удаляем плашку "Загрузка..." при первом полученном сообщении
    if (messagesList.children.length === 1 && messagesList.children[0].innerText.includes('Загрузка')) {
        messagesList.innerHTML = '';
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.innerHTML = `<strong>${escapeHtml(data.name)}</strong> ${escapeHtml(data.text)}`;
    messagesList.appendChild(messageDiv);
    messagesList.scrollTop = messagesList.scrollHeight;
});

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}
