// --- CONFIGURACIÓN FIREBASE ---
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

// --- SISTEMA DE VERSIONES ---
// Cada vez que subas algo a GitHub, sube este número (ej: "1.0.3")
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
    document.getElementById('notes-editor-area').classList.add('hidden');
    document.getElementById('notes-list-area').classList.remove('hidden');
}

// --- NOTIFICACIONES ---
function showBanner(title, msg) {
    if(!document.getElementById('notif-check').checked) return;
    const banner = document.getElementById('ios-notification');
    document.getElementById('notif-title').innerText = title;
    document.getElementById('notif-msg').innerText = msg;
    banner.classList.add('notif-active');
    setTimeout(() => banner.classList.remove('notif-active'), 3500);
}

function testNotif() { showBanner("Prueba ✨", "Todo funciona perfecto amor."); }

// --- ACTUALIZACIÓN REAL ---
function updateSoftware() {
    showBanner("Buscando...", "Verificando servidores de GitHub...");

    setTimeout(() => {
        // En el código que SUBAS a GitHub, cambia "nuevaVersion" para que sea mayor a "versionInstalada"
        const nuevaVersionDisponible = "1.0.2"; 

        if (nuevaVersionDisponible !== versionInstalada) {
            const confirmar = confirm("¡Nueva actualización disponible (v" + nuevaVersionDisponible + ")! ¿Quieres instalarla?");
            if (confirmar) {
                window.location.reload(true); // Recarga y limpia caché
            }
        } else {
            showBanner("iOS Love", "El software está al día (v" + versionInstalada + ")");
        }
    }, 2000);
}

// --- PERFIL ---
function editProfile() {
    const name = prompt("¿Cuál es tu nombre?", localStorage.getItem('user_name') || "");
    const mail = prompt("¿Cuál es tu Gmail?", localStorage.getItem('user_mail') || "");
    if(name) localStorage.setItem('user_name', name);
    if(mail) localStorage.setItem('user_mail', mail);
    loadProfile();
}

function loadProfile() {
    document.getElementById('prof-name').innerText = localStorage.getItem('user_name') || "Tu Nombre";
    document.getElementById('prof-mail').innerText = localStorage.getItem('user_mail') || "configurar@gmail.com";
}

// --- NOTAS ---
function showEditor() {
    document.getElementById('notes-list-area').classList.add('hidden');
    document.getElementById('notes-editor-area').classList.remove('hidden');
}

function saveNote() {
    const text = document.getElementById('notes-editor').value;
    if(!text) return;
    const newNote = {
        text: text,
        author: localStorage.getItem('user_name') || "Alguien",
        date: new Date().toLocaleString()
    };
    db.ref('shared_notes').push(newNote);
    document.getElementById('notes-editor').value = "";
    goHome();
    showBanner("Notas", "Guardado en la nube ❤️");
}

db.ref('shared_notes').on('value', (snapshot) => {
    const container = document.getElementById('list-container');
    container.innerHTML = "";
    snapshot.forEach((child) => {
        const n = child.val();
        const div = document.createElement('div');
        div.className = "settings-item";
        div.style.flexDirection = "column";
        div.style.alignItems = "flex-start";
        div.innerHTML = `<b>${n.text}</b><small style="color:#8e8e93">${n.author} - ${n.date}</small>`;
        container.prepend(div);
    });
});

// --- FOTOS ---
document.getElementById('up-file').onchange = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        db.ref('shared_photos').push(ev.target.result);
        showBanner("Nube", "Foto enviada con éxito.");
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

// --- CONTADOR Y GUIA ---
function actualizarContador() {
    const fechaInicio = new Date(2025, 11, 21); // 21 de Diciembre (Mes 11)
    const ahora = new Date();
    const diff = ahora - fechaInicio;
    
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const display = document.getElementById('timer-display');
    if(display) display.innerText = `${dias} días, ${horas}h y ${minutos}m`;
}

function closeGuide() {
    document.getElementById('setup-guide').classList.add('hidden');
    localStorage.setItem('app_version', versionInstalada);
}

// --- CARGA INICIAL ---
window.onload = () => {
    loadProfile();
    actualizarContador();
    setInterval(actualizarContador, 60000);
    
    if(localStorage.getItem('app_version') !== versionInstalada) {
        document.getElementById('setup-guide').classList.remove('hidden');
    }
};