// SISTEMA DE NOTIFICACIONES (Igual que antes pero con soporte para fotos)
function sendNotif(title, msg) {
    if (!document.getElementById('notif-toggle').checked) return;
    const banner = document.getElementById('ios-notification');
    document.getElementById('notif-title').innerText = title;
    document.getElementById('notif-msg').innerText = msg;
    banner.classList.remove('hidden');
    setTimeout(() => banner.classList.add('hidden'), 3500);
}

// SIMULAR ACTUALIZACIONES
function checkForUpdates() {
    sendNotif("Buscando...", "Verificando nuevas fotos y notas.");
    setTimeout(() => {
        sendNotif("Sistema al día", "Tienes la versión más reciente de vuestro amor.");
    }, 2000);
}

// LOGICA DE FOTOS MEJORADA
const uploadInput = document.getElementById('upload-photo');
const galleryGrid = document.getElementById('gallery-grid');

uploadInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const base64Image = event.target.result;
        
        try {
            savePhoto(base64Image);
            renderGallery();
            sendNotif("Nube Actualizada", "Se ha subido una nueva foto con éxito.");
        } catch (error) {
            alert("Memoria llena. Intenta con una foto más pequeña.");
        }
    };
    reader.readAsDataURL(file);
});

function savePhoto(url) {
    let photos = JSON.parse(localStorage.getItem('nuestras_fotos') || "[]");
    photos.push(url);
    localStorage.setItem('nuestras_fotos', JSON.stringify(photos));
}

function renderGallery() {
    galleryGrid.innerHTML = "";
    let photos = JSON.parse(localStorage.getItem('nuestras_fotos') || "[]");
    photos.reverse().forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.className = 'gallery-item';
        galleryGrid.appendChild(img);
    });
}

// NAVEGACIÓN (Consistente)
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

// CARGA INICIAL
window.onload = () => {
    renderGallery();
    // Render de notas resumido
    const notes = JSON.parse(localStorage.getItem('multi_notes') || "[]");
    const list = document.getElementById('notes-list');
    notes.forEach(n => {
        const item = document.createElement('div');
        item.className = 'settings-item';
        item.innerHTML = `<span>${n.text.substring(0,25)}...</span>`;
        list.appendChild(item);
    });
};