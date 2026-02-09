let currentPage = 0;

// PERMISOS DEL SISTEMA
function requestSystemPermissions() {
    if (!("Notification" in window)) {
        alert("Este navegador no soporta notificaciones de sistema.");
        return;
    }
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            sendNotif("¡Logrado!", "Ahora tengo permiso para avisarte cosas lindas.");
        }
    });
}

// ENVIAR NOTIFICACIÓN
function sendNotif(title, msg) {
    // Verificar si el interruptor en Ajustes está activo
    if (!document.getElementById('notif-toggle').checked) return;

    // 1. Notificación interna (Banner)
    const banner = document.getElementById('ios-notification');
    document.getElementById('notif-title').innerText = title;
    document.getElementById('notif-msg').innerText = msg;
    banner.classList.remove('hidden');
    setTimeout(() => banner.classList.add('hidden'), 3500);

    // 2. Notificación de sistema (Si hay permiso)
    if (Notification.permission === "granted") {
        new Notification(title, { body: msg, icon: 'apple-touch-icon.png' });
    }
}

function sendTestNotif() {
    sendNotif("Prueba de Sistema", "Funciona correctamente ❤️");
}

// NAVEGACIÓN
function openView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.getElementById('btn-back').classList.remove('hidden');
    document.getElementById('btn-settings').classList.add('hidden');
}

function goHome() {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('main-menu').classList.add('active');
    document.getElementById('btn-back').classList.add('hidden');
    document.getElementById('btn-settings').classList.remove('hidden');
}

// SWIPE DE PÁGINAS
const wrapper = document.getElementById('pages-wrapper');
let startX = 0;
wrapper.addEventListener('touchstart', e => startX = e.touches[0].clientX);
wrapper.addEventListener('touchend', e => {
    let diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) {
        currentPage = diff > 0 ? 1 : 0;
        wrapper.style.transform = `translateX(-${currentPage * 50}%)`;
        document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === currentPage));
    }
});

// NOTAS (Simplificado para el ejemplo)
function createNewNote() {
    document.getElementById('notes-list-view').classList.add('hidden');
    document.getElementById('note-editor-view').classList.remove('hidden');
}

function closeNoteEditor() {
    const txt = document.getElementById('notes-editor').value;
    if(txt) {
        let notes = JSON.parse(localStorage.getItem('multi_notes') || "[]");
        notes.push({ text: txt, date: new Date().toLocaleDateString() });
        localStorage.setItem('multi_notes', JSON.stringify(notes));
        sendNotif("Nota Guardada", "Se ha guardado en tu memoria local.");
    }
    location.reload(); // Recargar para ver lista
}

window.onload = () => {
    // Cargar notas en la lista si existen
    const list = document.getElementById('notes-list');
    const notes = JSON.parse(localStorage.getItem('multi_notes') || "[]");
    notes.forEach(n => {
        const d = document.createElement('div');
        d.className = 'settings-item';
        d.innerHTML = `<span>${n.text.substring(0,20)}...</span><span class="arrow">›</span>`;
        list.appendChild(d);
    });
};