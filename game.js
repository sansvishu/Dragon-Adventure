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
        this.width = 50;
        this.height = 50;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - 100;
        this.speed = 5;
        this.image = new Image();
        this.image.src = "https://i.postimg.cc/RN1Dt95K/dragon.jpg"; // Dragon image
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
        this.image.src = "https://i.postimg.cc/CRmrvNKK/gold-coin.jpg"; // Gold coin image
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height); // Draw the coin image
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
        this.image.src = "https://i.postimg.cc/NynJtjmq/Monster.png"; // Monster image
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

// Background setup
const backgroundImage = new Image();
backgroundImage.src = "https://i.postimg.cc/t1JS8x1N/background.png"; // Background image

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // Draw the background

    // Draw dragon, gems, and enemies
    dragon.draw();
    gems.forEach(gem => gem.draw());
    enemies.forEach(enemy => enemy.draw());

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
        ctx.fillText("GAME OVER! Press R to restart", canvas.width / 2 - 180, canvas.height / 2);
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

    for (let i = 0; i < 5 + level; i++) {
        gems.push(new Gem());
    }

    for (let i = 0; i < level; i++) {
        enemies.push(new Enemy());
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

    // Check if dragon hits enemy
    enemies.forEach((enemy) => {
        if (dragon.x < enemy.x + enemy.width && dragon.x + dragon.width > enemy.x &&
            dragon.y < enemy.y + enemy.height && dragon.y + dragon.height > enemy.y) {
            lives--;
            if (lives <= 0) {
                gameOver = true;
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
document.addEventListener("keydown", (e) => {
    if (e.key === "r" && gameOver) {
        gameOver = false;
        score = 0;
        level = 1;
        lives = 3;
        resetLevel();
    }
});
