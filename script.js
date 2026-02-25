// --- PARTE 1: SISTEMA BASE Y DATOS ---

// CONFIGURACIÓN FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyCRjtVHymOKWp_n13G4xkYpr8_pUTHaMgc",
    authDomain: "nuestraapp-97318.firebaseapp.com",
    databaseURL: "https://nuestraapp-97318-default-rtdb.firebaseio.com/",
    projectId: "nuestraapp-97318",
    storageBucket: "nuestraapp-97318.firebasestorage.app",
    messagingSenderId: "834055152460",
    appId: "1:834055152460:web:19649783347887502025e9"
};
// Inicializar Firebase solo si no existe ya
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// VARIABLES GLOBALES
let currentUser = localStorage.getItem('user_name') || "Invitado";
let isJiggleMode = false;
let longPressTimer;
let currentPhotoKey = null; 
let filterIndex = 0; 

// --- ARRANQUE (BOOT) ---
window.onload = () => {
    // 1. Animación de carga
    setTimeout(() => {
        const boot = document.getElementById('boot-screen');
        if(boot) {
            boot.style.opacity = '0';
            setTimeout(() => boot.classList.add('hidden'), 800);
        }
    }, 2000);

    // 2. Cargar datos
    loadSettings();
    updateClock();
    setInterval(updateClock, 1000);
    setupJiggle();
};

function loadSettings() {
    updateProfileUI();
    
    // Fondo personalizado
    const savedWP = localStorage.getItem('custom_wallpaper');
    const bg = document.getElementById('app-background');
    if (savedWP && bg) {
        bg.style.backgroundImage = `url(${savedWP})`;
    }

    // Efectos visuales
    const isBlur = localStorage.getItem('bg_blur') === 'true';
    const blurCheck = document.getElementById('blur-check');
    if(blurCheck) blurCheck.checked = isBlur;
    toggleBlurMode(isBlur);

    const isGlass = localStorage.getItem('glass_mode') === 'true';
    const glassCheck = document.getElementById('glass-check');
    if(glassCheck) glassCheck.checked = isGlass;
    toggleGlassMode(isGlass);
}

function updateClock() {
    const now = new Date();
    const timeEl = document.getElementById('clock-time');
    if(timeEl) timeEl.innerText = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const dateEl = document.getElementById('date-display');
    if(dateEl) {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        dateEl.innerText = now.toLocaleDateString('es-ES', options);
    }

    // Timer de relación
    const inicio = new Date(2025, 11, 21); 
    const diff = now - inicio;
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const timerEl = document.getElementById('timer-display');
    if(timerEl) timerEl.innerText = dias + " días juntos";
}

// --- NAVEGACIÓN ---
function openView(id) {
    if(isJiggleMode) return;
    if(typeof stopGame === 'function') stopGame(); 

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const view = document.getElementById(id);
    if(view) view.classList.add('active');

    const navbar = document.getElementById('main-navbar');
    if (navbar) {
        if (id === 'view-home') {
            navbar.classList.add('hidden');
        } else {
            navbar.classList.remove('hidden');
            let title = "Inicio";
            if(id === 'view-settings') title = "Ajustes";
            if(id === 'view-messages') title = "Chat";
            if(id === 'view-cloud') title = "Fotos";
            if(id === 'view-game-play') title = "Jugando";
            document.getElementById('navbar-title').innerText = title;
        }
    }
}

function goHome() { openView('view-home'); }
function handleAppClick(viewId) {
    if(!isJiggleMode) openView(viewId);
}

// --- AJUSTES VISUALES ---
function handleWallpaperUpload(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            localStorage.setItem('custom_wallpaper', e.target.result);
            document.getElementById('app-background').style.backgroundImage = `url(${e.target.result})`;
            showBanner("Sistema", "Fondo actualizado");
        } catch (err) {
            alert("Imagen muy grande. Usa una más ligera.");
        }
    };
    reader.readAsDataURL(file);
}

function resetWallpaper() {
    localStorage.removeItem('custom_wallpaper');
    document.getElementById('app-background').style.backgroundImage = "url('https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1000&auto=format&fit=crop')";
    showBanner("Sistema", "Fondo restaurado");
}

