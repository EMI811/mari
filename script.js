// CONFIGURACIÓN FIREBASE (Mantén tu config aquí)
const firebaseConfig = {
    apiKey: "AIzaSyCRjtVHymOKWp_n13G4xkYpr8_pUTHaMgc",
    authDomain: "nuestraapp-97318.firebaseapp.com",
    databaseURL: "https://nuestraapp-97318-default-rtdb.firebaseio.com/",
    projectId: "nuestraapp-97318",
    storageBucket: "nuestraapp-97318.firebasestorage.app",
    messagingSenderId: "834055152460",
    appId: "1:834055152460:web:19649783347887502025e9"
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let currentUser = localStorage.getItem('user_name') || "User_01";

// BOOT SYSTEM
window.onload = () => {
    setTimeout(() => {
        const boot = document.getElementById('boot-screen');
        boot.style.opacity = '0';
        setTimeout(() => boot.classList.add('hidden'), 1000);
    }, 2500);
    updateClock();
    setInterval(updateClock, 1000);
};

function updateClock() {
    const now = new Date();
    document.getElementById('clock-time').innerText = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    document.getElementById('date-display').innerText = now.toLocaleDateString('en-US', options).toUpperCase();
}

function openView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    const nav = document.getElementById('main-navbar');
    id === 'view-home' ? nav.classList.add('hidden') : nav.classList.remove('hidden');
}

function goHome() { openView('view-home'); }

// CHAT ENGINE
function sendMsg() {
    const input = document.getElementById('chat-input');
    const txt = input.value.trim();
    if(!txt) return;
    db.ref('messages').push({ text: txt, sender: currentUser, type: 'text', timestamp: Date.now() });
    input.value = "";
}

function sendImage(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        db.ref('messages').push({ img: e.target.result, sender: currentUser, type: 'image', timestamp: Date.now() });
    };
    reader.readAsDataURL(file);
}

function toggleStickers() { document.getElementById('sticker-panel').classList.toggle('hidden'); }

function sendSticker(emoji) {
    db.ref('messages').push({ text: emoji, sender: currentUser, type: 'sticker', timestamp: Date.now() });
    toggleStickers();
}

db.ref('messages').limitToLast(30).on('child_added', (sn) => {
    const m = sn.val();
    const box = document.getElementById('chat-container');
    const isMe = m.sender === currentUser;
    const time = new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const div = document.createElement('div');
    div.className = `msg ${isMe ? 'sent' : 'received'}`;
    
    if(m.type === 'image') div.innerHTML = `<img src="${m.img}" class="msg-img">`;
    else if(m.type === 'sticker') div.style.fontSize = "50px", div.style.background = "none", div.innerText = m.text;
    else div.innerHTML = `<b>${isMe ? '' : m.sender + ': '}</b>${m.text}`;
    
    div.innerHTML += `<span class="msg-time">${time}</span>`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
});