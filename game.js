const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Dynamically set canvas size based on the window size
function resizeCanvas() {
    canvas.width = window.innerWidth * 0.8;  // 80% of the screen width
    canvas.height = window.innerHeight * 0.7;  // 70% of the screen height
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Load images
const dragonImg = new Image();
dragonImg.src = "https://i.postimg.cc/K3TvQxwh/dragon-removebg-preview.png";

const coinImg = new Image();
coinImg.src = "https://i.postimg.cc/0MbNMpCQ/gold-coin-removebg-preview.png";

const monsterImg = new Image();
monsterImg.src = "https://i.postimg.cc/0MFypbtC/monster-removebg-preview.png";

// Game variables
let score = 0;
let level = 1;
let lives = 5;
let gameOver = false;
let coinsRequiredForNextLevel = 5;
let enemiesSpeed = 1.5;
let enemyCount = 3;
let coins = [];
let enemies = [];
let powerUps = [];

// Sound effects
const coinSound = new Audio("https://www.fesliyanstudios.com/play-mp3/2");
const hitSound = new Audio("https://www.fesliyanstudios.com/play-mp3/7");
const powerUpSound = new Audio("https://www.fesliyanstudios.com/play-mp3/4");
const bgMusic = new Audio('https://www.example.com/playful-background-music.mp3');
bgMusic.loop = true;
bgMusic.play();

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

        // Mobile controls - swipe to move
        if (touchControls.moveLeft) this.x -= this.speed;
        if (touchControls.moveRight) this.x += this.speed;
        if (touchControls.moveUp) this.y -= this.speed;
        if (touchControls.moveDown) this.y += this.speed;
    }

    draw() {
        ctx.drawImage(dragonImg, this.x, this.y, this.width, this.height);
    }
}

// Coin object
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

// Enemy object
class Enemy {
    constructor() {
        this.x = Math.random() * (canvas.width - 30);
        this.y = Math.random() * (canvas.height / 2);
        this.width = 30;
        this.height = 30;
        this.speed = enemiesSpeed;
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

// Power-up object
class PowerUp {
    constructor(type) {
        this.x = Math.random() * (canvas.width - 30);
        this.y = Math.random() * (canvas.height - 100);
        this.width = 25;
        this.height = 25;
        this.type = type;
    }

    draw() {
        ctx.fillStyle = "yellow";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Initialize objects
let dragon = new Dragon();
let keys = {};
let touchControls = {};

// Key event listeners for desktop
window.addEventListener("keydown", (e) => (keys[e.key] = true));
window.addEventListener("keyup", (e) => (keys[e.key] = false));

// Touch event listeners for mobile
window.addEventListener("touchstart", (e) => handleTouchStart(e), false);
window.addEventListener("touchmove", (e) => handleTouchMove(e), false);
window.addEventListener("touchend", () => resetTouchControls(), false);

function handleTouchStart(e) {
    const touch = e.touches[0];
    touchControls.startX = touch.pageX;
    touchControls.startY = touch.pageY;
}

function handleTouchMove(e) {
    const touch = e.touches[0];
    const moveX = touch.pageX - touchControls.startX;
    const moveY = touch.pageY - touchControls.startY;

    if (Math.abs(moveX) > Math
