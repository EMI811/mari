// CONFIG FIREBASE (Sustituye por la tuya completa)
const firebaseConfig = {
    apiKey: "AIzaSyCRjtVHymOKWp_n13G4xkYpr8_pUTHaMgc",
    databaseURL: "https://nuestraapp-97318-default-rtdb.firebaseio.com/",
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let currentUser = "NEO_USER";

window.onload = () => {
    setTimeout(() => {
        document.getElementById('boot-screen').style.opacity = '0';
        setTimeout(() => document.getElementById('boot-screen').classList.add('hidden'), 800);
    }, 2000);
    setInterval(updateSystem, 1000);
    loadNotes();
    loadVault();
};

function updateSystem() {
    const now = new Date();
    document.getElementById('clock-time').innerText = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    document.getElementById('date-display').innerText = now.toLocaleDateString('es-ES', {weekday: 'long', day: 'numeric', month: 'long'}).toUpperCase();
    
    // Timer juntos (Ajusta tu fecha aquí)
    const start = new Date(2025, 10, 21); 
    const diff = now - start;
    const d = Math.floor(diff / (1000*60*60*24));
    const h = Math.floor((diff/(1000*60*60))%24);
    const m = Math.floor((diff/(1000*60))%60);
    const s = Math.floor((diff/1000)%60);
    document.getElementById('timer-display').innerText = `${d}D ${h}H ${m}M ${s}S`;
}

// NAVEGACIÓN
function openView(id, title) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.getElementById('main-navbar').classList.remove('hidden');
    document.getElementById('navbar-title').innerText = title;
    if(id === 'view-home') document.getElementById('main-navbar').classList.add('hidden');
}
function goHome() { openView('view-home'); }

// --- CHAT Y MULTIMEDIA ---
function sendMsg() {
    const input = document.getElementById('chat-input');
    if(!input.value.trim()) return;
    db.ref('messages').push({ text: input.value, sender: currentUser, type: 'text', time: Date.now() });
    input.value = "";
}

function sendSticker(emoji) {
    db.ref('messages').push({ text: emoji, sender: currentUser, type: 'sticker', time: Date.now() });
    toggleStickers();
}

function sendImage(input, destination) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const path = destination === 'messages' ? 'messages' : 'vault';
        db.ref(path).push({ img: e.target.result, sender: currentUser, type: 'image', time: Date.now() });
    };
    reader.readAsDataURL(file);
}

function toggleStickers() { document.getElementById('sticker-panel').classList.toggle('hidden'); }

// Listeners Chat
db.ref('messages').limitToLast(20).on('child_added', (snap) => {
    const m = snap.val();
    const box = document.getElementById('chat-container');
    const div = document.createElement('div');
    div.className = `msg ${m.sender === currentUser ? 'sent' : 'received'}`;
    
    if(m.type === 'image') div.innerHTML = `<img src="${m.img}" class="msg-img">`;
    else if(m.type === 'sticker') { div.innerText = m.text; div.style.fontSize = "50px"; div.style.background = "none"; }
    else div.innerText = m.text;
    
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
});

// --- VAULT (FOTOS) ---
function loadVault() {
    db.ref('vault').on('value', (snap) => {
        const container = document.getElementById('gallery-container');
        container.innerHTML = "";
        snap.forEach(child => {
            const data = child.val();
            const img = document.createElement('img');
            img.src = data.img;
            img.className = "gallery-item";
            container.appendChild(img);
        });
    });
}

// --- NOTES ---
function saveNote() {
    const input = document.getElementById('note-input');
    if(!input.value.trim()) return;
    db.ref('notes').push({ text: input.value, time: Date.now() });
    input.value = "";
}

function loadNotes() {
    db.ref('notes').on('value', (snap) => {
        const container = document.getElementById('notes-container');
        container.innerHTML = "";
        snap.forEach(child => {
            const n = child.val();
            const div = document.createElement('div');
            div.className = "ios-item";
            div.innerHTML = `<span>${n.text}</span><small>${new Date(n.time).toLocaleDateString()}</small>`;
            container.appendChild(div);
        });
    });
}