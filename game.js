// ==========================================
// INICIALIZACIÓN DEL JUEGO
// ==========================================
window.onload = function() {
    // Arrancamos directamente en el Nivel 7 de prueba, o puedes cambiarlo según tu selector de niveles
    iniciarNivel7EscaleraMapa();
};

// ==========================================
MINIJUEGO 7: MAPA ZONA OESTE (AVENTURA DE PIO)
// ==========================================
function iniciarNivel7EscaleraMapa() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 700;

    let puntaje = 0;
    let juegoActivo = true;
    let vidas = 5;

    // UI específica para el nivel
    let uiContainer = document.getElementById('ui');
    uiContainer.innerHTML = `
        <div style="font-size: 13px;">Progreso Pio: <span id="score">0</span></div>
        <div id="hearts-container" style="font-size: 15px; letter-spacing: 1px; color: #ff3366;">❤❤❤❤❤</div>
    `;
    const scoreSpan = document.getElementById('score');
    const heartsContainer = document.getElementById('hearts-container');

    function actualizarCorazonesUI() {
        let textoCorazones = "";
        for (let i = 0; i < vidas; i++) textoCorazones += "❤️";
        heartsContainer.innerText = textoCorazones;
    }

    // Carga de las 4 imágenes de escenarios secuenciales
    const escenariosPio = [
        new Image(), // pioa
        new Image(), // piob
        new Image(), // pioc
        new Image()  // pioz
    ];
    
    escenariosPio[0].src = 'pioa.jpg'; 
    escenariosPio[1].src = 'piob.jpg';
    escenariosPio[2].src = 'pioc.jpg';
    escenariosPio[3].src = 'pioz.jpg';

    // Jugador
    const jugador = { x: 180, y: 550, ancho: 50, alto: 50, vx: 0 };
    let obstaculosPio = [];
    let tiempoCreacion = 0;

    function actualizar() {
        if (!juegoActivo) return;

        // Movimiento horizontal del jugador
        jugador.x += jugador.vx;
        if (jugador.x < 20) jugador.x = 20;
        if (jugador.x + jugador.ancho > canvas.width - 20) jugador.x = canvas.width - 20 - jugador.ancho;

        // Generar obstáculos
        tiempoCreacion++;
        if (tiempoCreacion > 60) {
            obstaculosPio.push({
                x: Math.random() * (canvas.width - 80) + 20,
                y: -40,
                ancho: 40,
                alto: 40,
                velocidadY: 3 + Math.floor(puntaje / 100)
            });
            tiempoCreacion = 0;
        }

        // Actualizar obstáculos
        for (let i = 0; i < obstaculosPio.length; i++) {
            let obs = obstaculosPio[i];
            obs.y += obs.velocidadY;

            // Colisión
            if (
                jugador.x < obs.x + obs.ancho &&
                jugador.x + jugador.ancho > obs.x &&
                jugador.y < obs.y + obs.alto &&
                jugador.y + jugador.alto > obs.y
            ) {
                vidas--;
                actualizarCorazonesUI();
                obstaculosPio.splice(i, 1);
                i--;

                if (vidas <= 0) {
                    juegoActivo = false;
                    alert("¡Te atraparon en la aventura de Pio! Game Over.");
                    document.location.reload();
                    return;
                }
            }

            // Pasar de largo y sumar puntos
            if (obs.y > canvas.height) {
                obstaculosPio.splice(i, 1);
                i--;
                puntaje += 10;
                if (scoreSpan) scoreSpan.innerText = puntaje;
            }
        }
    }

    function renderizar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // LÓGICA DE TRANSICIÓN DE ESCENARIOS SEGÚN EL PUNTAJE
        let indiceFondo = Math.floor(puntaje / 100);
        if (indiceFondo > 3) indiceFondo = 3; 

        let fondoActual = escenariosPio[indiceFondo];

        if (fondoActual.complete && fondoActual.naturalWidth !== 0) {
            ctx.drawImage(fondoActual, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "#11052c";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Renderizar obstáculos
        ctx.fillStyle = "#e74c3c";
        for (let obs of obstaculosPio) {
            ctx.fillRect(obs.x, obs.y, obs.ancho, obs.alto);
        }

        // Renderizar Jugador
        ctx.fillStyle = "#00e5ff";
        ctx.fillRect(jugador.x, jugador.y, jugador.ancho, jugador.alto);
    }

    function loop() {
        actualizar();
        renderizar();
        if (juegoActivo) requestAnimationFrame(loop);
    }

    // Controles en pantalla
    document.getElementById('btn-left').onclick = () => { jugador.vx = -5; };
    document.getElementById('btn-right').onclick = () => { jugador.vx = 5; };
    document.getElementById('btn-jump').onclick = () => { /* Salto opcional */ };
    
    // Controles de teclado
    window.onkeydown = (e) => {
        if (e.key === 'ArrowLeft') jugador.vx = -5;
        if (e.key === 'ArrowRight') jugador.vx = 5;
    };
    window.onkeyup = (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') jugador.vx = 0;
    };

    loop();
}
