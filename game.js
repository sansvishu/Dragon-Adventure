const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

// Load images
const dragonImg = new Image();
dragonImg.src = "https://i.postimg.cc/K3TvQxwh/dragon-removebg-preview.png";

const coinImg = new Image();
coinImg.src = "https://i.postimg.cc/0MbNMpCQ/gold-coin-removebg-preview.png";

const monsterImg = new Image();
monsterImg.src = "https://i.postimg.cc/0MFypbtC/monster-removebg-preview.png";

const powerUpImg = new Image();
powerUpImg.src = "https://i.postimg.cc/k2R3bf0L/star-removebg-preview.png";

// Sound effects
const coinSound = new Audio("coin.mp3");
const hitSound = new Audio("hit.mp3");
const powerUpSound = new Audio("powerup.mp3");
const gameOverSound = new Audio("gameover.mp3");
const winSound = new Audio("win.mp3");

// Game variables
let score = 0;
let level = 1;
let lives = 3;
let coinsNeeded = 5;
let gameOver = false;
let gameWin = false;
let powerUp = null;

// Power-Up types
const powerUps = ["Speed Boost", "Shield", "Extra Life"];

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

class Enemy {
    constructor() {
        this.x = Math.random() * (canvas.width - 30);
        this.y = Math.random() * (canvas.height / 2);
        this.width = 30;
        this.height = 30;
        this.speed = Math.random() * 3 + 1;
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

class PowerUp {
    constructor() {
        this.x = Math.random() * (canvas.width - 20);
        this.y = Math.random() * (canvas.height - 100);
        this.width = 30;
        this.height = 30;
        this.type = powerUps[Math.floor(Math.random() * powerUps.length)];
    }

    draw() {
        ctx.drawImage(powerUpImg, this.x, this.y, this.width, this.height);
    }
}

// Initialize objects
let dragon = new Dragon();
let coins = Array.from({ length: coinsNeeded }, () => new Coin());
let enemies = Array.from({ length: level }, () => new Enemy());
let powerUpItem = new PowerUp();

// Check for power-up collection
function checkPowerUp() {
    if (isColliding(dragon, powerUpItem)) {
        powerUpSound.play();
        powerUp = powerUpItem.type;
        document.getElementById("powerUpStatus").textContent = powerUp;
        if (powerUp === "Speed Boost") dragon.speed = 8;
        if (powerUp === "Extra Life") lives += 1;
        powerUpItem = null;
    }
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dragon.move();
    dragon.draw();
    coins.forEach((coin) => coin.draw());
    enemies.forEach((enemy) => enemy.move() && enemy.draw());
    if (powerUpItem) powerUpItem.draw();
    checkPowerUp();
    requestAnimationFrame(gameLoop);
}

gameLoop();
