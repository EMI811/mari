// Elementos
const btnNotes = document.getElementById('btn-notes');
const btnBack = document.getElementById('btn-back');
const btnSettings = document.getElementById('btn-settings');
const modalSettings = document.getElementById('modal-settings');
const notesView = document.getElementById('notes-view');
const mainMenu = document.getElementById('main-menu');
const notesEditor = document.getElementById('notes-editor');
const darkModeToggle = document.getElementById('dark-mode-toggle');

// Navegación
btnNotes.addEventListener('click', () => {
    mainMenu.classList.add('hidden');
    notesView.classList.remove('hidden');
    btnBack.style.visibility = 'visible';
});

btnBack.addEventListener('click', () => {
    mainMenu.classList.remove('hidden');
    notesView.classList.add('hidden');
    btnBack.style.visibility = 'hidden';
});

// Ajustes
btnSettings.addEventListener('click', () => modalSettings.classList.remove('hidden'));
function closeSettings() { modalSettings.classList.add('hidden'); }

// Función Borrar
function clearNotes() {
    if(confirm("¿Seguro que quieres borrar todas las notas?")) {
        notesEditor.value = "";
        localStorage.removeItem('nota_amor');
    }
}

// Modo Oscuro
darkModeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark');
});

// Guardado Automático
window.onload = () => {
    notesEditor.value = localStorage.getItem('nota_amor') || "";
};

notesEditor.addEventListener('input', () => {
    localStorage.setItem('nota_amor', notesEditor.value);
});