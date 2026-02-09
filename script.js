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
const versionInstalada = "1.0.2";

// --- NOTIFICACIONES REALES ---
function pedirPermisoNotif() {
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            showBanner("Sistema", "¡Notificaciones activadas!");
        }
    });
}

function lanzarNotificacionReal(titulo, texto) {
    if (Notification.permission === "granted") {
        new Notification(titulo, { body: texto, icon: "https://cdn-icons-png.flaticon.com/512/2589/2589175.png" });
    }
    showBanner(titulo, texto); // También mostramos el banner interno
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
}

function showBanner(title, msg) {
    if(!document.getElementById('notif-check').checked) return;
    const banner = document.getElementById('ios-notification');
    document.getElementById('notif-title').innerText = title;
    document.getElementById('notif-msg').innerText = msg;
    banner.classList.add('notif-active');
    setTimeout(() => banner.classList.remove('notif-active'), 3500);
}

// --- CHAT ---
function sendMsg() {
    const input = document.getElementById('chat-input');
    if(!input.value) return;
    db.ref('messages').push({
        text: input.value,
        sender: localStorage.getItem('user_name') || "Amor",
        time: Date.now()
    });
    input.value = "";
}

db.ref('messages').limitToLast(1).on('child_added', (snapshot) => {
    const m = snapshot.val();
    if(m.sender !== localStorage.getItem('user_name')) {
        lanzarNotificacionReal(m.sender, m.text);
    }
});

db.ref('messages').limitToLast(30).on('value', (snapshot) => {
    const container = document.getElementById('chat-container');
    container.innerHTML = "";
    snapshot.forEach(child => {
        const m = child.val();
        const isMe = m.sender === localStorage.getItem('user_name');
        const div = document.createElement('div');
        div.className = `msg ${isMe ? 'sent' : 'received'}`;
        div.innerText = m.text;
        container.appendChild(div);
    });
    container.scrollTop = container.scrollHeight;
});

// --- UBICACIÓN ---
function compartirUbicacion() {
    navigator.geolocation.getCurrentPosition((pos) => {
        const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            user: localStorage.getItem('user_name') || "Amor",
            timestamp: Date.now()
        };
        db.ref('last_location/' + coords.user).set(coords);
        showBanner("📍", "Ubicación enviada!");
    });
}

db.ref('last_location').on('value', (snapshot) => {
    const data = snapshot.val();
    const miNombre = localStorage.getItem('user_name');
    Object.keys(data || {}).forEach(nombre => {
        if(nombre !== miNombre) {
            const otraP = data[nombre];
            document.getElementById('distancia-texto').innerText = `Ubicación de ${otraP.user}`;
            document.getElementById('link-google-maps').href = `https://www.google.com/maps?q=${otraP.lat},${otraP.lng}`;
            document.getElementById('link-google-maps').style.display = "block";
        }
    });
});

// --- EL RESTO DE FUNCIONES ---
function setWP(color) {
    document.body.style.background = color;
    localStorage.setItem('user_wp', color);
}

function showEditor() {
    document.getElementById('notes-list-area').classList.add('hidden');
    document.getElementById('notes-editor-area').classList.remove('hidden');
}

function saveNote() {
    const text = document.getElementById('notes-editor').value;
    if(!text) return;
    db.ref('shared_notes').push({ text, author: localStorage.getItem('user_name') || "Amor", date: new Date().toLocaleString() });
    document.getElementById('notes-editor').value = "";
    goHome();
}

db.ref('shared_notes').on('value', (snapshot) => {
    const container = document.getElementById('list-container');
    container.innerHTML = "";
    snapshot.forEach(child => {
        const n = child.val();
        container.innerHTML += `<div class="settings-item" style="flex-direction:column; align-items:flex-start;"><b>${n.text}</b><small>${n.author}</small></div>`;
    });
});

document.getElementById('up-file').onchange = (e) => {
    const reader = new FileReader();
    reader.onload = (ev) => db.ref('shared_photos').push(ev.target.result);
    reader.readAsDataURL(e.target.files[0]);
};

db.ref('shared_photos').on('value', (snapshot) => {
    const gallery = document.getElementById('gallery'); gallery.innerHTML = "";
    snapshot.forEach(child => {
        const img = document.createElement('img'); img.src = child.val(); img.className = "gallery-item"; gallery.prepend(img);
    });
});

function actualizarContador() {
    const diff = new Date() - new Date(2025, 11, 21);
    const dias = Math.floor(diff / (1000*60*60*24));
    document.getElementById('timer-display').innerText = `${dias} días juntos`;
}

function editProfile() {
    const n = prompt("Tu nombre:");
    if(n) { localStorage.setItem('user_name', n); location.reload(); }
}

function updateSoftware() { alert("Software al día."); }
function closeGuide() { document.getElementById('setup-guide').classList.add('hidden'); }

window.onload = () => {
    actualizarContador();
    document.getElementById('prof-name').innerText = localStorage.getItem('user_name') || "Tu Nombre";
    if(localStorage.getItem('user_wp')) document.body.style.background = localStorage.getItem('user_wp');
};