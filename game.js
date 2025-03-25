const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

let score = 0;
let level = 1;
let lives = 3;
let coinsCollected = 0;
let coinTarget = 10;
let gameOver = false;

const scoreDisplay = document.getElementById("score").querySelector("span");
const levelDisplay = document.getElementById("level");
const livesDisplay = document.getElementById("lives");
const dragonTypeDisplay = document.getElementById("dragonType");
const gameOverPopup = document.getElementById("gameOverPopup");
const levelUpPopup = document.getElementById("levelUpPopup");
const restartButton = document.getElementById("restartButton");
const continueButton = document.getElementById("continueButton");

const backgrounds = [
    "https://i.postimg.cc/63HnQPS3/Colorful-Abstract-Dancing-Image-Dance-Studio-Logo.jpg", 
    "https://i.postimg.cc/QC9bRzXY/desert.jpg",
    "https://i.postimg.cc/43MHQ6Ct/mountain.jpg"
];
const dragonTypes = [
    { name: "Fire", image: "https://i.postimg.cc/8scvWm2H/dragon-removebg-preview.png" },
    { name: "Ice", image: "https://i.postimg.cc/dQVy6YFZ/ice-dragon.png" },
    { name: "Storm", image: "https://i.postimg.cc/85C7XyYD/storm-dragon.png" }
];

let backgroundImage = new Image();
backgroundImage.src = backgrounds[0];

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

function draw() {
    ctx.clearRect(0, 0, canvas.width,
