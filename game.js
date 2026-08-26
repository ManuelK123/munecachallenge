// ==========================================
// 7. MINIJUEGO 7: MAPA ZONA OESTE (HD, PIO A AL Z, CÁMARA MÓVIL Y FADES)
// ==========================================
function iniciarNivel7EscaleraMapa() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 400;
    canvas.height = 700;

    let juegoActivo = true;
    let vidas = 10;
    let tiempoInvulnerable = 0;

    // Secuencia completa de escenarios: HD (inicial con colisiones a edificios) -> pioa -> piob -> pioc -> pioz
    const listaEscenarios = ['hd.jpg', 'pioa.jpg', 'piob.jpg', 'pioc.jpg', 'pioz.jpg'];
    let indiceEscenarioActual = 0;
    
    // Sistema de Oscurecimiento (Fade out/in)
    let estadoOscurecimiento = 'NINGUNO'; // 'FADE_OUT', 'FADE_IN', 'NINGUNO'
    let contadorOscurecimiento = 0;
    const duracionFade = 120; // 120 frames para la transición completa
    let direccionSiguienteFade = 'AVANZAR'; // 'AVANZAR' o 'RETROCEDER'

    let uiContainer = document.getElementById('ui');
    uiContainer.innerHTML = `
        <div style="font-size: 13px;">Zona: <span id="stage-name-txt">Inicio</span></div>
        <div id="hearts-container" style="font-size: 14px; letter-spacing: 1px; color: #ff3366;">❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️</div>
    `;
    const stageNameTxt = document.getElementById('stage-name-txt');
    const heartsContainer = document.getElementById('hearts-container');

    function actualizarCorazonesUI() {
        let textoCorazones = "";
        for (let i = 0; i < vidas; i++) textoCorazones += "❤️";
        heartsContainer.innerText = textoCorazones;
    }

    // Cargar imágenes de escenarios
    let imagenesEscenarios = listaEscenarios.map(src => {
        let img = new Image();
        img.src = src;
        return img;
    });

    // Sprite del perrito cartoon (.png)
    const perroCartoonSheet = new Image();
    perroCartoonSheet.src = 'tobiaspapersss.png';

    // Objeto del Jugador (Perrito)
    const jugador = {
        x: 60,
        y: 480,
        ancho: 85,
        alto: 85,
        velocidad: 2.5,
        vx: 0,
        vy: 0,
        frameX: 0,
        animCounter: 0,
        mirandoIzquierda: false
    };

    // Cámara virtual para el desplazamiento lateral
    let cameraX = 0;
    const mundoAncho = 800;

    // ==========================================
    // TOPES FÍSICOS Y COLISIONES PARA EDIFICIOS (HD)
    // ==========================================
    function comprobarColision(nx, ny) {
        // Límites generales del escenario
        if (ny < 310) return true;
        if (ny + jugador.alto > 630) return true;
        if (nx < 10) return true;
        if (nx + jugador.ancho > mundoAncho - 10) return true;

        // Si estamos en el primer escenario (hd.jpg), restringimos el paso hacia los techos/edificios
        if (listaEscenarios[indiceEscenarioActual] === 'hd.jpg') {
            // Edificio Izquierdo (Bloque rojo principal y zonas elevadas)
            if (nx + jugador.ancho > 40 && nx < 340 && ny < 480) {
                return true;
            }
            // Edificio Derecho (Hospital / Estructura formal)
            if (nx + jugador.ancho > 500 && nx < 760 && ny < 490) {
                return true;
            }
        } else {
            // Colisiones estándar flexibles para los demás mapas de la zona
            if (nx + jugador.ancho > 210 && nx < 270 && ny + jugador.alto > 390 && ny < 460) {
                return true;
            }
        }

        // Gestión del Puente / Salida derecha
        let enZonaPuenteX = (nx + jugador.ancho > 720 && nx < 790);
        if (enZonaPuenteX) {
            let medioPuenteY = ny + jugador.alto / 2;
            if (medioPuenteY < 430 || medioPuenteY > 530) {
                return true;
            }
        }

        return false;
    }

    function actualizar() {
        if (!juegoActivo) return;

        if (tiempoInvulnerable > 0) tiempoInvulnerable--;

        // Gestión del efecto de oscurecimiento (Fade)
        if (estadoOscurecimiento === 'FADE_OUT') {
            contadorOscurecimiento++;
            if (contadorOscurecimiento >= duracionFade) {
                if (direccionSiguienteFade === 'AVANZAR') {
                    if (indiceEscenarioActual < listaEscenarios.length - 1) {
                        indiceEscenarioActual++;
                        jugador.x = 50; 
                        cameraX = 0;
                    }
                } else {
                    if (indiceEscenarioActual > 0) {
                        indiceEscenarioActual--;
                        jugador.x = mundoAncho - 120; 
                        cameraX = mundoAncho - canvas.width;
                    }
                }
                let nombreLimpio = listaEscenarios[indiceEscenarioActual].split('.')[0].toUpperCase();
                stageNameTxt.innerText = nombreLimpio;
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

        // Movimiento Horizontal con topes de edificios
        let nuevoX = jugador.x + jugador.vx;
        if (!comprobarColision(nuevoX, jugador.y)) {
            jugador.x = nuevoX;
        }

        // Movimiento Vertical con topes de edificios
        let nuevoY = jugador.y + jugador.vy;
        if (!comprobarColision(jugador.x, nuevoY)) {
            jugador.y = nuevoY;
        }

        // Orientación del sprite
        if (jugador.vx < 0) {
            jugador.mirandoIzquierda = true;
        } else if (jugador.vx > 0) {
            jugador.mirandoIzquierda = false;
        }

        // Desplazamiento suave de la cámara
        let objetivoCameraX = jugador.x - canvas.width / 2;
        if (objetivoCameraX < 0) objetivoCameraX = 0;
        if (objetivoCameraX > mundoAncho - canvas.width) objetivoCameraX = mundoAncho - canvas.width;
        cameraX += (objetivoCameraX - cameraX) * 0.1;

        // Detectar borde derecho para AVANZAR con fundido negro
        if (jugador.x > mundoAncho - 50 && indiceEscenarioActual < listaEscenarios.length - 1) {
            direccionSiguienteFade = 'AVANZAR';
            estadoOscurecimiento = 'FADE_OUT';
            contadorOscurecimiento = 0;
            return;
        }

        // Detectar borde izquierdo para RETROCEDER con fundido negro
        if (jugador.x <= 15 && indiceEscenarioActual > 0) {
            direccionSiguienteFade = 'RETROCEDER';
            estadoOscurecimiento = 'FADE_OUT';
            contadorOscurecimiento = 0;
            return;
        }

        // Animación de caminata
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

        ctx.save();
        ctx.translate(-cameraX, 0);

        // 1. Dibujar el mapa actual
        let imgActual = imagenesEscenarios[indiceEscenarioActual];
        if (imgActual && imgActual.complete && imgActual.naturalWidth !== 0) {
            ctx.drawImage(imgActual, 0, 150, mundoAncho, 450);
        } else {
            ctx.fillStyle = "#2ecc71";
            ctx.fillRect(0, 0, mundoAncho, canvas.height);
        }

        // 2. Dibujar al perrito
        if (tiempoInvulnerable === 0 || Math.floor(tiempoInvulnerable / 4) % 2 === 0) {
            if (perroCartoonSheet.complete && perroCartoonSheet.naturalWidth !== 0) {
                const sheetW = perroCartoonSheet.width / 4;
                const sheetH = perroCartoonSheet.height / 3;

                ctx.save();
                if (jugador.mirandoIzquierda) {
                    ctx.translate(jugador.x + jugador.ancho / 2, jugador.y + jugador.alto / 2);
                    ctx.scale(-1, 1);
                    ctx.drawImage(
                        perroCartoonSheet,
                        jugador.frameX * sheetW, 0, sheetW, sheetH,
                        -jugador.ancho / 2, -jugador.alto / 2, jugador.ancho, jugador.alto
                    );
                } else {
                    ctx.drawImage(
                        perroCartoonSheet,
                        jugador.frameX * sheetW, 0, sheetW, sheetH,
                        jugador.x, jugador.y, jugador.ancho, jugador.alto
                    );
                }
                ctx.restore();
            } else {
                ctx.fillStyle = "#d35400";
                ctx.fillRect(jugador.x, jugador.y, jugador.ancho, jugador.alto);
            }
        }

        ctx.restore();

        // 3. Efecto de oscurecimiento (Fade) durante las transiciones
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

    // Controles en pantalla y eventos de teclado
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
    };

    window.onkeyup = (e) => {
        if (e.key === 'ArrowLeft' && jugador.vx < 0) jugador.vx = 0;
        if (e.key === 'ArrowRight' && jugador.vx > 0) jugador.vx = 0;
        if (e.key === 'ArrowUp' && jugador.vy < 0) jugador.vy = 0;
        if (e.key === 'ArrowDown' && jugador.vy > 0) jugador.vy = 0;
    };

    loop();
}
