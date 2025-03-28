// Game Constants
const DRAGON_TYPES = {
    "Fire": { color: "#ff3333", speed: 5, ability: "Fireball", cooldown: 3000, damage: 3 },
    "Ice": { color: "#3333ff", speed: 6, ability: "Freeze", cooldown: 5000, duration: 3000 },
    "Storm": { color: "#aa33ff", speed: 7, ability: "Lightning", cooldown: 4000, damage: 2 }
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

// Load images
function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

async function loadAssets() {
    try {
        const [
            bgImage,
            dragonImage,
            coinImage,
            monsterImage,
            powerupImage
        ] = await Promise.all([
            loadImage(assets.bgImage),
            loadImage(assets.dragonImage),
            loadImage(assets.coinImage),
            loadImage(assets.monsterImage),
            loadImage(assets.powerupImage)
        ]);
        
        return {
            bgImage,
            dragonImage,
            coinImage,
            monsterImage,
            powerupImage
        };
    } catch (error) {
        console.error("Error loading images:", error);
        throw error;
    }
}

// Initialize game
async function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Check if mobile
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        document.getElementById('mobileControls').style.display = 'block';
        setupMobileControls();
    }
    
    // Load assets
    const images = await loadAssets();
    Object.assign(window, images); // Make images globally available
    
    // Event listeners
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('restartButton').addEventListener('click', startGame);
    document.getElementById('quitButton').addEventListener('click', () => window.close());
    document.getElementById('quitButton2').addEventListener('click', () => window.close());
    document.getElementById('dragonSelectButton').addEventListener('click', selectDragon);
    
    // Keyboard controls
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    
    // Start game loop
    requestAnimationFrame(gameLoop);
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
            dragon.dx = -speed;
            break;
        case 'ArrowRight':
            dragon.dx = speed;
            break;
        case 'ArrowUp':
            dragon.dy = -speed;
            break;
        case 'ArrowDown':
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
            if (dragon.dx < 0) dragon.dx = 0;
            break;
        case 'ArrowRight':
            if (dragon.dx > 0) dragon.dx = 0;
            break;
        case 'ArrowUp':
            if (dragon.dy < 0) dragon.dy = 0;
            break;
        case 'ArrowDown':
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
    dragon.x = 400;
    dragon.y = 500;
    dragon.dx = 0;
    dragon.dy = 0;
    dragon.speed = DRAGON_TYPES[currentDragon].speed;
    
    // Clear all objects
    gems = [];
    enemies = [];
    powerups = [];
    abilities = [];
    boss = null;
    
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
}

function generateObjects() {
    // Generate gems
    const gemCount = 5 + level * 2;
    for (let i = 0; i < gemCount; i++) {
        gems.push({
            x: Math.random() * (canvas.width - 30),
            y: Math.random() * (canvas.height - 150),
            width: 30,
            height: 30
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
    
    switch(currentDragon) {
        case "Fire":
            abilities.push({
                x: dragon.x,
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
                x: dragon.x,
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
            
            if (distance > 0) {
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
            score += 10;
            updateHUD();
        }
    }
    
    // Check powerup collisions
    for (let i = powerups.length - 1; i >= 0; i--) {
        const powerup = powerups[i];
        if (checkCollision(dragon, powerup)) {
            powerups.splice(i, 1);
            
            if (powerup.type === "extra_life") {
                lives++;
            } else {
                powerupsActive[powerup.type] = true;
                powerupEndTime = Date.now() + 10000; // 10 seconds
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
            
            if (lives <= 0) {
                gameOver = true;
                gameActive = false;
                document.getElementById('finalScore').textContent = score;
                document.getElementById('finalLevel').textContent = level;
                document.getElementById('gameOverScreen').style.display = 'flex';
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
                    break;
                }
            }
            
            // Check collision with boss
            if (bossActive && checkCollision(ability, boss)) {
                boss.health -= ability.damage;
                abilities.splice(i, 1);
                
                if (boss.health <= 0) {
                    bossActive = false;
                    score += 100 * level;
                    updateHUD();
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
                }
            }
            
            // Check collision with boss
            if (bossActive && checkCollision(ability, boss)) {
                boss.health -= ability.damage;
                
                if (boss.health <= 0) {
                    bossActive = false;
                    score += 100 * level;
                    updateHUD();
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
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    
    if (gameActive) {
        // Draw gems
        gems.forEach(gem => {
            ctx.drawImage(coinImage, gem.x, gem.y, gem.width, gem.height);
        });
        
        // Draw powerups
        powerups.forEach(powerup => {
            ctx.drawImage(powerupImage, powerup.x, powerup.y, powerup.width, powerup.height);
            
            // Draw icon for extra life
            if (powerup.type === "extra_life") {
                ctx.fillStyle = "red";
                ctx.font = "bold 20px Arial";
                ctx.fillText("+1", powerup.x + 5, powerup.y + 20);
            }
        });
        
        // Draw enemies
        enemies.forEach(enemy => {
            if (enemy.frozen) {
                // Draw frozen effect
                ctx.save();
                ctx.globalAlpha = 0.7;
                ctx.drawImage(monsterImage, enemy.x, enemy.y, enemy.width, enemy.height);
                ctx.restore();
                
                // Ice overlay
                ctx.fillStyle = "rgba(100, 100, 255, 0.3)";
                ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            } else {
                ctx.drawImage(monsterImage, enemy.x, enemy.y, enemy.width, enemy.height);
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
            // Draw boss image (using monster image for now)
            ctx.drawImage(monsterImage, boss.x, boss.y, boss.width, boss.height);
            
            // Boss health bar background
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(boss.x + 10, boss.y - 20, boss.width - 20, 10);
            
            // Boss health bar
            const healthWidth = (boss.width - 20) * (boss.health / boss.maxHealth);
            ctx.fillStyle = "#00ff00";
            ctx.fillRect(boss.x + 10, boss.y - 20, healthWidth, 10);
        }
        
        // Draw dragon
        ctx.drawImage(dragonImage, dragon.x, dragon.y, dragon.width, dragon.height);
        
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

// Initialize the game when the window loads
window.addEventListener('load', init);
