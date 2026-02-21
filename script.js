// CONFIG FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyCRjtVHymOKWp_n13G4xkYpr8_pUTHaMgc",
    databaseURL: "https://nuestraapp-97318-default-rtdb.firebaseio.com/",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const currentUser = "NEO_USER"; // Puedes cambiarlo por un prompt de nombre

// BOOT
window.onload = () => {
    setTimeout(() => {
        document.getElementById('boot-screen').style.opacity = '0';
        setTimeout(() => document.getElementById('boot-screen').classList.add('hidden'), 800);
    }, 2000);
    setInterval(updateSystem, 1000);
};

function updateSystem() {
    const now = new Date();
    document.getElementById('clock-time').innerText = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    document.getElementById('date-display').innerText = now.toLocaleDateString('es-ES', {weekday: 'long', day: 'numeric', month: 'long'}).toUpperCase();

    // Contador (Ajusta tu fecha aquí)
    const start = new Date(2023, 10, 21); 
    const diff = now - start;
    const d = Math.floor(diff / (1000*60*60*24));
    const h = Math.floor((diff/(1000*60*60))%24);
    const m = Math.floor((diff/(1000*60))%60);
    const s = Math.floor((diff/1000)%60);
    document.getElementById('timer-display').innerText = `${d}D ${h}H ${m}M ${s}S`;
}

function openView(id, title) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.getElementById('main-navbar').classList.remove('hidden');
    document.getElementById('navbar-title').innerText = title;
    if(id === 'view-home') document.getElementById('main-navbar').classList.add('hidden');
}

function goHome() { openView('view-home'); }

// CHAT SIMPLE QUE SI SIRVE
function sendMsg() {
    const input = document.getElementById('chat-input');
    if(!input.value.trim()) return;
    db.ref('messages').push({ text: input.value, sender: currentUser, time: Date.now() });
    input.value = "";
}

db.ref('messages').limitToLast(20).on('child_added', (snap) => {
    const m = snap.val();
    const box = document.getElementById('chat-container');
    const div = document.createElement('div');
    div.style = `padding: 10px 15px; border-radius: 15px; margin-bottom: 5px; max-width: 80%; ${m.sender === currentUser ? 'background: #007aff; align-self: flex-end;' : 'background: #3a3a3c; align-self: flex-start;'}`;
    div.innerText = m.text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
});