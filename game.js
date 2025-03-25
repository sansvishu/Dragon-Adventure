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
let isMultiplayer = false;  // Track if multiplayer is active

// Dragon properties
const dragons = {
    "Fire": { color: "red", ability: "Fireball", speed: 5 },
    "Ice": { color: "blue", ability: "Freeze", speed: 4 },
    "Earth": { color: "green", ability: "Shield", speed: 3 },
    "Storm": { color: "purple", ability: "Speed", speed: 6 }
};

// Dragon class
class Dragon {
    constructor(type, isPlayer2 = false) {
        this.type = type;
        this.isPlayer2 = isPlayer2;
        this.width = 50;
        this.height = 50;
        this.x = isPlayer2 ? canvas.width - this.width - 10 : canvas.width / 2 - this.width / 2;
        this.y = canvas.height - 100;
        this.speed = dragons[type].speed;
        this.image = new Image();
        this.image.src = `https://i.postimg.cc/8scvWm2H/dragon-removebg-preview.png`; // Use a shared image for now
        this.ability = dragons[type].ability;
    }

    move() {
        if (this.isPlayer2) {
            if (keys2.left && this.x > 0) this.x -= this.speed;
            if (keys2.right && this.x + this.width < canvas.width) this.x += this.speed;
            if (keys2.up && this.y > 0) this.y -= this.speed;
            if (keys2.down && this.y + this.height < canvas.height) this.y += this.speed;
        } else {
            if (keys.left && this.x > 0) this.x -= this.speed;
            if (keys.right && this.x + this.width < canvas.width) this.x += this.speed;
            if (keys.up && this.y > 0) this.y -= this.speed;
            if (keys.down && this.y + this.height < canvas.height) this.y += this.speed;
        }
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

// PowerUp class
class PowerUp {
    constructor() {
        this.width = 30;
        this.height = 30;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = Math.random() * (canvas.height - this.height);
        this.type = Math.random() < 0.5 ? "shield" : "speed";  // Random power-up type
        this.image = new Image();
        this.image.src = this.type === "shield" ? "shield.png" : "speed-boost.png"; // Use images for power-ups
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
        this.y = Math.random() * (canvas.height - 200);
        this.speed = Math.random() * 3 + 1;
        this.image = new Image();
        this.image.src = "https://i.postimg.cc/zHyRrqCM/monster-removebg-preview.png"; // Monster image
    }

    move() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.y = 0;
            this.x = Math.random() * (canvas.width - this.width);
        }
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

// Game Over screen
const gameOverScreen = document.getElementById("gameOverScreen");

// Game logic
let keys = { left: false, right: false, up: false, down: false };
let keys2 = { left: false, right: false, up: false, down: false };  // For player 2 in multiplayer

// Key events for player controls
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") keys.left = true;
    if (e.key === "ArrowRight") keys.right = true;
    if (e.key === "ArrowUp") keys.up = true;
    if (e.key === "ArrowDown") keys.down = true;

    if (e.key === "a") keys2.left = true;  // Player 2 controls (a-d-w-s)
    if (e.key === "d") keys2.right = true;
    if (e.key === "w") keys2.up = true;
    if (e.key === "s") keys2.down = true;
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") keys.left = false;
    if (e.key === "ArrowRight") keys.right = false;
    if (e.key === "ArrowUp") keys.up = false;
    if (e.key === "ArrowDown") keys.down = false;

    if (e.key === "a") keys2.left = false;
    if (e.key === "d") keys2.right = false;
    if (e.key === "w") keys2.up = false;
    if (e.key === "s") keys2.down = false;
});

// Reset level
function resetLevel() {
    dragon = new Dragon(currentDragon, isMultiplayer);
    gems = [];
    enemies = [];
    powerUps = [];

    for (let i = 0; i < 5 + level; i++) {
        gems.push(new Gem());
    }

    for (let i = 0; i < level; i++) {
        enemies.push(new Enemy());
    }

    for (let i = 0; i < 3; i++) {  // Add some power-ups
        powerUps.push(new PowerUp());
    }
}

// Check for collisions
function checkCollisions() {
    // Check for gem collection
    gems.forEach((gem, index) => {
        if (dragon.x < gem.x + gem.width && dragon.x + dragon.width > gem.x &&
            dragon.y < gem.y + gem.height && dragon.y + dragon.height > gem.y) {
            score += 10;
            gems.splice(index, 1);
            gems.push(new Gem());  // New gem after collection
        }
    });

    // Check for power-up collection
    powerUps.forEach((powerUp, index) => {
        if (dragon.x < powerUp.x + powerUp.width && dragon.x + dragon.width > powerUp.x &&
            dragon.y < powerUp.y + powerUp.height && dragon.y + dragon.height > powerUp.y) {
            if (powerUp.type === "shield") {
                // Apply shield logic here
            } else if (powerUp.type === "speed") {
                // Apply speed boost logic here
            }
            powerUps.splice(index, 1);  // Remove power-up after collection
        }
    });

    // Check for enemy collision
    enemies.forEach((enemy) => {
        if (dragon.x < enemy.x + enemy.width && dragon.x + dragon.width > enemy.x &&
            dragon.y < enemy.y + enemy.height && dragon.y + dragon.height > enemy.y) {
            lives--;
            if (lives <= 0) {
                gameOver = true;
                gameOverScreen.classList.remove("hidden");
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

// Draw the game
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dragon.draw();
    gems.forEach(gem => gem.draw());
    enemies.forEach(enemy => enemy.draw());
    powerUps.forEach(powerUp => powerUp.draw());

    // Draw UI (score, level, lives)
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Lives: ${lives}`, 10, 60);
    ctx.fillText(`Level: ${level}`, 10, 90);
    ctx.fillText(`Dragon: ${currentDragon}`, 10, 120);

    // Show game over text
    if (gameOver) {
        ctx.fillStyle = "red";
        ctx.font = "30px Arial";
        ctx.fillText("GAME OVER!", canvas.width / 2 - 100, canvas.height / 2 - 30);
        ctx.fillText("Press Restart to play again.", canvas.width / 2 - 150, canvas.height / 2 + 30);
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
    gameOverScreen.classList.add("hidden"); // Hide restart button
});
