import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onChildAdded, set, remove } from "firebase/database";

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
const typingRef = ref(db, 'typing');

let currentUsername = "";
let typingTimeout;

// === ASCII ЛОГО (летучая мышь) ===
const asciiBat = `     
  __QQ
 (_)_">
 _) SHREKNET
 
`;

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
    const displaySpan = document.getElementById('username-display');
    if (displaySpan) displaySpan.textContent = currentUsername;
    return currentUsername;
}

function changeName(newName) {
    if (!newName || newName.trim() === "" || newName.trim() === currentUsername) return false;
    let oldName = currentUsername;
    currentUsername = newName.trim();
    localStorage.setItem('chat_username', currentUsername);
    const displaySpan = document.getElementById('username-display');
    if (displaySpan) displaySpan.textContent = currentUsername;
    
    push(messagesRef, {
        name: "⚠️ СИСТЕМА",
        text: `${oldName} → теперь → ${currentUsername}`,
        timestamp: Date.now()
    }).catch(console.error);
    return true;
}

// === Очистка истории ===
function clearHistory() {
    if (confirm("⚠️ ВСЕ сообщения будут удалены безвозвратно. Продолжить?")) {
        remove(messagesRef).then(() => {
            const messagesList = document.getElementById('messages-list');
            if (messagesList) {
                messagesList.innerHTML = '<div class="message system">История очищена. Напишите первое сообщение...</div>';
            }
            push(messagesRef, {
                name: "⚠️ СИСТЕМА",
                text: "История чата была очищена.",
                timestamp: Date.now()
            }).catch(console.error);
        }).catch(err => console.error("Ошибка очистки:", err));
    }
}

// === Обработка команд ===
function handleCommand(commandText) {
    const parts = commandText.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    
    if (cmd === '/help') {
        const helpMsg = "Доступные команды:\n/help - эта справка\n/nick <имя> - сменить имя\n/clear - очистить историю чата\n/logo - показать лого ShrekNet";
        alert(helpMsg);
        push(messagesRef, {
            name: "📟 СИСТЕМА",
            text: helpMsg.replace(/\n/g, ' | '),
            timestamp: Date.now()
        }).catch(console.error);
        return true;
    }
    else if (cmd === '/nick') {
        if (parts.length < 2) {
            alert("Использование: /nick <новое имя>");
            return true;
        }
        const newName = parts.slice(1).join(" ");
        changeName(newName);
        return true;
    }
    else if (cmd === '/clear') {
        clearHistory();
        return true;
    }
    else if (cmd === '/logo') {
        push(messagesRef, {
            name: "🦇 ASCII",
            text: asciiBat,
            timestamp: Date.now()
        }).catch(console.error);
        return true;
    }
    return false;
}

// === Статус "печатает" ===
function setupTypingStatus(inputElement, statusDiv) {
    inputElement.addEventListener('input', () => {
        if (!currentUsername) return;
        const typingData = {};
        typingData[currentUsername] = true;
        set(typingRef, typingData).catch(console.error);
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            const offData = {};
            offData[currentUsername] = null;
            set(typingRef, offData).catch(console.error);
        }, 1500);
    });
    
    onChildAdded(typingRef, (snap) => {
        const typingUsers = snap.val();
        if (typingUsers && typeof typingUsers === 'object') {
            const users = Object.keys(typingUsers).filter(u => typingUsers[u] === true && u !== currentUsername);
            if (users.length > 0) {
                statusDiv.innerHTML = `печатает: ${users.slice(0, 3).join(', ')}${users.length > 3 ? '...' : ''}`;
            } else {
                statusDiv.innerHTML = '';
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadOrAskName();
    
    const changeBtn = document.getElementById('change-name-btn');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-button');
    const messagesList = document.getElementById('messages-list');
    
    // Блок статуса "печатает"
    let statusDiv = document.querySelector('.typing-status');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.className = 'typing-status';
        const inputArea = document.querySelector('.input-area');
        if (inputArea) inputArea.parentNode.insertBefore(statusDiv, inputArea.nextSibling);
    }
    
    if (changeBtn) {
        changeBtn.addEventListener('click', () => {
            const newName = prompt("Введите новое имя:", currentUsername);
            if (newName) changeName(newName);
        });
    }
    
    function sendMessage() {
        let text = messageInput.value.trim();
        if (text === "") return;
        
        if (text.startsWith('/')) {
            if (handleCommand(text)) {
                messageInput.value = "";
                messageInput.focus();
                return;
            }
        }
        
        push(messagesRef, {
            name: currentUsername,
            text: text,
            timestamp: Date.now()
        }).catch(console.error);
        messageInput.value = "";
        messageInput.focus();
    }
    
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Загрузка сообщений и показ лого (один раз за сессию)
    messagesList.innerHTML = '<div class="message system">Загрузка истории терминала...</div>';
    
    let logoShown = sessionStorage.getItem('logo_shown');
    if (!logoShown) {
        const logoDiv = document.createElement('div');
        logoDiv.className = 'message system';
        logoDiv.innerHTML = `<pre style="font-family: monospace; font-size: 0.7rem; line-height: 1.2;">${asciiBat}</pre>`;
        messagesList.appendChild(logoDiv);
        sessionStorage.setItem('logo_shown', 'true');
    }
    
    let firstRealMessage = true;
    onChildAdded(messagesRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        
        if (firstRealMessage && messagesList.children.length === 1 && messagesList.children[0].innerText.includes("Загрузка")) {
            messagesList.innerHTML = '';
            if (sessionStorage.getItem('logo_shown') === 'true') {
                const logoDiv = document.createElement('div');
                logoDiv.className = 'message system';
                logoDiv.innerHTML = `<pre style="font-family: monospace; font-size: 0.7rem; line-height: 1.2;">${asciiBat}</pre>`;
                messagesList.appendChild(logoDiv);
            }
            firstRealMessage = false;
        }
        
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message';
        msgDiv.innerHTML = `<strong>${escapeHtml(data.name)}</strong> ${escapeHtml(data.text)}`;
        messagesList.appendChild(msgDiv);
        messagesList.scrollTop = messagesList.scrollHeight;
    });
    
    setupTypingStatus(messageInput, statusDiv);
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
