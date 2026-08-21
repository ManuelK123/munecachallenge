// ==========================================
// 1. CONFIGURACIÓN DE AUDIO AUTOPLAY
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    const music = document.getElementById('menu-music');
    if (music) {
        music.volume = 0.4;
        // Intenta reproducir de inmediato al cargar la página
        music.play().catch(error => {
            console.log("Autoplay bloqueado por el navegador, esperando interacción:", error);
        });
    }
});

// Desmutea y asegura el audio con cualquier toque o clic en la pantalla
const habilitarAudio = () => {
    const music = document.getElementById('menu-music');
    if (music) {
        music.muted = false;
        if (music.paused) {
            music.play();
        }
    }
    // Remueve los eventos una vez que el audio está activo
    window.removeEventListener('click', habilitarAudio);
    window.removeEventListener('touchstart', habilitarAudio);
    window.removeEventListener('keydown', habilitarAudio);
};

window.addEventListener('click', habilitarAudio);
window.addEventListener('touchstart', habilitarAudio);
window.addEventListener('keydown', habilitarAudio);

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
// 3. MINIJUEGO 1: ESCALERA CARACOL (3 CARRILES + SALTO)
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

    // Cargar assets
    const bgImg = new Image();
    bgImg.src = 'escenario_escalera.png';

    const obsImgs = [new Image(), new Image(), new Image()];
    obsImgs[0].src = 'obs_cuaderno.png';
    obsImgs[1].src = 'obs_mochila.png';
    obsImgs[2].src = 'obs_lapiz.png';

    const petSprite = new Image();
    petSprite.src = 'boy_left.png.png'; // Cambiar por el sprite de la mascota

    // Configuración de 3 carriles sobre el ancho de la escalera
    const carrilesX = [130, 200, 270];
    let carrilActual = 1;

    // Estado del personaje
    const jugador = {
        x: carrilesX[carrilActual],
        yBase: 530,
        y: 530,
        ancho: 60,
        alto: 60,
        vy: 0,
        enSuelo: true,
        saltar: function() {
            if (this.enSuelo) {
                this.vy = -13;
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
            y: 180,
            escala: 0.3
        });
    }

    function actualizar() {
        if (!juegoActivo) return;

        velocidad += 0.0008;

        // Movimiento de salto y gravedad
        jugador.y += jugador.vy;
        jugador.vy += 0.7;

        if (jugador.y >= jugador.yBase) {
            jugador.y = jugador.yBase;
            jugador.vy = 0;
            jugador.enSuelo = true;
        }

        // Suavizar movimiento lateral entre carriles
        const objetivoX = carrilesX[carrilActual];
        jugador.x += (objetivoX - jugador.x) * 0.25;

        // Generar obstáculos periódicamente
        if (Math.random() < 0.02) {
            if (obstaculos.length === 0 || obstaculos[obstaculos.length - 1].y > 320) {
                crearObstaculo();
            }
        }

        // Mover y procesar obstáculos
        for (let i = 0; i < obstaculos.length; i++) {
            let obs = obstaculos[i];
            obs.y += velocidad;
            obs.escala = 0.3 + (obs.y / 700) * 0.7; // Efecto de profundidad

            const posX = carrilesX[obs.carril];

            // Detección de colisión: misma columna y altura, considerando si está en el suelo
            if (obs.y > 490 && obs.y < 560 && obs.carril === carrilActual && jugador.y > 480) {
                juegoActivo = false;
                alert(`¡Perdiste! Chocaste con un obstáculo. Puntaje final: ${Math.floor(puntaje)}`);
                document.location.reload();
            }

            // Eliminar obstáculo cuando sale de pantalla
            if (obs.y > canvas.height) {
                obstaculos.splice(i, 1);
                i--;
                puntaje += 10;
                scoreEl.innerText = Math.floor(puntaje);
            }
        }
    }

    function renderizar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Dibujar escenario de fondo
        if (bgImg.complete && bgImg.naturalWidth !== 0) {
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "#1e092b";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 2. Dibujar obstáculos (Cuaderno, Mochila, Lápiz)
        for (let obs of obstaculos) {
            const img = obsImgs[obs.tipo];
            const tamano = 50 * obs.escala;
            const posX = carrilesX[obs.carril] - tamano / 2;

            if (img.complete && img.naturalWidth !== 0) {
                ctx.drawImage(img, posX, obs.y, tamano, tamano);
            } else {
                ctx.fillStyle = "#e74c3c";
                ctx.fillRect(posX, obs.y, tamano, tamano);
            }
        }

        // 3. Dibujar personaje/mascota
        const posXJugador = jugador.x - jugador.ancho / 2;
        if (petSprite.complete && petSprite.naturalWidth !== 0) {
            ctx.drawImage(petSprite, posXJugador, jugador.y, jugador.ancho, jugador.alto);
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

    // Eventos de control táctil / botones
    document.getElementById('btn-left').onclick = () => { if (carrilActual > 0) carrilActual--; };
    document.getElementById('btn-right').onclick = () => { if (carrilActual < 2) carrilActual++; };
    document.getElementById('btn-jump').onclick = () => jugador.saltar();

    // Eventos de teclado
    window.onkeydown = (e) => {
        if (e.key === 'ArrowLeft' && carrilActual > 0) carrilActual--;
        if (e.key === 'ArrowRight' && carrilActual < 2) carrilActual++;
        if (e.key === ' ' || e.key === 'ArrowUp') jugador.saltar();
    };

    loop();
}

        // Generar obstáculos por la espiral
        if (Math.random() < 0.02) {
            if (obstaculos.length === 0 || obstaculos[obstaculos.length - 1].distancia > 150) {
                crearObstaculo();
            }
        }

        // Mover obstáculos siguiendo el arco de la escalera
        for (let i = 0; i < obstaculos.length; i++) {
            let obs = obstaculos[i];
            obs.distancia += 3.5;
            obs.angulo += 0.03;

            // Calcular posición XY en la espiral
            let radio = 60 + (obs.distancia * 0.4);
            let obsX = 200 + Math.cos(obs.angulo) * radio - 20;
            let obsY = 200 + Math.sin(obs.angulo) * (radio * 0.5) + (obs.distancia * 0.8);

            // Detección de colisión (si el perrito no está brincando)
            if (obsY > 450 && obsY < 510 && jugador.y > 440) {
                juegoActivo = false;
                alert(`¡Tropezaste en la escalera! Puntaje: ${Math.floor(puntaje)}`);
                document.location.reload();
            }

            if (obsY > canvas.height) {
                obstaculos.splice(i, 1);
                i--;
                puntaje += 10;
                scoreEl.innerText = Math.floor(puntaje);
            }
        }
    }

    function dibujarEscaleraCaracol() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Fondo Morado/Místico estilo UANE Adventures
        ctx.fillStyle = "#1e092b";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Dibujar escalones helicoidales (Espiral de la escalera)
        ctx.strokeStyle = "#8e44ad";
        ctx.lineWidth = 14;
        ctx.beginPath();

        for (let a = 0; a < Math.PI * 6; a += 0.1) {
            let r = 30 + (a * 15);
            let x = 200 + Math.cos(a + anguloEscalera) * r;
            let y = 100 + Math.sin(a + anguloEscalera) * (r * 0.4) + (a * 25);
            if (a === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Dibujar obstáculos sobre los escalones
        for (let obs of obstaculos) {
            let radio = 60 + (obs.distancia * 0.4);
            let obsX = 200 + Math.cos(obs.angulo) * radio - 20;
            let obsY = 200 + Math.sin(obs.angulo) * (radio * 0.5) + (obs.distancia * 0.8);

            if (obstaculoSprite.complete && obstaculoSprite.naturalWidth !== 0) {
                ctx.drawImage(obstaculoSprite, obsX, obsY, 40, 40);
            } else {
                ctx.fillStyle = "#e74c3c";
                ctx.fillRect(obsX, obsY, 35, 35);
            }
        }

        // Dibujar Mascota Brincando
        if (petSprite.complete && petSprite.naturalWidth !== 0) {
            ctx.drawImage(petSprite, jugador.x, jugador.y, jugador.ancho, jugador.alto);
        } else {
            ctx.fillStyle = "#f1c40f";
            ctx.fillRect(jugador.x, jugador.y, jugador.ancho, jugador.alto);
        }
    }

    function loop() {
        actualizar();
        dibujarEscaleraCaracol();
        if (juegoActivo) requestAnimationFrame(loop);
    }

    // Controles
    document.getElementById('btn-jump').onclick = () => jugador.saltar();
    window.onkeydown = (e) => {
        if (e.key === ' ' || e.key === 'ArrowUp') jugador.saltar();
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

        ctx.fillStyle = "#1e272e";
        ctx.fillRect(0, 0, canvas.width, 180);

        ctx.fillStyle = "#2ed573";
        ctx.fillRect(0, 180, canvas.width, canvas.height - 180);

        ctx.fillStyle = "#57606f";
        ctx.beginPath();
        ctx.moveTo(150, 180);
        ctx.lineTo(250, 180);
        ctx.lineTo(380, 700);
        ctx.lineTo(20, 700);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 4;
        ctx.setLineDash([20, 20]);
        ctx.lineDashOffset = -desplazamientoCarretera;

        ctx.beginPath();
        ctx.moveTo(183, 180); ctx.lineTo(140, 700);
        ctx.moveTo(216, 180); ctx.lineTo(260, 700);
        ctx.stroke();
        ctx.setLineDash([]);

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
    document.getElementById('btn-right').onclick = () => { if (carrilActual < 2) carrilActual++; };

    window.onkeydown = (e) => {
        if (e.key === 'ArrowLeft' && carrilActual > 0) carrilActual--;
        if (e.key === 'ArrowRight' && carrilActual < 2) carrilActual++;
    };

    loop();
}
