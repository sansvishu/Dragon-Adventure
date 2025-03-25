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
let powerUps = [];

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
        this.width = 50;
        this.height = 50;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - 100;
        this.speed = 5;
        this.image = new Image();
        this.image.src = "https://i.postimg.cc/8scvWm2H/dragon-removebg-preview.png"; // Updated Dragon image
    }

    move() {
        if (keys.left && this.x > 0) this.x -= this.speed;
        if (keys.right && this.x + this.width < canvas.width) this.x += this.speed;
        if (keys.up && this.y > 0) this.y -= this.speed;
        if (keys.down && this.y + this.height < canvas.height) this.y += this.speed;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height); // Draw the dragon image
    }
}

// Gem class
class Gem {
    constructor() {
        this.width = 20;
        this.height = 20;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = Math.random() * (canvas.height - 100);
        this.image = new Image();
        this.image.src = "https://i.postimg.cc/hzy76XdT/gold-coin-removebg-preview.png"; // Updated Gold Coin image
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height); // Draw the coin image
    }
}

// Power-Up class (e.g., shield, speed boost)
class PowerUp {
    constructor(type) {
        this.width = 30;
        this.height = 30;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = Math.random() * (canvas.height - 100);
        this.type = type;
        this.image = new Image();
        if (type === "shield") {
            this.image.src = "https://i.postimg.cc/Vv9wZm6w/shield.png"; // Example shield power-up
        } else if (type === "speed") {
            this.image.src = "https://i.postimg.cc/vH9msmvX/speed-boost.png"; // Example speed boost power-up
        }
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height); // Draw the power-up image
    }
}

// Enemy class
class Enemy {
    constructor() {
        this.width = 50;
        this.height = 50;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = Math.random() * (canvas.height - 200);
        this.speed = Math.random() * 3 + 1;
        this.image = new Image();
        this.image.src = "https://i.postimg.cc/zHyRrqCM/monster-removebg-preview.png"; // Updated Monster image
    }

    move() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.y = 0;
            this.x = Math.random() * (canvas.width - this.width);
        }
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height); // Draw the monster image
    }
}

// Background setup with animation
let backgroundY = 0;
const backgroundImage = new Image();
backgroundImage.src = "https://i.postimg.cc/gJGn8KRZ/backgroudn-of-game.jpg"; // Updated Background image

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Animated background (scrolling effect)
    backgroundY += 1;
    if (backgroundY > canvas.height) backgroundY = 0;
    ctx.drawImage(backgroundImage, 0, backgroundY, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, backgroundY - canvas.height, canvas.width, canvas.height);

    // Draw dragon, gems, enemies, power-ups
    dragon.draw();
    gems.forEach(gem => gem.draw());
    enemies.forEach(enemy => enemy.draw());
    powerUps.forEach(powerUp => powerUp.draw());

    // Draw UI (score, lives, level)
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Lives: ${lives}`, 10, 60);
    ctx.fillText(`Level: ${level}`, 10, 90);
    ctx.fillText(`Dragon: ${currentDragon}`, 10, 120);

    // Draw game over text
    if (gameOver) {
        ctx.fillStyle = "red";
        ctx.font = "30px Arial";
        ctx.fillText("GAME OVER!", canvas.width / 2 - 100, canvas.height / 2 - 30);
        ctx.fillText("Press Restart to play again.", canvas.width / 2 - 150, canvas.height / 2 + 30);
    }
}

// Handle key presses
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

// Reset level
function resetLevel() {
    dragon = new Dragon(currentDragon);
    gems = [];
    enemies = [];
    powerUps = [];

    for (let i = 0; i < 5 + level; i++) {
        gems.push(new Gem());
    }

    for (let i = 0; i < level; i++) {
        enemies.push(new Enemy());
    }

    // Introduce power-ups (randomly)
    if (Math.random() < 0.1) {
        powerUps.push(new PowerUp("shield"));
    }
    if (Math.random() < 0.1) {
        powerUps.push(new PowerUp("speed"));
    }
}

// Check collisions
function checkCollisions() {
    // Check if dragon collects gems
    gems.forEach((gem, index) => {
        if (dragon.x < gem.x + gem.width && dragon.x + dragon.width > gem.x &&
            dragon.y < gem.y + gem.height && dragon.y + dragon.height > gem.y) {
            score += 10;
            gems.splice(index, 1);
            gems.push(new Gem());  // Spawn a new gem
        }
    });

    // Check if dragon collects power-ups
    powerUps.forEach((powerUp, index) => {
        if (dragon.x < powerUp.x + powerUp.width && dragon.x + dragon.width > powerUp.x &&
            dragon.y < powerUp.y + powerUp.height && dragon.y + dragon.height > powerUp.y) {
            if (powerUp.type === "shield") {
                // Give the dragon a shield for a limited time
                console.log("Shield activated!");
            } else if (powerUp.type === "speed") {
                // Boost the dragon's speed temporarily
                console.log("Speed Boost!");
            }
            powerUps.splice(index, 1);
        }
    });

    // Check if dragon hits enemy
    enemies.forEach((enemy) => {
        if (dragon.x < enemy.x + enemy.width && dragon.x + dragon.width > enemy.x &&
            dragon.y < enemy.y + enemy.height && dragon.y + dragon.height > enemy.y) {
            lives--;
            if (lives <= 0) {
                gameOver = true;
                document.getElementById("gameOverScreen").classList.remove("hidden"); // Show restart button
            } else {
                resetLevel();
            }
        }
    });
}

// Update game logic
function update() {
    if (!gameOver) {
        dragon.move();
        enemies.forEach(enemy => enemy.move());
        checkCollisions();

        if (gems.length === 0) {
            level++;
            resetLevel();
        }
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

resetLevel();
gameLoop();

// Restart game
document.getElementById("restartButton").addEventListener("click", () => {
    gameOver = false;
    score = 0;
    level = 1;
    lives = 3;
    resetLevel();
    document.getElementById("gameOverScreen").classList.add("hidden"); // Hide restart button
});
