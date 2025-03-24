// Get elements
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const gameCanvas = document.getElementById("gameCanvas");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScore = document.getElementById("finalScore");
const startScreen = document.getElementById("startScreen");
const controls = document.getElementById("controls");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

const ctx = gameCanvas.getContext("2d");

let dragonX = gameCanvas.width / 2 - 50;
let dragonY = gameCanvas.height - 60;
let dragonSpeed = 15;
let fallingStars = [];
let score = 0;
let lives = 3;
let gameOver = false;

// Start the game
startBtn.addEventListener("click", () => {
    startScreen.style.display = "none";
    gameCanvas.style.display = "block";
    controls.style.display = "block";
    gameLoop();
});

// Restart the game
restartBtn.addEventListener("click", () => {
    gameOver = false;
    lives = 3;
    score = 0;
    fallingStars = [];
    finalScore.textContent = score;
    gameOverScreen.style.display = "none";
    startScreen.style.display = "none";
    gameCanvas.style.display = "block";
    controls.style.display = "block";
    gameLoop();
});

// Move dragon left
leftBtn.addEventListener("click", () => {
    if (dragonX > 0) {
        dragonX -= dragonSpeed;
    }
});

// Move dragon right
rightBtn.addEventListener("click", () => {
    if (dragonX < gameCanvas.width - 50) {
        dragonX += dragonSpeed;
    }
});

// Create falling stars
function createFallingStar() {
    const starX = Math.random() * (gameCanvas.width - 30);
    const star = { x: starX, y: 0, width: 30, height: 30 };
    fallingStars.push(star);
}

// Update falling stars
function updateStars() {
    for (let i = 0; i < fallingStars.length; i++) {
        const star = fallingStars[i];
        star.y += 5;

        if (star.y > gameCanvas.height) {
            fallingStars.splice(i, 1);
            lives -= 1;
            if (lives === 0) {
                gameOver = true;
                finalScore.textContent = score;
                gameOverScreen.style.display = "block";
                gameCanvas.style.display = "none";
                controls.style.display = "none";
            }
        }

        // Check for collision with the dragon
        if (
            star.x < dragonX + 50 &&
            star.x + 30 > dragonX &&
            star.y < dragonY + 50 &&
            star.y + 30 > dragonY
        ) {
            score += 10;
            fallingStars.splice(i, 1);
        }
    }
}

// Draw game elements
function draw() {
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    // Draw falling stars
    ctx.fillStyle = "yellow";
    fallingStars.forEach(star => {
        ctx.fillRect(star.x, star.y, star.width, star.height);
    });

    // Draw dragon
    ctx.fillStyle = "green";
    ctx.fillRect(dragonX, dragonY, 50, 50);

    // Draw score and lives
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 20, 30);
    ctx.fillText("Lives: " + lives, gameCanvas.width - 100, 30);
}

// Game loop
function gameLoop() {
    if (!gameOver) {
        createFallingStar();
        updateStars();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

// Resize the canvas when window is resized
window.addEventListener("resize", () => {
    gameCanvas.width = window.innerWidth - 40;
    gameCanvas.height = window.innerHeight - 150;
});
