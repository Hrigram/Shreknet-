import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onChildAdded } from "firebase/database";

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

// Запоминаем или спрашиваем имя
let username = localStorage.getItem('username');
if (!username) {
    username = prompt("Введите ваше имя:");
    if (username) localStorage.setItem('username', username);
    else username = "Гость";
}

// Элементы
const input = document.getElementById('message-input');
const btn = document.getElementById('send-button');
const container = document.getElementById('messages-list');

function send() {
    let text = input.value.trim();
    if (text === "") return;
    push(messagesRef, { name: username, text: text });
    input.value = "";
}

btn.onclick = send;
input.onkeypress = (e) => { if (e.key === "Enter") send(); };

// Загрузка сообщений
container.innerHTML = '<div class="message system">Загрузка...</div>';
onChildAdded(messagesRef, (snap) => {
    let msg = snap.val();
    if (!msg) return;
    if (container.children.length === 1 && container.children[0].innerText.includes("Загрузка")) {
        container.innerHTML = "";
    }
    let div = document.createElement("div");
    div.className = "message";
    div.innerHTML = `<strong>${escapeHtml(msg.name)}</strong> ${escapeHtml(msg.text)}`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
});

function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}
