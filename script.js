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

// --- SISTEMA DE NAVEGACIÓN ---
function openView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.getElementById('btn-back').classList.remove('hidden');
    document.getElementById('btn-settings-nav').classList.add('hidden');
    if(id === 'view-home') goHome();
}

function goHome() {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-home').classList.add('active');
    document.getElementById('btn-back').classList.add('hidden');
    document.getElementById('btn-settings-nav').classList.remove('hidden');
    gameRunning = false; // Detener juegos al salir
}

// --- LÓGICA DE JUEGOS ---
let gameRunning = false, score = 0, gameLoop;
function openGame(type) {
    score = 0; document.getElementById('game-score').innerText = "Score: 0";
    document.getElementById('game-title').innerText = type.toUpperCase();
    document.getElementById('btn-start-game').onclick = () => runGame(type);
    openView('view-game-play');
}

function runGame(type) {
    if(gameRunning) return;
    gameRunning = true;
    const container = document.getElementById('game-canvas-container');
    const player = document.getElementById('game-player');
    player.style.top = "50%"; player.style.left = "50%";

    if(type === 'catch') {
        player.style.top = "80%";
        container.ontouchmove = (e) => {
            let x = e.touches[0].clientX - container.getBoundingClientRect().left;
            player.style.left = x + "px";
        };
        gameLoop = setInterval(() => { if(gameRunning) createObject("❤️"); }, 1000);
    } else if(type === 'flappy') {
        let y = 50;
        container.onclick = () => y -= 10;
        gameLoop = setInterval(() => {
            y += 2; player.style.top = y + "%";
            if(y > 95 || y < 0) endGame();
        }, 50);
    }
}

function createObject(emoji) {
    const container = document.getElementById('game-canvas-container');
    const obj = document.createElement('div');
    obj.innerHTML = emoji; obj.style.position = "absolute"; obj.style.top = "0px";
    obj.style.left = Math.random() * 80 + "%"; obj.style.fontSize = "30px";
    container.appendChild(obj);
    let fall = setInterval(() => {
        let top = parseInt(obj.style.top || 0);
        obj.style.top = (top + 5) + "px";
        if(top > 400) { obj.remove(); clearInterval(fall); }
        // Colisión básica
        let pRect = document.getElementById('game-player').getBoundingClientRect();
        let oRect = obj.getBoundingClientRect();
        if(oRect.top + 30 > pRect.top && oRect.left < pRect.left + 40 && oRect.left + 30 > pRect.left) {
            score++; document.getElementById('game-score').innerText = "Score: " + score;
            obj.remove(); clearInterval(fall);
        }
    }, 30);
}

function endGame() { gameRunning = false; clearInterval(gameLoop); alert("Game Over! Score: " + score); goHome(); }

// --- CHAT Y NOTIFICACIONES ---
function sendMsg() {
    const input = document.getElementById('chat-input');
    if(!input.value) return;
    db.ref('messages').push({ text: input.value, sender: localStorage.getItem('user_name') || "Amor" });
    input.value = "";
}

db.ref('messages').limitToLast(1).on('child_added', (sn) => {
    const m = sn.val();
    if(m.sender !== localStorage.getItem('user_name')) showBanner(m.sender, m.text);
});

db.ref('messages').limitToLast(20).on('value', (sn) => {
    const box = document.getElementById('chat-container'); box.innerHTML = "";
    sn.forEach(c => {
        const m = c.val();
        const div = document.createElement('div');
        div.className = `msg ${m.sender === localStorage.getItem('user_name') ? 'sent' : 'received'}`;
        div.innerText = m.text; box.appendChild(div);
    });
    box.scrollTop = box.scrollHeight;
});

function showBanner(t, m) {
    const b = document.getElementById('ios-notification');
    document.getElementById('notif-title').innerText = t;
    document.getElementById('notif-msg').innerText = m;
    b.classList.add('notif-active'); setTimeout(() => b.classList.remove('notif-active'), 3000);
}

// --- UBICACIÓN ---
function compartirUbicacion() {
    navigator.geolocation.getCurrentPosition(p => {
        db.ref('loc/' + localStorage.getItem('user_name')).set({ lat: p.coords.latitude, lng: p.coords.longitude });
        showBanner("📍", "Ubicación enviada");
    });
}

db.ref('loc').on('value', sn => {
    const d = sn.val();
    Object.keys(d || {}).forEach(k => {
        if(k !== localStorage.getItem('user_name')) {
            document.getElementById('link-google-maps').href = `https://www.google.com/maps?q=${d[k].lat},${d[k].lng}`;
            document.getElementById('link-google-maps').style.display = "block";
        }
    });
});

// --- INICIO ---
window.onload = () => {
    document.getElementById('prof-name').innerText = localStorage.getItem('user_name') || "Amor";
    setInterval(() => {
        const diff = new Date() - new Date(2025, 11, 21);
        document.getElementById('timer-display').innerText = Math.floor(diff/(1000*60*60*24)) + " días juntos";
    }, 1000);
};

function editProfile() {
    const n = prompt("Tu nombre:");
    if(n) { localStorage.setItem('user_name', n); location.reload(); }
}
function setWP(c) { document.body.style.background = c; }