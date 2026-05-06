import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onChildAdded } from "firebase/database";

// Ваша конфигурация Firebase (уже правильная)
const firebaseConfig = {
  apiKey: "AIzaSyC0gnDfPZKdTRx0pQ1ExYtsv31z37V6XEY",
  authDomain: "shreknet-bloodline.firebaseapp.com",
  databaseURL: "https://shreknet-bloodline-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "shreknet-bloodline",
  storageBucket: "shreknet-bloodline.firebasestorage.app",
  messagingSenderId: "807684896663",
  appId: "1:807684896663:web:c9878ece00b2b69d3e76d2"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messagesRef = ref(db, 'messages');

let currentUsername = "";

// Загрузка или запрос имени
function loadOrAskName() {
    let saved = localStorage.getItem('chat_username');
    if (saved && saved.trim() !== "") {
        currentUsername = saved.trim();
    } else {
        let newName = prompt("Введите ваше имя:", "Гость");
        if (newName && newName.trim() !== "") {
            currentUsername = newName.trim();
        } else {
            currentUsername = "Гость";
        }
        localStorage.setItem('chat_username', currentUsername);
    }
    const displaySpan = document.getElementById('username-display');
    if (displaySpan) displaySpan.textContent = currentUsername;
    return currentUsername;
}

// Смена имени
function changeName() {
    let newName = prompt("Введите новое имя:", currentUsername);
    if (newName && newName.trim() !== "" && newName.trim() !== currentUsername) {
        currentUsername = newName.trim();
        localStorage.setItem('chat_username', currentUsername);
        const displaySpan = document.getElementById('username-display');
        if (displaySpan) displaySpan.textContent = currentUsername;
        // Отправить системное сообщение о смене имени (можно удалить, если не нужно)
        push(messagesRef, {
            name: "Система",
            text: `👤 Пользователь сменил имя на ${currentUsername}`,
            timestamp: Date.now()
        }).catch(console.error);
    } else if (newName === currentUsername) {
        alert("Это ваше текущее имя.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadOrAskName();

    const changeBtn = document.getElementById('change-name-btn');
    if (changeBtn) changeBtn.addEventListener('click', changeName);

    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-button');
    const messagesList = document.getElementById('messages-list');

    if (!messageInput || !sendBtn || !messagesList) {
        console.error("Элементы чата не найдены");
        return;
    }

    function sendMessage() {
        const text = messageInput.value.trim();
        if (text === "") return;
        push(messagesRef, {
            name: currentUsername,
            text: text,
            timestamp: Date.now()
        }).catch(err => console.error("Ошибка отправки:", err));
        messageInput.value = "";
        messageInput.focus();
    }

    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Загрузка всех сообщений (история + новые)
    messagesList.innerHTML = '<div class="message system">Загрузка истории...</div>';
    onChildAdded(messagesRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        if (messagesList.children.length === 1 && messagesList.children[0].innerText.includes("Загрузка")) {
            messagesList.innerHTML = '';
        }
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.innerHTML = `<strong>${escapeHtml(data.name)}</strong> ${escapeHtml(data.text)}`;
        messagesList.appendChild(messageDiv);
        messagesList.scrollTop = messagesList.scrollHeight;
    });
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
