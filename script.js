let jiggleMode = false;
let timer;

// Detectar pulsación larga en el menú principal
const mainGrid = document.getElementById('main-menu');
mainGrid.addEventListener('touchstart', startTimer);
mainGrid.addEventListener('touchend', cancelTimer);

function startTimer() {
    if (jiggleMode) return;
    timer = setTimeout(startJiggle, 800); // 800ms para activar
}

function cancelTimer() { clearTimeout(timer); }

function startJiggle() {
    jiggleMode = true;
    document.querySelectorAll('.ios-card, .widget').forEach(el => el.classList.add('jiggling'));
    document.getElementById('btn-add').classList.remove('hidden');
    document.getElementById('btn-done').classList.remove('hidden');
    document.getElementById('btn-settings').classList.add('hidden');
}

function stopJiggle() {
    jiggleMode = false;
    document.querySelectorAll('.ios-card, .widget').forEach(el => el.classList.remove('jiggling'));
    document.getElementById('btn-add').classList.add('hidden');
    document.getElementById('btn-done').classList.add('hidden');
    document.getElementById('btn-settings').classList.remove('hidden');
}

// Navegación
function openView(id) {
    if (jiggleMode) return; // No abrir si estamos editando
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

// Lógica del Widget y Fotos
const upload = document.getElementById('upload-photo');
const widgetContent = document.getElementById('widget-content');

upload.onchange = (e) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
        const url = ev.target.result;
        saveAndDisplay(url);
    };
    reader.readAsDataURL(e.target.files[0]);
};

function saveAndDisplay(url) {
    let photos = JSON.parse(localStorage.getItem('nuestras_fotos') || "[]");
    photos.push(url);
    localStorage.setItem('nuestras_fotos', JSON.stringify(photos));
    updateWidget(photos);
    // También mostrar en galería
    const img = document.createElement('img');
    img.src = url; img.className = 'gallery-item';
    document.getElementById('gallery-grid').prepend(img);
}

function updateWidget(photos) {
    if (photos.length > 0) {
        widgetContent.innerHTML = `<img src="${photos[photos.length - 1]}">`;
    } else {
        widgetContent.innerHTML = `<p id="widget-msg">No hay fotos. Ve a la Nube y sube una para verla aquí.</p>`;
    }
}

window.onload = () => {
    document.getElementById('notes-editor').value = localStorage.getItem('nota_amor') || "";
    let photos = JSON.parse(localStorage.getItem('nuestras_fotos') || "[]");
    updateWidget(photos);
    photos.forEach(url => {
        const img = document.createElement('img');
        img.src = url; img.className = 'gallery-item';
        document.getElementById('gallery-grid').prepend(img);
    });
};