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

    window.removeEventListener('click', activarMusicaMenu);
    window.removeEventListener('touchstart', activarMusicaMenu);
    window.removeEventListener('keydown', activarMusicaMenu);
};

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
    } else if (nombreNivel === 'clases') {
        iniciarMinijuegoClases();
    }
}

function startGame(gameType) {
    if (gameType === 'story') alert("Una historia increíble en el campus de UANE está por comenzar...");
}

function openSettings() {
    alert("Panel de Opciones de Audio y Gráficos");
}

// ==========================================
// 3. MINIJUEGO 1: ESCALERA CARACOL
// ==========================================
function iniciarNivelEscalera() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 400;
    canvas.height = 700;

    let puntaje = 0;
    let juegoActivo = true;
    let velocidad = 2.0;
    let bgOffsetY = 0;

    let vidas = 10;
    let tiempoInvulnerable = 0;

    let uiContainer = document.getElementById('ui');
    uiContainer.innerHTML = `
        <div style="font-size: 14px;">Puntaje: <span id="score">0</span></div>
        <div id="hearts-container" style="font-size: 16px; letter-spacing: 1px; color: #ff3366;">❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️</div>
    `;
    const scoreSpan = document.getElementById('score');
    const heartsContainer = document.getElementById('hearts-container');

    function actualizarCorazonesUI() {
        let textoCorazones = "";
        for (let i = 0; i < vidas; i++) {
            textoCorazones += "❤️";
        }
        heartsContainer.innerText = textoCorazones;
    }

    const bgImg = new Image();
    bgImg.src = 'escenario_escalera.png';

    const obsImgs = [new Image(), new Image(), new Image()];
    obsImgs[0].src = 'obs_cuaderno.png';
    obsImgs[1].src = 'obs_mochila.png';
    obsImgs[2].src = 'obs_lapiz.png';

    const petSheet = new Image();
    petSheet.src = 'tobias.png';

    const carrilesX = [120, 200, 280];
    let carrilActual = 1;

    const jugador = {
        x: carrilesX[carrilActual],
        yBase: 440,
        y: 440,
        ancho: 160,
        alto: 160,
        vy: 0,
        enSuelo: true,
        frameX: 0,
        animCounter: 0,
        saltar: function() {
            if (this.enSuelo) {
                this.vy = -12;
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
            escala: 0.2,
            golpeado: false
        });
    }

    function actualizar() {
        if (!juegoActivo) return;

        velocidad += 0.0003;
        bgOffsetY = (bgOffsetY + velocidad * 1.5) % canvas.height;

        if (tiempoInvulnerable > 0) tiempoInvulnerable--;

        jugador.y += jugador.vy;
        jugador.vy += 0.6;

        if (jugador.y >= jugador.yBase) {
            jugador.y = jugador.yBase;
            jugador.vy = 0;
            jugador.enSuelo = true;
        }

        const objetivoX = carrilesX[carrilActual];
        if (Math.abs(jugador.x - objetivoX) > 1) {
            jugador.x += (objetivoX - jugador.x) * 0.3;
            jugador.animCounter++;
            if (jugador.animCounter % 8 === 0) {
                jugador.frameX = (jugador.frameX + 1) % 4;
            }
        } else {
            jugador.frameX = 0; 
        }

        if (Math.random() < 0.02) {
            if (obstaculos.length === 0 || obstaculos[obstaculos.length - 1].y > 320) {
                crearObstaculo();
            }
        }

        for (let i = 0; i < obstaculos.length; i++) {
            let obs = obstaculos[i];
            obs.y += velocidad * 1.2;
            obs.escala = 0.2 + (obs.y / 600) * 1.1;

            if (!obs.golpeado && obs.y > 400 && obs.y < 500 && obs.carril === carrilActual && jugador.y > 380) {
                if (tiempoInvulnerable === 0) {
                    vidas--;
                    obs.golpeado = true;
                    actualizarCorazonesUI();
                    tiempoInvulnerable = 45;

                    if (vidas <= 0) {
                        juegoActivo = false;
                        alert(`¡Te quedaste sin corazones! Game Over. Puntaje final: ${Math.floor(puntaje)}`);
                        document.location.reload();
                        return;
                    }
                }
            }

            if (obs.y > canvas.height) {
                obstaculos.splice(i, 1);
                i--;
                puntaje += 10;
                if (scoreSpan) scoreSpan.innerText = Math.floor(puntaje);
            }
        }
    }

    function renderizar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (bgImg.complete && bgImg.naturalWidth !== 0) {
            ctx.drawImage(bgImg, 0, bgOffsetY - canvas.height, canvas.width, canvas.height);
            ctx.drawImage(bgImg, 0, bgOffsetY, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "#1e092b";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        for (let obs of obstaculos) {
            const img = obsImgs[obs.tipo];
            const baseSize = 90;
            const tamanoActual = baseSize * obs.escala;
            const posX = carrilesX[obs.carril] - tamanoActual / 2;

            if (img.complete && img.naturalWidth !== 0) {
                ctx.drawImage(img, posX, obs.y, tamanoActual, tamanoActual);
            } else {
                ctx.fillStyle = "#ff3838";
                ctx.fillRect(posX, obs.y, tamanoActual, tamanoActual);
            }
        }

        const posXJugador = jugador.x - jugador.ancho / 2;
        
        if (tiempoInvulnerable === 0 || Math.floor(tiempoInvulnerable / 4) % 2 === 0) {
            if (petSheet.complete && petSheet.naturalWidth !== 0) {
                const sheetW = petSheet.width / 4;
                const sheetH = petSheet.height / 3;
                
                let filaSprite = 0;
                if (!jugador.enSuelo) filaSprite = 0;
                else if (Math.abs(jugador.x - carrilesX[carrilActual]) < 1) filaSprite = 1;

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
    }

    function loop() {
        actualizar();
        renderizar();
        if (juegoActivo) requestAnimationFrame(loop);
    }

    document.getElementById('btn-left').onclick = () => { if (carrilActual > 0) carrilActual--; };
    document.getElementById('btn-right').onclick = () => { if (carrilActual < 2) carrilActual++; };
    document.getElementById('btn-jump').onclick = () => jugador.saltar();

    window.onkeydown = (e) => {
        if (e.key === 'ArrowLeft' && carrilActual > 0) carrilActual--;
        if (e.key === 'ArrowRight' && carrilActual < 2) carrilActual++;
        if (e.key === ' ' || e.key === 'ArrowUp') jugador.saltar();
    };

    loop();
}

// ==========================================
// 4. MINIJUEGO 2: MINI KARA (CARRETERA)
// ==========================================
function iniciarMiniKara() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');

    canvas.width = 400;
    canvas.height = 700;

    let puntaje = 0;
    let velocidad = 4;
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
        velocidad += 0.0008;
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

// ==========================================
// 5. MINIJUEGO 3: CLASE DE MEMORIA (CLEFAIRY SAYS)
// ==========================================
function iniciarMinijuegoClases() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 400;
    canvas.height = 700;

    let vidas = 10;
    let ronda = 1;
    let secuencia = [];
    let entradaJugador = [];
    let estadoJuego = 'MOSTRAR'; // 'MOSTRAR', 'ESPERAR', 'CORRECTO', 'INCORRECTO'
    let indiceFlechaActual = 0;
    let temporizadorMostrar = 0;
    let mensajePantalla = "¡Atención a la maestra!";

    let uiContainer = document.getElementById('ui');
    uiContainer.innerHTML = `
        <div style="font-size: 13px;">Ronda: <span id="round-num">1</span></div>
        <div id="hearts-container" style="font-size: 15px; letter-spacing: 1px; color: #ff3366;">❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️</div>
    `;
    const roundNumEl = document.getElementById('round-num');
    const heartsContainer = document.getElementById('hearts-container');

    function actualizarCorazonesUI() {
        let textoCorazones = "";
        for (let i = 0; i < vidas; i++) {
            textoCorazones += "❤️";
        }
        heartsContainer.innerText = textoCorazones;
    }

    const flechasDirecciones = ['ARRIBA', 'ABAJO', 'IZQUIERDA', 'DERECHA'];

    function generarNuevaRonda() {
        entradaJugador = [];
        const nuevaFlecha = flechasDirecciones[Math.floor(Math.random() * flechasDirecciones.length)];
        secuencia.push(nuevaFlecha);
        
        indiceFlechaActual = 0;
        estadoJuego = 'MOSTRAR';
        temporizadorMostrar = 0;
        mensajePantalla = "¡Memoriza la secuencia!";
    }

    generarNuevaRonda();

    function actualizar() {
        if (estadoJuego === 'MOSTRAR') {
            temporizadorMostrar++;
            if (temporizadorMostrar > 45) {
                temporizadorMostrar = 0;
                indiceFlechaActual++;
                if (indiceFlechaActual >= secuencia.length) {
                    estadoJuego = 'ESPERAR';
                    indiceFlechaActual = 0;
                    mensajePantalla = "¡Tu turno! Repite las flechas";
                }
            }
        }
    }

    function renderizar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Fondo del Salón
        ctx.fillStyle = "#f5f6fa";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Pizarrón verde
        ctx.fillStyle = "#273c75";
        ctx.fillRect(30, 80, 340, 160);
        ctx.strokeStyle = "#40739e";
        ctx.lineWidth = 6;
        ctx.strokeRect(30, 80, 340, 160);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 15px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(mensajePantalla, canvas.width / 2, 115);

        if (estadoJuego === 'MOSTRAR') {
            let flechaTexto = "";
            for (let i = 0; i <= indiceFlechaActual && i < secuencia.length; i++) {
                let f = secuencia[i];
                if (f === 'ARRIBA') flechaTexto += " ⬆️ ";
                if (f === 'ABAJO') flechaTexto += " ⬇️ ";
                if (f === 'IZQUIERDA') flechaTexto += " ⬅️ ";
                if (f === 'DERECHA') flechaTexto += " ➡️ ";
            }
            ctx.font = "22px sans-serif";
            ctx.fillText(flechaTexto, canvas.width / 2, 170);
        } else if (estadoJuego === 'ESPERAR') {
            ctx.font = "13px sans-serif";
            ctx.fillStyle = "#e84118";
            ctx.fillText(`Progreso: ${entradaJugador.length} / ${secuencia.length}`, canvas.width / 2, 160);
            
            let inputTexto = "";
            for (let f of entradaJugador) {
                if (f === 'ARRIBA') inputTexto += "⬆️";
                if (f === 'ABAJO') inputTexto += "⬇️";
                if (f === 'IZQUIERDA') inputTexto += "⬅️";
                if (f === 'DERECHA') inputTexto += "➡️";
            }
            ctx.font = "18px sans-serif";
            ctx.fillStyle = "#00a8ff";
            ctx.fillText(inputTexto, canvas.width / 2, 195);
        }

        // Escritorio de la profesora
        ctx.fillStyle = "#875530";
        ctx.fillRect(100, 280, 200, 80);
        
        // Maestra de lentes grandes
        ctx.fillStyle = "#ffcccc";
        ctx.beginPath();
        ctx.arc(200, 260, 40, 0, Math.PI * 2);
        ctx.fill();

        // Lentes rojos grandes característicos
        ctx.strokeStyle = "#e84118";
        ctx.lineWidth = 4;
        ctx.strokeRect(175, 245, 22, 15);
        ctx.strokeRect(203, 245, 22, 15);

        ctx.fillStyle = "#2f3640";
        ctx.font = "13px sans-serif";
        ctx.fillText("Usa las flechas del teclado o botones", canvas.width / 2, 420);
    }

    function procesarEntrada(direccion) {
        if (estadoJuego !== 'ESPERAR') return;

        entradaJugador.push(direccion);
        let indiceActual = entradaJugador.length - 1;

        if (entradaJugador[indiceActual] !== secuencia[indiceActual]) {
            vidas--;
            actualizarCorazonesUI();
            mensajePantalla = "¡Error! Te equivocaste ❌";
            estadoJuego = 'INCORRECTO';

            if (vidas <= 0) {
                alert(`¡Te quedaste sin corazones en la clase! Game Over. Llegaste a la ronda ${ronda}`);
                document.location.reload();
                return;
            }

            setTimeout(() => {
                entradaJugador = [];
                indiceFlechaActual = 0;
                estadoJuego = 'MOSTRAR';
                temporizadorMostrar = 0;
                mensajePantalla = "Repitiendo secuencia...";
            }, 1200);
            return;
        }

        if (entradaJugador.length === secuencia.length) {
            mensajePantalla = "¡Excelente! Ronda superada 🎉";
            estadoJuego = 'CORRECTO';
            ronda++;
            if (roundNumEl) roundNumEl.innerText = ronda;

            setTimeout(() => {
                generarNuevaRonda();
            }, 1500);
        }
    }

    // Controles por botones táctiles en pantalla (reasignados para las 4 direcciones del minijuego de memoria)
    document.getElementById('btn-left').onclick = () => procesarEntrada('IZQUIERDA');
    document.getElementById('btn-right').onclick = () => procesarEntrada('DERECHA');
    document.getElementById('btn-jump').onclick = () => procesarEntrada('ARRIBA');

    window.onkeydown = (e) => {
        if (e.key === 'ArrowUp') procesarEntrada('ARRIBA');
        if (e.key === 'ArrowDown') procesarEntrada('ABAJO');
        if (e.key === 'ArrowLeft') procesarEntrada('IZQUIERDA');
        if (e.key === 'ArrowRight') procesarEntrada('DERECHA');
    };

    function loop() {
        actualizar();
        renderizar();
        requestAnimationFrame(loop);
    }

    loop();
}
