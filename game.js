// ==========================================
// 1. CONFIGURACIÓN DE AUDIO POR INTERACCIÓN
// ==========================================
let audioIniciado = false;

const activarMusicaMenu = () => {
    if (audioIniciado) return;
    
    const music = document.getElementById('menu-music');
    if (music) {
        music.volume = 0.4;
        music.muted = false;
        music.play().then(() => {
            audioIniciado = true;
            console.log("Música del menú iniciada correctamente.");
        }).catch(error => {
            console.log("Error al reproducir audio:", error);
        });
    }

    // Remover los escuchas una vez que ya arrancó la música
    window.removeEventListener('click', activarMusicaMenu);
    window.removeEventListener('touchstart', activarMusicaMenu);
    window.removeEventListener('keydown', activarMusicaMenu);
};

// Escuchar cualquier toque, clic o tecla en todo el menú principal para arrancar el audio
window.addEventListener('click', activarMusicaMenu);
window.addEventListener('touchstart', activarMusicaMenu);
window.addEventListener('keydown', activarMusicaMenu);

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
    if (gameType === 'story') alert("Una historia increíble en el campus de UANE está por comenzar...");
}

function openSettings() {
    alert("Panel de Opciones de Audio y Gráficos");
}

// ==========================================
// 3. MINIJUEGO 1: ESCALERA CARACOL (SPRITE SHEET + OBSTÁCULOS GRANDES)
// ==========================================
function iniciarNivelEscalera() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');

    canvas.width = 400;
    canvas.height = 700;

    let puntaje = 0;
    let juegoActivo = true;
    let velocidad = 4;
    let bgOffsetY = 0; // Efecto de movimiento de la escalera

    // Cargar fondo y assets de obstáculos
    const bgImg = new Image();
    bgImg.src = 'escenario_escalera.png';

    const obsImgs = [new Image(), new Image(), new Image()];
    obsImgs[0].src = 'obs_cuaderno.png'; // Cuaderno
    obsImgs[1].src = 'obs_mochila.png'; // Mochila
    obsImgs[2].src = 'obs_lapiz.png';   // Lápiz

    // Cargar Sprite Sheet del Perrito (actualizado a tobias.jpg)
    const petSheet = new Image();
    petSheet.src = 'tobias.jpg';

    const carrilesX = [120, 200, 280];
    let carrilActual = 1;

    const jugador = {
        x: carrilesX[carrilActual],
        yBase: 520,
        y: 520,
        ancho: 80,
        alto: 80,
        vy: 0,
        enSuelo: true,
        frameX: 0,
        animCounter: 0,
        saltar: function() {
            if (this.enSuelo) {
                this.vy = -14;
                this.enSuelo = false;
            }
        }
    };

    let obstaculos = [];

    function crearObstaculo() {
        const carrilAleatorio = Math.floor(Math.random() * 3);
        const tipoAleatorio = Math.floor(Math.random() * 3);
        
        obstaculos.push({
            carril: carrilAleatorio,
            tipo: tipoAleatorio,
            y: 150,
            escala: 0.2 // Comienzan pequeños en el fondo y crecen al caer
        });
    }

    function actualizar() {
        if (!juegoActivo) return;

        velocidad += 0.001;
        bgOffsetY = (bgOffsetY + velocidad * 2) % canvas.height; // Movimiento dinámico de la escalera

        // Gravedad y salto
        jugador.y += jugador.vy;
        jugador.vy += 0.75;

        if (jugador.y >= jugador.yBase) {
            jugador.y = jugador.yBase;
            jugador.vy = 0;
            jugador.enSuelo = true;
        }

        // Suavizar movimiento horizontal
        const objetivoX = carrilesX[carrilActual];
        if (Math.abs(jugador.x - objetivoX) > 1) {
            jugador.x += (objetivoX - jugador.x) * 0.3;
            // Animar frames de caminata (Fila 0 del sprite sheet: 4 columnas)
            jugador.animCounter++;
            if (jugador.animCounter % 6 === 0) {
                jugador.frameX = (jugador.frameX + 1) % 4;
            }
        } else {
            // Frame en reposo / sentado (Fila 1 del sprite sheet)
            jugador.frameX = 0; 
        }

        // Generar obstáculos
        if (Math.random() < 0.025) {
            if (obstaculos.length === 0 || obstaculos[obstaculos.length - 1].y > 280) {
                crearObstaculo();
            }
        }

        // Actualizar posición de obstáculos
        for (let i = 0; i < obstaculos.length; i++) {
            let obs = obstaculos[i];
            obs.y += velocidad * 1.5;
            obs.escala = 0.2 + (obs.y / 600) * 1.2; // Crecimiento masivo conforme se acercan

            // Detección de colisión (si están cerca del jugador y este no brincó lo suficiente)
            if (obs.y > 470 && obs.y < 550 && obs.carril === carrilActual && jugador.y > 460) {
                juegoActivo = false;
                alert(`¡Oh no! Te tropezaste con el material escolar. Puntaje: ${Math.floor(puntaje)}`);
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

    function renderizar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Dibujar Fondo de Escalera con efecto de desplazamiento vertical continuo
        if (bgImg.complete && bgImg.naturalWidth !== 0) {
            ctx.drawImage(bgImg, 0, bgOffsetY - canvas.height, canvas.width, canvas.height);
            ctx.drawImage(bgImg, 0, bgOffsetY, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "#1e092b";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 2. Dibujar Obstáculos Grandes (Cuaderno, Mochila, Lápiz)
        for (let obs of obstaculos) {
            const img = obsImgs[obs.tipo];
            const baseSize = 90; // Tamaño base grande
            const tamanoActual = baseSize * obs.escala;
            const posX = carrilesX[obs.carril] - tamanoActual / 2;

            if (img.complete && img.naturalWidth !== 0) {
                ctx.drawImage(img, posX, obs.y, tamanoActual, tamanoActual);
            } else {
                ctx.fillStyle = "#ff3838";
                ctx.fillRect(posX, obs.y, tamanoActual, tamanoActual);
            }
        }

        // 3. Dibujar Perrito desde el Sprite Sheet (`tobias.jpg`)
        const posXJugador = jugador.x - jugador.ancho / 2;
        if (petSheet.complete && petSheet.naturalWidth !== 0) {
            const sheetW = petSheet.width / 4;
            const sheetH = petSheet.height / 3;
            
            let filaSprite = 0; // Fila superior para caminar
            if (!jugador.enSuelo) {
                filaSprite = 0; // Frame de salto
            } else if (Math.abs(jugador.x - carrilesX[carrilActual]) < 1) {
                filaSprite = 1; // Fila central para estar sentado/reposo
            }

            ctx.drawImage(
                petSheet,
                jugador.frameX * sheetW, filaSprite * sheetH, sheetW, sheetH,
                posXJugador, jugador.y, jugador.ancho, jugador.alto
            );
        } else {
            ctx.fillStyle = "#f1c40f";
            ctx.fillRect(posXJugador, jugador.y, jugador.ancho, jugador.alto);
        }
    }

    function loop() {
        actualizar();
        renderizar();
        if (juegoActivo) requestAnimationFrame(loop);
    }

    // Controles táctiles
    document.getElementById('btn-left').onclick = () => { if (carrilActual > 0) carrilActual--; };
    document.getElementById('btn-right').onclick = () => { if (carrilActual < 2) carrilActual++; };
    document.getElementById('btn-jump').onclick = () => jugador.saltar();

    // Controles de teclado
    window.onkeydown = (e) => {
        if (e.key === 'ArrowLeft' && carrilActual > 0) carrilActual--;
        if (e.key === 'ArrowRight' && carrilActual < 2) carrilActual++;
        if (e.key === ' ' || e.key === 'ArrowUp') jugador.saltar();
    };

    loop();
}

// ==========================================
// 4. MINIJUEGO 2: MINI KARA MUÑECA (CARRETERA)
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
        obstaculos.push({ carril: carrilAleatorio, y: 180, escala: 0.2 });
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
        ctx.fillStyle = "#1e272e"; ctx.fillRect(0, 0, canvas.width, 180);
        ctx.fillStyle = "#2ed573"; ctx.fillRect(0, 180, canvas.width, canvas.height - 180);

        ctx.fillStyle = "#57606f";
        ctx.beginPath();
        ctx.moveTo(150, 180); ctx.lineTo(250, 180); ctx.lineTo(380, 700); ctx.lineTo(20, 700);
        ctx.closePath(); ctx.fill();

        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 4; ctx.setLineDash([20, 20]);
        ctx.lineDashOffset = -desplazamientoCarretera;
        ctx.beginPath();
        ctx.moveTo(183, 180); ctx.lineTo(140, 700);
        ctx.moveTo(216, 180); ctx.lineTo(260, 700);
        ctx.stroke(); ctx.setLineDash([]);

        for (let obs of obstaculos) {
            let posX = 200 + (carriles[obs.carril] - 200) * obs.escala - (30 * obs.escala);
            let tamano = 60 * obs.escala;
            if (assetsKara.obstaculo.complete && assetsKara.obstaculo.naturalWidth !== 0) {
                ctx.drawImage(assetsKara.obstaculo, posX, obs.y, tamano, tamano);
            } else {
                ctx.fillStyle = "#ff4757"; ctx.fillRect(posX, obs.y, tamano, tamano);
            }
        }

        if (assetsKara.auto.complete && assetsKara.auto.naturalWidth !== 0) {
            ctx.drawImage(assetsKara.auto, jugador.x, jugador.y, jugador.ancho, jugador.alto);
        } else {
            ctx.fillStyle = "#ffa502"; ctx.fillRect(jugador.x, jugador.y, jugador.ancho, jugador.alto);
        }
    }

    function loop() {
        actualizar();
        dibujarPerspectiva();
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
