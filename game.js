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

// Game variables
let score = 0;
let level = 1;
let lives = 3;
let gameOver = false;
let powerUps = [];

// Sound effects
const coinSound = new Audio("https://www.fesliyanstudios.com/play-mp3/2");
const hitSound = new Audio("https://www.fesliyanstudios.com/play-mp3/3");
const powerUpSound = new Audio("https://www.fesliyanstudios.com/play-mp3/4");

// Dragon object
class Dragon {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 80;
        this.width = 50;
        this.height = 50;
        this.speed = 5;
        this.ability = "none";
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
let coins = Array.from({ length: 5 + level }, () => new Coin());
let enemies = Array.from({ length: level }, () => new Enemy());

// Key events
let keys = {};
window.addEventListener("keydown", (e) => (keys[e.key] = true));
window.addEventListener("keyup", (e) => (keys[e.key] = false));

// Check collisions
function isColliding(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// Reset level
function resetLevel() {
    coins = Array.from({ length: 5 + level }, () => new Coin());
    enemies = Array.from({ length: level }, () => new Enemy());
    powerUps = [];
}

// Game loop
function update() {
    if (!gameOver) {
        dragon.move();

        // Check coin collection
        for (let i = 0; i < coins.length; i++) {
            if (isColliding(dragon, coins[i])) {
                coins.splice(i, 1);
                score += 10;
                coinSound.play();
                if (Math.random() < 0.2) powerUps.push(new PowerUp("shield"));
            }
        }

        // Check power-up collection
        for (let i = 0; i < powerUps.length; i++) {
            if (isColliding(dragon, powerUps[i])) {
                powerUps.splice(i, 1);
                powerUpSound.play();
                lives += 1;
            }
        }

        // Check enemy collision
        for (let enemy of enemies) {
            enemy.move();
            if (isColliding(dragon, enemy)) {
                hitSound.play();
                lives -= 1;
                if (lives <= 0) gameOver = true;
                resetLevel();
            }
        }

        // Level progression
        if (coins.length === 0) {
            level += 1;
            resetLevel();
        }
    }
}

// Draw everything
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

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
