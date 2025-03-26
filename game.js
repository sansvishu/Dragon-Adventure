const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const quitBtn = document.getElementById('quitBtn');
const restartBtn = document.getElementById('restartBtn');
const dragonSelectBtn = document.getElementById('dragonSelectBtn');

canvas.width = 800;
canvas.height = 600;

let score = 0;
let level = 1;
let gameActive = false;
let gameOver = false;
let dragonType = 'Fire';
let dragonSpeed = 5;
let lives = 3;

const dragon = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 50,
    height: 50,
    color: 'red',
    move: function() {
        if (gameActive) {
            if (keys.left && this.x > 0) this.x -= dragonSpeed;
            if (keys.right && this.x + this.width < canvas.width) this.x += dragonSpeed;
            if (keys.up && this.y > 0) this.y -= dragonSpeed;
            if (keys.down && this.y + this.height < canvas.height) this.y += dragonSpeed;
        }
    },
    draw: function() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
    }
};

// Input handling
let keys = {
    left: false,
    right: false,
    up: false,
    down: false
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
    if (e.key === 'ArrowUp') keys.up = true;
    if (e.key === 'ArrowDown') keys.down = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
    if (e.key === 'ArrowUp') keys.up = false;
    if (e.key === 'ArrowDown') keys.down = false;
});

// Start game function
function startGame() {
    score = 0;
    level = 1;
    lives = 3;
    gameActive = true;
    gameOver = false;
    dragon.x = canvas.width / 2;
    dragon.y = canvas.height - 100;
    gameLoop();
}

// Game loop
function gameLoop() {
    if (gameActive) {
        updateGame();
        drawGame();
        requestAnimationFrame(gameLoop);
    } else {
        displayGameOver();
    }
}

// Update game state
function updateGame() {
    dragon.move();
    // Add logic for enemies, gems, and collision detection
}

// Draw game elements
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dragon.draw();
    // Draw score, level, and other game elements
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);
    ctx.fillText('Level: ' + level, canvas.width - 100, 30);
    ctx.fillText('Lives: ' + lives, 10, 60);
}

// Handle game over
function displayGameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText('Game Over', canvas.width / 2 - 75, canvas.height / 2 - 20);
    ctx.fillText('Score: ' + score, canvas.width / 2 - 60, canvas.height / 2 + 20);
}

// Button event listeners
startBtn.addEventListener('click', startGame);
quitBtn.addEventListener('click', () => window.close());
restartBtn.addEventListener('click', startGame);
dragonSelectBtn.addEventListener('click', () => {
    // Implement dragon selection logic
    dragonType = dragonType === 'Fire' ? 'Ice' : 'Fire';
    dragon.color = dragonType === 'Fire' ? 'red' : 'blue';
});

