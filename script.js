let currentPage = 0;
let currentNoteId = null;

// SISTEMA DE SWIPE (Páginas)
const wrapper = document.getElementById('pages-wrapper');
const dots = document.querySelectorAll('.dot');

let startX = 0;
wrapper.addEventListener('touchstart', e => startX = e.touches[0].clientX);
wrapper.addEventListener('touchend', e => {
    let diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
        currentPage = diff > 0 ? 1 : 0;
        updatePage();
    }
});

function updatePage() {
    wrapper.style.transform = `translateX(-${currentPage * 50}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === currentPage));
}

// NOTIFICACIONES
function sendNotif(title, msg) {
    if (!document.getElementById('notif-toggle').checked) return;
    const banner = document.getElementById('ios-notification');
    document.getElementById('notif-title').innerText = title;
    document.getElementById('notif-msg').innerText = msg;
    banner.classList.remove('hidden');
    setTimeout(() => banner.classList.add('hidden'), 4000);
}

function sendTestNotif() { sendNotif("Hola Amor ❤️", "Esta es una notificación real."); }

// SISTEMA DE MÚLTIPLES NOTAS
function createNewNote() {
    currentNoteId = Date.now();
    document.getElementById('notes-editor').value = "";
    document.getElementById('notes-list-view').classList.add('hidden');
    document.getElementById('note-editor-view').classList.remove('hidden');
}

function closeNoteEditor() {
    const text = document.getElementById('notes-editor').value;
    if (text.trim() !== "") {
        let notes = JSON.parse(localStorage.getItem('multi_notes') || "[]");
        const existingIndex = notes.findIndex(n => n.id === currentNoteId);
        if (existingIndex > -1) notes[existingIndex].text = text;
        else notes.push({ id: currentNoteId, text: text, date: new Date().toLocaleDateString() });
        localStorage.setItem('multi_notes', JSON.stringify(notes));
    }
    renderNotesList();
    document.getElementById('notes-list-view').classList.remove('hidden');
    document.getElementById('note-editor-view').classList.add('hidden');
    sendNotif("Nota Guardada", "Tus pensamientos están a salvo.");
}

function renderNotesList() {
    const list = document.getElementById('notes-list');
    const notes = JSON.parse(localStorage.getItem('multi_notes') || "[]");
    list.innerHTML = notes.length ? "" : "<p style='text-align:center; color:#888;'>No hay notas aún.</p>";
    notes.reverse().forEach(n => {
        const div = document.createElement('div');
        div.className = 'note-item';
        div.onclick = () => {
            currentNoteId = n.id;
            document.getElementById('notes-editor').value = n.text;
            document.getElementById('notes-list-view').classList.add('hidden');
            document.getElementById('note-editor-view').classList.remove('hidden');
        };
        div.innerHTML = `<b>${n.text.substring(0, 25)}...</b><span>${n.date}</span>`;
        list.appendChild(div);
    });
}

// FUNCIONES DE NAVEGACIÓN Y CARGA
function openView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.getElementById('btn-back').classList.remove('hidden');
    if (id === 'view-notes') renderNotesList();
}

function goHome() {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('main-menu').classList.add('active');
    document.getElementById('btn-back').classList.add('hidden');
}

window.onload = () => { renderNotesList(); };