// Tus llaves maestras
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_PROYECTO.firebaseapp.com",
    databaseURL: "EL_LINK_DE_REALTIME_DATABASE", // El que copiaste en el paso 1
    projectId: "TU_PROYECTO",
    storageBucket: "TU_PROYECTO.appspot.com",
    messagingSenderId: "NUMERO",
    appId: "ID_DE_APP"
};

// Conectar con Google
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

console.log("¡Conexión establecida con la Nube! ☁️");

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

// --- NOTIFICACIONES ---
function showBanner(title, msg) {
    const banner = document.getElementById('ios-notification');
    document.getElementById('notif-title').innerText = title;
    document.getElementById('notif-msg').innerText = msg;
    banner.classList.add('notif-active');
    setTimeout(() => banner.classList.remove('notif-active'), 3500);
}

// --- NOTAS EN TIEMPO REAL (UTILIDAD REAL) ---
function saveNote() {
    const text = document.getElementById('notes-editor').value;
    if(!text) return;

    const newNote = {
        text: text,
        author: localStorage.getItem('user_name') || "Alguien",
        date: new Date().toLocaleString()
    };

    // Esto lo manda a la nube de Google
    db.ref('shared_notes').push(newNote);
    
    document.getElementById('notes-editor').value = "";
    goHome();
    showBanner("Enviado", "Nota guardada en la nube ❤️");
}

// Escuchar notas nuevas
db.ref('shared_notes').on('value', (snapshot) => {
    const container = document.getElementById('list-container');
    container.innerHTML = "";
    snapshot.forEach((child) => {
        const n = child.val();
        const div = document.createElement('div');
        div.className = "settings-item"; // Usamos tu clase de Ajustes para que se vea igual
        div.style.flexDirection = "column";
        div.style.alignItems = "flex-start";
        div.innerHTML = `<b>${n.text}</b><small style="color:#8e8e93">${n.author} - ${n.date}</small>`;
        container.prepend(div);
    });
});

// --- FOTOS EN TIEMPO REAL ---
document.getElementById('up-file').onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
        const base64 = ev.target.result;
        // Guardamos en Firebase (Nube Real)
        db.ref('shared_photos').push(base64);
        showBanner("Nube", "Subiendo foto compartida...");
    };
    reader.readAsDataURL(file);
};

db.ref('shared_photos').on('value', (snapshot) => {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = "";
    snapshot.forEach((child) => {
        const img = document.createElement('img');
        img.src = child.val();
        img.className = "gallery-item";
        gallery.prepend(img);
    });
});

// Perfil y carga inicial
window.onload = () => {
    document.getElementById('prof-name').innerText = localStorage.getItem('user_name') || "Configurar Perfil";
    document.getElementById('prof-mail').innerText = localStorage.getItem('user_mail') || "toque para iniciar";
};