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

// --- VARIABLES GLOBALES ---
let gameRunning = false;
let score = 0;
let gameLoopInterval;
let fallingObjectsIntervals = [];

// --- SISTEMA DE PERFIL ---
function login() {
    const nombre = prompt("Ingresa tu nombre (ej: Amor, Juan, Maria):");
    if (nombre) {
        localStorage.setItem('user_name', nombre);
        db.ref('users/' + nombre).update({ lastLogin: Date.now(), online: true });
        location.reload();
    }
}

function updateProfileUI() {
    const user = localStorage.getItem('user_name');
    const nameEl = document.getElementById('display-name');
    const roleEl = document.getElementById('display-role');
    const avatarEl = document.getElementById('user-avatar');
    
    if (user && nameEl) {
        nameEl.innerText = user;
        roleEl.innerText = "Usuario Activo";
        avatarEl.innerText = user.charAt(0).toUpperCase();
        document.querySelector('.main-title').innerText = "Hola, " + user + " ❤️";
    }
}

function borrarTodo() {
    if(confirm("¿Cerrar sesión y borrar datos locales?")) {
        localStorage.clear();
        location.reload();
    }
}

// --- NAVEGACIÓN ---
function openView(id) {
    stopGame(); 
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(id);
    if(target) target.classList.add('active');

    document.getElementById('btn-back').classList.remove('hidden');
    document.getElementById('btn-settings-nav').classList.add('hidden');
}

function goHome() {
    stopGame();
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-home').classList.add('active');
    document.getElementById('btn-back').classList.add('hidden');
    document.getElementById('btn-settings-nav').classList.remove('hidden');
    
    const notesList = document.getElementById('notes-list-area');
    const notesEdit = document.getElementById('notes-editor-area');
    if(notesList) notesList.classList.remove('hidden');
    if(notesEdit) notesEdit.classList.add('hidden');
}

// --- CHAT ---
function sendMsg() {
    const input = document.getElementById('chat-input');
    const user = localStorage.getItem('user_name') || "Anónimo";
    if(!input || !input.value.trim()) return;

    db.ref('messages').push({
        text: input.value.trim(),
        sender: user,
        timestamp: Date.now()
    });
    input.value = "";
}

