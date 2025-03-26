// Game Constants
const DRAGON_TYPES = {
    "Fire": { 
        color: "#ff3333", 
        speed: 5, 
        ability: "Fireball", 
        cooldown: 3000, 
        damage: 3,
        abilitySound: "fireball"
    },
    "Ice": { 
        color: "#3333ff", 
        speed: 6, 
        ability: "Freeze", 
        cooldown: 5000, 
        duration: 3000,
        abilitySound: "freeze"
    },
    "Storm": { 
        color: "#aa33ff", 
        speed: 7, 
        ability: "Lightning", 
        cooldown: 4000, 
        damage: 2,
        abilitySound: "lightning"
    }
};

// Game Variables
let canvas, ctx;
let gameActive = false;
let gameOver = false;
let score = 0;
let level = 1;
let lives = 3;
let currentDragon = "Fire";
let bossActive = false;
let abilityCooldown = 0;
let powerupsActive = {
    speed_boost: false,
    invincible: false,
    magnet: false
};
let powerupEndTime = 0;
let isMobile = false;
let sounds = {};

// Game Objects
let dragon = {
    x: 400, y: 500, width: 60, height: 60,
    speed: DRAGON_TYPES["Fire"].speed,
    dx: 0, dy: 0
};
let gems = [];
let enemies = [];
let powerups = [];
let abilities = [];
let boss = null;

// Image assets
const assets = {
    bgImage: 'https://i.postimg.cc/bs0QLhQh/Colorful-Abstract-Dancing-Image-Dance-Studio-Logo.jpg',
    dragonImage: 'https://i.postimg.cc/K3TvQxwh/dragon-removebg-preview.png',
    coinImage: 'https://i.postimg.cc/0MbNMpCQ/gold-coin-removebg-preview.png',
    monsterImage: 'https://i.postimg.cc/0MFypbtC/monster-removebg-preview.png',
    powerupImage: 'https://i.postimg.cc/k2R3bf0L/star-removebg-preview.png'
};

// Sound assets
const soundAssets = {
    collect: 'https://assets.mixkit.co/sfx/preview/mixkit-coin-win-notification-1992.mp3',
    fireball: 'https://assets.mixkit.co/sfx/preview/mixkit-fireball-spell-1664.mp3',
    freeze: 'https://assets.mixkit.co/sfx/preview/mixkit-magic-spell-hit-1682.mp3',
    lightning: 'https://assets.mixkit.co/sfx/preview/mixkit-light-spell-hit-1681.mp3',
    hit: 'https://assets.mixkit.co/sfx/preview/mixkit-player-jumping-into-water-1946.mp3',
    powerup: 'https://assets.mixkit.co/sfx/preview/mixkit-bonus-earned-in-video-game-2058.mp3',
    gameOver: 'https://assets.mixkit.co/sfx/preview/mixkit-retro-arcade-lose-2027.mp3',
    levelUp: 'https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3'
};

// Initialize game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Check if mobile
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        document.getElementById('mobileControls').style.display = 'block';
        setupMobileControls();
        
        // Adjust canvas size for mobile
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        dragon.x = canvas.width / 2 - dragon.width / 2;
        dragon.y = canvas.height - dragon.height - 20;
    }
    
    // Load images
    loadImages();
    
    // Load sounds
    loadSounds();
    
    // Event listeners
    setupEventListeners();
    
    // Start game loop
    requestAnimationFrame(gameLoop);
}

function loadImages() {
    Object.entries(assets).forEach(([key, src]) => {
        const img = new Image();
        img.src = src;
        assets[key] = img;
    });
}

function loadSounds() {
    Object.entries(soundAssets).forEach(([key, src]) => {
        const sound = new Audio(src);
        sound.volume = 0.3;
        sounds[key] = sound;
    });
}

function setupEventListeners() {
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('restartButton').addEventListener('click', startGame);
    document.getElementById('quitButton').addEventListener('click', () => {
        if (confirm('Are you sure you want to quit?')) {
            window.close();
        }
    });
    document.getElementById('quitButton2').addEventListener('click', () => {
        if (confirm('Are you sure you want to quit?')) {
            window.close();
        }
    });
    document.getElementById('dragonSelectButton').addEventListener('click', selectDragon);
    
    // Keyboard controls
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    
    // Window resize handler
    window.addEventListener('resize', handleResize);
}