function toggleBlurMode(active) {
    localStorage.setItem('bg_blur', active);
    const bg = document.getElementById('app-background');
    if(bg) {
        bg.style.filter = active ? "blur(15px)" : "none";
        bg.style.transform = active ? "scale(1.1)" : "scale(1)";
    }
}

function toggleGlassMode(active) {
    localStorage.setItem('glass_mode', active);
    if(active) document.body.classList.add('glass-mode');
    else document.body.classList.remove('glass-mode');
}

// --- JIGGLE MODE ---
function setupJiggle() {
    const apps = document.querySelectorAll('.app-icon-container');
    apps.forEach(app => {
        const start = () => { longPressTimer = setTimeout(startJiggle, 800); };
        const end = () => clearTimeout(longPressTimer);
        
        app.addEventListener('touchstart', start);
        app.addEventListener('touchend', end);
        app.addEventListener('mousedown', start);
        app.addEventListener('mouseup', end);
    });

    document.addEventListener('click', (e) => {
        if(isJiggleMode && !e.target.closest('.app-icon-container')) {
            stopJiggle();
        }
    });
}
function startJiggle() {
    isJiggleMode = true;
    if(navigator.vibrate) navigator.vibrate(50);
    document.querySelectorAll('.app-icon-container').forEach(el => el.classList.add('jiggle'));
}
function stopJiggle() {
    isJiggleMode = false;
    document.querySelectorAll('.app-icon-container').forEach(el => el.classList.remove('jiggle'));
}

// --- PERFIL ---
function login() {
    const name = prompt("Tu nombre:");
    if(name && name.trim()) {
        localStorage.setItem('user_name', name);
        location.reload();
    }
}
function updateProfileUI() {
    currentUser = localStorage.getItem('user_name') || "Invitado";
    const welcome = document.getElementById('welcome-text');
    if(welcome) welcome.innerText = "Hola, " + currentUser;
    
    const setNames = document.querySelectorAll('#setting-name, #display-name');
    setNames.forEach(el => el.innerText = currentUser);
    
    const avatars = document.querySelectorAll('#user-avatar-setting');
    avatars.forEach(el => el.innerText = currentUser.charAt(0).toUpperCase());
}
function borrarTodo() {
    if(confirm("⚠ ¿Restablecer toda la app? Se borrarán tus ajustes locales.")) {
        localStorage.clear();
        location.reload();
    }
}

let replyingTo = null; // Variable para saber a qué mensaje respondemos
const recorder = new MicRecorder({ bitRate: 128 });

// --- RESPONDER MENSAJE ---
function setReply(text, sender) {
    replyingTo = { text, sender };
    const bar = document.getElementById('reply-bar') || createReplyBar();
    bar.innerHTML = `<span>Replying to: <b>${sender}</b><br>${text.substring(0,20)}...</span><button onclick="cancelReply()">✕</button>`;
    bar.classList.remove('hidden');
}

function cancelReply() {
    replyingTo = null;
    document.getElementById('reply-bar').classList.add('hidden');
}

// --- ENVIAR MENSAJE (CUALQUIER TIPO) ---
function sendMsg(customData = null) {
    const input = document.getElementById('chat-input');
    const msgData = customData || {
        text: input.value,
        type: 'text'
    };

    if(!msgData.text && !msgData.img && !msgData.audio) return;

    db.ref('messages').push({
        ...msgData,
        sender: currentUser,
        reply: replyingTo,
        timestamp: Date.now(),
        seen: false
    });

    input.value = "";
    cancelReply();
}

// --- LISTENER DE CHAT MEJORADO (Evita el "undefined") ---
let lastDisplayedDate = null; // 1. Pon esta variable afuera, arriba del todo

