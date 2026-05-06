import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onChildAdded } from "firebase/database";

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

// === Функции работы с именем ===
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
    // Обновляем отображение имени
    const displaySpan = document.getElementById('username-display');
    if (displaySpan) displaySpan.textContent = currentUsername;
    return currentUsername;
}

function changeName() {
    let newName = prompt("Введите новое имя:", currentUsername);
    if (newName && newName.trim() !== "" && newName.trim() !== currentUsername) {
        let oldName = currentUsername;
        currentUsername = newName.trim();
        localStorage.setItem('chat_username', currentUsername);
        const displaySpan = document.getElementById('username-display');
        if (displaySpan) displaySpan.textContent = currentUsername;
        
        // Отправляем системное сообщение о смене имени
        push(messagesRef, {
            name: "⚠️ СИСТЕМА",
            text: `${oldName} → теперь → ${currentUsername}`,
            timestamp: Date.now()
        }).catch(err => console.error("Ошибка отправки:", err));
        
        alert(`Имя изменено на ${currentUsername}`);
    } else if (newName === currentUsername) {
        alert("Это ваше текущее имя.");
    }
}

// === Ждём загрузки DOM ===
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем или спрашиваем имя
    loadOrAskName();
    
    // Навешиваем обработчик на кнопку смены имени
    const changeBtn = document.getElementById('change-name-btn');
    if (changeBtn) {
        changeBtn.addEventListener('click', changeName);
        console.log("Кнопка смены имени подключена");
    } else {
        console.error("Кнопка смены имени не найдена в DOM");
    }
    
    // Элементы чата
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-button');
    const messagesList = document.getElementById('messages-list');
    
    if (!messageInput || !sendBtn || !messagesList) {
        console.error("Ошибка: не найдены элементы чата");
        return;
    }
    
    // Отправка сообщения
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
    
    // Загрузка сообщений (история)
    messagesList.innerHTML = '<div class="message system">Загрузка истории терминала...</div>';
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
