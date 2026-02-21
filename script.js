// CONFIGURACIÓN FIREBASE (Usa la tuya siempre)
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

let currentUser = localStorage.getItem('user_name') || "NEO_USER";

window.onload = () => {
    setTimeout(() => {
        document.getElementById('boot-screen').style.opacity = '0';
        setTimeout(() => document.getElementById('boot-screen').classList.add('hidden'), 1000);
    }, 2500);
    updateClock();
    setInterval(updateClock, 1000);
};

// RELOJ Y TIMER
function updateClock() {
    const now = new Date();
    
    // --- RELOJ DE LA BARRA DE ESTADO ---
    document.getElementById('clock-time').innerText = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    // --- FECHA DEL HOME ---
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    document.getElementById('date-display').innerText = now.toLocaleDateString('es-ES', options).toUpperCase();

    // --- CONTADOR DE TIEMPO JUNTOS (MODIFICA TU FECHA AQUÍ) ---
    // Formato: Año, Mes (0-11), Día, Hora, Minuto
    // Nota: Enero es 0, Febrero es 1, etc. 
    const fechaInicio = new Date(2025, 10, 21, 15, 37); // Ejemplo: 21 de Noviembre de 2023, 8:00 PM
    
    const diff = now - fechaInicio;

    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diff % (1000 * 60)) / 1000);

    // Formato de salida NeoOne
    document.getElementById('timer-display').innerText = `${dias}D ${horas}H ${minutos}M ${segundos}S`;
}

// NAVEGACIÓN
function openView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    const nav = document.getElementById('main-navbar');
    id === 'view-home' ? nav.classList.add('hidden') : nav.classList.remove('hidden');
    document.getElementById('navbar-title').innerText = id.replace('view-', '').toUpperCase();
}
function goHome() { openView('view-home'); }

// --- CHAT LOGIC ---
function sendMsg() {
    const input = document.getElementById('chat-input');
    if(!input.value.trim()) return;
    db.ref('messages').push({ text: input.value, sender: currentUser, type: 'text', timestamp: Date.now() });
    input.value = "";
}

db.ref('messages').limitToLast(30).on('child_added', (sn) => {
    const m = sn.val();
    const box = document.getElementById('chat-container');
    const isMe = m.sender === currentUser;
    const div = document.createElement('div');
    div.className = `msg ${isMe ? 'sent' : 'received'}`;
    
    if(m.type === 'image') div.innerHTML = `<img src="${m.img}" class="msg-img">`;
    else if(m.type === 'sticker') div.style.fontSize = "50px", div.style.background = "none", div.innerText = m.text;
    else div.innerHTML = m.text;
    
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
});

// --- EL RESTO DE TUS FUNCIONES (Notas, Ubicación, etc.) ---
// Aquí puedes pegar tus funciones de saveNote(), compartirUbicacion() y el motor de juegos que ya tenías. 
// He dejado la estructura preparada para que funcionen con los nuevos IDs.