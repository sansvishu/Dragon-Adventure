// Set up canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

// Game Variables
let score = 0;
let level = 1;
let lives = 3;
let gameOver = false;
let currentDragon = "Fire";  
let dragon;
let gems = [];
let enemies = [];

// Sounds
const gemSound = new Audio("https://freesound.org/data/previews/399/399303_5121236-lq.mp3");
const hitSound = new Audio("https://freesound.org/data/previews/341/341695_5121236-lq.mp3");

// Dragon Class
class Dragon {
    constructor() {
        this.width = 60;
        this.height = 60;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - 120;
        this.speed = 6;
        this.image = new Image();
        this.image.src = "https://i.postimg.cc/8scvWm2H/dragon-removebg-preview.png";
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

// Gem Class
class Gem {
    constructor() {
        this.width = 25;
        this.height = 25;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = Math.random() * (canvas.height - 150);
        this.image = new Image();
        this.image.src = "https://i.postimg.cc/hzy76XdT/gold-coin-removebg-preview.png";
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

// Enemy Class
class Enemy {
    constructor() {
        this.width = 50;
        this.height = 50;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -50;
        this.speed = Math.random() * 2 + 1;
        this.image = new Image();
        this.image.src = "https://i.postimg.cc/zHyRrqCM/monster-removebg-preview.png";
    }

    move() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.y = -50;
            this.x = Math.random() * (canvas.width - this.width);
        }
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

// Handle Collisions
function checkCollisions() {
    gems.forEach((gem, index) => {
        if (dragon.x < gem.x + gem.width && dragon.x + dragon.width > gem.x &&
            dragon.y < gem.y + gem.height && dragon.y + dragon.height > gem.y) {
            score += 10;
            gemSound.play();
            gems.splice(index, 1);
            gems.push(new Gem());
        }
    });

    enemies.forEach((enemy) => {
        if (dragon.x < enemy.x + enemy.width && dragon.x + dragon.width > enemy.x &&
            dragon.y < enemy.y + enemy.height && dragon.y + dragon.height > enemy.y) {
            lives--;
            hitSound.play();
            if (lives <= 0) {
                gameOver = true;
                document.getElementById("gameOverPopup").style.display = "block";
            }
        }
    });
}

// Update & Draw Loop
function gameLoop() {
    if (!gameOver) {
        dragon.move();
        enemies.forEach(enemy => enemy.move());
        checkCollisions();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

// Restart Game
document.getElementById("restartButton").addEventListener("click", () => {
    location.reload();
});

// Start Game
dragon = new Dragon();
gameLoop();
