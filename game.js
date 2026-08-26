// ==========================================
// CONTROLADOR GENERAL DE NIVELES Y ENRUTAMIENTO
// ==========================================

function cargarMinijuego(nombreNivel) {
    document.getElementById('level-select-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';

    // Limpiar eventos previos para evitar conflictos de teclado/mouse al cambiar de nivel
    window.onkeydown = null;
    window.onkeyup = null;

    if (nombreNivel === 'nivel7') {
        iniciarNivel7EscaleraMapa();
    } else {
        // Plantilla por defecto para los demás niveles genéricos
        iniciarNivelGenerico(nombreNivel);
    }
}

function volverAlMenu() {
    window.onkeydown = null;
    window.onkeyup = null;
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('level-select-screen').style.display = 'flex';
    
    // Detener bucles limpiando el canvas
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// ==========================================
// FUNCIÓN PARA NIVELES GENÉRICOS (1 AL 6)
// ==========================================
function iniciarNivelGenerico(nombre) {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 700;

    let uiContainer = document.getElementById('ui');
    uiContainer.innerHTML = `<div>Nivel: ${nombre.toUpperCase()}</div><div>❤️ Vidas: 5</div>`;

    const controlsContainer = document.getElementById('controls');
    controlsContainer.innerHTML = `<div>Controles genéricos activos para ${nombre}</div>`;

    function loopGenerico() {
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '18px sans-serif';
        ctx.fillText(`Cargando ${nombre.toUpperCase()}...`, 100, 350);
    }
    loopGenerico();
}

// ==========================================
// 7. MINIJUEGO 7: MAPA ZONA OESTE (ESCENARIOS SECUENCIALES PIOA A PIOZ, PUENTE 2D Y OSCURECIMIENTO 4 SEG)
// ==========================================
function iniciarNivel7EscaleraMapa() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 400;
    canvas.height = 700;

    let juegoActivo = true;
    let vidas = 10;
    let tiempoInvulnerable = 0;

    // Control de transición de escenarios y oscurecimiento (4 segundos = aprox 240 frames a 60fps)
    const listaEscenarios = ['pioa.jpg', 'piob.jpg', 'pioc.jpg', 'pioz.jpg'];
    let indiceEscenarioActual = 0;
    let estadoOscurecimiento = 'NINGUNO'; // 'FADE_OUT', 'FADE_IN', 'NINGUNO'
    let contadorOscurecimiento = 0;
    const duracionFade = 120; // 2 segundos bajando, 2 segundos subiendo = 4 seg totales de efecto

    let uiContainer = document.getElementById('ui');
    uiContainer.innerHTML = `
        <div style="font-size: 13px;">Zona: <span id="stage-name-txt">pioa</span></div>
        <div id="hearts-container" style="font-size: 14px; letter-spacing: 1px; color: #ff3366;">❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️</div>
    `;
    const stageNameTxt = document.getElementById('stage-name-txt');
    const heartsContainer = document.getElementById('hearts-container');

    function actualizarCorazonesUI() {
        let textoCorazones = "";
        for (let i = 0; i < vidas; i++) textoCorazones += "❤️";
        heartsContainer.innerText = textoCorazones;
    }

    // Cargar imágenes de los escenarios dinámicamente
    let imagenesEscenarios = listaEscenarios.map(src => {
        let img = new Image();
        img.src = src;
        return img;
    });

    // Sprite PNG del perrito cartoon (.png)
    const perroCartoonSheet = new Image();
    perroCartoonSheet.src = 'tobiaspapersss.png';

    // Objeto del Jugador (Perrito)
    const jugador = {
        x: 60,
        y: 480,
        ancho: 55,
        alto: 55,
        velocidad: 2.5,
        vx: 0,
        vy: 0,
        frameX: 0,
        animCounter: 0
    };

    // ==========================================
    // TOPES FÍSICOS Y ZONAS 2D (Pasto y Puente)
    // ==========================================
    function comprobarColision(nx, ny) {
        // 1. Límite superior estricto del pasto
        if (ny < 320) return true;

        // 2. Límite inferior del pasto
        if (ny + jugador.alto > 610) return true;

        // 3. Límite lateral izquierdo
        if (nx < 20) return true;

        // 4. Colisiones con los árboles / elementos fijos del centro (rocas y troncos)
        if (nx + jugador.ancho > 195 && nx < 285 && ny + jugador.alto > 370 && ny < 480) {
            return true;
        }
        if (nx + jugador.ancho > 100 && nx < 170 && ny + jugador.alto > 320 && ny < 440) {
            return true;
        }

        // 5. Gestión del Puente (Derecha): El perrito solo puede pasar si cruza exactamente por el medio del puente
        let enZonaPuenteX = (nx + jugador.ancho > 310 && nx < 380);
        if (enZonaPuenteX) {
            let medioPuenteY = ny + jugador.alto / 2;
            if (medioPuenteY < 445 || medioPuenteY > 525) {
                return true;
            }
        }

        return false;
    }

    function actualizar() {
        if (!juegoActivo) return;

        if (tiempoInvulnerable > 0) tiempoInvulnerable--;

        // Manejo de la transición con oscurecimiento de 4 segundos
        if (estadoOscurecimiento === 'FADE_OUT') {
            contadorOscurecimiento++;
            if (contadorOscurecimiento >= duracionFade) {
                if (indiceEscenarioActual < listaEscenarios.length - 1) {
                    indiceEscenarioActual++;
                    jugador.x = 40; 
                    stageNameTxt.innerText = listaEscenarios[indiceEscenarioActual].split('.')[0];
                }
                estadoOscurecimiento = 'FADE_IN';
            }
            return; 
        } else if (estadoOscurecimiento === 'FADE_IN') {
            contadorOscurecimiento--;
            if (contadorOscurecimiento <= 0) {
                estadoOscurecimiento = 'NINGUNO';
            }
            return;
        }

        // Movimiento Horizontal con topes
        let nuevoX = jugador.x + jugador.vx;
        if (!comprobarColision(nuevoX, jugador.y)) {
            jugador.x = nuevoX;
        }

        // Movimiento Vertical con topes
        let nuevoY = jugador.y + jugador.vy;
        if (!comprobarColision(jugador.x, nuevoY)) {
            jugador.y = nuevoY;
        }

        // Detectar si llega al extremo derecho superior para avanzar al siguiente escenario
        if (jugador.x > 360 && jugador.y < 500) {
            if (indiceEscenarioActual < listaEscenarios.length - 1) {
                estadoOscurecimiento = 'FADE_OUT';
                contadorOscurecimiento = 0;
                return;
            }
        }

        // Detectar si va hacia el extremo izquierdo para retroceder de escenario
        if (jugador.x <= 25 && indiceEscenarioActual > 0) {
            indiceEscenarioActual--;
            jugador.x = 330; 
            stageNameTxt.innerText = listaEscenarios[indiceEscenarioActual].split('.')[0];
        }

        // Animación del perrito cartoon
        if (jugador.vx !== 0 || jugador.vy !== 0) {
            jugador.animCounter++;
            if (jugador.animCounter % 8 === 0) {
                jugador.frameX = (jugador.frameX + 1) % 4;
            }
        } else {
            jugador.frameX = 0;
        }
    }

    function renderizar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Dibujar la imagen del escenario actual (pioa, piob, pioc, pioz)[cite: 17]
        let imgActual = imagenesEscenarios[indiceEscenarioActual];
        if (imgActual && imgActual.complete && imgActual.naturalWidth !== 0) {
            ctx.drawImage(imgActual, 0, 150, canvas.width, 450);
        } else {
            ctx.fillStyle = "#2ecc71";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 2. Dibujar al perrito cartoon (.png)
        if (tiempoInvulnerable === 0 || Math.floor(tiempoInvulnerable / 4) % 2 === 0) {
            if (perroCartoonSheet.complete && perroCartoonSheet.naturalWidth !== 0) {
                const sheetW = perroCartoonSheet.width / 4;
                const sheetH = perroCartoonSheet.height / 3;
                ctx.drawImage(
                    perroCartoonSheet,
                    jugador.frameX * sheetW, 0, sheetW, sheetH,
                    jugador.x, jugador.y, jugador.ancho, jugador.alto
                );
            } else {
                ctx.fillStyle = "#d35400";
                ctx.fillRect(jugador.x, jugador.y, jugador.ancho, jugador.alto);
            }
        }

        // 3. Aplicar efecto de oscurecimiento (Fade) durante las transiciones de 4 segundos[cite: 17]
        if (estadoOscurecimiento !== 'NINGUNO') {
            let alpha = contadorOscurecimiento / duracionFade;
            if (alpha > 1) alpha = 1;
            ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    function loop() {
        actualizar();
        renderizar();
        if (juegoActivo) requestAnimationFrame(loop);
    }

    // ==========================================
    // CONTROLES TÁCTILES Y DE TECLADO
    // ==========================================
    const controlsContainer = document.getElementById('controls');
    controlsContainer.innerHTML = `
        <div style="display: flex; gap: 4px; align-items: center;">
            <div class="btn-control" id="btn-left" style="width: 50px; height: 50px; font-size: 20px;">◀</div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
                <div class="btn-control" id="btn-up" style="width: 45px; height: 23px; font-size: 13px;">▲</div>
                <div class="btn-control" id="btn-down" style="width: 45px; height: 23px; font-size: 13px;">▼</div>
            </div>
            <div class="btn-control" id="btn-right" style="width: 50px; height: 50px; font-size: 20px;">▶</div>
        </div>
        <div class="btn-control btn-jump" id="btn-jump" style="width: 55px; height: 55px; font-size: 20px;">🐾</div>
    `;

    document.getElementById('btn-left').onmousedown = () => { jugador.vx = -jugador.velocidad; };
    document.getElementById('btn-right').onmousedown = () => { jugador.vx = jugador.velocidad; };
    document.getElementById('btn-up').onmousedown = () => { jugador.vy = -jugador.velocidad; };
    document.getElementById('btn-down').onmousedown = () => { jugador.vy = jugador.velocidad; };
    document.getElementById('btn-jump').onclick = () => { tiempoInvulnerable = 15; };

    document.getElementById('btn-left').onmouseup = () => { if (jugador.vx < 0) jugador.vx = 0; };
    document.getElementById('btn-right').onmouseup = () => { if (jugador.vx > 0) jugador.vx = 0; };
    document.getElementById('btn-up').onmouseup = () => { if (jugador.vy < 0) jugador.vy = 0; };
    document.getElementById('btn-down').onmouseup = () => { if (jugador.vy > 0) jugador.vy = 0; };

    window.onkeydown = (e) => {
        if (e.key === 'ArrowLeft') jugador.vx = -jugador.velocidad;
        if (e.key === 'ArrowRight') jugador.vx = jugador.velocidad;
        if (e.key === 'ArrowUp') jugador.vy = -jugador.velocidad;
        if (e.key === 'ArrowDown') jugador.vy = jugador.velocidad;
        if (e.key === ' ' || e.key === 'Enter') tiempoInvulnerable = 15;
    };

    window.onkeyup = (e) => {
        if (e.key === 'ArrowLeft' && jugador.vx < 0) jugador.vx = 0;
        if (e.key === 'ArrowRight' && jugador.vx > 0) jugador.vx = 0;
        if (e.key === 'ArrowUp' && jugador.vy < 0) jugador.vy = 0;
        if (e.key === 'ArrowDown' && jugador.vy > 0) jugador.vy = 0;
    };

    loop();
}
