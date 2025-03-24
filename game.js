const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// DOM Elements
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const quitBtn = document.getElementById('quitBtn');
const restartBtn = document.getElementById('restartBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

// Resize the canvas to fit the screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.7;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Game variables
let score = 0;
let level = 1;
let lives = 3;
let gameActive = false;
let dragon = null;
let objects = [];  // Objects to fall

// Game states
const gameState = {
    START_SCREEN: 'start',
    GAME_ACTIVE: 'active',
    GAME_OVER: 'over'
};

let currentState = gameState.START_SCREEN;

// Create Dragon class
class Dragon {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 100;
        this.speed = 5;
        this.color = 'green';
        this.width = 50;
        this.height = 50;
        this.velocityX = 0;
    }

    move() {
        this.x += this.velocityX;

        // Boundaries check
        this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Create Falling Object class
class FallingObject {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = 0;
        this.speed = 3 + Math.random() * 2;  // Random speed for difficulty
        this.size = 30;
        this.color = '#ffeb3b';
    }

    fall() {
        this.y += this.speed;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    checkCollision(dragon) {
        const dx = this.x - dragon.x;
        const dy = this.y - dragon.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.size + dragon.width / 2;
    }
}

// Handle button presses for dragon movement
leftBtn.addEventListener('click', () => { dragon.velocityX = -dragon.speed; });
rightBtn.addEventListener('click', () => { dragon.velocityX = dragon.speed; });

// Stop movement when button is released
document.addEventListener('mouseup', () => {
    dragon.velocityX = 0;
});

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameActive) {
        // Update game objects
        dragon.move();
        dragon.draw();

        // Update falling objects
        for (let i = 0; i < objects.length; i++) {
            let obj = objects[i];
            obj.fall();
            obj.draw();

            // Check for collision with dragon
            if (obj.checkCollision(dragon)) {
                score += 10;
                objects.splice(i, 1);
                i--;
            }

            // Remove object if it goes out of bounds
            if (obj.y > canvas.height) {
                objects.splice(i, 1);
                i--;
                lives -= 1;
                if (lives <= 0) {
                    currentState = gameState.GAME_OVER;
                    document.getElementById('finalScore').textContent = score;
                }
            }
        }

        // Display score and lives
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.fillText('Score: ' + score, 20, 40);
        ctx.fillText('Lives: ' + lives, canvas.width - 120, 40);

        // Level Up Logic
        if (score >= level * 50) {
            level++;
            score = 0; // Reset score for next level
            lives = 3; // Reset lives for next level
        }

        // Randomly spawn new objects
        if (Math.random() < 0.02) {
            objects.push(new FallingObject());
        }
    }

    // Request the next frame of the game loop
    requestAnimationFrame(gameLoop);
}

// Start the game
function startGame() {
    dragon = new Dragon();
    currentState = gameState.GAME_ACTIVE;
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    gameActive = true;
    gameLoop();
}

// Restart the game
function restartGame() {
    score = 0;
    level = 1;
    lives = 3;
    currentState = gameState.START_SCREEN;
    startScreen.style.display = 'block';
    gameOverScreen.style.display = 'none';
}

// Quit the game
function quitGame() {
    window.location.reload();
}

// Event Listeners for buttons
startBtn.addEventListener('click', startGame);
quitBtn.addEventListener('click', quitGame);
restartBtn.addEventListener('click', restartGame);

// Initialize game state
function init() {
    gameOverScreen.style.display = 'none';
    startScreen.style.display = 'block';
}

init();
