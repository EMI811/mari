// NAVEGACIÓN
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

// NOTIFICACIONES
function showBanner(title, msg) {
    if(!document.getElementById('notif-check').checked) return;
    const banner = document.getElementById('ios-notification');
    document.getElementById('notif-title').innerText = title;
    document.getElementById('notif-msg').innerText = msg;
    banner.classList.add('notif-active');
    setTimeout(() => banner.classList.remove('notif-active'), 3500);
}

function testNotif() { showBanner("Prueba ❤️", "Notificaciones activas y funcionando."); }

function updateSoftware() {
    showBanner("Buscando...", "Verificando actualizaciones de sistema.");
    setTimeout(() => showBanner("Software al día", "iOS Love v1.0.1 está actualizado."), 2500);
}

// PERFIL
function editProfile() {
    const n = prompt("Nombre:");
    const g = prompt("Gmail:");
    if(n) localStorage.setItem('user_name', n);
    if(g) localStorage.setItem('user_mail', g);
    loadProfile();
}

function loadProfile() {
    document.getElementById('prof-name').innerText = localStorage.getItem('user_name') || "Tu Nombre";
    document.getElementById('prof-mail').innerText = localStorage.getItem('user_mail') || "toque para configurar";
}

// FOTOS (NUBE LOCAL)
document.getElementById('up-file').onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
        let photos = JSON.parse(localStorage.getItem('saved_photos') || "[]");
        photos.push(ev.target.result);
        localStorage.setItem('saved_photos', JSON.stringify(photos));
        renderGallery();
        showBanner("Galería", "Foto añadida a tu nube.");
    };
    reader.readAsDataURL(file);
};

function renderGallery() {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = "";
    let photos = JSON.parse(localStorage.getItem('saved_photos') || "[]");
    photos.reverse().forEach(src => {
        const img = document.createElement('img');
        img.src = src; img.className = "gallery-item";
        gallery.appendChild(img);
    });
}

// NOTAS
function showEditor() {
    document.getElementById('notes-list-area').classList.add('hidden');
    document.getElementById('notes-editor-area').classList.remove('hidden');
}

function saveNote() {
    const text = document.getElementById('notes-editor').value;
    if(!text) return;
    let notes = JSON.parse(localStorage.getItem('saved_notes') || "[]");
    notes.push({text, date: new Date().toLocaleDateString()});
    localStorage.setItem('saved_notes', JSON.stringify(notes));
    document.getElementById('notes-editor').value = "";
    renderNotes();
    goHome();
    showBanner("Notas", "Se ha guardado tu nota.");
}

function renderNotes() {
    const container = document.getElementById('list-container');
    container.innerHTML = "";
    let notes = JSON.parse(localStorage.getItem('saved_notes') || "[]");
    notes.reverse().forEach(n => {
        const div = document.createElement('div');
        div.style.background = "white"; div.style.padding = "15px"; div.style.marginBottom = "10px"; div.style.borderRadius = "10px";
        div.innerHTML = `<b>${n.text.substring(0,30)}...</b><br><small style="color:#888">${n.date}</small>`;
        container.appendChild(div);
    });
}

window.onload = () => { loadProfile(); renderGallery(); renderNotes(); };