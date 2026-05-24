// Audio Controller Setup
window.addEventListener('click', () => {
    const music = document.getElementById('menu-music');
    
    // Check if music is already playing so it doesn't restart on every click
    if (music.paused) {
        music.volume = 0.4; // Sets volume to a comfortable 40%
        music.play().catch(error => {
            console.log("Audio playback failed due to browser restrictions:", error);
        });
    }
});

// Your existing game logic functions go right below here...
function startGame(mode) {
    console.log("Starting mode: " + mode);
    // Game mode logic will expand here
}

function openSettings() {
    console.log("Opening settings menu...");
}// Simple Navigation State Manager
function startGame(gameType) {
    console.log("Loading scene: " + gameType);
    
    if (gameType === 'memory') {
        alert("Muñeca says: Get ready to memorize the arrows!");
        // Your future Arrow Mini-Game Loop initialization goes here
    } else if (gameType === 'play') {
        alert("Opening Mini-Games Selector!");
    } else if (gameType === 'story') {
        alert("Once upon a time at UANE school...");
    }
}

function openSettings() {
    alert("Audio and Visual Options Panel");
}// Simple Navigation State Manager
function startGame(gameType) {
    console.log("Loading scene: " + gameType);
    
    if (gameType === 'memory') {
        alert("Muñeca says: Get ready to memorize the arrows!");
        // Your future Arrow Mini-Game Loop initialization goes here
    } else if (gameType === 'play') {
        alert("Opening Mini-Games Selector!");
    } else if (gameType === 'story') {
        alert("Once upon a time at UANE school...");
    }
}

function openSettings() {
    alert("Audio and Visual Options Panel");
}
