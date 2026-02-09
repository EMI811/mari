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

// --- WALLPAPER ---
function setWP(color) {
    document.body.style.background = color;
    localStorage.setItem('user_wp', color);
}

// --- NOTAS ---
function showEditor() {
    document.getElementById('notes-list-area').classList.add('hidden');
    document.getElementById('notes-editor-area').classList.remove('hidden');
}

function saveNote() {
    const text = document.getElementById('notes-editor').value;
    if(!text) return;
    db.ref('shared_notes').push({
        text: text,
        author: localStorage.getItem('user_name') || "Amor",
        date: new Date().toLocaleString()
    });
    document.getElementById('notes-editor').value = "";
    goHome();
}

db.ref('shared_notes').on('value', (snapshot) => {
    const container = document.getElementById('list-container');
    container.innerHTML = "";
    snapshot.forEach(child => {
        const n = child.val();
        container.innerHTML += `<div class="settings-item" style="flex-direction:column; align-items:flex-start;">
            <b>${n.text}</b><small style="color:gray">${n.author}</small>
        </div>`;
    });
});

// --- FOTOS ---
document.getElementById('up-file').onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (ev) => db.ref('shared_photos').push(ev.target.result);
    reader.readAsDataURL(file);
};

db.ref('shared_photos').on('value', (snapshot) => {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = "";
    snapshot.forEach(child => {
        const img = document.createElement('img');
        img.src = child.val();
        img.className = "gallery-item";
        gallery.prepend(img);
    });
});

// --- SISTEMA ---
function actualizarContador() {
    const inicio = new Date(2025, 11, 21); // 21 Dic 2025
    const diff = new Date() - inicio;
    const dias = Math.floor(diff / (1000*60*60*24));
    const horas = Math.floor((diff / (1000*60*60)) % 24);
    document.getElementById('timer-display').innerText = `${dias} días y ${horas}h`;
}

function editProfile() {
    const n = prompt("Tu nombre:");
    if(n) {
        localStorage.setItem('user_name', n);
        document.getElementById('prof-name').innerText = n;
    }
}

function updateSoftware() {
    alert("Buscando actualizaciones... No hay versiones nuevas.");
}

function closeGuide() { document.getElementById('setup-guide').classList.add('hidden'); }

window.onload = () => {
    actualizarContador();
    setInterval(actualizarContador, 60000);
    document.getElementById('prof-name').innerText = localStorage.getItem('user_name') || "Tu Nombre";
    if(localStorage.getItem('user_wp')) document.body.style.background = localStorage.getItem('user_wp');
};// --- SISTEMA DE LOCALIZACIÓN ---
function compartirUbicacion() {
    if (!navigator.geolocation) {
        alert("Tu cel no deja compartir ubicación");
        return;
    }

    showBanner("Satélite", "Obteniendo coordenadas...");

    navigator.geolocation.getCurrentPosition((pos) => {
        const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            user: localStorage.getItem('user_name') || "Amor",
            timestamp: Date.now()
        };

        // Guardamos en Firebase
        db.ref('last_location/' + coords.user).set(coords);
        showBanner("📍", "Ubicación enviada!");
    }, (err) => {
        alert("Error al obtener ubicación. Activa el GPS.");
    });
}

// Escuchar cambios de ubicación
db.ref('last_location').on('value', (snapshot) => {
    const data = snapshot.val();
    if(!data) return;

    // Buscamos la ubicación de la OTRA persona
    const miNombre = localStorage.getItem('user_name');
    let otraPersona = "";
    
    // Identificar quién es el otro
    Object.keys(data).forEach(nombre => {
        if(nombre !== miNombre) otraPersona = data[nombre];
    });

    if(otraPersona) {
        document.getElementById('distancia-texto').innerText = `Última vez de ${otraPersona.user} cerca de aquí.`;
        const link = `https://www.google.com/maps?q=${otraPersona.lat},${otraPersona.lng}`;
        const btnLink = document.getElementById('link-google-maps');
        btnLink.href = link;
        btnLink.style.display = "block";
        document.getElementById('mini-mapa').innerText = "📍";
    }
});