function handleResize() {
    if (isMobile) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Adjust dragon position
        if (gameActive) {
            dragon.x = Math.min(dragon.x, canvas.width - dragon.width);
            dragon.y = Math.min(dragon.y, canvas.height - dragon.height);
        }
    }
}

function setupMobileControls() {
    const upBtn = document.getElementById('upBtn');
    const downBtn = document.getElementById('downBtn');
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const abilityBtn = document.getElementById('abilityBtn');
    
    // Touch events
    upBtn.addEventListener('touchstart', () => dragon.dy = -dragon.speed);
    upBtn.addEventListener('touchend', () => { if (dragon.dy < 0) dragon.dy = 0 });
    
    downBtn.addEventListener('touchstart', () => dragon.dy = dragon.speed);
    downBtn.addEventListener('touchend', () => { if (dragon.dy > 0) dragon.dy = 0 });
    
    leftBtn.addEventListener('touchstart', () => dragon.dx = -dragon.speed);
    leftBtn.addEventListener('touchend', () => { if (dragon.dx < 0) dragon.dx = 0 });
    
    rightBtn.addEventListener('touchstart', () => dragon.dx = dragon.speed);
    rightBtn.addEventListener('touchend', () => { if (dragon.dx > 0) dragon.dx = 0 });
    
    abilityBtn.addEventListener('touchstart', useAbility);
}

function keyDown(e) {
    if (!gameActive) return;
    
    const speed = dragon.speed * (powerupsActive.speed_boost ? 1.5 : 1);
    
    switch(e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            dragon.dx = -speed;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            dragon.dx = speed;
            break;
        case 'ArrowUp':
        case 'w':
        case 'W':
            dragon.dy = -speed;
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            dragon.dy = speed;
            break;
        case ' ':
            useAbility();
            break;
    }
}

function keyUp(e) {
    switch(e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (dragon.dx < 0) dragon.dx = 0;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (dragon.dx > 0) dragon.dx = 0;
            break;
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (dragon.dy < 0) dragon.dy = 0;
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (dragon.dy > 0) dragon.dy = 0;
            break;
    }
}

