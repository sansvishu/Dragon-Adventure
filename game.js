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
let targetCoins = 0;
let coinsCollected = 0;
let currentDragon = "Fire";  // Default dragon
const FPS = 60;
let dragon;
let gems = [];
let enemies = [];

// Sound variables
const fireballSound = new Audio('fireball.mp3'); 
const gemCollectSound = new Audio('gemCollect.mp3'); 
const dragonRoarSound = new Audio('dragonRoar.mp3'); 
const gameOverSound = new Audio('gameOver.mp3'); 
const levelUpSound = new Audio('levelUp.mp3'); 
const backgroundMusic = new Audio('backgroundMusic.mp3'); 
backgroundMusic.loop = true;
backgroundMusic.volume = 0.2;

// Background setup
const backgroundImage = new Image();
backgroundImage.src = "https://i.postimg.cc/L6wN945n/Colorful-Abstract-Dancing-Image-Dance-Studio-Logo.jpg";  // Background image URL

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
        this.image.src = "https://i.postimg.cc/8scvWm2H/dragon-removebg-preview.png"; // Dragon image
    }

    move() {
        if (keys.left && this.x > 0) this.x -= this.speed;
        if (keys.right && this.x + this.width < canvas.width) this.x += this.speed;
        if (keys.up && this.y > 0) this.y -= this.speed;
        if (keys.down && this.y + this.height < canvas.height) this.y += this.speed;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height); // Draw dragon image
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
        this.image.src = "https://i.postimg.cc/hzy76XdT/gold-coin-removebg-preview.png";  // Gem image
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);  // Draw gem image
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
        this.image.src = "https://i.postimg.cc/zHyRrqCM/monster-removebg-preview.png";  // Enemy image
    }

    move() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.y = 0;
            this.x = Math.random() * (canvas.width - this.width);
        }
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);  // Draw enemy image
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

// Update the UI to show the target coins
function updateTargetCoins() {
    document.getElementById("targetCoins").innerText = `Collect ${targetCoins} coins to clear the level.`;
}

// Reset level
function resetLevel() {
    dragon = new Dragon(currentDragon);
    gems = [];
    enemies = [];
    coinsCollected = 0; // Reset collected coins count

    // Increase the target coins for the next level
    targetCoins = level * 10;  // For example, level 1 requires 10 coins, level 2 requires 20 coins, etc.
    
    // Update target coins display
    updateTargetCoins();

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
            coinsCollected++;  // Increment coin collection count
            gems.splice(index, 1);
            gems.push(new Gem());  // Spawn a new gem

            // Play gem collect sound when gem is collected
            playGemCollectSound();
        }
    });

    // Check if dragon hits enemy
    enemies.forEach((enemy) => {
        if (dragon.x < enemy.x + enemy.width && dragon.x + dragon.width > enemy.x &&
            dragon.y < enemy.y + enemy.height && dragon.y + dragon.height > enemy.y) {
            lives--;
            if (lives <= 0) {
                gameOver = true;
                stopBackgroundMusic(); // Stop background music when game is over
                playGameOverSound();  // Play game over sound
                document.getElementById("gameOverScreen").classList.remove("hidden");  // Show restart button
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

        // Check if level is cleared
        if (coinsCollected >= targetCoins) {
            levelUp();
        }
    }
}

// Handle level up
function levelUp() {
    if (coinsCollected >= targetCoins) {
        // Show "You Win" message
        gameOver = true;
        stopBackgroundMusic(); // Stop background music
        playLevelUpSound();  // Play level-up sound
        document.getElementById("levelUpScreen").classList.remove("hidden");  // Show "You Win" message

        // Update level and target coin count for next level
        setTimeout(() => {
            level++;
            document.getElementById("levelDetails").innerText = `Level ${level} - Collect ${level * 10} coins to clear the level.`;
        }, 2000);  // Wait for 2 seconds before showing next level details
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Draw the game elements
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);  // Draw the background

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
        ctx.fillText("GAME OVER!", canvas.width / 2 - 100, canvas.height / 2 - 30);
        ctx.fillText("Press Restart to play again.", canvas.width / 2 - 150, canvas.height / 2 + 30);
    }
}

// Restart the game
document.getElementById("restartButton").addEventListener("click", () => {
    gameOver = false;
    score = 0;
    level = 1;
    lives = 3;
    resetLevel();
    document.getElementById("gameOverScreen").classList.add("hidden");  // Hide restart button
    playBackgroundMusic();  // Start background music again
});

// Go to the next level
document.getElementById("nextLevelButton").addEventListener("click", () => {
    gameOver = false;
    coinsCollected = 0;  // Reset collected coins count
    resetLevel();
    document.getElementById("levelUpScreen").classList.add("hidden");  // Hide level up message
    playBackgroundMusic();  // Start background music again
});

// Play background music
function playBackgroundMusic() {
    backgroundMusic.play();
}

// Stop background music
function stopBackgroundMusic() {
    backgroundMusic.pause();
}

// Play gem collect sound
function playGemCollectSound() {
    gemCollectSound.play();
}

// Play game over sound
function playGameOverSound() {
    gameOverSound.play();
}

// Play level-up sound
function playLevelUpSound() {
    levelUpSound.play();
}

// Start the game
resetLevel();
gameLoop();