db.ref('messages').on('child_added', (sn) => {
    const m = sn.val();
    const box = document.getElementById('chat-container');
    if(!box) return;

    // --- 2. Lógica de Separador de Fechas ---
    const dateString = getFriendlyDate(m.timestamp);
    if (dateString !== lastDisplayedDate) {
        const dateSeparator = document.createElement('div');
        dateSeparator.className = 'date-separator';
        dateSeparator.innerText = dateString;
        box.appendChild(dateSeparator);
        // Dentro del listener de mensajes (db.ref('messages').on...)
        // Justo después de: box.appendChild(div);
        box.scrollTop = box.scrollHeight;
        lastDisplayedDate = dateString;
    }

    // --- 3. Crear la burbuja del mensaje (tu código existente mejorado) ---
    const isMe = m.sender === currentUser;
    const div = document.createElement('div');
    // Agregamos clases según el tipo para que no salga "undefined"
    div.className = `msg ${isMe ? 'sent' : 'received'} ${m.type === 'sticker' ? 'sticker' : ''}`;

    // Lógica para mostrar Contenido (Texto, Imagen o Audio)
    let contentHTML = "";
    if(m.type === 'image' || m.img) {
        contentHTML = `<img src="${m.img}" class="chat-img" onclick="openLightbox('${m.img}')">`;
    } else if(m.type === 'audio') {
        contentHTML = `<audio controls src="${m.audio}"></audio>`;
    } else {
        contentHTML = m.text || "";
    }

    const time = new Date(m.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    div.innerHTML = `${contentHTML}<div class="msg-info">${time} ${isMe ? (m.seen ? '✓✓' : '✓') : ''}</div>`;
    
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;

    if(!isMe) db.ref('messages/' + sn.key).update({ seen: true });
});

// --- 4. Añade esta función de apoyo al final de tu JS ---
function getFriendlyDate(timestamp) {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDate = (d1, d2) => 
        d1.getDate() === d2.getDate() && 
        d1.getMonth() === d2.getMonth() && 
        d1.getFullYear() === d2.getFullYear();

    if (isSameDate(messageDate, today)) return "Hoy";
    if (isSameDate(messageDate, yesterday)) return "Ayer";

    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    if (messageDate.getFullYear() === today.getFullYear()) {
        return messageDate.toLocaleDateString('es-ES', options);
    }
    return messageDate.toLocaleDateString('es-ES', { ...options, year: 'numeric' });
}

// --- NOTAS DE VOZ ---
function startVoice() {
    recorder.start().then(() => {
        document.getElementById('record-btn').innerText = "🔴 Grabando...";
    });
}

function stopVoice() {
    recorder.stop().getMp3().then(([buffer, blob]) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            sendMsg({ audio: e.target.result, type: 'audio', text: 'Nota de voz' });
            document.getElementById('record-btn').innerText = "🎤 Nota de Voz";
        };
        reader.readAsDataURL(blob);
    });
}

// --- STICKERS ---
function sendSticker(emoji) {
    sendMsg({ text: emoji, type: 'sticker' });
}
// --- NOTAS ---
function showEditor() {
    document.getElementById('notes-list-area').classList.add('hidden');
    document.getElementById('notes-editor-area').classList.remove('hidden');
}
function saveNote() {
    const txt = document.getElementById('notes-editor').value;
    if(txt.trim()) {
        db.ref('shared_notes').push({ text: txt, author: currentUser, date: new Date().toLocaleDateString() });
        document.getElementById('notes-editor').value = "";
        document.getElementById('notes-list-area').classList.remove('hidden');
        document.getElementById('notes-editor-area').classList.add('hidden');
    }
}
db.ref('shared_notes').on('value', sn => {
    const c = document.getElementById('list-container');
    if(!c) return;
    c.innerHTML = "";
    sn.forEach(x => {
        const n = x.val();
        c.innerHTML += `<div class="ios-item" style="flex-direction:column; align-items:flex-start;"><b>${n.text}</b><span style="font-size:10px; opacity:0.5;">${n.author}</span></div>`;
    });
});
// --- PARTE 2: GALERÍA, MAPA Y JUEGOS ---

// GALERÍA & LIGHTBOX
const upFile = document.getElementById('up-file');
if(upFile) {
    upFile.onchange = (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => db.ref('shared_photos').push({ img: ev.target.result });
        reader.readAsDataURL(file);
    };
}