function startGame() {
    // Reset game state
    gameActive = true;
    gameOver = false;
    score = 0;
    level = 1;
    lives = 3;
    bossActive = false;
    
    // Reset dragon
    dragon.x = isMobile ? canvas.width / 2 - dragon.width / 2 : 400;
    dragon.y = isMobile ? canvas.height - dragon.height - 20 : 500;
    dragon.dx = 0;
    dragon.dy = 0;
    dragon.speed = DRAGON_TYPES[currentDragon].speed;
    
    // Clear all objects
    gems = [];
    enemies = [];
    powerups = [];
    abilities = [];
    boss = null;
    
    // Reset powerups
    powerupsActive.speed_boost = false;
    powerupsActive.invincible = false;
    powerupsActive.magnet = false;
    
    // Generate initial objects
    generateObjects();
    
    // Hide menus
    document.getElementById('menuScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
    
    // Update HUD
    updateHUD();
}

function selectDragon() {
    const dragons = Object.keys(DRAGON_TYPES);
    const currentIndex = dragons.indexOf(currentDragon);
    currentDragon = dragons[(currentIndex + 1) % dragons.length];
    
    document.getElementById('dragonDisplay').textContent = currentDragon;
    dragon.speed = DRAGON_TYPES[currentDragon].speed;
    
    // Play sound effect
    sounds.powerup.play();
}

function generateObjects() {
    // Generate gems
    const gemCount = 5 + level * 2;
    for (let i = 0; i < gemCount; i++) {
        gems.push({
            x: Math.random() * (canvas.width - 30),
            y: Math.random() * (canvas.height - 150),
            width: 30,
            height: 30,
            value: 10 + Math.floor(level / 2)
        });
    }
    
    // Generate enemies every 3 levels
    if (level % 3 === 0) {
        const enemyCount = Math.min(Math.floor(level / 3), 5);
        for (let i = 0; i < enemyCount; i++) {
            enemies.push({
                x: Math.random() * (canvas.width - 40),
                y: Math.random() * -100 - 40,
                width: 40,
                height: 40,
                speed: 1 + Math.random() * 2,
                frozen: false,
                frozenTime: 0
            });
        }
    }
    
    // Generate boss every 5 levels
    if (level % 5 === 0) {
        spawnBoss();
    }
    
    // Generate powerups randomly
    if (Math.random() < 0.3) {
        const powerTypes = Object.keys(powerupsActive);
        const powerType = Math.random() < 0.8 ? 
            powerTypes[Math.floor(Math.random() * powerTypes.length)] : 
            "extra_life";
        
        powerups.push({
            x: Math.random() * (canvas.width - 30),
            y: Math.random() * (canvas.height - 150),
            width: 30,
            height: 30,
            type: powerType
        });
    }
}

function spawnBoss() {
    bossActive = true;
    boss = {
        x: canvas.width / 2 - 50,
        y: 100,
        width: 100,
        height: 100,
        speed: 2,
        direction: 1,
        health: 10 * level,
        maxHealth: 10 * level,
        attackCooldown: 0
    };
}

function useAbility() {
    if (Date.now() < abilityCooldown) return;
    
    abilityCooldown = Date.now() + DRAGON_TYPES[currentDragon].cooldown;
    updateAbilityBar();
    
    // Play ability sound
    sounds[DRAGON_TYPES[currentDragon].abilitySound].play();
    
    switch(currentDragon) {
        case "Fire":
            abilities.push({
                x: dragon.x + dragon.width/2 - 10,
                y: dragon.y - dragon.height/2,
                width: 20,
                height: 20,
                speed: 10,
                damage: DRAGON_TYPES[currentDragon].damage,
                type: "fireball"
            });
            break;
            
        case "Ice":
            // Freeze all enemies
            enemies.forEach(enemy => {
                enemy.frozen = true;
                enemy.frozenTime = Date.now() + DRAGON_TYPES[currentDragon].duration;
            });
            break;
            
        case "Storm":
            abilities.push({
                x: dragon.x + dragon.width/2 - 5,
                y: dragon.y - dragon.height/2,
                width: 10,
                height: 30,
                lifetime: 30,
                damage: DRAGON_TYPES[currentDragon].damage,
                type: "lightning"
            });
            break;
    }
}

function updateAbilityBar() {
    const abilityBar = document.getElementById('abilityBar');
    abilityBar.style.transform = 'scaleX(0)';
    
    const startTime = Date.now();
    const endTime = abilityCooldown;
    const duration = DRAGON_TYPES[currentDragon].cooldown;
    
    function animate() {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        abilityBar.style.transform = `scaleX(${progress})`;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            document.getElementById('abilityText').textContent = "Ability Ready (Press Space)";
        }
    }
    
    document.getElementById('abilityText').textContent = DRAGON_TYPES[currentDragon].ability + " Cooldown";
    animate();
}

function gameLoop() {
    if (gameActive) {
        update();
    }
    render();
    requestAnimationFrame(gameLoop);
}

