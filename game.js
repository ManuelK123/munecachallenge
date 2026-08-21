// ==========================================
// 1. CONFIGURACIÓN DE AUDIO
// ==========================================
window.addEventListener('click', () => {
    const music = document.getElementById('menu-music');
    if (music && music.paused) {
        music.volume = 0.4;
        music.play().catch(error => {
            console.log("Audio en pausa por políticas del navegador:", error);
        });
    }
});

// ==========================================
// 2. NAVEGACIÓN Y MENÚS
// ==========================================
function startGame(gameType) {
    console.log("Cargando escena: " + gameType);
    
    if (gameType === 'play') {
        // Ocultar menú principal y mostrar pantalla del juego
        document.getElementById('main-menu').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';

        // Detener o bajar volumen a la música del menú
        const music = document.getElementById('menu-music');
        if (music) music.pause();

        // Arrancar la mecánica del minijuego
        iniciarNivelEscalera();

    } else if (gameType === 'story') {
        alert("Una historia increíble en el campus de UANE está por comenzar...");
    } else if (gameType === 'memory') {
        alert("¡Muñeca dice: Prepárate para memorizar las flechas!");
    }
}

function openSettings() {
    alert("Panel de Opciones de Audio y Gráficos");
}

// ==========================================
// 3. LÓGICA DEL JUEGO (ESCALERA INFINITA)
// ==========================================
function iniciarNivelEscalera() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');

    // Resolución estándar para móvil
    canvas.width = 400;
    canvas.height = 700;

    // Carga de imágenes (usa los archivos de tu repositorio)
    const assets = {
        fondo: new Image(),
        jugador: new Image(),
        obstaculo: new Image()
    };

    assets.fondo.src = 'campus_background.png';
    assets.jugador.src = 'boy_left.png.png';
    assets.obstaculo.src = 'chalkboard_text.png.png';

    const carriles = [80, 200, 320]; // Carril Izquierdo, Centro, Derecho
    let carrilActual = 1;
    let puntaje = 0;
    let velocidad = 4;
    let juegoActivo = true;
    let fondoY = 0;

    const jugador = { x: carriles[carrilActual], y: 530, ancho: 70, alto: 70 };
    let obstaculos = [];

    function crearObstaculo() {
        const carrilAleatorio = Math.floor(Math.random() * 3);
        obstaculos.push({
            x: carriles[carrilAleatorio] - 30,
            y: -70,
            ancho: 60,
            alto: 60
        });
    }

    function actualizar() {
        if (!juegoActivo) return;

        // Aumentar velocidad progresivamente
        velocidad += 0.0015;

        // Movimiento en bucle del fondo (subir la escalera)
        fondoY += velocidad;
        if (fondoY >= canvas.height) fondoY = 0;

        // Transición suave del personaje entre carriles
        jugador.x += (carriles[carrilActual] - 35 - jugador.x) * 0.25;

        // Generar nuevos obstáculos
        if (Math.random() < 0.022) {
            if (obstaculos.length === 0 || obstaculos[obstaculos.length - 1].y > 220) {
                crearObstaculo();
            }
        }

        // Mover obstáculos y detectar impactos
        for (let i = 0; i < obstaculos.length; i++) {
            let obs = obstaculos[i];
            obs.y += velocidad;

            // Detección de Colisión
            if (
                jugador.x < obs.x + obs.ancho &&
                jugador.x + jugador.ancho > obs.x &&
                jugador.y < obs.y + obs.alto &&
                jugador.y + jugador.alto > obs.y
            ) {
                juegoActivo = false;
                alert(`¡Game Over! Puntaje obtenido: ${Math.floor(puntaje)}`);
                document.location.reload();
            }

            // Eliminar obstáculo que sale de pantalla y sumar puntos
            if (obs.y > canvas.height) {
                obstaculos.splice(i, 1);
                i--;
                puntaje += 10;
                scoreEl.innerText = Math.floor(puntaje);
            }
        }
    }

    function dibujar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Renderizar Fondo en Bucle
        if (assets.fondo.complete && assets.fondo.naturalWidth !== 0) {
            ctx.drawImage(assets.fondo, 0, fondoY - canvas.height, canvas.width, canvas.height);
            ctx.drawImage(assets.fondo, 0, fondoY, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "#2c3e50";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Renderizar Jugador
        if (assets.jugador.complete && assets.jugador.naturalWidth !== 0) {
            ctx.drawImage(assets.jugador, jugador.x, jugador.y, jugador.ancho, jugador.alto);
        } else {
            ctx.fillStyle = "#2ecc71";
            ctx.fillRect(jugador.x, jugador.y, jugador.ancho, jugador.alto);
        }

        // Renderizar Obstáculos
        for (let obs of obstaculos) {
            if (assets.obstaculo.complete && assets.obstaculo.naturalWidth !== 0) {
                ctx.drawImage(assets.obstaculo, obs.x, obs.y, obs.ancho, obs.alto);
            } else {
                ctx.fillStyle = "#e74c3c";
                ctx.fillRect(obs.x, obs.y, obs.ancho, obs.alto);
            }
        }
    }

    function loop() {
        actualizar();
        dibujar();
        if (juegoActivo) requestAnimationFrame(loop);
    }

    // Controles táctiles
    document.getElementById('btn-left').onclick = () => { if (carrilActual > 0) carrilActual--; };
    document.getElementById('btn-right').onclick = () => { if (carrilActual < 2) carrilActual++; };

    // Controles de teclado
    window.onkeydown = (e) => {
        if (e.key === 'ArrowLeft' && carrilActual > 0) carrilActual--;
        if (e.key === 'ArrowRight' && carrilActual < 2) carrilActual++;
    };

    loop();
}
