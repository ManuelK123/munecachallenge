// ==========================================
// 1. GESTIÓN DE MENÚS Y NAVEGACIÓN
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
    } else if (nombreNivel === 'cascada') {
        iniciarMinijuegoCascada();
    } else if (nombreNivel === 'nivel6') {
        iniciarNivel6Cascada();
    }
}

function startGame(gameType) {
    if (gameType === 'story') alert("Modo historia en desarrollo...");
}

function abrirSeccionPago() {
    window.location.href = "pago.html";
}

// ==========================================
// 2. MINIJUEGO 1: ESCALERA CARACOL
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
        <div id="hearts-container" style="font-size: 15px; letter-spacing: 1px; color: #ff3366;">❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️</div>
    `;
    const scoreSpan = document.getElementById('score');
    const heartsContainer = document.getElementById('hearts-container');

    function actualizarCorazonesUI() {
        let textoCorazones = "";
        for (let i = 0; i < vidas; i++) textoCorazones += "❤️";
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
        obstaculos.push({ carril: carrilAleatorio, tipo: tipoAleatorio, y: 150, escala: 0.2, golpeado: false });
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
            if (jugador.animCounter % 8 === 0) jugador.frameX = (jugador.frameX + 1) % 4;
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
                        alert(`¡Game Over! Puntaje final: ${Math.floor(puntaje)}`);
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
            const tamanoActual = 90 * obs.escala;
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
                let filaSprite = !jugador.enSuelo ? 0 : (Math.abs(jugador.x - carrilesX[carrilActual]) < 1 ? 1 : 0);

                ctx.drawImage(petSheet, jugador.frameX * sheetW, filaSprite * sheetH, sheetW, sheetH, posXJugador, jugador.y, jugador.ancho, jugador.alto);
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
// 3. MINIJUEGO 2: MINI KARA (CARRETERA)
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
                alert(`¡Choque! Puntaje: ${Math.floor(puntaje)}`);
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
// 4. MINIJUEGO 3: CLASE DE MEMORIA
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
    let estadoJuego = 'MOSTRAR'; 
    let indiceFlechaActual = 0;
    let temporizadorMostrar = 0;
    let mensajePantalla = "¡Atención a la clase!";

    let uiContainer = document.getElementById('ui');
    uiContainer.innerHTML = `
        <div style="font-size: 13px;">Ronda: <span id="round-num">1</span></div>
        <div id="hearts-container" style="font-size: 15px; letter-spacing: 1px; color: #ff3366;">❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️</div>
    `;
    const roundNumEl = document.getElementById('round-num');
    const heartsContainer = document.getElementById('hearts-container');

    function actualizarCorazonesUI() {
        let textoCorazones = "";
        for (let i = 0; i < vidas; i++) textoCorazones += "❤️";
        heartsContainer.innerText = textoCorazones;
    }

    const flechasDirecciones = ['ARRIBA', 'ABAJO', 'IZQUIERDA', 'DERECHA'];

    const bgSalongImg = new Image();
    bgSalongImg.src = 'escritoriio.png';

    const dinoProfImg = new Image();
    dinoProfImg.src = 'dino_prof1.png';

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

        if (bgSalongImg.complete && bgSalongImg.naturalWidth !== 0) {
            ctx.drawImage(bgSalongImg, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "#1e092b";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 15px sans-serif";
        ctx.textAlign = "center";
        ctx.shadowColor = "#000000";
        ctx.shadowBlur = 4;
        ctx.fillText(mensajePantalla, canvas.width / 2, 185);

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
            ctx.fillText(flechaTexto, canvas.width / 2, 225);
        } else if (estadoJuego === 'ESPERAR') {
            ctx.font = "13px sans-serif";
            ctx.fillStyle = "#f1c40f";
            ctx.fillText(`Progreso: ${entradaJugador.length} / ${secuencia.length}`, canvas.width / 2, 210);
            
            let inputTexto = "";
            for (let f of entradaJugador) {
                if (f === 'ARRIBA') inputTexto += "⬆️";
                if (f === 'ABAJO') inputTexto += "⬇️";
                if (f === 'IZQUIERDA') inputTexto += "⬅️";
                if (f === 'DERECHA') inputTexto += "➡️";
            }
            ctx.font = "18px sans-serif";
            ctx.fillStyle = "#00e5ff";
            ctx.fillText(inputTexto, canvas.width / 2, 240);
        }
        
        ctx.shadowBlur = 0;

        if (dinoProfImg.complete && dinoProfImg.naturalWidth !== 0) {
            const anchoIndividual = dinoProfImg.width / 3;
            const altoIndividual = dinoProfImg.height;
            ctx.drawImage(dinoProfImg, 0, 0, anchoIndividual, altoIndividual, 120, 320, 160, 160);
        } else {
            ctx.fillStyle = "#2ecc71";
            ctx.beginPath();
            ctx.arc(200, 380, 40, 0, Math.PI * 2);
            ctx.fill();
        }
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
                alert(`¡Game Over en clase! Llegaste a la ronda ${ronda}`);
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

// ==========================================
// 5. MINIJUEGO 5: CASCADA DE BARRILES (ORIGINAL)
// ==========================================
function iniciarMinijuegoCascada() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 400;
    canvas.height = 700;

    let puntaje = 0;
    let juegoActivo = true;
    let vidas = 5;

    let uiContainer = document.getElementById('ui');
    uiContainer.innerHTML = `
        <div style="font-size: 13px;">Ascenso: <span id="score">0</span></div>
        <div id="hearts-container" style="font-size: 15px; letter-spacing: 1px; color: #ff3366;">❤❤❤❤❤</div>
    `;
    const scoreSpan = document.getElementById('score');
    const heartsContainer = document.getElementById('hearts-container');

    function actualizarCorazonesUI() {
        let textoCorazones = "";
        for (let i = 0; i < vidas; i++) textoCorazones += "❤️";
        heartsContainer.innerText = textoCorazones;
    }

    const bgCascada = new Image();
    bgCascada.src = 'cascada_fondo_1.png';

    const imgBarrilSprite = new Image();
    imgBarrilSprite.src = 'barril_sprite.png';

    const imgPlataforma = new Image();
    imgPlataforma.src = 'plataforma_larga.png';

    const imgPuente = new Image();
    imgPuente.src = 'puente_meta.png';

    const jugador = {
        x: 100,
        y: 600,
        ancho: 45,
        alto: 50,
        vx: 0,
        vy: 0,
        enSuelo: false
    };

    const plataformas = [
        { x: 0, y: 640, ancho: 400, alto: 60 },
        { x: 50, y: 500, ancho: 220, alto: 25 },
        { x: 130, y: 360, ancho: 220, alto: 25 },
        { x: 50, y: 220, ancho: 220, alto: 25 },
        { x: 200, y: 90, ancho: 160, alto: 30 }
    ];

    let barriles = [];

    function crearBarril() {
        barriles.push({
            x: Math.random() * 320 + 40,
            y: -40,
            radio: 18,
            velocidadY: Math.random() * 2 + 3
        });
    }

    let tiempoCreacion = 0;

    function actualizar() {
        if (!juegoActivo) return;

        jugador.x += jugador.vx;
        if (jugador.x < 0) jugador.x = 0;
        if (jugador.x + jugador.ancho > canvas.width) jugador.x = canvas.width - jugador.ancho;

        jugador.vy += 0.4;
        jugador.y += jugador.vy;
        jugador.enSuelo = false;

        for (let p of plataformas) {
            if (
                jugador.x + jugador.ancho > p.x &&
                jugador.x < p.x + p.ancho &&
                jugador.y + jugador.alto >= p.y &&
                jugador.y + jugador.alto <= p.y + p.vy + 5 &&
                jugador.vy >= 0
            ) {
                jugador.y = p.y - jugador.alto;
                jugador.vy = 0;
                jugador.enSuelo = true;
            }
        }

        tiempoCreacion++;
        if (tiempoCreacion > 70) {
            crearBarril();
            tiempoCreacion = 0;
        }

        for (let i = 0; i < barriles.length; i++) {
            let b = barriles[i];
            b.y += b.velocidadY;

            let distX = (jugador.x + jugador.ancho / 2) - b.x;
            let distY = (jugador.y + jugador.alto / 2) - b.y;
            let distancia = Math.sqrt(distX * distX + distY * distY);

            if (distancia < b.radio + 20) {
                vidas--;
                actualizarCorazonesUI();
                barriles.splice(i, 1);
                i--;

                if (vidas <= 0) {
                    juegoActivo = false;
                    alert("¡Te derribó un barril! Game Over.");
                    document.location.reload();
                    return;
                }
            }

            if (b.y > canvas.height + 50) {
                barriles.splice(i, 1);
                i--;
                puntaje += 20;
                if (scoreSpan) scoreSpan.innerText = puntaje;
            }
        }

        if (jugador.y <= 120 && jugador.x >= 180 && jugador.x <= 340) {
            juegoActivo = false;
            alert("¡Felicidades! Superaste la cascada. Puntaje: " + puntaje);
            document.location.reload();
        }

        if (jugador.y > canvas.height) {
            juegoActivo = false;
            alert("¡Caíste al agua! Game Over.");
            document.location.reload();
        }
    }

    function renderizar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (bgCascada.complete && bgCascada.naturalWidth !== 0) {
            ctx.drawImage(bgCascada, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "#1b4d3e";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        for (let i = 0; i < plataformas.length; i++) {
            let p = plataformas[i];
            if (i === plataformas.length - 1) {
                if (imgPuente.complete && imgPuente.naturalWidth !== 0) {
                    ctx.drawImage(imgPuente, p.x, p.y - 10, p.width, p.height + 15);
                } else {
                    ctx.fillStyle = "#8b4513";
                    ctx.fillRect(p.x, p.y, p.width, p.height);
                }
            } else {
                if (imgPlataforma.complete && imgPlataforma.naturalWidth !== 0) {
                    ctx.drawImage(imgPlataforma, p.x, p.y, p.width, p.height);
                } else {
                    ctx.fillStyle = "#5c4033";
                    ctx.fillRect(p.x, p.y, p.width, p.height);
                }
            }
        }

        for (let b of barriles) {
            if (imgBarrilSprite.complete && imgBarrilSprite.naturalWidth !== 0) {
                ctx.drawImage(imgBarrilSprite, b.x - 20, b.y - 20, 40, 40);
            } else {
                ctx.fillStyle = "#d35400";
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.radio, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.fillStyle = "#f1c40f";
        ctx.fillRect(jugador.x, jugador.y, jugador.ancho, jugador.alto);
    }

    function loop() {
        actualizar();
        renderizar();
        if (juegoActivo) requestAnimationFrame(loop);
    }

    document.getElementById('btn-left').onclick = () => { jugador.vx = -3; };
    document.getElementById('btn-right').onclick = () => { jugador.vx = 3; };
    document.getElementById('btn-jump').onclick = () => {
        if (jugador.enSuelo) {
            jugador.vy = -9;
            jugador.enSuelo = false;
        }
    };

    document.getElementById('btn-left').onmouseup = () => { if (jugador.vx < 0) jugador.vx = 0; };
    document.getElementById('btn-right').onmouseup = () => { if (jugador.vx > 0) jugador.vx = 0; };

    window.onkeydown = (e) => {
        if (e.key === 'ArrowLeft') jugador.vx = -3;
        if (e.key === 'ArrowRight') jugador.vx = 3;
        if ((e.key === 'ArrowUp' || e.key === ' ') && jugador.enSuelo) {
            jugador.vy = -9;
            jugador.enSuelo = false;
        }
    };

    window.onkeyup = (e) => {
        if (e.key === 'ArrowLeft' && jugador.vx < 0) jugador.vx = 0;
        if (e.key === 'ArrowRight' && jugador.vx > 0) jugador.vx = 0;
    };

    loop();
}

// ==========================================
// 6. MINIJUEGO 6: CASCADA CON LOS 4 CUADROS
// ==========================================
function iniciarNivel6Cascada() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 400;
    canvas.height = 700;

    let puntaje = 0;
    let juegoActivo = true;
    let vidas = 5;

    let uiContainer = document.getElementById('ui');
    uiContainer.innerHTML = `
        <div style="font-size: 13px;">Ascenso Nivel 6: <span id="score">0</span></div>
        <div id="hearts-container" style="font-size: 15px; letter-spacing: 1px; color: #ff3366;">❤❤❤❤❤</div>
    `;
    const scoreSpan = document.getElementById('score');
    const heartsContainer = document.getElementById('hearts-container');

    function actualizarCorazonesUI() {
        let textoCorazones = "";
        for (let i = 0; i < vidas; i++) textoCorazones += "❤️";
        heartsContainer.innerText = textoCorazones;
    }

    const jugador = {
        x: 180,
        y: 520,
        ancho: 80,
        alto: 80,
        vx: 0,
        vy: 0,
        enSuelo: false,
        frameX: 0,
        animCounter: 0
    };

    // Estructura adaptada estrictamente a los 4 cuadros indicados:
    let plataformas = [
        { x: 30, y: 580, ancho: 340, alto: 30, tipo: 'puente' }, // Cuadro B (Puente horizontal inicial que colapsa)
        { x: 70, y: 440, ancho: 120, alto: 22, tipo: 'barril' },  // Cuadro C (Plataforma roja / barril)
        { x: 210, y: 310, ancho: 120, alto: 22, tipo: 'barril' }, // Cuadro C (Plataforma roja / barril)
        { x: 90, y: 180, ancho: 120, alto: 22, tipo: 'barril' },  // Cuadro C (Plataforma roja / barril)
        { x: 60, y: 70, ancho: 280, alto: 35, tipo: 'meta' }      // Puente superior final de llegada
    ];

    let barrilesFlotantes = [];

    function crearBarrilFlotante() {
        barrilesFlotantes.push({
            x: Math.random() * 240 + 80,
            y: -30,
            radio: 16,
            velocidadY: Math.random() * 1.5 + 3
        });
    }

    let tiempoCreacion = 0;

    function actualizar() {
        if (!juegoActivo) return;

        jugador.x += jugador.vx;
        if (jugador.x < 10) jugador.x = 10;
        if (jugador.x + jugador.ancho > canvas.width - 10) jugador.x = canvas.width - jugador.ancho - 10;

        if (jugador.vx !== 0) {
            jugador.animCounter++;
            if (jugador.animCounter % 6 === 0) jugador.frameX = (jugador.frameX + 1) % 4;
        } else {
            jugador.frameX = 0;
        }

        jugador.vy += 0.45;
        jugador.y += jugador.vy;
        jugador.enSuelo = false;

        // Colisiones con plataformas (Cuadro B y Cuadro C)
        for (let p of plataformas) {
            if (
                jugador.x + jugador.ancho > p.x &&
                jugador.x < p.x + p.ancho &&
                jugador.y + jugador.alto >= p.y &&
                jugador.y + jugador.alto <= p.y + p.vy + 8 &&
                jugador.vy >= 0
            ) {
                jugador.y = p.y - jugador.alto;
                jugador.vy = 0;
                jugador.enSuelo = true;

                // El Cuadro B (Puente base) colapsa/desaparece tras pisarlo un instante
                if (p.tipo === 'puente') {
                    setTimeout(() => {
                        p.y = 9999; 
                    }, 350);
                }
            }
        }

        tiempoCreacion++;
        if (tiempoCreacion > 70) {
            crearBarrilFlotante();
            tiempoCreacion = 0;
        }

        // Obstáculos de caída opcionales
        for (let i = 0; i < barrilesFlotantes.length; i++) {
            let b = barrilesFlotantes[i];
            b.y += b.velocidadY;

            let distX = (jugador.x + jugador.ancho / 2) - b.x;
            let distY = (jugador.y + jugador.alto / 2) - b.y;
            let distancia = Math.sqrt(distX * distX + distY * distY);

            if (distancia < b.radio + 22) {
                vidas--;
                actualizarCorazonesUI();
                barrilesFlotantes.splice(i, 1);
                i--;

                if (vidas <= 0) {
                    juegoActivo = false;
                    alert("¡Te golpeó un objeto! Game Over.");
                    document.location.reload();
                    return;
                }
            }

            if (b.y > canvas.height + 40) {
                barrilesFlotantes.splice(i, 1);
                i--;
                puntaje += 15;
                if (scoreSpan) scoreSpan.innerText = puntaje;
            }
        }

        // Meta superior
        let meta = plataformas[plataformas.length - 1];
        if (jugador.y <= meta.y && jugador.x + jugador.ancho > meta.x && jugador.x < meta.x + meta.ancho) {
            juegoActivo = false;
            alert("¡Increíble! Subiste con éxito por la cascada. Puntaje final: " + puntaje);
            document.location.reload();
        }

        // Si cae al fondo / agua
        if (jugador.y > canvas.height) {
            juegoActivo = false;
            alert("¡Caíste al agua! Game Over.");
            document.location.reload();
        }
    }

    function renderizar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // ==========================================
        // CUADRO A: Background completo de color amarillo
        // ==========================================
        ctx.fillStyle = "#f1c40f"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // ==========================================
        // CUADRO B y otros: Puente horizontal y Meta
        // ==========================================
        for (let i = 0; i < plataformas.length; i++) {
            let p = plataformas[i];
            if (p.tipo === 'puente') {
                ctx.fillStyle = "#2980b9"; // CUADRO B: Color azul (puente horizontal base)
                ctx.fillRect(p.x, p.y, p.ancho, p.alto);
            } else if (p.tipo === 'barril') {
                ctx.fillStyle = "#e74c3c"; // CUADRO C: Color rojo (plataformas de salto estilo barril)
                ctx.fillRect(p.x, p.y, p.ancho, p.alto);
                // Detalles visuales en la plataforma roja
                ctx.fillStyle = "#c0392b";
                ctx.fillRect(p.x, p.y + 6, p.ancho, p.alto - 12);
            } else if (p.tipo === 'meta') {
                ctx.fillStyle = "#8e44ad"; // Puente superior de llegada
                ctx.fillRect(p.x, p.y, p.ancho, p.alto);
            }
        }

        // Dibujar elementos flotantes adicionales
        for (let b of barrilesFlotantes) {
            ctx.fillStyle = "#c0392b";
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radio, 0, Math.PI * 2);
            ctx.fill();
        }

        // Dibujar personaje (Perrita / Jugador)
        ctx.fillStyle = "#d35400";
        ctx.fillRect(jugador.x, jugador.y, jugador.ancho, jugador.alto);
    }

    function loop() {
        actualizar();
        renderizar();
        if (juegoActivo) requestAnimationFrame(loop);
    }

    // Controles
    document.getElementById('btn-left').onclick = () => { jugador.vx = -3.5; };
    document.getElementById('btn-right').onclick = () => { jugador.vx = 3.5; };
    document.getElementById('btn-jump').onclick = () => {
        if (jugador.enSuelo) {
            jugador.vy = -10;
            jugador.enSuelo = false;
        }
    };

    document.getElementById('btn-left').onmouseup = () => { if (jugador.vx < 0) jugador.vx = 0; };
    document.getElementById('btn-right').onmouseup = () => { if (jugador.vx > 0) jugador.vx = 0; };

    window.onkeydown = (e) => {
        if (e.key === 'ArrowLeft') jugador.vx = -3.5;
        if (e.key === 'ArrowRight') jugador.vx = 3.5;
        if ((e.key === 'ArrowUp' || e.key === ' ') && jugador.enSuelo) {
            jugador.vy = -10;
            jugador.enSuelo = false;
        }
    };

    window.onkeyup = (e) => {
        if (e.key === 'ArrowLeft' && jugador.vx < 0) jugador.vx = 0;
        if (e.key === 'ArrowRight' && jugador.vx > 0) jugador.vx = 0;
    };

    loop();
}
