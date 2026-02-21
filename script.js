import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
const firebaseConfig = { 
      apiKey: "AIzaSyCRjtVHymOKWp_n13G4xkYpr8_pUTHaMgc",
  authDomain: "nuestraapp-97318.firebaseapp.com",
  databaseURL: "https://nuestraapp-97318-default-rtdb.firebaseio.com",
  projectId: "nuestraapp-97318",
  storageBucket: "nuestraapp-97318.firebasestorage.app",
  messagingSenderId: "834055152460",
  appId: "1:834055152460:web:19649783347887502025e9",
  measurementId: "G-K0K8CZTL4T"
 };
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Navegación Blindada
function openApp(id, title, mode) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    const nav = document.getElementById('top-nav');
    nav.classList.remove('hidden');
    document.getElementById('nav-title').innerText = title;
}

function goHome() {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-home').classList.add('active');
    document.getElementById('top-nav').classList.add('hidden');
}

// CHAT INDEPENDIENTE
function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const user = document.getElementById('set-user').value || "Invitado";
    if(!input.value.trim()) return;
    
    db.ref('messages').push({
        text: input.value,
        sender: user,
        time: Date.now()
    });
    input.value = "";
}

// FOTOS VAULT
function uploadMedia(input, path) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        db.ref(path).push({ img: e.target.result, time: Date.now() });
    };
    reader.readAsDataURL(file);
}

// NOTAS TIPO IPHONE
function saveCurrentNote() {
    const text = document.getElementById('note-pad').value;
    if(!text) return;
    db.ref('notes').push({ text: text, date: new Date().toLocaleDateString() });
    document.getElementById('note-pad').value = "";
    alert("Nota guardada");
}

// Listener de Fotos
db.ref('vault').on('value', snap => {
    const cont = document.getElementById('photos-container');
    cont.innerHTML = "";
    snap.forEach(child => {
        const img = document.createElement('img');
        img.src = child.val().img;
        cont.appendChild(img);
    });
});

// Listener de Chat mejorado (Fusion Insta+WA)
db.ref('messages').limitToLast(20).on('child_added', snap => {
    const m = snap.val();
    const box = document.getElementById('chat-messages');
    const user = document.getElementById('set-user').value || "Invitado";
    
    const div = document.createElement('div');
    div.className = `msg ${m.sender === user ? 'sent' : 'received'}`;
    div.innerText = m.text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
});