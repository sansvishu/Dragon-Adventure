const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas size dynamically
function resizeCanvas() {
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.7;
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

// Sound effects
const coinSound = new Audio("https://www.fesliyanstudios.com/play-mp3/2");
const hitSound = new Audio("https://www.fesliyanstudios.com/play-mp3/7");

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

// Initialize objects
let dragon = new Dragon();
let keys = {};

// Key event listeners
window.addEventListener("keydown", (e) => (keys[e.key] = true));
window.addEventListener("keyup", (e) => (keys[e.key] = false));

// Collision detection
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
                    resetLevel();
                    showNextLevelScreen();
                }
            }
        }

        // Enemy collision
        for (let enemy of enemies) {
            enemy.move();
            if (isColliding(dragon, enemy)) {
                hitSound.play();
                lives -= 1;
                if (lives <= 0) {
                    gameOver = true;
                    showGameOverScreen();
                }
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
}

// Game loop
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
}

// Go to next level
function nextLevel() {
    document.getElementById("nextLevelScreen").classList.add("hidden");
    resetLevel();
}

// Reset the level
function resetLevel() {
    coins = Array.from({ length: coinsRequiredForNextLevel }, () => new Coin());
    enemies = Array.from({ length: enemyCount }, () => new Enemy());
}