db.ref('shared_photos').on('value', sn => {
    const g = document.getElementById('gallery');
    if(!g) return;
    g.innerHTML = "";
    sn.forEach(x => {
        const val = x.val();
        const img = document.createElement('img');
        img.src = val.img;
        img.className = 'gallery-item';
        img.onclick = () => openLightbox(val.img, x.key);
        g.prepend(img);
    });
});

function openLightbox(src, key) {
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    img.src = src;
    img.style.filter = "none";
    filterIndex = 0;
    currentPhotoKey = key;
    lb.classList.remove('hidden');
}

function closeLightbox() {
    document.getElementById('lightbox').classList.add('hidden');
    currentPhotoKey = null;
}

function applyFilter() {
    const img = document.getElementById('lightbox-img');
    filterIndex = (filterIndex + 1) % 4;
    const filters = ["none", "grayscale(100%)", "sepia(100%)", "contrast(150%)"];
    img.style.filter = filters[filterIndex];
}

function deleteCurrentPhoto() {
    if(currentPhotoKey && confirm("¿Borrar esta foto para siempre?")) {
        db.ref('shared_photos/' + currentPhotoKey).remove();
        closeLightbox();
        showBanner("Galería", "Foto eliminada");
    }
}

function downloadPhoto() {
    const src = document.getElementById('lightbox-img').src;
    const a = document.createElement('a');
    a.href = src;
    a.download = "MyLove_Photo.png";
    a.click();
}

// UBICACIÓN (MAPA)
function compartirUbicacion() {
    if(!navigator.geolocation) return alert("Tu dispositivo no soporta GPS");
    showBanner("Mapa", "Obteniendo posición...");
    navigator.geolocation.getCurrentPosition(p => {
        db.ref('loc/' + currentUser).set({
            lat: p.coords.latitude,
            lng: p.coords.longitude,
            time: Date.now()
        });
        showBanner("Mapa", "Ubicación enviada ✅");
    });
}

db.ref('loc').on('value', sn => {
    const data = sn.val();
    const btn = document.getElementById('link-google-maps');
    const txt = document.getElementById('distancia-texto');
    if(!data || !txt) return;
    
    const keys = Object.keys(data);
    const otherUser = keys.find(k => k !== currentUser);

    if(otherUser) {
        txt.innerText = `Ubicación de ${otherUser} recibida.`;
        if(btn) {
            btn.classList.remove('hidden');
            btn.href = `https://www.google.com/maps/search/?api=1&query=${data[otherUser].lat},${data[otherUser].lng}`;
        }
    }
});

// --- MOTOR DE JUEGOS ---
let gameInterval, spawnInterval;
let score = 0;
let gameType = ""; 

function openGame(type) {
    gameType = type;
    stopGame(); // Limpieza preventiva
    openView('view-game-play');
    document.getElementById('game-title-hud').innerText = type.toUpperCase();
    document.getElementById('game-score').innerText = "0";
    
    const btn = document.getElementById('btn-start-game');
    btn.style.display = "block";
    btn.onclick = (e) => {
        e.stopPropagation();
        btn.style.display = "none";
        startGameLogic();
    };

    // Reset Player Visual
    const p = document.getElementById('game-player');
    p.style.top = "50%"; p.style.left = "50%";
    p.style.transform = "translate(-50%, -50%)"; // Centrado perfecto
    
    if(type === 'jump') p.innerText = "🚀";
    else if(type === 'flappy') p.innerText = "❤️";
    else p.innerText = "🧺"; // Cesta para catch
}

function stopGame() {
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    // Eliminar enemigos
    document.querySelectorAll('.game-obj').forEach(e => e.remove());
    // Quitar listeners de movimiento viejos si es necesario
    const container = document.getElementById('game-canvas-container');
    if(container) {
        container.ontouchmove = null;
        container.onclick = null;
    }
}

