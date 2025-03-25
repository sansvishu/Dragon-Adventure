// Set up canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

// Game Variables
let score = 0;
let level = 1;
let lives = 3;
let coinsCollected = 0;
let coinTarget = 10;
let gameOver = false;

// Elements
const scoreDisplay = document.getElementById("score").querySelector("span");
const levelDisplay = document.getElementById("level");
const livesDisplay = document.getElementById("lives");
const dragonTypeDisplay = document.getElementById("dragonType");
const gameOverPopup = document.getElementById("gameOverPopup");
const levelUpPopup = document.getElementById("levelUpPopup");
const restartButton = document.getElementById("restartButton");
const continueButton = document.getElementById("continueButton");

// Backgrounds & Dragons
const backgrounds = ["forest.jpg", "desert.jpg", "mountain.jpg"];
const dragonTypes = [
    { name: "Fire", image: "fire-dragon.png" },
    { name: "Ice", image: "ice-dragon.png" },
    { name: "Storm", image: "storm-dragon.png" }
];

let currentBackground = backgrounds[0];
let currentDragon = dragonTypes[0];

// Dragon Class
class Dragon {
    constructor() {
        this.width = 60;
        this.height = 60;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - 120;
        this.speed = 6;
        this.image = new Image();
        this.image.src = currentDragon.image;
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
        this.image.src = "coin.png";
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

// Check Collisions
function checkCollisions() {
    gems.forEach((gem, index) => {
        if (dragon.x < gem.x + gem.width && dragon.x + dragon.width > gem.x &&
            dragon.y < gem.y + gem.height && dragon.y + dragon.height > gem.y) {
            score += 10;
            coinsCollected++;
            gems.splice(index, 1);
            gems.push(new Gem());

            scoreDisplay.textContent = score;
            if (score % 200 === 0) levelUp();
        }
    });
}

// Level Up
function levelUp() {
    level++;
    levelDisplay.textContent = level;

    currentBackground = backgrounds[level % backgrounds.length];
    currentDragon = dragonTypes[level % dragonTypes.length];
    document.body.style.background = `url('${currentBackground}') no-repeat center center/cover`;

    dragonTypeDisplay.textContent = currentDragon.name;
    levelUpPopup.classList.remove("hidden");
}

// Game Over
function endGame() {
    gameOver = true;
    document.getElementById("finalScore").textContent = score;
    gameOverPopup.classList.remove("hidden");
}

// Restart Game
restartButton.addEventListener("click", () => {
    location.reload();
});

// Continue to Next Level
continueButton.addEventListener("click", () => {
    levelUpPopup.classList.add("hidden");
    dragon = new Dragon();
    gems = Array.from({ length: 5 }, () => new Gem());
    gameLoop();
});

// Start Game
dragon = new Dragon();
gems = Array.from({ length: 5 }, () => new Gem());
gameLoop();
