// ==========================================
// 7. MINIJUEGO 7: MAPA ZONA OESTE (SECUENCIAL PIO Y TRANSICIONES)
// ==========================================
function iniciarNivel7EscaleraMapa() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 400;
    canvas.height = 700;

    // Lista de escenarios secuenciales solicitados (.jpg)
    const listaEscenarios = ['pioa_2.jpg', 'piob_2.jpg', 'pioc_2.jpg', 'pioz_2.jpg'];
    let indiceEscenarioActual = 0;

    let puntaje = 0;
    let juegoActivo = true;
    let vidas = 10;
    let tiempoInvulnerable = 0;

    // Variables para el efecto de oscurecimiento (transición de 4 segundos / 240 frames a 60fps)
    let transicionActiva = false;
    let opacidadOscurecimiento = 0;
    let direccionTransicion = 1; // 1: oscureciendo, -1: aclarando
    let callbackTransicion = null;

    let uiContainer = document.getElementById('ui');
    uiContainer.innerHTML = `
        <div style="font-size: 13px;">Zona: <span id="nombre-escenario">pioa</span> | Puntaje: <span id="score">0</span></div>
        <div id="hearts-container" style="font-size: 14px; letter-spacing: 1px; color: #ff3366;">❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️</div>
    `;
    const scoreSpan = document.getElementById('score');
    const nombreEscenarioSpan = document.getElementById('nombre-escenario');
    const heartsContainer = document.getElementById('hearts-container');

    function actualizarCorazonesUI() {
        let textoCorazones = "";
        for (let i = 0; i < vidas; i++) textoCorazones += "❤️";
        heartsContainer.innerText = textoCorazones;
    }

    // Cargar imagen del escenario actual
    let mapaEscolarImg = new Image();
    function cargarEscenarioActual() {
        mapaEscolarImg.src = listaEscenarios[indiceEscenarioActual];
        const nombresCortos = ['pioa', 'piob', 'pioc', 'pioz'];
        if (nombreEscenarioSpan) nombreEscenarioSpan.innerText = nombresCortos[indiceEscenarioActual];
    }
    cargarEscenarioActual();

    // Sprite PNG del perrito cartoon
    const perroCartoonSheet = new Image();
    perroCartoonSheet.src = 'tobiaspapersss.png';

    const jugador = {
        x: 50,
        y: 530,
        ancho: 55,
        alto: 55,
        velocidad: 2.8,
        vx: 0,
        vy: 0,
        frameX: 0,
        animCounter: 0,
        saltar: function() {
            tiempoInvulnerable = Math.max(tiempoInvulnerable, 15);
        }
    };

    // Topes físicos adaptados con colisión peatonal 2D y paso por el medio del puente
    const topesFisicos = [
        { x: 35, y: 300, ancho: 140, alto: 120 }, // Edificio izquierdo
        { x: 225, y: 260, ancho: 145, alto: 140 }, // Edificio derecho
        // Simulación del puente permitiendo el paso por el medio (dejando un carril libre al centro Y: 380-440)
        { x: 260, y: 360, ancho: 70, alto: 20 }
    ];

    function comprobarColision(nx, ny) {
        let hitboxJugador = { x: nx + 5, y: ny + 25, ancho: jugador.ancho - 10, alto: jugador.alto - 25 };
        
        // Límites de la pantalla
        if (hitboxJugador.x < 0 || hitboxJugador.x + hitboxJugador.ancho > canvas.width || hitboxJugador.y < 180 || hitboxJugador.y + hitboxJugador.alto > 650) {
            return true;
        }

        for (let tope of topesFisicos) {
            if (
                hitboxJugador.x < tope.x + tope.ancho &&
                hitboxJugador.x + hitboxJugador.ancho > tope.x &&
                hitboxJugador.y < tope.y + tope.alto &&
                hitboxJugador.y + hitboxJugador.alto > tope.y
            ) {
                return true;
            }
        }
        return false;
    }

    function iniciarTransicion(siguienteAccion) {
        transicionActiva = true;
        direccionTransicion = 1;
        opacidadOscurecimiento = 0;
        callbackTransicion = siguienteAccion;
    }

    let obstaculosEscuela = [];
    function crearObstaculoEscuela() {
        obstaculosEscuela.push({
            x: Math.random() * 260 + 70,
            y: 220,
            ancho: 35,
            alto: 35,
            velY: 1.8
        });
    }

    let contadorSpawn = 0;

    function actualizar() {
        if (!juegoActivo) return;

        // Manejo de la transición con efecto de oscurecimiento (4 segundos total aprox)
        if (transicionActiva) {
            opacidadOscurecimiento += 0.016 * direccionTransicion; // ~60 frames por segundo
            if (opacidadOscurecimiento >= 1) {
                opacidadOscurecimiento = 1;
                if (callbackTransicion) callbackTransicion();
                direccionTransicion = -1; // Comienza a aclarar
            } else if (opacidadOscurecimiento <= 0 && direccionTransicion === -1) {
                opacidadOscurecimiento = 0;
                transicionActiva = false;
            }
            return; // Pausar movimiento del jugador durante la transición
        }

        if (tiempoInvulnerable > 0) tiempoInvulnerable--;

        // Movimiento Horizontal y Vertical con colisiones 2D
        let nuevoX = jugador.x + jugador.vx;
        if (!comprobarColision(nuevoX, jugador.y)) jugador.x = nuevoX;

        let nuevoY = jugador.y + jugador.vy;
        if (!comprobarColision(jugador.x, nuevoY)) jugador.y = nuevoY;

        // Detección de extremos para navegación secuencial entre escenarios (pioa -> piob -> pioc -> pioz)
        // Extremo derecho (cerca de los árboles superiores / lateral derecho > 340) -> Avanzar escenario
        if (jugador.x > 335 && jugador.y < 350) {
            if (indiceEscenarioActual < listaEscenarios.length - 1) {
                iniciarTransicion(() => {
                    indiceEscenarioActual++;
                    cargarEscenarioActual();
                    jugador.x = 40; // Aparece en el lado izquierdo del nuevo escenario
                });
            }
        }

        // Extremo izquierdo (< 10) -> Retroceder escenario en orden inverso
        if (jugador.x < 10) {
            if (indiceEscenarioActual > 0) {
                iniciarTransicion(() => {
                    indiceEscenarioActual--;
                    cargarEscenarioActual();
                    jugador.x = 320; // Aparece en el lado derecho del escenario anterior
                });
            } else {
                jugador.x = 10;
            }
        }

        if (jugador.vx !== 0 || jugador.vy !== 0) {
            jugador.animCounter++;
            if (jugador.animCounter % 8 === 0) jugador.frameX = (jugador.frameX + 1) % 4;
        } else {
            jugador.frameX = 0;
        }

        contadorSpawn++;
        if (contadorSpawn > 80) {
            crearObstaculoEscuela();
            contadorSpawn = 0;
        }

        for (let i = 0; i < obstaculosEscuela.length; i++) {
            let obs = obstaculosEscuela[i];
            obs.y += obs.velY;

            let distX = (jugador.x + jugador.ancho / 2) - (obs.x + obs.ancho / 2);
            let distY = (jugador.y + jugador.alto / 2) - (obs.y + obs.alto / 2);
            let distancia = Math.sqrt(distX * distX + distY * distY);

            if (distancia < 30 && tiempoInvulnerable === 0) {
                vidas--;
                actualizarCorazonesUI();
                tiempoInvulnerable = 45;
                obstaculosEscuela.splice(i, 1);
                i--;

                if (vidas <= 0) {
                    juegoActivo = false;
                    alert(`¡Game Over! Puntaje final: ${Math.floor(puntaje)}`);
                    document.location.reload();
                    return;
                }
            }

            if (obs.y > canvas.height) {
                obstaculosEscuela.splice(i, 1);
                i--;
                puntaje += 10;
                if (scoreSpan) scoreSpan.innerText = Math.floor(puntaje);
            }
        }
    }

    function renderizar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Dibujar imagen del escenario actual (.jpg)
        if (mapaEscolarImg.complete && mapaEscolarImg.naturalWidth !== 0) {
            ctx.drawImage(mapaEscolarImg, 0, 150, canvas.width, 450);
        } else {
            ctx.fillStyle = "#2ecc71";
            ctx.fillRect(0, 150, canvas.width, 450);
        }

        // 2. Obstáculos
        for (let obs of obstaculosEscuela) {
            ctx.fillStyle = "#e74c3c";
            ctx.fillRect(obs.x, obs.y, obs.ancho, obs.alto);
        }

        // 3. Dibujar al jugador (perrito cartoon)
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

        // 4. Efecto de oscurecimiento para la transición (4 segundos)
        if (opacidadOscurecimiento > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${opacidadOscurecimiento})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    function loop() {
        actualizar();
        renderizar();
        if (juegoActivo) requestAnimationFrame(loop);
    }

    // Controles táctiles y de teclado
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
        <div class="btn-control btn-jump" id="btn-jump" style="width: 55px; height: 55px; font-size: 20px;">▲</div>
    `;

    document.getElementById('btn-left').onmousedown = () => { jugador.vx = -jugador.velocidad; };
    document.getElementById('btn-right').onmousedown = () => { jugador.vx = jugador.velocidad; };
    document.getElementById('btn-up').onmousedown = () => { jugador.vy = -jugador.velocidad; };
    document.getElementById('btn-down').onmousedown = () => { jugador.vy = jugador.velocidad; };
    document.getElementById('btn-jump').onclick = () => { jugador.saltar(); };

    document.getElementById('btn-left').onmouseup = () => { if (jugador.vx < 0) jugador.vx = 0; };
    document.getElementById('btn-right').onmouseup = () => { if (jugador.vx > 0) jugador.vx = 0; };
    document.getElementById('btn-up').onmouseup = () => { if (jugador.vy < 0) jugador.vy = 0; };
    document.getElementById('btn-down').onmouseup = () => { if (jugador.vy > 0) jugador.vy = 0; };

    window.onkeydown = (e) => {
        if (e.key === 'ArrowLeft') jugador.vx = -jugador.velocidad;
        if (e.key === 'ArrowRight') jugador.vx = jugador.velocidad;
        if (e.key === 'ArrowUp') jugador.vy = -jugador.velocidad;
        if (e.key === 'ArrowDown') jugador.vy = jugador.velocidad;
        if (e.key === ' ' || e.key === 'Enter') jugador.saltar();
    };

    window.onkeyup = (e) => {
        if (e.key === 'ArrowLeft' && jugador.vx < 0) jugador.vx = 0;
        if (e.key === 'ArrowRight' && jugador.vx > 0) jugador.vx = 0;
        if (e.key === 'ArrowUp' && jugador.vy < 0) jugador.vy = 0;
        if (e.key === 'ArrowDown' && jugador.vy > 0) jugador.vy = 0;
    };

    loop();
}