function startGameLogic() {
    score = 0;
    const player = document.getElementById('game-player');
    const container = document.getElementById('game-canvas-container');
    if(!container) return;

    const width = container.offsetWidth;
    const height = container.offsetHeight;

    // LÓGICA: CATCH (Atrapar manzanas)
    if(gameType === 'catch') {
        player.style.top = (height - 60) + "px"; // Abajo
        
        container.ontouchmove = (e) => {
            const rect = container.getBoundingClientRect();
            let x = e.touches[0].clientX - rect.left;
            player.style.left = x + "px";
        };
        // Mouse fallback
        container.onmousemove = (e) => {
             const rect = container.getBoundingClientRect();
             player.style.left = (e.clientX - rect.left) + "px";
        };

        spawnInterval = setInterval(() => {
            spawnObj("🍎", Math.random() * (width - 40), -40, 0, 4, "catch");
        }, 800);
    } 
    // LÓGICA: FLAPPY (Tocar para saltar)
    else if (gameType === 'flappy') {
        let py = height / 2;
        let vy = 0;
        player.style.left = "20%"; // Posición X fija
        
        container.onclick = () => vy = -7; // Impulso

        gameInterval = setInterval(() => {
            vy += 0.5; // Gravedad
            py += vy;
            player.style.top = py + "px";
            
            // Suelo o Techo
            if(py > height - 30 || py < 0) gameOver();
        }, 20);

        spawnInterval = setInterval(() => {
            // Cactus viene de la derecha hacia la izquierda
            spawnObj("🌵", width, Math.random() * (height - 100) + 50, -4, 0, "flappy");
        }, 1800);
    }
    // LÓGICA: JUMP / SKY DODGE (Esquivar nubes)
    else if (gameType === 'jump') {
        let px = width / 2;
        player.style.top = (height - 60) + "px"; // Jugador abajo fijo
        
        container.ontouchmove = (e) => {
            const rect = container.getBoundingClientRect();
            px = e.touches[0].clientX - rect.left;
            player.style.left = px + "px";
        };
        container.onmousemove = (e) => {
             const rect = container.getBoundingClientRect();
             player.style.left = (e.clientX - rect.left) + "px";
        };

        spawnInterval = setInterval(() => {
            // Nubes bajan o suben? Hagamos que bajen como meteoritos para esquivar
            spawnObj("☁️", Math.random() * (width - 40), -40, 0, 5, "jump");
        }, 500);
    }
}

// GENERADOR DE OBJETOS
function spawnObj(emoji, x, y, vx, vy, mode) {
    const container = document.getElementById('game-canvas-container');
    if(!container) return;

    const el = document.createElement('div');
    el.innerText = emoji;
    el.className = 'game-obj';
    el.style.position = 'absolute';
    el.style.fontSize = '28px';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    container.appendChild(el);

    let objLoop = setInterval(() => {
        // Movimiento
        x += vx;
        y += vy;
        el.style.left = x + 'px';
        el.style.top = y + 'px';

        // DETECCIÓN DE COLISIÓN
        const pRect = document.getElementById('game-player').getBoundingClientRect();
        const oRect = el.getBoundingClientRect();

        // Si hay superposición
        if(!(pRect.right < oRect.left || pRect.left > oRect.right || pRect.bottom < oRect.top || pRect.top > oRect.bottom)) {
            
            if(mode === 'catch') {
                score += 10;
                updateScore();
                el.remove();
                clearInterval(objLoop);
            } 
            else if (mode === 'flappy') {
                gameOver();
                clearInterval(objLoop);
            }
            else if (mode === 'jump') {
                // En Jump (Sky Dodge), tocar una nube es perder
                gameOver();
                clearInterval(objLoop);
            }
        }

        // LIMPIEZA (Si sale de pantalla)
        if(y > 800 || y < -100 || x < -100) {
            // En flappy, si pasamos el cactus, sumamos punto
            if(mode === 'flappy' && x < -50) { 
                score++; 
                updateScore(); 
                // Evitar sumar multiples veces por el mismo objeto
                el.remove(); 
                clearInterval(objLoop);
                return;
            }
            // En Jump, si la nube sale por abajo, sumamos punto (esquivada)
            if(mode === 'jump' && y > 600) {
                score += 5;
                updateScore();
            }

            el.remove();
            clearInterval(objLoop);
        }
    }, 20);
}

function updateScore() {
    const s = document.getElementById('game-score');
    if(s) s.innerText = score;
}