function update() {
    // Update dragon position
    dragon.x += dragon.dx;
    dragon.y += dragon.dy;
    
    // Keep dragon in bounds
    dragon.x = Math.max(0, Math.min(canvas.width - dragon.width, dragon.x));
    dragon.y = Math.max(0, Math.min(canvas.height - dragon.height, dragon.y));
    
    // Magnet powerup effect
    if (powerupsActive.magnet) {
        gems.forEach(gem => {
            const dx = dragon.x + dragon.width/2 - (gem.x + gem.width/2);
            const dy = dragon.y + dragon.height/2 - (gem.y + gem.height/2);
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance > 0 && distance < 200) {
                gem.x += dx / distance * 3;
                gem.y += dy / distance * 3;
            }
        });
    }
    
    // Check powerup expiration
    if (powerupsActive.speed_boost || powerupsActive.invincible || powerupsActive.magnet) {
        if (Date.now() > powerupEndTime) {
            powerupsActive.speed_boost = false;
            powerupsActive.invincible = false;
            powerupsActive.magnet = false;
        }
    }
    
    // Check gem collisions
    for (let i = gems.length - 1; i >= 0; i--) {
        const gem = gems[i];
        if (checkCollision(dragon, gem)) {
            gems.splice(i, 1);
            score += gem.value;
            updateHUD();
            sounds.collect.play();
        }
    }
    
    // Check powerup collisions
    for (let i = powerups.length - 1; i >= 0; i--) {
        const powerup = powerups[i];
        if (checkCollision(dragon, powerup)) {
            powerups.splice(i, 1);
            
            if (powerup.type === "extra_life") {
                lives++;
                sounds.powerup.play();
            } else {
                powerupsActive[powerup.type] = true;
                powerupEndTime = Date.now() + 10000; // 10 seconds
                sounds.powerup.play();
            }
            updateHUD();
        }
    }
    
    // Update enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // Skip if frozen
        if (enemy.frozen && Date.now() < enemy.frozenTime) {
            continue;
        } else if (enemy.frozen) {
            enemy.frozen = false;
        }
        
        enemy.y += enemy.speed;
        
        // Wrap around if off screen
        if (enemy.y > canvas.height) {
            enemy.y = Math.random() * -100 - 40;
            enemy.x = Math.random() * (canvas.width - enemy.width);
        }
        
        // Check collision with dragon
        if (!powerupsActive.invincible && checkCollision(dragon, enemy)) {
            lives--;
            updateHUD();
            sounds.hit.play();
            
            if (lives <= 0) {
                gameOver = true;
                gameActive = false;
                document.getElementById('finalScore').textContent = score;
                document.getElementById('finalLevel').textContent = level;
                document.getElementById('gameOverScreen').style.display = 'flex';
                sounds.gameOver.play();
            } else {
                // Brief invincibility after hit
                powerupsActive.invincible = true;
                powerupEndTime = Date.now() + 2000;
            }
            
            enemies.splice(i, 1);
        }
    }
    
    // Update abilities
    for (let i = abilities.length - 1; i >= 0; i--) {
        const ability = abilities[i];
        
        if (ability.type === "fireball") {
            ability.y -= ability.speed;
            
            // Check if off screen
            if (ability.y + ability.height < 0) {
                abilities.splice(i, 1);
                continue;
            }
            
            // Check collision with enemies
            for (let j = enemies.length - 1; j >= 0; j--) {
                if (checkCollision(ability, enemies[j])) {
                    enemies.splice(j, 1);
                    abilities.splice(i, 1);
                    score += 20;
                    updateHUD();
                    sounds.hit.play();
                    break;
                }
            }
            
            // Check collision with boss
            if (bossActive && checkCollision(ability, boss)) {
                boss.health -= ability.damage;
                abilities.splice(i, 1);
                sounds.hit.play();
                
                if (boss.health <= 0) {
                    bossActive = false;
                    score += 100 * level;
                    updateHUD();
                    sounds.levelUp.play();
                }
            }
        }
        else if (ability.type === "lightning") {
            ability.lifetime--;
            
            if (ability.lifetime <= 0) {
                abilities.splice(i, 1);
                continue;
            }
            
            // Check collision with enemies
            for (let j = enemies.length - 1; j >= 0; j--) {
                if (checkCollision(ability, enemies[j])) {
                    enemies.splice(j, 1);
                    score += 20;
                    updateHUD();
                    sounds.hit.play();
                }
            }
            
            // Check collision with boss
            if (bossActive && checkCollision(ability, boss)) {
                boss.health -= ability.damage;
                sounds.hit.play();
                
                if (boss.health <= 0) {
                    bossActive = false;
                    score += 100 * level;
                    updateHUD();
                    sounds.levelUp.play();
                }
            }
        }
    }
    
    // Update boss
    if (bossActive) {
        boss.x += boss.speed * boss.direction;
        
        // Change direction at edges
        if (boss.x + boss.width > canvas.width || boss.x < 0) {
            boss.direction *= -1;
        }
        
        // Boss attacks
        if (Date.now() > boss.attackCooldown) {
            boss.attackCooldown = Date.now() + 2000;
            enemies.push({
                x: boss.x + boss.width/2 - 20,
                y: boss.y + boss.height,
                width: 40,
                height: 40,
                speed: 2,
                frozen: false,
                frozenTime: 0
            });
        }
    }
    
    // Level progression
    if (gems.length === 0 && !bossActive) {
        level++;
        updateHUD();
        sounds.levelUp.play();
        generateObjects();
    }
}

function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

function updateHUD() {
    document.getElementById('scoreDisplay').textContent = score;
    document.getElementById('levelDisplay').textContent = level;
    document.getElementById('livesDisplay').textContent = lives;
}

