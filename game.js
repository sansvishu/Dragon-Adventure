// Get the canvas element and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = 800;
const HEIGHT = 600;
canvas.width = WIDTH;
canvas.height = HEIGHT;

// Game variables
let dragon;
let gems = [];
let powerUps = [];
let monsters = [];
let score = 0;
let level = 1;
let gameOver = false;
let levelClear = false;

// Image assets
const dragonImg = new Image();
dragonImg.src = "https://i.postimg.cc/K3TvQxwh/dragon-removebg-preview.png";
const goldCoinImg = new Image();
goldCoinImg.src = "https://i.postimg.cc/0MbNMpCQ/gold-coin-removebg-preview.png";
const monsterImg = new Image();
monsterImg.src = "https://postimg.cc/0MFypbtC/monster-removebg-preview.png";
const powerUpImg = new Image();
powerUpImg.src = "https://postimg.cc/k2R3bf0L/star-removebg-preview.png";

// Backgrounds
const backgrounds = [
    "https://i.postimg.cc/C51pVZyt/Colorful-Abstract-Dancing-Image-Dance-Studio-Logo-1.png",
    "https://i.postimg.cc/Dy7kT6Kn/level-background2.png",
    "https://i.postimg.cc/3RJXzPS6/level-background3.png"
];

// Dragon Class
class Dragon {
    constructor() {
        this.x = WIDTH / 2;
        this.y = HEIGHT - 80;
        this.width = 50;
        this.height = 50;
        this.image = dragonImg;
        this.speed = 5;
    }

    move(direction) {
        switch (direction) {
            case "left":
                if (this.x > 0) this.x -= this.speed;
                break;
            case "right":
                if (this.x + this.width < WIDTH) this.x += this.speed;
                break;
            case "up":
                if (this.y > 0) this.y -= this.speed;
                break;
            case "down":
                if (this.y + this.height < HEIGHT) this.y += this.speed;
                break;
        }
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

// Gem Class (Gold Coin)
class Gem {
    constructor() {
        this.x = Math.random() * WIDTH;
        this.y = Math.random() * (HEIGHT - 150);
        this.width = 25;
        this.height = 25;
        this.image = goldCoinImg;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

// PowerUp Class
class PowerUp {
    constructor() {
        this.x = Math.random() * WIDTH;
        this.y = Math.random() * (HEIGHT - 150);
        this.width = 30;
        this.height = 30;
        this.image = powerUpImg;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

// Monster Class
class Monster {
    constructor() {
        this.x = Math.random() * WIDTH;
        this.y = -30;
        this.width = 50;
        this.height = 50;
        this.image = monsterImg;
        this.speed = Math.random() * 2 + 1; // Random speed
    }

    update() {
        this.y += this.speed;
        if (this.y > HEIGHT) {
            this.y = -30;
            this.x = Math.random() * WIDTH;
        }
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

// Level Clear Screen
function showLevelClear() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = "white";
    ctx.font = "36px Arial";
    ctx.fillText(`Level ${level} Clear!`, WIDTH / 2 - 120, HEIGHT / 2 - 50);
    ctx.fillText(`Score: ${score}`, WIDTH / 2 - 60, HEIGHT / 2);

    // Next Level Button
    const nextButton = document.createElement("button");
    nextButton.innerText = "Next Level";
    nextButton.style.position = "absolute";
    nextButton.style.left = "50%";
    nextButton.style.top = "50%";
    nextButton.style.transform = "translate(-50%, -50%)";
    nextButton.style.fontSize = "20px";
    nextButton.onclick = () => {
        levelClear = false;
        nextLevel();
        document.body.removeChild(nextButton);
    };
    document.body.appendChild(nextButton);
}

// Start Next Level
function nextLevel() {
    level++;
    monsters = [];
    gems = [];
    powerUps = [];
    gameOver = false;

    // Increase difficulty (example: more monsters, etc.)
    for (let i = 0; i < level + 2; i++) {
        monsters.push(new Monster());
    }

    for (let i = 0; i < level + 3; i++) {
        gems.push(new Gem());
    }

    // Change background based on level
    document.body.style.backgroundImage = `url(${backgrounds[level % backgrounds.length]})`;

    // Reinitialize the dragon
    dragon = new Dragon();
    gameLoop();
}

// Initialize game
function init() {
    dragon = new Dragon();
    gems.push(new Gem());
    monsters.push(new Monster());
    gameLoop();
}

// Game loop
function gameLoop() {
    if (gameOver) return;

    // Clear canvas
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Draw game objects
    dragon.draw();
    gems.forEach((gem) => gem.draw());
    monsters.forEach((monster) => {
        monster.update();
        monster.draw();
    });

    // Collision detection (Dragon and Gem)
    gems.forEach((gem, index) => {
        if (collision(dragon, gem)) {
            score += 10;
            gems.splice(index, 1); // Remove the gem
            gems.push(new Gem()); // Add new gem
        }
    });

    // Collision detection (Dragon and Monster)
    monsters.forEach((monster, index) => {
        if (collision(dragon, monster)) {
            gameOver = true;
            alert("Game Over!");
        }
    });

    // Check if all gems are collected
    if (gems.length === 0) {
        levelClear = true;
        showLevelClear();
    }

    // Request the next frame
    requestAnimationFrame(gameLoop);
}

// Collision detection function
function collision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// Start the game
init();
