// Configuración principal del juego Phaser
const config = {
    type: Phaser.AUTO,
    width: 800, // Ancho del lienzo del juego
    height: 600, // Alto del lienzo del juego
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 }, // Gravedad para el jugador
            debug: false // Cambiar a true para ver cajas de colisión
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Inicializar el juego
const game = new Phaser.Game(config);

// Variables globales para el estado del juego
let player;
let platforms;
let cursors;
let barrels;
let score = 0;
let scoreText;
let gameOver = false;
let waterfall;

// 1. PRELOAD: Cargar todos los activos de imagen
function preload() {
    // Cargar las dos imágenes para la animación del fondo (efecto cascada)
    this.load.image('cascada1', 'assets/cascada_fondo_1.png');
    this.load.image('cascada2', 'assets/cascada_fondo_2.png');
    
    // Cargar los activos de juego individuales
    this.load.image('plataforma', 'assets/plataforma_larga.png');
    this.load.image('barril', 'assets/barril_sprite.png');
    this.load.image('puente', 'assets/puente_meta.png');
}

// 2. CREATE: Configurar la escena y los objetos
function create() {
    // --- ANIMACIÓN DE FONDO ---
    // Crear un sprite animado para el fondo
    // Las imágenes originales son estrechas (ej. 273px), las escalamos para cubrir el ancho 800
    waterfall = this.add.sprite(400, 300, 'cascada1');
    waterfall.setScale(2.95, 2.5); // Ajuste de escala para cubrir 800x600

    // Definir la animación que alterna entre las dos imágenes de la cascada
    this.anims.create({
        key: 'flow',
        frames: [
            { key: 'cascada1' },
            { key: 'cascada2' }
        ],
        frameRate: 4, // Velocidad de la animación (cambios por segundo)
        repeat: -1 // Repetir infinitamente
    });

    // Iniciar la animación de fondo
    waterfall.anims.play('flow');

    // --- GRUPOS DE FÍSICA ---
    // Grupo estático para plataformas (no se mueven ni caen)
    platforms = this.physics.add.staticGroup();

    // Crear plataformas base (usando la imagen 'plataforma')
    // Colocamos varias para simular la estructura de la imagen de referencia
    platforms.create(400, 580, 'plataforma').setScale(2).refreshBody(); // Suelo
    platforms.create(100, 450, 'plataforma').setScale(0.5, 1).refreshBody(); // Plataforma izquierda
    platforms.create(700, 350, 'plataforma').setScale(0.5, 1).refreshBody(); // Plataforma derecha
    platforms.create(150, 220, 'plataforma').setScale(0.8, 1).refreshBody(); // Plataforma alta izquierda
    
    // Crear el puente de meta final
    const puente = platforms.create(650, 100, 'puente');
    puente.setScale(1.5);
    puente.body.setSize(puente.width * 0.8, puente.height * 0.5, true); // Ajustar colisión del puente

    // Grupo dinámico para los barriles que caen
    barrels = this.physics.add.group();

    // --- JUGADOR ---
    // Crear un sprite de jugador simple (usaremos el barril como marcador de posición del jugador)
    player = this.physics.add.sprite(100, 450, 'barril');
    // El barril es muy grande, lo escalamos para que parezca un personaje pequeño
    player.setScale(0.3); 
    
    // Propiedades del jugador
    player.setBounce(0.1); // Pequeño rebote al caer
    player.setCollideWorldBounds(true); // No puede salir de la pantalla
    player.body.setSize(player.width * 0.8, player.height * 0.8, true); // Ajustar colisión del jugador

    // --- CONTROLES ---
    // Configurar las teclas de flecha predeterminadas
    cursors = this.input.keyboard.createCursorKeys();

    // --- EVENTOS Y COLISIONES ---
    // Colisión entre jugador y plataformas
    this.physics.add.collider(player, platforms);
    
    // Colisión entre barriles y plataformas (para que no sigan cayendo al suelo)
    this.physics.add.collider(barrels, platforms);

    // Colisión entre jugador y barriles (si se tocan, el jugador pierde)
    this.physics.add.collider(player, barrels, hitBarrel, null, this);

    // --- LÓGICA DE JUEGO ---
    // Temporizador para crear nuevos barriles cada 0.8 segundos
    this.time.addEvent({
        delay: 800,
        callback: addBarrel,
        callbackScope: this,
        loop: true
    });

    // Puntuación en pantalla
    scoreText = this.add.text(16, 16, 'Ascenso: 0', { fontSize: '32px', fill: '#000' });
}

// 3. UPDATE: Bucle principal del juego, se ejecuta 60 veces por segundo
function update() {
    // Si el juego ha terminado, detener la actualización
    if (gameOver) {
        return;
    }

    // Lógica de movimiento del jugador
    if (cursors.left.isDown) {
        player.setVelocityX(-160); // Mover a la izquierda
    } else if (cursors.right.isDown) {
        player.setVelocityX(160); // Mover a la derecha
    } else {
        player.setVelocityX(0); // Detener movimiento horizontal
    }

    // Lógica de salto (solo si el jugador está tocando el suelo)
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-450); // Impulso hacia arriba
    }

    // Incrementar puntuación mientras el jugador sube (basado en la posición Y)
    // Cuanto más baja sea la coordenada Y, mayor es la puntuación
    score = Math.floor((600 - player.y) * 0.5);
    scoreText.setText('Ascenso: ' + score);

    // Comprobar si el jugador ha alcanzado el puente (meta)
    if (player.y <= 80 && player.x > 550 && player.x < 750) {
        endGame(true);
    }
    
    // Comprobar si el jugador ha caído al fondo
    if (player.y >= 580) {
        endGame(false);
    }
}

// --- FUNCIONES AUXILIARES ---

// Función para añadir un nuevo barril que cae
function addBarrel() {
    // Posición X aleatoria a lo largo de la parte superior
    const x = Phaser.Math.Between(50, 750);
    // Crear el barril
    const barrel = barrels.create(x, -50, 'barril');
    barrel.setScale(0.3); // Escalar el barril
    barrel.setVelocityY(Phaser.Math.Between(200, 400)); // Velocidad de caída aleatoria
    barrel.setAngularVelocity(Phaser.Math.Between(-150, 150)); // Rotación aleatoria
    barrel.setCollideWorldBounds(true); // Rebotar en los límites
    barrel.body.onWorldBounds = true; // Habilitar detección de rebote
    
    // Eliminar el barril automáticamente cuando toque el suelo (para liberar memoria)
    this.physics.world.on('worldbounds', function(body) {
        if (body.gameObject === barrel) {
            barrel.destroy();
        }
    });
}

// Función que se ejecuta si el jugador choca con un barril
function hitBarrel(player, barrel) {
    // Detener el movimiento del jugador
    this.physics.pause();
    // Cambiar el color del jugador a rojo para indicar el golpe
    player.setTint(0xff0000);
    // Finalizar el juego
    endGame(false);
}

// Función para finalizar el juego
function endGame(win) {
    gameOver = true;
    
    // Detener la animación de fondo
    waterfall.anims.stop();
    
    // Mostrar mensaje de fin de juego
    let message = win ? '¡HAS GANADO!\nPresiona F5 para reiniciar' : '¡HAS PERDIDO!\nPresiona F5 para reiniciar';
    const finalMessage = this.add.text(400, 300, message, { fontSize: '64px', fill: '#fff', align: 'center' });
    finalMessage.setOrigin(0.5);
}
