const notesEditor = document.querySelector('.notes-editor');

// Al cargar la página, recuperar nota guardada
window.onload = () => {
    const savedNote = localStorage.getItem('miNotaSecreta');
    if (savedNote) {
        notesEditor.value = savedNote;
    }
};

// Guardar automáticamente mientras escribe
notesEditor.addEventListener('input', () => {
    localStorage.setItem('miNotaSecreta', notesEditor.value);
});

function openView(viewId) {
    document.querySelectorAll('section').forEach(s => s.style.display = 'none');
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById(viewId).style.display = 'flex';
    document.getElementById('btn-back').style.display = 'block';
}

function goHome() {
    document.querySelectorAll('section').forEach(s => s.style.display = 'none');
    document.getElementById('main-menu').style.display = 'block';
    document.getElementById('btn-back').style.display = 'none';
}