// Seleccionamos los elementos
const btnNotes = document.getElementById('btn-notes');
const btnCloud = document.getElementById('btn-cloud');
const btnBack = document.getElementById('btn-back');
const mainMenu = document.getElementById('main-menu');
const notesView = document.getElementById('notes-view');
const cloudView = document.getElementById('cloud-view');
const notesEditor = document.getElementById('notes-editor');

// Función para cambiar de vista
function showView(viewToShow) {
    mainMenu.classList.add('hidden');
    notesView.classList.add('hidden');
    cloudView.classList.add('hidden');
    
    viewToShow.classList.remove('hidden');
    btnBack.style.visibility = 'visible';
}

// Botón Atrás
btnBack.addEventListener('click', () => {
    mainMenu.classList.remove('hidden');
    notesView.classList.add('hidden');
    cloudView.classList.add('hidden');
    btnBack.style.visibility = 'hidden';
});

// Eventos de los botones principales
btnNotes.addEventListener('click', () => showView(notesView));
btnCloud.addEventListener('click', () => showView(cloudView));

// Lógica de Notas (Auto-guardado)
window.onload = () => {
    const saved = localStorage.getItem('notaAmor');
    if (saved) notesEditor.value = saved;
};

notesEditor.addEventListener('input', () => {
    localStorage.setItem('notaAmor', notesEditor.value);
});