function gameOver() {
    stopGame();
    setTimeout(() => {
        alert("¡Juego Terminado! Puntuación: " + score);
        openView('view-games'); // Volver al menú
    }, 100);
}

// UTILIDADES VISUALES
function showBanner(title, msg) {
    const b = document.getElementById('ios-notification');
    if(!b) return;
    
    document.getElementById('notif-title').innerText = title;
    document.getElementById('notif-msg').innerText = msg;
    
    // Forzar reflow para reiniciar animación si ya estaba activo
    b.classList.remove('active');
    void b.offsetWidth; 
    b.classList.add('active');
    
    setTimeout(() => {
        b.classList.remove('active');
    }, 4000);
}
// --- SISTEMA DE PRESENCIA Y VISTO ---
function updatePresence(status) {
    db.ref('status/' + currentUser).set({
        state: status,
        last_changed: Date.now()
    });
}

// Detectar cuando el usuario entra al chat
db.ref('status').on('value', snap => {
    const data = snap.val();
    for (let user in data) {
        if (user !== currentUser) {
            const statusEl = document.getElementById('other-user-status');
            const isOnline = (Date.now() - data[user].last_changed) < 10000;
            statusEl.innerText = isOnline ? "En línea" : "Desconectado";
            statusEl.style.color = isOnline ? "#34C759" : "#8E8E93";
        }
    }
});

// --- MENSAJES MULTIMEDIA ---
function toggleExtraMenu() { document.getElementById('chat-extra-menu').classList.toggle('hidden'); }

function sendSticker(emoji) {
    db.ref('messages').push({ text: emoji, sender: currentUser, type: 'sticker', timestamp: Date.now() });
    document.getElementById('sticker-panel').classList.add('hidden');
    toggleExtraMenu();
}

function sendMedia(input) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        db.ref('messages').push({ img: e.target.result, sender: currentUser, type: 'image', timestamp: Date.now() });
    };
    reader.readAsDataURL(file);
    toggleExtraMenu();
}

// --- NOTIFICACIONES REALES (PWA) ---
// Esta función lanza la notificación nativa si el navegador lo permite
function triggerNotification(title, body) {
    if (Notification.permission === "granted") {
        new Notification(title, { body: body, icon: "❤️" });
    } else {
        // Si no hay permiso, usamos tu banner de iOS
        showBanner(title, body);
    }
}

// --- ACTUALIZACIÓN DEL LISTENER DE CHAT ---
db.ref('messages').limitToLast(1).on('child_added', (sn) => {
    const m = sn.val();
    if (m.sender !== currentUser) {
        triggerNotification(m.sender, m.type === 'image' ? "📷 Foto" : m.text);
        // Marcar como visto en la DB
        db.ref('messages/' + sn.key).update({ seen: true });
    }
});

