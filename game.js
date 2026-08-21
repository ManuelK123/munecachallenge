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
function showStageSelect() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('stage-select-screen').style.display = 'block';
}

function volverAlMenu() {
    document.getElementById('stage-select-screen').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
}

function cargarMinijuego(nombreNivel) {
    document.getElementById('stage-select-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';

    const music = document.getElementById('menu-music');
    if (music) music.pause();

    if (nombreNivel === 'escalera') {
        iniciarNivelEscalera();
    } else if (nombreNivel === 'kara') {
        iniciarMiniKara();
    }
}

function startGame(gameType) {
    if (gameType === 'story') {
        alert("Una historia increíble en el campus de UANE está por comenzar...");
    }
}

function openSettings() {
    alert("Panel de Opciones de Audio y Gráficos");
}

// ==========================================
// 3. MINIJUEGO 1: ESCALERA INFINITA (EDIFICIO)
// ==========================================
function iniciarNivelEscalera() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');

    canvas.width = 400;
    canvas.height = 700;

    const assets = {
        fondo: new Image(),
        jugador: new Image(),
        obstaculo: new Image()
    };

    assets.fondo.src = 'campus_background.png';
    assets.jugador.src = 'boy_left.png.png';
    assets.obstaculo.src = 'chalkboard_text.png.png';

    const carriles = [80, 200, 320];
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

        velocidad += 0.0015;
        fondoY += velocidad;
        if (fondoY >= canvas.height) fondoY = 0;

        jugador.x += (carriles[carrilActual] - 35 - jugador.x) * 0.25;

        if (Math.random() < 0.022) {
            if (obstaculos.length === 0 || obstaculos[obstaculos.length - 1].y > 220) {
                crearObstaculo();
            }
        }

        for (let i = 0; i < obstaculos.length; i++) {
            let obs = obstaculos[i];
            obs.y += velocidad;

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

        if (assets.fondo.complete && assets.fondo.naturalWidth !== 0) {
            ctx.drawImage(assets.fondo, 0, fondoY - canvas.height, canvas.width, canvas.height);
            ctx.drawImage(assets.fondo, 0, fondoY, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "#2c3e50";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        if (assets.jugador.complete && assets.jugador.naturalWidth !== 0) {
            ctx.drawImage(assets.jugador, jugador.x, jugador.y, jugador.ancho, jugador.alto);
        } else {
            ctx.fillStyle = "#2ecc71";
            ctx.fillRect(jugador.x, jugador.y, jugador.ancho, jugador.alto);
        }

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

    document.getElementById('btn-left').onclick = () => { if (carrilActual > 0) carrilActual--; };
    document.getElementById('btn-right').onclick = () => { if (carrilActual < 2) carrilActual++; };

    window.onkeydown = (e) => {
        if (e.key === 'ArrowLeft' && carrilActual > 0) carrilActual--;
        if (e.key === 'ArrowRight' && carrilActual < 2) carrilActual++;
    };

    loop();
}

// ==========================================
// 4. MINIJUEGO 2: MINI KARA MUÑECA (CARRETERA 3D)
// ==========================================
function iniciarMiniKara() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');

    canvas.width = 400;
    canvas.height = 700;

    let puntaje = 0;
    let velocidad = 5;
    let juegoActivo = true;
    let desplazamientoCarretera = 0;

    const carriles = [100, 200, 300];
    let carrilActual = 1;

    const jugador = { x: carriles[carrilActual], y: 550, ancho: 70, alto: 70 };
    let obstaculos = [];

    const assetsKara = {
        auto: new Image(),
        obstaculo: new Image()
    };
    assetsKara.auto.src = 'boy_left.png.png';
    assetsKara.obstaculo.src = 'chalkboard_text.png.png';

    function crearObstaculoCarretera() {
        const carrilAleatorio = Math.floor(Math.random() * 3);
        obstaculos.push({
            carril: carrilAleatorio,
            y: 180,
            escala: 0.2
        });
    }

    function actualizar() {
        if (!juegoActivo) return;

        velocidad += 0.001;
        desplazamientoCarretera = (desplazamientoCarretera + velocidad) % 40;

        jugador.x += (carriles[carrilActual] - 35 - jugador.x) * 0.2;

        if (Math.random() < 0.02) {
            if (obstaculos.length === 0 || obstaculos[obstaculos.length - 1].y > 300) {
                crearObstaculoCarretera();
            }
        }

        for (let i = 0; i < obstaculos.length; i++) {
            let obs = obstaculos[i];
            obs.y += velocidad;
            obs.escala = obs.y / 550;

            if (obs.y > 500 && obs.y < 600 && obs.carril === carrilActual) {
                juegoActivo = false;
                alert(`¡Choque en la carretera! Puntaje: ${Math.floor(puntaje)}`);
                document.location.reload();
            }

            if (obs.y > canvas.height) {
                obstaculos.splice(i, 1);
                i--;
                puntaje += 15;
                scoreEl.innerText = Math.floor(puntaje);
            }
        }
    }

    function dibujarPerspectiva() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Cielo
        ctx.fillStyle = "#1e272e";
        ctx.fillRect(0, 0, canvas.width, 180);

        // Pasto
        ctx.fillStyle = "#2ed573";
        ctx.fillRect(0, 180, canvas.width, canvas.height - 180);

        // Carretera en trapecio
        ctx.fillStyle = "#57606f";
        ctx.beginPath();
        ctx.moveTo(150, 180);
        ctx.lineTo(250, 180);
        ctx.lineTo(380, 700);
        ctx.lineTo(20, 700);
        ctx.closePath();
        ctx.fill();

        // Líneas animadas
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 4;
        ctx.setLineDash([20, 20]);
        ctx.lineDashOffset = -desplazamientoCarretera;

        ctx.beginPath();
        ctx.moveTo(183, 180); ctx.lineTo(140, 700);
        ctx.moveTo(216, 180); ctx.lineTo(260, 700);
        ctx.stroke();
        ctx.setLineDash([]);

        // Obstáculos
        for (let obs of obstaculos) {
            let posX = 200 + (carriles[obs.carril] - 200) * obs.escala - (30 * obs.escala);
            let tamano = 60 * obs.escala;

            if (assetsKara.obstaculo.complete && assetsKara.obstaculo.naturalWidth !== 0) {
                ctx.drawImage(assetsKara.obstaculo, posX, obs.y, tamano, tamano);
            } else {
                ctx.fillStyle = "#ff4757";
                ctx.fillRect(posX, obs.y, tamano, tamano);
            }
        }

        // Jugador
        if (assetsKara.auto.complete && assetsKara.auto.naturalWidth !== 0) {
            ctx.drawImage(assetsKara.auto, jugador.x, jugador.y, jugador.ancho, jugador.alto);
        } else {
            ctx.fillStyle = "#ffa502";
            ctx.fillRect(jugador.x, jugador.y, jugador.ancho, jugador.alto);
        }
    }

    function loop() {
        actualizar();
        dibujarPerspectiva();
        if (juegoActivo) requestAnimationFrame(loop);
    }

    document.getElementById('btn-left').onclick = () => { if (carrilActual > 0) carrilActual--; };
    document.getElementById('btn-right').onclick = () => { if (carrilActual < 2) carrilActual--; };

    window.onkeydown = (e) => {
        if (e.key === 'ArrowLeft' && carrilActual > 0) carrilActual--;
        if (e.key === 'ArrowRight' && carrilActual < 2) carrilActual++;
    };

    loop();
}