function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    if (assets.bgImage.complete) {
        ctx.drawImage(assets.bgImage, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    if (gameActive) {
        // Draw gems
        gems.forEach(gem => {
            if (assets.coinImage.complete) {
                ctx.drawImage(assets.coinImage, gem.x, gem.y, gem.width, gem.height);
            } else {
                ctx.fillStyle = '#ffcc00';
                ctx.beginPath();
                ctx.arc(
                    gem.x + gem.width/2,
                    gem.y + gem.height/2,
                    gem.width/2,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        });
        
        // Draw powerups
        powerups.forEach(powerup => {
            if (assets.powerupImage.complete) {
                ctx.drawImage(assets.powerupImage, powerup.x, powerup.y, powerup.width, powerup.height);
            } else {
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.moveTo(powerup.x + powerup.width/2, powerup.y);
                ctx.lineTo(powerup.x + powerup.width, powerup.y + powerup.height/3);
                ctx.lineTo(powerup.x + powerup.width*0.8, powerup.y + powerup.height);
                ctx.lineTo(powerup.x + powerup.width*0.2, powerup.y + powerup.height);
                ctx.lineTo(powerup.x, powerup.y + powerup.height/3);
                ctx.closePath();
                ctx.fill();
            }
            
            // Draw icon for extra life
            if (powerup.type === "extra_life") {
                ctx.fillStyle = "red";
                ctx.font = "bold 20px Arial";
                ctx.fillText("+1", powerup.x + 5, powerup.y + 20);
            }
        });
        
        // Draw enemies
        enemies.forEach(enemy => {
            if (assets.monsterImage.complete) {
                if (enemy.frozen) {
                    // Draw frozen effect
                    ctx.save();
                    ctx.globalAlpha = 0.7;
                    ctx.drawImage(assets.monsterImage, enemy.x, enemy.y, enemy.width, enemy.height);
                    ctx.restore();
                    
                    // Ice overlay
                    ctx.fillStyle = "rgba(100, 100, 255, 0.3)";
                    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
                } else {
                    ctx.drawImage(assets.monsterImage, enemy.x, enemy.y, enemy.width, enemy.height);
                }
            } else {
                ctx.fillStyle = enemy.frozen ? "#6666ff" : "#ff0000";
                ctx.beginPath();
                ctx.arc(
                    enemy.x + enemy.width/2,
                    enemy.y + enemy.height/2,
                    enemy.width/2,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        });
        
        // Draw abilities
        abilities.forEach(ability => {
            if (ability.type === "fireball") {
                ctx.fillStyle = "#ff9933";
                ctx.beginPath();
                ctx.arc(
                    ability.x + ability.width/2,
                    ability.y + ability.height/2,
                    ability.width/2,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                
                // Fire effect
                ctx.fillStyle = "#ff3333";
                ctx.beginPath();
                ctx.arc(
                    ability.x + ability.width/2,
                    ability.y + ability.height/2,
                    ability.width/3,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            } else if (ability.type === "lightning") {
                ctx.strokeStyle = "#aa33ff";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(ability.x + ability.width/2, ability.y);
                ctx.lineTo(ability.x + ability.width/2, ability.y + ability.height);
                ctx.stroke();
            }
        });
        
        // Draw boss
        if (bossActive) {
            if (assets.monsterImage.complete) {
                ctx.drawImage(assets.monsterImage, boss.x, boss.y, boss.width, boss.height);
            } else {
                ctx.fillStyle = "#ff0000";
                ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
            }
            
            // Boss health bar background
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(boss.x + 10, boss.y - 20, boss.width - 20, 10);
            
            // Boss health bar
            const healthWidth = (boss.width - 20) * (boss.health / boss.maxHealth);
            ctx.fillStyle = "#00ff00";
            ctx.fillRect(boss.x + 10, boss.y - 20, healthWidth, 10);
        }
        
        // Draw dragon
        if (assets.dragonImage.complete) {
            ctx.drawImage(assets.dragonImage, dragon.x, dragon.y, dragon.width, dragon.height);
        } else {
            ctx.fillStyle = DRAGON_TYPES[currentDragon].color;
            ctx.beginPath();
            ctx.arc(
                dragon.x + dragon.width/2,
                dragon.y + dragon.height/2,
                dragon.width/2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        
        // Flash effect when invincible
        if (powerupsActive.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(
                dragon.x + dragon.width/2,
                dragon.y + dragon.height/2,
                dragon.width/2 + 5,
                0,
                Math.PI * 2
            );
            ctx.stroke();
        }
    }
}

// Start the game when all assets are loaded
window.addEventListener('load', init);
