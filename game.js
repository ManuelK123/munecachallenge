const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let platforms;
let cursors;
let barrels;
let score = 0;
let scoreText;
let gameOver = false;
let waterfall;

function preload() {
    // Carga de tus imágenes exactas
    this.load.image('fondo_cascada', 'assets/cascada_fondo_1.png');
    this.load.image('hoja_barriles', 'assets/barril_sprite.png');
    this.load.image('tronco_largo', 'assets/plataforma_larga.png');
    this.load.image('puente_meta', 'assets/puente_meta.png');
}

function create() {
    // --- FONDO ---
    waterfall = this.add.sprite(400, 300, 'fondo_cascada');
    waterfall.setScale(2.5);

    // --- PLATAFORMAS ---
    platforms = this.physics.add.staticGroup();

    // Suelo base inferior
    platforms.create(400, 580, 'tronco_largo').setScale(2).refreshBody(); 
    
    // Troncos intermedios para escalar
    platforms.create(200, 420, 'tronco_largo').setScale(0.6, 1).refreshBody(); 
    platforms.create(600, 270, 'tronco_largo').setScale(0.6, 1).refreshBody(); 
    
    // Puente de meta en la parte superior
    const puente = platforms.create(650, 110, 'puente_meta');
    puente.setScale(1.2);
    puente.body.setSize(puente.width * 0.8, puente.height * 0.5, true);

    // --- OBSTÁCULOS (Barriles) ---
    barrels = this.physics.add.group();

    // --- JUGADOR ---
    player = this.physics.add.sprite(100, 500, 'hoja_barriles');
    player.setCrop(0, 0, 120, 150); // Recorta el barril grande de tu imagen para usarlo de personaje
    player.setScale(0.3);
    player.setBounce(0.1);
    player.setCollideWorldBounds(true);
    player.body.setSize(player.width * 0.5, player.height * 0.5, true);

    // --- CONTROLES ---
    cursors = this.input.keyboard.createCursorKeys();

    // --- COLISIONES ---
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(barrels, platforms);
    this.physics.add.collider(player, barrels, hitBarrel, null, this);

    // --- GENERADOR DE BARRILES ---
    this.time.addEvent({
        delay: 800,
        callback: addBarrel,
        callbackScope: this,
        loop: true
    });

    scoreText = this.add.text(16, 16, 'NIVEL 5 - Ascenso: 0', { 
        fontSize: '28px', 
        fill: '#fff', 
        stroke: '#000', 
        strokeThickness: 4 
    });
}

function update() {
    if (gameOver) return;

    if (cursors.left.isDown) {
        player.setVelocityX(-180);
    } else if (cursors.right.isDown) {
        player.setVelocityX(180);
    } else {
        player.setVelocityX(0);
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-460);
    }

    score = Math.floor((600 - player.y) * 0.5);
    scoreText.setText('NIVEL 5 - Ascenso: ' + score);

    // Condición de victoria (llegar al puente superior)
    if (player.y <= 140 && player.x > 550 && player.x < 750) {
        endGame(true);
    }
    
    // Condición de derrota (caer)
    if (player.y >= 580) {
        endGame(false);
    }
}

function addBarrel() {
    const x = Phaser.Math.Between(150, 700);
    const barrel = barrels.create(x, -50, 'hoja_barriles');
    
    barrel.setCrop(450, 20, 40, 50); // Recorta uno de los barriles pequeños que caen
    barrel.setScale(0.8);
    barrel.setVelocityY(Phaser.Math.Between(250, 420));
    barrel.setAngularVelocity(Phaser.Math.Between(-150, 150));
    barrel.setCollideWorldBounds(true);
    
    barrel.body.onWorldBounds = true;
    this.physics.world.on('worldbounds', function(body) {
        if (body.gameObject === barrel) {
            barrel.destroy();
        }
    });
}

function hitBarrel(player, barrel) {
    this.physics.pause();
    player.setTint(0xff0000);
    endGame(false);
}

function endGame(win) {
    gameOver = true;
    let message = win ? '¡NIVEL 5 SUPERADO!\nPresiona F5 para reiniciar' : '¡HAS CAÍDO EN LA CASCADA!\nPresiona F5 para reiniciar';
    const finalMessage = this.add.text(400, 300, message, { 
        fontSize: '42px', 
        fill: '#fff', 
        align: 'center',
        stroke: '#000',
        strokeThickness: 6
    });
    finalMessage.setOrigin(0.5);
}
