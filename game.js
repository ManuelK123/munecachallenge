// ==========================================
// 7. MINIJUEGO 7: MAPA ZONA OESTE (HD, MÚSICA, VELOCIDAD PROGRESIVA Y FADES)
// ==========================================
function iniciarNivel7EscaleraMapa() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 400;
    canvas.height = 700;

    let juegoActivo = true;
    let vidas = 10;
    let tiempoInvulnerable = 0;

    // Reproducir la música del menú principal desde el comienzo
    const menuMusic = document.getElementById('menu-music');
    if (menuMusic) {
        menuMusic.currentTime = 0;
        menuMusic.play().catch(e => console.log("Audio play bloqueado por el navegador:", e));
    }

    // Secuencia completa de escenarios: HD -> pioa -> piob -> pioc -> pioz
    const listaEscenarios = ['hd.jpg', 'pioa.jpg', 'piob.jpg', 'pioc.jpg', 'pioz.jpg'];
    let indiceEscenarioActual = 0;
    
    // Sistema de Oscurecimiento (Fade out/in)
    let estadoOscurecimiento = 'NINGUNO'; 
    let contadorOscurecimiento = 0;
    const duracionFade = 120; 
    let direccionSiguienteFade = 'AVANZAR'; 

    let uiContainer = document.getElementById('ui');
    uiContainer.innerHTML = `
        <div style="font-size: 13px;">Zona: <span id="stage-name-txt">Inicio</span> | Vel: <span id="speed-txt">100%</span></div>
        <div id="hearts-container" style="font-size: 14px; letter-spacing: 1px; color: #ff3366;">❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️</div>
    `;
    const stageNameTxt = document.getElementById('stage-name-txt');
    const speedTxt = document.getElementById('speed-txt');
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
        baseVelocidad: 2.5, // 100% de velocidad inicial
        vx: 0,
        vy: 0,
        frameX: 0,
        animCounter: 0,
        mirandoIzquierda: false
    };

    // Cámara virtual para el desplazamiento lateral
    let cameraX = 0;
    const mundoAncho = 800;

    // Calcular velocidad actual de forma gradual (del 100% al 140% según el escenario avanzado)
    function obtenerVelocidadActual() {
        // Incremento proporcional según el índice del escenario actual (de 0 a 4)
        let factorAumento = 1 + (indiceEscenarioActual / (listaEscenarios.length - 1)) * 0.4;
        return jugador.baseVelocidad * factorAumento;
    }

    // ==========================================
    // TOPES FÍSICOS Y COLISIONES PARA EDIFICIOS (HD)
    // ==========================================
    function comprobarColision(nx, ny) {
        if (ny < 310) return true;
        if (ny + jugador.alto > 630) return true;
        if (nx < 10) return true;
        if (nx + jugador.ancho > mundoAncho - 10) return true;

        if (listaEscenarios[indiceEscenarioActual] === 'hd.jpg') {
            if (nx + jugador.ancho > 40 && nx < 340 && ny < 480) {
                return true;
            }
            if (nx + jugador.ancho > 500 && nx < 760 && ny < 490) {
                return true;
            }
        } else {
            if (nx + jugador.ancho > 210 && nx < 270 && ny + jugador.alto > 390 && ny < 460) {
                return true;
            }
        }

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
                
                // Actualizar indicador visual de velocidad en UI (de 100% a 140%)
                let porcentajeVel = Math.round((1 + (indiceEscenarioActual / (listaEscenarios.length - 1)) * 0.4) * 100);
                if (speedTxt) speedTxt.innerText = porcentajeVel + "%";

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

        // Movimiento Horizontal con velocidad gradual aplicada
        let velActual = obtenerVelocidadActual();
        if (jugador.vx !== 0) {
            jugador.vx = (jugador.vx > 0) ? velActual : -velActual;
        }
        if (jugador.vy !== 0) {
            jugador.vy = (jugador.vy > 0) ? velActual : -velActual;
        }

        let nuevoX = jugador.x + jugador.vx;
        if (!comprobarColision(nuevoX, jugador.y)) {
            jugador.x = nuevoX;
        }

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

        // Detectar borde derecho para AVANZAR
        if (jugador.x > mundoAncho - 50 && indiceEscenarioActual < listaEscenarios.length - 1) {
            direccionSiguienteFade = 'AVANZAR';
            estadoOscurecimiento = 'FADE_OUT';
            contadorOscurecimiento = 0;
            return;
        }

        // Detectar borde izquierdo para RETROCEDER
        if (jugador.x <= 15 && indiceEscenarioActual > 0) {
            direccionSiguienteFade = 'RETROCEDER';
            estadoOscurecimiento = 'FADE_OUT';
            contadorOscurecimiento = 0;
            return;
        }

        // Animación de caminata ajustada a la velocidad actual
        if (jugador.vx !== 0 || jugador.vy !== 0) {
            jugador.animCounter++;
            let frecuenciaAnim = Math.max(4, Math.floor(8 / (obtenerVelocidadActual() / jugador.baseVelocidad)));
            if (jugador.animCounter % frecuenciaAnim === 0) {
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

        let imgActual = imagenesEscenarios[indiceEscenarioActual];
        if (imgActual && imgActual.complete && imgActual.naturalWidth !== 0) {
            ctx.drawImage(imgActual, 0, 150, mundoAncho, 450);
        } else {
            ctx.fillStyle = "#2ecc71";
            ctx.fillRect(0, 0, mundoAncho, canvas.height);
        }

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

    document.getElementById('btn-left').onmousedown = () => { jugador.vx = -obtenerVelocidadActual(); };
    document.getElementById('btn-right').onmousedown = () => { jugador.vx = obtenerVelocidadActual(); };
    document.getElementById('btn-up').onmousedown = () => { jugador.vy = -obtenerVelocidadActual(); };
    document.getElementById('btn-down').onmousedown = () => { jugador.vy = obtenerVelocidadActual(); };
    document.getElementById('btn-jump').onclick = () => { tiempoInvulnerable = 15; };

    document.getElementById('btn-left').onmouseup = () => { if (jugador.vx < 0) jugador.vx = 0; };
    document.getElementById('btn-right').onmouseup = () => { if (jugador.vx > 0) jugador.vx = 0; };
    document.getElementById('btn-up').onmouseup = () => { if (jugador.vy < 0) jugador.vy = 0; };
    document.getElementById('btn-down').onmouseup = () => { if (jugador.vy > 0) jugador.vy = 0; };

    window.onkeydown = (e) => {
        let v = obtenerVelocidadActual();
        if (e.key === 'ArrowLeft') jugador.vx = -v;
        if (e.key === 'ArrowRight') jugador.vx = v;
        if (e.key === 'ArrowUp') jugador.vy = -v;
        if (e.key === 'ArrowDown') jugador.vy = v;
    };

    window.onkeyup = (e) => {
        if (e.key === 'ArrowLeft' && jugador.vx < 0) jugador.vx = 0;
        if (e.key === 'ArrowRight' && jugador.vx > 0) jugador.vx = 0;
        if (e.key === 'ArrowUp' && jugador.vy < 0) jugador.vy = 0;
        if (e.key === 'ArrowDown' && jugador.vy > 0) jugador.vy = 0;
    };

    loop();
}
