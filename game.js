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

// Background and Dragon List
const backgrounds = [
    "https://i.postimg.cc/63HnQPS3/Colorful-Abstract-Dancing-Image-Dance-Studio-Logo.jpg",
    "https://i.postimg.cc/tCNpT6Jb/forest.jpg",
    "https://i.postimg.cc/8Pc9tHHV/desert.jpg"
];

const dragonTypes = [
    { name: "Fire", image: "https://i.postimg.cc/8scvWm2H/dragon-removebg-preview.png" },
    { name: "Ice", image: "https://i.postimg.cc/Y0sX7F2Q/ice-dragon.png" },
    { name: "Storm", image: "https://i.postimg.cc/KjKqJMQy/storm-dragon.png" }
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
        this.image.src = "https://i.postimg.cc/hzy76XdT/gold-coin-removebg-preview.png";
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
            coinsCollected++;
            gems.splice(index, 1);
            gems.push(new Gem());

            document.getElementById("coins").textContent = coinsCollected;
            document.getElementById("score").querySelector("span").textContent = score;

            if (coinsCollected >= coinTarget) {
                levelUp();
            }
        }
    });
}

// Level Up
function levelUp() {
    level++;
    coinTarget += 5;
    coinsCollected = 0;
    
    currentBackground = backgrounds[level % backgrounds.length];
    currentDragon = dragonTypes[level % dragonTypes.length];

    document.getElementById("level").textContent = level;
    document.getElementById("dragonType").textContent = currentDragon.name;
    document.getElementById("coinTarget").textContent = coinTarget;
    document.body.style.background = `url('${currentBackground}') no-repeat center center/cover`;

    dragon = new Dragon();
}

// Game Over Function
function endGame() {
    gameOver = true;
    document.getElementById("finalScore").textContent = score;
    document.getElementById("gameOverPopup").style.display = "block";
}

// Game Loop
function gameLoop() {
    if (!gameOver) {
        dragon.move();
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
document.getElementById("coinTarget").textContent = coinTarget;
dragon = new Dragon();
gems = Array.from({ length: 5 }, () => new Gem());
gameLoop();
