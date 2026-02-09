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

// --- VARIABLES ---
let isJiggleMode = false;
let longPressTimer;
let currentPhotoKey = null; // Para saber qué foto borrar
let currentFilter = 0; // 0: Normal, 1: B&N, 2: Sepia

// --- INICIO Y EVENTOS ---
window.onload = () => {
    updateProfileUI();
    // Restaurar Glass Mode si estaba activo
    if(localStorage.getItem('glassMode') === 'true') {
        document.body.classList.add('glass-active');
        document.getElementById('glass-check').checked = true;
    } else if(localStorage.getItem('user_wp')) {
        document.body.style.background = localStorage.getItem('user_wp');
    }

    // Timer de la relación
    setInterval(() => {
        const inicio = new Date(2025, 11, 21);
        const diff = new Date() - inicio;
        const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
        const el = document.getElementById('timer-display');
        if(el) el.innerText = dias + " días juntos";
    }, 1000);

    setupJiggleMode();
};

// --- LOGICA DE JIGGLE MODE (TEMBLOR) ---
function setupJiggleMode() {
    const apps = document.querySelectorAll('.ios-card');
    apps.forEach(app => {
        // Detectar pulsación larga (mouse y touch)
        const start = () => {
            longPressTimer = setTimeout(() => {
                isJiggleMode = true;
                document.querySelectorAll('.ios-card').forEach(a => a.classList.add('jiggle'));
                navigator.vibrate(50); // Vibrar cel
            }, 800); // 800ms para activar
        };
        const end = () => clearTimeout(longPressTimer);

        app.addEventListener('mousedown', start);
        app.addEventListener('touchstart', start);
        app.addEventListener('mouseup', end);
        app.addEventListener('touchend', end);
    });

    // Clic fuera para detener
    document.addEventListener('click', (e) => {
        if(isJiggleMode && !e.target.closest('.ios-card')) {
            isJiggleMode = false;
            document.querySelectorAll('.ios-card').forEach(a => a.classList.remove('jiggle'));
        }
    });
}

function handleAppClick(viewId) {
    if (isJiggleMode) return; // Si tiembla, no abre la app
    openView(viewId);
}

// --- LIQUID GLASS MODE ---
function toggleGlassMode(active) {
    if(active) {
        document.body.classList.add('glass-active');
        document.body.style.background = ""; // Limpiar color solido para ver animacion
        localStorage.setItem('glassMode', 'true');
    } else {
        document.body.classList.remove('glass-active');
        localStorage.setItem('glassMode', 'false');
        if(localStorage.getItem('user_wp')) document.body.style.background = localStorage.getItem('user_wp');
    }
}

// --- GALERIA Y LIGHTBOX ---
const upFileInput = document.getElementById('up-file');
if(upFileInput) {
    upFileInput.onchange = (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            // Comprimir un poco si es muy grande (opcional simple)
            db.ref('shared_photos').push({ img: ev.target.result });
            showBanner("Nube", "Foto subida!");
        };
        reader.readAsDataURL(file);
    };
}

db.ref('shared_photos').on('value', (snapshot) => {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = "";
    snapshot.forEach(child => {
        const data = child.val();
        const key = child.key;
        const img = document.createElement('img');
        img.src = data.img;
        img.className = "gallery-item";
        // Al hacer click, pasamos la URL y la KEY (para borrar)
        img.onclick = () => openLightbox(data.img, key);
        gallery.prepend(img);
    });
});

function openLightbox(src, key) {
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    img.src = src;
    img.style.filter = "none"; // Reset filtro
    currentFilter = 0;
    currentPhotoKey = key;
    lb.classList.remove('hidden');
}

function closeLightbox() {
    document.getElementById('lightbox').classList.add('hidden');
    currentPhotoKey = null;
}

function applyFilter() {
    const img = document.getElementById('lightbox-img');
    currentFilter = (currentFilter + 1) % 3;
    if(currentFilter === 0) img.style.filter = "none";
    if(currentFilter === 1) img.style.filter = "grayscale(100%)";
    if(currentFilter === 2) img.style.filter = "sepia(100%)";
}

function deleteCurrentPhoto() {
    if(confirm("¿Seguro que quieres borrar esta foto de la nube?")) {
        if(currentPhotoKey) {
            db.ref('shared_photos/' + currentPhotoKey).remove();
            closeLightbox();
            showBanner("Galería", "Foto eliminada");
        }
    }
}

// --- JUEGOS, CHAT Y OTROS (Core logic mantenida) ---
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
}

function sendMsg() {
    const input = document.getElementById('chat-input');
    const user = localStorage.getItem('user_name') || "Yo";
    if(input.value.trim()) {
        db.ref('messages').push({ text: input.value.trim(), sender: user });
        input.value = "";
    }
}
db.ref('messages').on('child_added', s => {
    const m = s.val();
    const box = document.getElementById('chat-container');
    const isMe = m.sender === (localStorage.getItem('user_name') || "Yo");
    box.innerHTML += `<div class="msg ${isMe ? 'sent' : ''}">${m.text}</div>`;
    box.scrollTop = box.scrollHeight;
});

function saveNote() {
    const val = document.getElementById('notes-editor').value;
    if(val) {
        db.ref('shared_notes').push({t: val});
        document.getElementById('notes-editor').value = "";
        showEditor(false);
    }
}
function showEditor(show=true) {
    if(show) {
        document.getElementById('notes-list-area').classList.add('hidden');
        document.getElementById('notes-editor-area').classList.remove('hidden');
    } else {
        document.getElementById('notes-list-area').classList.remove('hidden');
        document.getElementById('notes-editor-area').classList.add('hidden');
    }
}
db.ref('shared_notes').on('value', s => {
    const c = document.getElementById('list-container');
    c.innerHTML = "";
    s.forEach(h => {
        c.innerHTML += `<div class="settings-item glass-panel" style="margin:5px 0;">${h.val().t}</div>`;
    });
});

// Juegos básicos
function openGame(t) { openView('view-game-play'); document.getElementById('game-title').innerText = t; }

// Utils
function showBanner(t, m) {
    const b = document.getElementById('ios-notification');
    document.getElementById('notif-title').innerText = t;
    document.getElementById('notif-msg').innerText = m;
    b.classList.add('notif-active');
    setTimeout(() => b.classList.remove('notif-active'), 3000);
}
function setWP(c) { document.body.style.background = c; localStorage.setItem('user_wp', c); }
function login() { 
    const n = prompt("Nombre:"); 
    if(n) { localStorage.setItem('user_name', n); location.reload(); }
}
function updateProfileUI() {
    const u = localStorage.getItem('user_name');
    if(u) document.getElementById('display-name').innerText = u;
}
function borrarTodo() { localStorage.clear(); location.reload(); }