db.ref('messages').on('value', (sn) => {
    const box = document.getElementById('chat-container');
    if(!box) return;
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

// --- NOTAS ---
function showEditor() {
    document.getElementById('notes-list-area').classList.add('hidden');
    document.getElementById('notes-editor-area').classList.remove('hidden');
}

function saveNote() {
    const editor = document.getElementById('notes-editor');
    const text = editor.value.trim();
    const author = localStorage.getItem('user_name') || "Amor";
    if(!text) return;
    
    db.ref('shared_notes').push({ text: text, author: author, date: new Date().toLocaleString() });
    editor.value = "";
    goHome();
    showBanner("Notas", "Nota guardada ✨");
}

db.ref('shared_notes').on('value', (snapshot) => {
    const container = document.getElementById('list-container');
    if(!container) return;
    container.innerHTML = "";
    snapshot.forEach(child => {
        const n = child.val();
        container.innerHTML += `<div class="settings-item" style="flex-direction:column; align-items:flex-start;">
            <b>${n.text}</b><small style="opacity:0.6">${n.author} - ${n.date}</small>
        </div>`;
    });
});

// --- FOTOS ---
const upFileInput = document.getElementById('up-file');
if(upFileInput) {
    upFileInput.onchange = (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            db.ref('shared_photos').push({ img: ev.target.result, user: localStorage.getItem('user_name') || "Amor" });
            showBanner("Nube", "Foto subida!");
        };
        reader.readAsDataURL(file);
    };
}

db.ref('shared_photos').on('value', (snapshot) => {
    const gallery = document.getElementById('gallery');
    if(!gallery) return;
    gallery.innerHTML = "";
    snapshot.forEach(child => {
        const data = child.val();
        const img = document.createElement('img');
        img.src = data.img;
        img.className = "gallery-item";
        gallery.prepend(img);
    });
});

// --- MAPA ---
function compartirUbicacion() {
    navigator.geolocation.getCurrentPosition(p => {
        const user = localStorage.getItem('user_name') || "Amor";
        db.ref('loc/' + user).set({ lat: p.coords.latitude, lng: p.coords.longitude });
        showBanner("📍", "Ubicación enviada");
    });
}

db.ref('loc').on('value', sn => {
    const d = sn.val();
    const miNombre = localStorage.getItem('user_name');
    const linkMap = document.getElementById('link-google-maps');
    Object.keys(d || {}).forEach(k => {
        if(k !== miNombre && linkMap) {
            document.getElementById('distancia-texto').innerText = "Ubicación de " + k;
            linkMap.href = `https://www.google.com/maps?q=${d[k].lat},${d[k].lng}`;
            linkMap.style.display = "block";
        }
    });
});

// --- JUEGOS ---
function openGame(type) {
    stopGame();
    score = 0;
    document.getElementById('game-score').innerText = "Puntos: 0";
    document.getElementById('game-title').innerText = type.toUpperCase();
    document.getElementById('btn-start-game').onclick = () => startSpecificGame(type);
    openView('view-game-play');
}

function startSpecificGame(type) {
    if(gameRunning) return;
    gameRunning = true;
    const player = document.getElementById('game-player');
    const container = document.getElementById('game-canvas-container');

    if(type === 'catch') {
        player.style.top = "80%";
        container.ontouchmove = (e) => {
            let rect = container.getBoundingClientRect();
            let x = e.touches[0].clientX - rect.left;
            player.style.left = Math.min(Math.max(x - 20, 0), rect.width - 40) + "px";
        };
        gameLoopInterval = setInterval(() => spawnObject("🍎", "fall"), 1000);
    } else if(type === 'flappy') {
        let velY = 0; let posStr = 50;
        player.style.left = "20%";
        container.onclick = () => { velY = -1.5; };
        gameLoopInterval = setInterval(() => {
            velY += 0.1; posStr += velY;
            player.style.top = posStr + "%";
            if(posStr > 95 || posStr < 0) endGame("¡Perdiste! 💔");
            if(Math.random() > 0.98) { score++; updateScore(); }
        }, 30);
    } else if(type === 'jump') {
        player.innerHTML = "🚀";
        container.ontouchmove = (e) => {
            let rect = container.getBoundingClientRect();
            let x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
            player.style.left = x + "%";
        };
        gameLoopInterval = setInterval(() => spawnObject("☁️", "jump"), 800);
    }
}

function spawnObject(emoji, mode) {
    const container = document.getElementById('game-canvas-container');
    const obj = document.createElement('div');
    obj.innerHTML = emoji; obj.style.position = "absolute"; obj.style.fontSize = "30px";
    obj.style.left = Math.random() * 90 + "%";
    
    if(mode === "fall") obj.style.top = "-40px";
    else obj.style.bottom = "-40px";
    
    container.appendChild(obj);

    let moveInterval = setInterval(() => {
        let current = parseInt(mode === "fall" ? obj.style.top : obj.style.bottom);
        if(mode === "fall") obj.style.top = (current + 5) + "px";
        else obj.style.bottom = (current + 5) + "px";

        let pRect = document.getElementById('game-player').getBoundingClientRect();
        let oRect = obj.getBoundingClientRect();

        if(oRect.top < pRect.bottom && oRect.bottom > pRect.top && oRect.left < pRect.right && oRect.right > pRect.left) {
            score++; updateScore(); obj.remove(); clearInterval(moveInterval);
        }
        if(current > 600) { obj.remove(); clearInterval(moveInterval); }
    }, 20);
    fallingObjectsIntervals.push(moveInterval);
}

function updateScore() { document.getElementById('game-score').innerText = "Puntos: " + score; }

function stopGame() {
    gameRunning = false;
    clearInterval(gameLoopInterval);
    fallingObjectsIntervals.forEach(clearInterval);
    const container = document.getElementById('game-canvas-container');
    if(container) {
        Array.from(container.children).forEach(c => { if(c.id !== 'game-player') c.remove(); });
    }
}

function endGame(msg) { stopGame(); alert(msg); goHome(); }

function showBanner(t, m) {
    const b = document.getElementById('ios-notification');
    if(b) {
        document.getElementById('notif-title').innerText = t;
        document.getElementById('notif-msg').innerText = m;
        b.classList.add('notif-active');
        setTimeout(() => b.classList.remove('notif-active'), 3000);
    }
}

function setWP(c) {
    document.body.style.background = c;
    localStorage.setItem('user_wp', c);
}

window.onload = () => {
    updateProfileUI();
    if(localStorage.getItem('user_wp')) document.body.style.background = localStorage.getItem('user_wp');
    setInterval(() => {
        const inicio = new Date(2025, 11, 21);
        const diff = new Date() - inicio;
        const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
        const el = document.getElementById('timer-display');
        if(el) el.innerText = dias + " días juntos";
    }, 1000);
};