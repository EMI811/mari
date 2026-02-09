let jiggleMode = false;
let timer;

// Iniciar Jiggle Mode con Long Press
document.body.addEventListener('touchstart', (e) => {
    if (e.target.closest('.ios-card') || e.target.closest('.widget-frame') || e.target.tagName === 'MAIN') {
        timer = setTimeout(startJiggle, 800);
    }
});
document.body.addEventListener('touchend', () => clearTimeout(timer));

function startJiggle() {
    jiggleMode = true;
    document.querySelectorAll('.ios-card, .widget-frame').forEach(el => el.classList.add('jiggling'));
    document.getElementById('btn-add').classList.remove('hidden');
    document.getElementById('btn-done').classList.remove('hidden');
    document.getElementById('btn-settings').classList.add('hidden');
}

function stopJiggle() {
    jiggleMode = false;
    document.querySelectorAll('.ios-card, .widget-frame').forEach(el => el.classList.remove('jiggling'));
    document.getElementById('btn-add').classList.add('hidden');
    document.getElementById('btn-done').classList.add('hidden');
    document.getElementById('btn-settings').classList.remove('hidden');
}

// MENU DE WIDGETS
function showWidgetMenu() {
    const menu = document.getElementById('widget-menu');
    const container = document.getElementById('available-widgets');
    const photos = JSON.parse(localStorage.getItem('nuestras_fotos') || "[]");
    
    container.innerHTML = "";
    menu.classList.remove('hidden');

    if (photos.length > 0) {
        const formats = [
            { id: 'w-square', name: 'Widget Cuadrado' },
            { id: 'w-horizontal', name: 'Widget Panorámico' },
            { id: 'w-vertical', name: 'Widget Vertical' }
        ];
        formats.forEach(f => {
            container.innerHTML += `
                <div class="widget-option" onclick="addWidget('${f.id}')">
                    <span>${f.name}</span> <span style="color:var(--ios-blue)">Añadir</span>
                </div>`;
        });
    } else {
        container.innerHTML = "<p style='text-align:center; color:#888;'>No tienes fotos guardadas para crear widgets todavía.</p>";
    }
}

function closeWidgetMenu() { document.getElementById('widget-menu').classList.add('hidden'); }

function addWidget(type) {
    const photos = JSON.parse(localStorage.getItem('nuestras_fotos') || "[]");
    const lastPhoto = photos[photos.length - 1];
    const widgetData = { type, img: lastPhoto };
    
    let activeWidgets = JSON.parse(localStorage.getItem('active_widgets') || "[]");
    activeWidgets.push(widgetData);
    localStorage.setItem('active_widgets', JSON.stringify(activeWidgets));
    
    renderWidgets();
    closeWidgetMenu();
}

function renderWidgets() {
    const container = document.getElementById('widgets-container');
    const activeWidgets = JSON.parse(localStorage.getItem('active_widgets') || "[]");
    container.innerHTML = "";

    activeWidgets.forEach((w, index) => {
        const div = document.createElement('div');
        div.className = `widget-frame ${w.type} ${jiggleMode ? 'jiggling' : ''}`;
        div.innerHTML = `<img src="${w.img}">`;
        // Eliminar widget si estamos en jiggle mode
        div.onclick = () => {
            if(jiggleMode) {
                activeWidgets.splice(index, 1);
                localStorage.setItem('active_widgets', JSON.stringify(activeWidgets));
                renderWidgets();
            }
        };
        container.appendChild(div);
    });
}

// Navegación Básica
function openView(id) {
    if (jiggleMode) return;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.getElementById('btn-back').classList.remove('hidden');
}

function goHome() {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('main-menu').classList.add('active');
    document.getElementById('btn-back').classList.add('hidden');
}

// Subida de fotos
document.getElementById('upload-photo').onchange = (e) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
        let photos = JSON.parse(localStorage.getItem('nuestras_fotos') || "[]");
        photos.push(ev.target.result);
        localStorage.setItem('nuestras_fotos', JSON.stringify(photos));
        location.reload(); // Recargar para ver cambios
    };
    reader.readAsDataURL(e.target.files[0]);
};

window.onload = () => {
    renderWidgets();
    document.getElementById('notes-editor').value = localStorage.getItem('nota_amor') || "";
};