// Modificar el renderizado de mensajes para mostrar hora y visto
// (Dentro de tu listener de chat existente, añade esto):
function renderMessage(m) {
    const time = new Date(m.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    const seenIcon = m.seen ? "✔️✔️" : "✔️";
    // ... lógica de creación de div ...
    div.innerHTML += `<div class="msg-info">${time} ${m.sender === currentUser ? seenIcon : ''}</div>`;
}
// Función para bajar al final del chat
function scrollToBottom() {
    const box = document.getElementById('chat-container');
    box.scrollTo({
        top: box.scrollHeight,
        behavior: 'smooth' // Bajada suave
    });
}

// Detectar el scroll para mostrar/ocultar el botón
const chatContainer = document.getElementById('chat-container');
chatContainer.addEventListener('scroll', () => {
    const btn = document.getElementById('scroll-bottom-btn');
    
    // Si estamos a más de 300px del fondo, mostrar el botón
    const distanceFromBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight;
    
    if (distanceFromBottom > 300) {
        btn.classList.remove('hidden');
    } else {
        btn.classList.add('hidden');
    }
});
function requestNotificationPermission() {
    if (!("Notification" in window)) {
        alert("Este navegador no soporta notificaciones de escritorio");
        return;
    }

    Notification.requestPermission().then(permission => {
        const statusEl = document.getElementById('notif-status');
        
        if (permission === "granted") {
            statusEl.innerText = "Estado: Activado ✅";
            statusEl.style.color = "var(--ios-green)";
            
            // Notificación de prueba estilo NeoOne
            new Notification("NeoOne", {
                body: "¡Notificaciones activadas correctamente! ❤️",
                icon: "https://cdn-icons-png.flaticon.com/512/2589/2589175.png" // O tu logo
            });
        } else if (permission === "denied") {
            statusEl.innerText = "Estado: Bloqueado ❌";
            statusEl.style.color = "var(--ios-red)";
            alert("Has bloqueado las notificaciones. Actívalas en los ajustes de tu navegador.");
        }
    });
}

// Opcional: Revisar el estado al cargar la app
window.addEventListener('load', () => {
    const statusEl = document.getElementById('notif-status');
    if (statusEl) {
        if (Notification.permission === "granted") {
            statusEl.innerText = "Estado: Activado ✅";
            statusEl.style.color = "var(--ios-green)";
        } else if (Notification.permission === "denied") {
            statusEl.innerText = "Estado: Bloqueado ❌";
        }
    }
});
// --- LÓGICA DE ESCRIBIENDO ---

const chatInput = document.getElementById('chat-input');
let typingTimeout;

chatInput.addEventListener('input', () => {
    // 1. Decirle a Firebase que estoy escribiendo
    db.ref('typing/' + currentUser).set(true);

    // 2. Si dejo de escribir por 2 segundos, quitar el estado
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        db.ref('typing/' + currentUser).set(false);
    }, 2000);
});

// 3. Escuchar si la OTRA persona está escribiendo
db.ref('typing').on('value', (snapshot) => {
    const data = snapshot.val();
    const indicator = document.getElementById('typing-indicator');
    
    if (!data) return;

    // Buscamos si alguien que NO soy yo está escribiendo
    let isSomeoneElseTyping = false;
    for (let user in data) {
        if (user !== currentUser && data[user] === true) {
            isSomeoneElseTyping = true;
            break;
        }
    }

    if (isSomeoneElseTyping) {
        indicator.classList.remove('hidden');
        // Auto-scroll al fondo para ver los puntos
        const box = document.getElementById('chat-container');
        box.scrollTop = box.scrollHeight;
    } else {
        indicator.classList.add('hidden');
    }
});
let targetMsgKey = null; // Para saber a qué mensaje le ponemos el emoji

// Esta función se activa cuando creas el mensaje en el chat
function setupLongPress(element, key) {
    let timer;
    const start = (e) => {
        timer = setTimeout(() => {
            showReactionMenu(e, key);
        }, 600); // 600ms para detectar pulsación larga
    };
    const end = () => clearTimeout(timer);

    element.addEventListener('touchstart', start);
    element.addEventListener('touchend', end);
    element.addEventListener('mousedown', start);
    element.addEventListener('mouseup', end);
}

function showReactionMenu(e, key) {
    if (navigator.vibrate) navigator.vibrate(40); // Vibración háptica de iOS
    targetMsgKey = key;
    const menu = document.getElementById('reaction-menu');
    
    // Posicionar el menú cerca del toque
    let touch = e.touches ? e.touches[0] : e;
    menu.style.left = "50px"; 
    menu.style.top = (touch.clientY - 100) + "px";
    
    menu.classList.remove('hidden');
    setTimeout(() => menu.classList.add('active'), 10);
}

function sendReaction(emoji) {
    if (targetMsgKey) {
        db.ref('messages/' + targetMsgKey + '/reaction').set(emoji);
        document.getElementById('reaction-menu').classList.remove('active');
        setTimeout(() => document.getElementById('reaction-menu').classList.add('hidden'), 200);
    }
}

// CERRAR MENÚ AL TOCAR FUERA
document.addEventListener('click', (e) => {
    if(!e.target.closest('.reaction-menu')) {
        const menu = document.getElementById('reaction-menu');
        menu.classList.remove('active');
        setTimeout(() => menu.classList.add('hidden'), 200);
    }
});