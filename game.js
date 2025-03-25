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

// Load power-up image
const starImg = new Image();
starImg.src = "https://i.postimg.cc/k2R3bf0L/star-removebg-preview.png";

// Game variables
let score = 0;
let level = 1;
let lives = 3;
let gameOver = false;
let powerUps = [];
let coinsRequiredForNextLevel = 5;

// Sound effects
const coinSound = new Audio("https://www.fesliyanstudios.com/play-mp3/2");
const hitSound = new Audio("https://www.fesliyanstudios.com/play-mp3/3");
const powerUpSound = new Audio("https://www.fesliyanstudios.com/play-mp3/4");
const gameOverSound = new Audio("https://www.fesliyanstudios.com/play-mp3/5");

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
        this.width = 30;
        this.height = 30;
        this.type = type;
    }

    draw() {
        if (this.type === "star") {
            ctx.drawImage(starImg, this.x, this.y, this.width, this.height);
        } else {
            if (this.type === "shield") {
                ctx.fillStyle = "blue";
            } else if (this.type === "speed") {
                ctx.fillStyle = "green";
            }
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

// Initialize objects
let dragon = new Dragon();
let coins = Array.from({ length: coinsRequiredForNextLevel }, () => new Coin());
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
    coins = Array.from({ length: coinsRequiredForNextLevel + level }, () => new Coin());
    enemies = Array.from({ length: level }, () => new Enemy());
    powerUps = [];
    score += 10;
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
                if (Math.random() < 0.2) powerUps.push(new PowerUp("speed"));
                if (Math.random() < 0.2) powerUps.push(new PowerUp("star"));
            }
        }

        // Check power-up collection
        for (let i = 0; i < powerUps.length; i++) {
            if (isColliding(dragon, powerUps[i])) {
                powerUps.splice(i, 1);
                powerUpSound.play();
                if (powerUps[i].type === "shield") {
                    dragon.ability = "shield";
                } else if (powerUps[i].type === "speed") {
                    dragon.speed = 8;
                } else if (powerUps[i].type === "star") {
                    score += 50; // Increase score with star
                }
            }
        }

        // Check enemy collision
        for (let enemy of enemies) {
            enemy.move();
            if (isColliding(dragon, enemy)) {
                if (dragon.ability === "shield") {
                    dragon.ability = "none";
                } else {
                    hitSound.play();
                    lives -= 1;
                    if (lives <= 0) {
                        gameOver = true;
                        gameOverSound.play();
                        showGameOverScreen();
                    }
                    resetLevel();
                }
            }
        }

        // Level progression
        if (coins.length === 0) {
            showNextLevelScreen();
        }
    }
}

// Show Game Over Screen
function showGameOverScreen() {
    document.getElementById("gameOverScreen").classList.remove("hidden");
}

// Show Next Level Screen
function showNextLevelScreen() {
    document.getElementById("nextLevelScreen").classList.remove("hidden");
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dynamic background for each level
    if (level === 1) {
        canvas.style.backgroundImage = "url('https://i.postimg.cc/L6wN945n/Colorful-Abstract-Dancing-Image-Dance-Studio-Logo.jpg')";
    } else if (level === 2) {
        canvas.style.backgroundImage = "url('https://www.example.com/level2-bg.jpg')";
    } else {
        canvas.style.backgroundImage = "url('https://www.example.com/level3-bg.jpg')";
    }

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

// Restart the game
document.getElementById("restartButton").addEventListener("click", () => {
    score = 0;
    level = 1;
    lives = 3;
    gameOver = false;
    resetLevel();
    document.getElementById("gameOverScreen").classList.add("hidden");
    gameLoop();
});

// Next Level
document.getElementById("nextLevelButton").addEventListener("click", () => {
    level += 1;
    coinsRequiredForNextLevel += 2; // Increase coins needed for next level
    resetLevel();
    document.getElementById("nextLevelScreen").classList.add("hidden");
    gameLoop();
});

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
