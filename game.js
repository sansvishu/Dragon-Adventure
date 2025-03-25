// Set up canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

// Game variables
let score = 0;
let level = 1;
let lives = 3;
let gameOver = false;
let coinsCollected = 0;
let coinTarget = 5; // Coins needed to complete level
let dragon;
let collectibles = [];
let enemies = [];

// Assets
const backgrounds = [
    "https://i.postimg.cc/63HnQPS3/Colorful-Abstract-Dancing-Image-Dance-Studio-Logo.jpg",
    "https://i.postimg.cc/gJ0QCBCF/background-level2.jpg"
];

const dragons = [
    "https://i.postimg.cc/8scvWm2H/dragon-removebg-preview.png",
    "https://i.postimg.cc/Dw6y5Bsb/dragon2.png"
];

const collectibleItems = [
    "https://i.postimg.cc/hzy76XdT/gold-coin-removebg-preview.png", // Coin
    "https://i.postimg.cc/C51pVZyt/Colorful-Abstract-Dancing-Image-Dance-Studio-Logo-1.png" // Necklace
];

// Background image
let backgroundImage = new Image();
backgroundImage.src = backgrounds[0];

// Dragon class
class Dragon {
    constructor() {
        this.width = 60;
        this.height = 60;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - 120;
        this.speed = 6;
        this.image = new Image();
        this.image.src = dragons[0];
    }

    move() {
        if (keys.left && this.x > 0) this.x -= this.speed;
        if (keys.right && this.x + this.width < canvas.width) this.x += this.speed;
        if (keys.up && this.y > 0) this.y -= this.speed;
        if (keys.down && this.y + this.height < canvas.height) this.y += this.speed;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

// Collectible class (Coins & Necklaces)
class Collectible {
    constructor(type) {
        this.width = 25;
        this.height = 25;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -50;
        this.speed = Math.random() * 2 + 1;
        this.image = new Image();
        this.image.src = collectibleItems[type];
    }

    move() {
        this.y += this.speed;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

// Enemy class
class Enemy {
    constructor() {
        this.width = 50;
        this.height = 50;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -50;
        this.speed = Math.random() * 2 + level;
        this.image = new Image();
        this.image.src = "https://i.postimg.cc/zHyRrqCM/monster-removebg-preview.png";
    }

    move() {
        this.y += this.speed;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

// Draw function
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    dragon.draw();
    collectibles.forEach(item => item.draw());
    enemies.forEach(enemy => enemy.draw());

    // UI Elements
    ctx.fillStyle = "black";
    ctx.font = "22px Arial";
    ctx.fillText(`Lives: ${lives}`, 10, 30);
    ctx.fillText(`Level: ${level}`, 10, 60);
    
    ctx.fillStyle = "darkbrown";
    ctx.fillText(`Score: ${score}`, canvas.width - 120, 30);

    if (gameOver) {
        document.getElementById("gameOverScreen").classList.remove("hidden");
    }
}

// Game logic
function update() {
    if (!gameOver) {
        dragon.move();
        collectibles.forEach(item => item.move());
        enemies.forEach(enemy => enemy.move());
        checkCollisions();
    }
}

// Collision checks
function checkCollisions() {
    collectibles.forEach((item, index) => {
        if (dragon.x < item.x + item.width && dragon.x + dragon.width > item.x &&
            dragon.y < item.y + item.height && dragon.y + dragon.height > item.y) {
            score += 10;
            coinsCollected++;
            collectibles.splice(index, 1);
            collectibles.push(new Collectible(Math.floor(Math.random() * 2)));
        }
    });

    if (coinsCollected >= coinTarget) {
        levelUp();
    }
}

// Level Up
function levelUp() {
    level++;
    coinsCollected = 0;
    coinTarget += 5;
    document.getElementById("levelNumber").innerText = level;
    document.getElementById("levelUpPopup").classList.remove("hidden");
    setTimeout(() => {
        document.getElementById("levelUpPopup").classList.add("hidden");
    }, 1500);
}

// Game Loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

dragon = new Dragon();
gameLoop();
