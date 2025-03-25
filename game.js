const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Dynamically set canvas size based on the window size
function resizeCanvas() {
    canvas.width = window.innerWidth * 0.8;  // 80% of the screen width
    canvas.height = window.innerHeight * 0.7;  // 70% of the screen height
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Load images
const dragonImg = new Image();
dragonImg.src = "https://i.postimg.cc/K3TvQxwh/dragon-removebg-preview.png";

const coinImg = new Image();
coinImg.src = "https://i.postimg.cc/0MbNMpCQ/gold-coin-removebg-preview.png";

const monsterImg = new Image();
monsterImg.src = "https://i.postimg.cc/0MFypbtC/monster-removebg-preview.png";

// Game variables
let score = 0;
let level = 1;
let lives = 3;
let gameOver = false;
let coinsRequiredForNextLevel = 5;
let enemiesSpeed = 1.5;
let enemyCount = 3;
let coins = [];
let enemies = [];
let powerUps = [];

// Sound effects
const coinSound = new Audio("https://www.fesliyanstudios.com/play-mp3/2");
const hitSound = new Audio("https://www.fesliyanstudios.com/play-mp3/7");
const powerUpSound = new Audio("https://www.fesliyanstudios.com/play-mp3/4");

// Dragon object
class Dragon {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 80;
        this.width = 50;
        this.height = 50;
        this.speed = 5;
    }

    move() {
        if (keys["ArrowLeft"] && this.x > 0) this.x -= this.speed;
        if (keys["ArrowRight"] && this.x < canvas.width - this.width) this.x += this.speed;
        if (keys["ArrowUp"] && this.y > 0) this.y -= this.speed;
        if (keys["ArrowDown"] && this.y < canvas.height - this.height) this.y += this.speed;

        // Mobile controls - swipe to move
        if (touchControls.moveLeft) this.x -= this.speed;
        if (touchControls.moveRight) this.x += this.speed;
        if (touchControls.moveUp) this.y -= this.speed;
        if (touchControls.moveDown) this.y += this.speed;
    }

    draw() {
        ctx.drawImage(dragonImg, this.x, this.y, this.width, this.height);
    }
}

// Coin object
class Coin {
    constructor() {
        this.x = Math.random() * (canvas.width - 20);
        this.y = Math.random() * (canvas.height - 100);
        this.width = 20;
        this.height = 20;
    }

    draw() {
        ctx.drawImage(coinImg, this.x, this.y, this.width, this.height);
    }
}

// Enemy object
class Enemy {
    constructor() {
        this.x = Math.random() * (canvas.width - 30);
        this.y = Math.random() * (canvas.height / 2);
        this.width = 30;
        this.height = 30;
        this.speed = enemiesSpeed;
    }

    move() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.y = 0;
            this.x = Math.random() * (canvas.width - this.width);
        }
    }

    draw() {
        ctx.drawImage(monsterImg, this.x, this.y, this.width, this.height);
    }
}

// Power-up object
class PowerUp {
    constructor(type) {
        this.x = Math.random() * (canvas.width - 30);
        this.y = Math.random() * (canvas.height - 100);
        this.width = 25;
        this.height = 25;
        this.type = type;
    }

    draw() {
        ctx.fillStyle = "yellow";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Initialize objects
let dragon = new Dragon();
let keys = {};
let touchControls = {};

// Key event listeners for desktop
window.addEventListener("keydown", (e) => (keys[e.key] = true));
window.addEventListener("keyup", (e) => (keys[e.key] = false));

// Touch event listeners for mobile
window.addEventListener("touchstart", (e) => handleTouchStart(e), false);
window.addEventListener("touchmove", (e) => handleTouchMove(e), false);
window.addEventListener("touchend", () => resetTouchControls(), false);

function handleTouchStart(e) {
    const touch = e.touches[0];
    touchControls.startX = touch.pageX;
    touchControls.startY = touch.pageY;
}

function handleTouchMove(e) {
    const touch = e.touches[0];
    const moveX = touch.pageX - touchControls.startX;
    const moveY = touch.pageY - touchControls.startY;

    if (Math.abs(moveX) > Math.abs(moveY)) {
        touchControls.moveLeft = moveX < 0;
        touchControls.moveRight = moveX > 0;
    } else {
        touchControls.moveUp = moveY < 0;
        touchControls.moveDown = moveY > 0;
    }
}

function resetTouchControls() {
    touchControls = {};
}

// Resize the canvas to fit screen size
function resizeCanvas() {
    canvas.width = window.innerWidth * 0.8; // 80% of the screen width
    canvas.height = window.innerHeight * 0.7; // 70% of the screen height
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Check collisions
function isColliding(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// Game update function
function update() {
    if (!gameOver) {
        dragon.move();

        // Collect coins
        for (let i = 0; i < coins.length; i++) {
            if (isColliding(dragon, coins[i])) {
                coins.splice(i, 1);
                score += 10;
                coinSound.play();
                if (coins.length === 0) {
                    level += 1;
                    coinsRequiredForNextLevel += 2; // Slightly more coins per level
                    enemyCount += 1; // Add one more enemy
                    resetLevel();
                    showNextLevelScreen();
                }
            }
        }

        // Move and draw enemies
        for (let enemy of enemies) {
            enemy.move();
            if (isColliding(dragon, enemy)) {
                hitSound.play();
                lives -= 1;
                if (lives <= 0) {
                    gameOver = true;
                    showGameOverScreen();
                }
                resetLevel();
            }
        }
    }
}

// Draw the game
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dragon.draw();
    coins.forEach((coin) => coin.draw());
    enemies.forEach((enemy) => enemy.draw());
    powerUps.forEach((power) => power.draw());

    // UI
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Lives: ${lives}`, 10, 60);
    ctx.fillText(`Level: ${level}`, 10, 90);

    if (gameOver) {
        ctx.fillText("Game Over! Refresh to restart", canvas.width / 2 - 100, canvas.height / 2);
    }
}

// Start the game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();

// Restart the game
function restartGame() {
    lives = 3;
    score = 0;
    level = 1;
    gameOver = false;
    resetLevel();
    document.getElementById("gameOverScreen").classList.add("hidden");
    gameLoop();
}

// Go to next level
function nextLevel() {
    document.getElementById("nextLevelScreen").classList.add("hidden");
    resetLevel();
    gameLoop();
}

// Reset the level
function resetLevel() {
    coins = Array.from({ length: coinsRequiredForNextLevel }, () => new Coin());
    enemies = Array.from({ length: enemyCount }, () => new Enemy());
    powerUps = [];
}

// Show Game Over screen
function showGameOverScreen() {
    document.getElementById("gameOverScreen").classList.remove("hidden");
}

// Show Next Level screen
function showNextLevelScreen() {
    document.getElementById("nextLevelScreen").classList.remove("hidden");
}
