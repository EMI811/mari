// Funciones de navegación
function openView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.getElementById('btn-back').style.visibility = 'visible';
}

function goHome() {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('main-menu').classList.add('active');
    document.getElementById('btn-back').style.visibility = 'hidden';
}

// Manejo de Notas
const editor = document.getElementById('notes-editor');
editor.oninput = () => localStorage.setItem('nota_compartida', editor.value);

// Manejo de Fotos
const upload = document.getElementById('upload-photo');
const grid = document.getElementById('gallery-grid');

upload.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
        const url = ev.target.result;
        displayImg(url);
        saveImg(url);
    };
    reader.readAsDataURL(file);
};

function displayImg(url) {
    const img = document.createElement('img');
    img.src = url;
    img.className = 'gallery-item';
    grid.prepend(img);
}

function saveImg(url) {
    let list = JSON.parse(localStorage.getItem('nuestras_fotos') || "[]");
    list.push(url);
    localStorage.setItem('nuestras_fotos', JSON.stringify(list));
}

// Ajustes
document.getElementById('btn-settings').onclick = () => document.getElementById('modal-settings').classList.remove('hidden');
function closeSettings() { document.getElementById('modal-settings').classList.add('hidden'); }

// Carga inicial
window.onload = () => {
    editor.value = localStorage.getItem('nota_compartida') || "";
    JSON.parse(localStorage.getItem('nuestras_fotos') || "[]").forEach(displayImg);
};