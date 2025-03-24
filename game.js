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
let currentDragon = "Fire";  // Default dragon
const FPS = 60;
let dragon;
let gems = [];
let enemies = [];

// Dragon properties
const dragons = {
    "Fire": { color: "red", ability: "Burn obstacles" },
    "Ice": { color: "blue", ability: "Freeze enemies" },
    "Earth": { color: "green", ability: "Dig through rocks" },
    "Storm": { color: "purple", ability: "Fly faster" }
};

// Dragon class
class Dragon {
    constructor(type) {
        this.type = type;
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

// Gem class
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

// Enemy class
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

// Background setup
const backgroundImage = new Image();
backgroundImage.src = "https://i.postimg.cc/63HnQPS3/Colorful-Abstract-Dancing-Image-Dance-Studio-Logo.jpg";

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    dragon.draw();
    gems.forEach(gem => gem.draw());
    enemies.forEach(enemy => enemy.draw());

    ctx.fillStyle = "white";
    ctx.font = "22px Comic Sans MS";
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Lives: ${lives}`, 10, 60);
    ctx.fillText(`Level: ${level}`, 10, 90);
    ctx.fillText(`Dragon: ${currentDragon}`, 10, 120);

    if (gameOver) {
        ctx.fillStyle = "red";
        ctx.font = "30px Comic Sans MS";
        ctx.fillText("GAME OVER!", canvas.width / 2 - 100, canvas.height / 2 - 30);
        ctx.fillText("Press Restart to play again.", canvas.width / 2 - 150, canvas.height / 2 + 30);
    }
}

const keys = {
    left: false,
    right: false,
    up: false,
    down: false
};

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") keys.left = true;
    if (e.key === "ArrowRight") keys.right = true;
    if (e.key === "ArrowUp") keys.up = true;
    if (e.key === "ArrowDown") keys.down = true;
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") keys.left = false;
    if (e.key === "ArrowRight") keys.right = false;
    if (e.key === "ArrowUp") keys.up = false;
    if (e.key === "ArrowDown") keys.down = false;
});

function resetLevel() {
    dragon = new Dragon(currentDragon);
    gems = Array.from({ length: 6 + level }, () => new Gem());
    enemies = Array.from({ length: level }, () => new Enemy());
}

function checkCollisions() {
    gems.forEach((gem, index) => {
        if (dragon.x < gem.x + gem.width && dragon.x + dragon.width > gem.x &&
            dragon.y < gem.y + gem.height && dragon.y + dragon.height > gem.y) {
            score += 10;
            gems.splice(index, 1);
            gems.push(new Gem());
        }
    });

    enemies.forEach((enemy) => {
        if (dragon.x < enemy.x + enemy.width && dragon.x + dragon.width > enemy.x &&
            dragon.y < enemy.y + enemy.height && dragon.y + dragon.height > enemy.y) {
            lives--;
            if (lives <= 0) {
                gameOver = true;
                document.getElementById("gameOverScreen").classList.remove("hidden");
            } else {
                resetLevel();
            }
        }
    });
}

function update() {
    if (!gameOver) {
        dragon.move();
        enemies.forEach(enemy => enemy.move());
        checkCollisions();
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

resetLevel();
gameLoop();
