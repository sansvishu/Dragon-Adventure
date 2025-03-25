// Load sound files
const fireballSound = new Audio('fireball.mp3');  // Fireball sound
const gemCollectSound = new Audio('gemCollect.mp3');  // Gem collect sound
const dragonRoarSound = new Audio('dragonRoar.mp3');  // Dragon roar sound
const gameOverSound = new Audio('gameOver.mp3');  // Game over sound
const levelUpSound = new Audio('levelUp.mp3');  // Level up sound
const backgroundMusic = new Audio('backgroundMusic.mp3');  // Background music

// Set background music to loop
backgroundMusic.loop = true;
backgroundMusic.volume = 0.2; // Set volume to a comfortable level

// Play background music at the start
backgroundMusic.play();

// Function to play fireball sound
function playFireballSound() {
    fireballSound.play();
}

// Function to play gem collect sound
function playGemCollectSound() {
    gemCollectSound.play();
}

// Function to play dragon roar sound
function playDragonRoarSound() {
    dragonRoarSound.play();
}

// Function to play game over sound
function playGameOverSound() {
    gameOverSound.play();
}

// Function to play level up sound
function playLevelUpSound() {
    levelUpSound.play();
}

// Function to play background music (if paused or stopped)
function playBackgroundMusic() {
    if (backgroundMusic.paused) {
        backgroundMusic.play();
    }
}

// Function to stop background music when game over
function stopBackgroundMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;  // Reset the music to the beginning
}

// Dragon class: Call dragon roar when dragon moves or does an action
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

        // Play dragon roar when dragon moves
        playDragonRoarSound();
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);  // Draw dragon image
    }
}

// Gem class: Play collect sound when the dragon collects a gem
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

// Enemy class: Play sound when the dragon collides with an enemy
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

// Check collisions: Play sound when dragon collects a gem or hits an enemy
function checkCollisions() {
    // Check if dragon collects gems
    gems.forEach((gem, index) => {
        if (dragon.x < gem.x + gem.width && dragon.x + dragon.width > gem.x &&
            dragon.y < gem.y + gem.height && dragon.y + dragon.height > gem.y) {
            score += 10;
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

        // Play level up sound when all gems are collected
        if (gems.length === 0) {
            level++;
            resetLevel();
            playLevelUpSound();  // Play sound when level is up
        }
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Restart game
document.getElementById("restartButton").addEventListener("click", () => {
    gameOver = false;
    score = 0;
    level = 1;
    lives = 3;
    resetLevel();
    document.getElementById("gameOverScreen").classList.add("hidden");  // Hide restart button
    playBackgroundMusic();  // Restart background music when restarting the game
});

resetLevel();
gameLoop();
