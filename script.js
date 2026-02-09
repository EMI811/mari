const firebaseConfig = {
    apiKey: "AIzaSyCRjtVHymOKWp_n13G4xkYpr8_pUTHaMgc",
    authDomain: "nuestraapp-97318.firebaseapp.com",
    databaseURL: "https://nuestraapp-97318-default-rtdb.firebaseio.com/", 
    projectId: "nuestraapp-97318",
    storageBucket: "nuestraapp-97318.firebasestorage.app",
    messagingSenderId: "834055152460",
    appId: "1:834055152460:web:19649783347887502025e9"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// --- SISTEMA DE "CUENTA" ---
function login() {
    const nombre = prompt("Ingresa tu nombre para entrar (ej: Amor, Juan, Maria):");
    if (nombre) {
        localStorage.setItem('user_name', nombre);
        // Guardar en Firebase que este usuario existe
        db.ref('users/' + nombre).update({
            lastLogin: Date.now(),
            online: true
        });
        location.reload(); // Recargar para aplicar cambios
    }
}

function updateProfileUI() {
    const user = localStorage.getItem('user_name');
    if (user) {
        document.getElementById('display-name').innerText = user;
        document.getElementById('display-role').innerText = "Usuario Activo";
        document.getElementById('user-avatar').innerText = user.charAt(0).toUpperCase();
        document.querySelector('.main-title').innerText = "Hola, " + user + " ❤️";
    }
}

function borrarTodo() {
    if(confirm("¿Seguro que quieres cerrar sesión?")) {
        localStorage.clear();
        location.reload();
    }
}

// --- NAVEGACIÓN ---
function openView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.getElementById('btn-back').classList.remove('hidden');
    document.getElementById('btn-settings-nav').classList.add('hidden');
}

function goHome() {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-home').classList.add('active');
    document.getElementById('btn-back').classList.add('hidden');
    document.getElementById('btn-settings-nav').classList.remove('hidden');
    gameRunning = false;
}

// --- CHAT CON PERFILES ---
function sendMsg() {
    const input = document.getElementById('chat-input');
    const user = localStorage.getItem('user_name') || "Anonimo";
    if(!input.value) return;

    db.ref('messages').push({
        text: input.value,
        sender: user,
        timestamp: Date.now()
    });
    input.value = "";
}

db.ref('messages').limitToLast(1).on('child_added', (sn) => {
    const m = sn.val();
    if(m.sender !== localStorage.getItem('user_name')) {
        showBanner(m.sender, m.text);
    }
});

db.ref('messages').on('value', (sn) => {
    const box = document.getElementById('chat-container');
    box.innerHTML = "";
    sn.forEach(c => {
        const m = c.val();
        const isMe = m.sender === localStorage.getItem('user_name');
        const div = document.createElement('div');
        div.className = `msg ${isMe ? 'sent' : 'received'}`;
        div.innerHTML = `<small style="display:block; font-size:10px; opacity:0.6">${m.sender}</small>${m.text}`;
        box.appendChild(div);
    });
    box.scrollTop = box.scrollHeight;
});

// --- BANNER DE NOTIFICACIÓN ---
function showBanner(t, m) {
    const b = document.getElementById('ios-notification');
    document.getElementById('notif-title').innerText = t;
    document.getElementById('notif-msg').innerText = m;
    b.classList.add('notif-active');
    setTimeout(() => b.classList.remove('notif-active'), 3000);
}

// --- INICIO ---
window.onload = () => {
    updateProfileUI();
    
    // Contador
    setInterval(() => {
        const inicio = new Date(2025, 11, 21); // Ajusta tu fecha aquí
        const diff = new Date() - inicio;
        const dias = Math.floor(diff / (1000*60*60*24));
        document.getElementById('timer-display').innerText = dias + " días juntos";
    }, 1000);

    // Cargar fondo guardado
    if(localStorage.getItem('user_wp')) {
        document.body.style.background = localStorage.getItem('user_wp');
    }
};

function setWP(c) {
    document.body.style.background = c;
    localStorage.setItem('user_wp', c);
}