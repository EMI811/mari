const btnBack = document.getElementById('btn-back');
const uploadPhoto = document.getElementById('upload-photo');
const galleryGrid = document.getElementById('gallery-grid');
const notesEditor = document.getElementById('notes-editor');

// Navegación entre pantallas
function openView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    btnBack.style.visibility = 'visible';
}

function goHome() {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('main-menu').classList.add('active');
    btnBack.style.visibility = 'hidden';
}

btnBack.addEventListener('click', goHome);

// Ajustes
document.getElementById('btn-settings').onclick = () => document.getElementById('modal-settings').classList.remove('hidden');
function closeSettings() { document.getElementById('modal-settings').classList.add('hidden'); }

// Lógica de Notas
notesEditor.oninput = () => localStorage.setItem('nuestra_nota', notesEditor.value);

// Lógica de Galería (Guardar fotos en el dispositivo)
uploadPhoto.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
        const imgUrl = event.target.result;
        savePhoto(imgUrl);
        displayPhoto(imgUrl);
    };
    reader.readAsDataURL(file);
};

function displayPhoto(url) {
    const img = document.createElement('img');
    img.src = url;
    img.className = 'gallery-item';
    galleryGrid.prepend(img);
}

function savePhoto(url) {
    let photos = JSON.parse(localStorage.getItem('nuestras_fotos') || "[]");
    photos.push(url);
    localStorage.setItem('nuestras_fotos', JSON.stringify(photos));
}

// Cargar todo al iniciar
window.onload = () => {
    notesEditor.value = localStorage.getItem('nuestra_nota') || "";
    let photos = JSON.parse(localStorage.getItem('nuestras_fotos') || "[]");
    photos.forEach(displayPhoto);
};