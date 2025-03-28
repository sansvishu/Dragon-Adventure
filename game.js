// Game Constants
const DRAGON_TYPES = {
    "Fire": { 
        color: "#ff3333", 
        speed: 5, 
        ability: "Fireball", 
        cooldown: 3000, 
        damage: 3,
        abilityColor: "#ff9933"
    },
    "Ice": { 
        color: "#3333ff", 
        speed: 6, 
        ability: "Freeze", 
        cooldown: 5000, 
        duration: 3000,
        abilityColor: "#33ccff"
    },
    "Storm": { 
        color: "#aa33ff", 
        speed: 7, 
        ability: "Lightning", 
        cooldown: 4000, 
        damage: 2,
        abilityColor: "#cc33ff"
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
let canvasWidth, canvasHeight;

// Audio Elements
let backgroundMusic;
let coinSound;
let powerupSound;
let gameOverSound;
let abilitySound;
let soundEnabled = true;

// Game Objects
let dragon = {
    x: 0, y: 0, width: 60, height: 60,
    speed: DRAGON_TYPES["Fire"].speed,
    dx: 0, dy: 0
};
let gems = [];
let enemies = [];
let powerups = [];
let abilities = [];
let boss = null;

// Initialize game
async function init() {
    // Get canvas and context
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size based on container
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Check if mobile
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        document.getElementById('mobileControls').style.display = 'flex';
        setupMobileControls();
    }
    
    // Initialize audio elements
    backgroundMusic = document.getElementById('backgroundMusic');
    coinSound = document.getElementById('coinSound');
    powerupSound = document.getElementById('powerupSound');
    gameOverSound = document.getElementById('gameOverSound');
    abilitySound = document.getElementById('abilitySound');
    
    // Set initial volume
    backgroundMusic.volume = 0.5;
    coinSound.volume = 0.7;
    powerupSound.volume = 0.7;
    gameOverSound.volume = 0.7;
    abilitySound.volume = 0.7;
    
    // Event listeners
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('restartButton').addEventListener('click', startGame);
    document.getElementById('quitButton').addEventListener('click', () => window.close());
    document.getElementById('quitButton2').addEventListener('click', () => window.close());
    document.getElementById('dragonSelectButton').addEventListener('click', selectDragon);
    document.getElementById('musicToggle').addEventListener('click', toggleMusic);
    document.getElementById('soundToggle').addEventListener('click', toggleSound);
    document.getElementById('controlsButton').addEventListener('click', toggleControls);
    
    // Keyboard controls
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    
    // Start game loop
    requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
    const container = document.getElementById('gameContainer');
    canvasWidth = container.clientWidth;
    canvasHeight = container.clientHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Reposition dragon if game is active
    if (gameActive) {
        dragon.x = canvasWidth / 2 - dragon.width / 2;
        dragon.y = canvasHeight - dragon.height - 20;
    }
}

function setupMobileControls() {
    const upBtn = document.getElementById('upBtn');
    const downBtn = document.getElementById('downBtn');
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const abilityBtn = document.getElementById('abilityBtn');
    
    // Touch events
    const handleTouchStart = (e) => {
        e.preventDefault();
        const btnId = e.target.id;
        const speed = dragon.speed * (powerupsActive.speed_boost ? 1.5 : 1);
        
        switch(btnId) {
            case 'upBtn':
                dragon.dy = -speed;
                break;
            case 'downBtn':
                dragon.dy = speed;
                break;
            case 'leftBtn':
                dragon.dx = -speed;
                break;
            case 'rightBtn':
                dragon.dx = speed;
                break;
            case 'abilityBtn':
                useAbility();
                break;
        }
    };
    
    const handleTouchEnd = (e) => {
        e.preventDefault();
        const btnId = e.target.id;
        
        switch(btnId) {
            case 'upBtn':
                if (dragon.dy < 0) dragon.dy = 0;
                break;
            case 'downBtn':
                if (dragon.dy > 0) dragon.dy = 0;
                break;
            case 'leftBtn':
                if (dragon.dx < 0) dragon.dx = 0;
                break;
            case 'rightBtn':
                if (dragon.dx > 0) dragon.dx = 0;
                break;
        }
    };
    
    upBtn.addEventListener('touchstart', handleTouchStart);
    upBtn.addEventListener('touchend', handleTouchEnd);
    downBtn.addEventListener('touchstart', handleTouchStart);
    downBtn.addEventListener('touchend', handleTouchEnd);
    leftBtn.addEventListener('touchstart', handleTouchStart);
    leftBtn.addEventListener('touchend', handleTouchEnd);
    rightBtn.addEventListener('touchstart', handleTouchStart);
    rightBtn.addEventListener('touchend', handleTouchEnd);
    abilityBtn.addEventListener('touchstart', handleTouchStart);
}

function keyDown(e) {
    if (!gameActive && e.key !== 'm' && e.key !== 's') return;
    
    const speed = dragon.speed * (powerupsActive.speed_boost ? 1.5 : 1);
    
    switch(e.key) {
        case 'ArrowLeft':
        case 'a':
            dragon.dx = -speed;
            break;
        case 'ArrowRight':
        case 'd':
            dragon.dx = speed;
            break;
        case 'ArrowUp':
        case 'w':
            dragon.dy = -speed;
            break;
        case 'ArrowDown':
        case 's':
            dragon.dy = speed;
            break;
        case ' ':
            useAbility();
            break;
        case 'm':
            toggleMusic();
            break;
        case 's':
            toggleSound();
            break;
    }
}

function keyUp(e) {
    switch(e.key) {
        case 'ArrowLeft':
        case 'a':
            if (dragon.dx < 0) dragon.dx = 0;
            break;
        case 'ArrowRight':
        case 'd':
            if (dragon.dx > 0) dragon.dx = 0;
            break;
        case 'ArrowUp':
        case 'w':
            if (dragon.dy < 0) dragon.dy = 0;
            break;
        case 'ArrowDown':
        case 's':
            if (dragon.dy > 0) dragon.dy = 0;
            break;
    }
}

function toggleMusic() {
    const musicEnabled = backgroundMusic.paused;
    document.getElementById('musicToggle').textContent = `MUSIC: ${musicEnabled ? 'ON' : 'OFF'}`;
    
    if (musicEnabled) {
        backgroundMusic.play().catch(e => console.log("Audio play failed:", e));
    } else {
        backgroundMusic.pause();
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    document.getElementById('soundToggle').textContent = `SOUND: ${soundEnabled ? 'ON' : 'OFF'}`;
}

function toggleControls() {
    const controlsInfo = document.getElementById('controlsInfo');
    controlsInfo.style.display = controlsInfo.style.display === 'block' ? 'none' : 'block';
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
    dragon.x = canvasWidth / 2 - dragon.width / 2;
    dragon.y = canvasHeight - dragon.height - 20;
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
    document.getElementById('controlsInfo').style.display = 'none';
    
    // Update HUD
    updateHUD();
    
    // Play background music if enabled
    if (backgroundMusic.paused) {
        backgroundMusic.currentTime = 0;
        backgroundMusic.play().catch(e => console.log("Audio play failed:", e));
    }
}

function selectDragon() {
    const dragons = Object.keys(DRAGON_TYPES);
    const currentIndex = dragons.indexOf(currentDragon);
    currentDragon = dragons[(currentIndex + 1) % dragons.length];
    
    document.getElementById('dragonDisplay').textContent = currentDragon;
    dragon.speed = DRAGON_TYPES[currentDragon].speed;
    
    // Update ability bar color
    document.getElementById('abilityBar').style.background = DRAGON_TYPES[currentDragon].abilityColor;
}

function generateObjects() {
    // Generate gems
    const gemCount = 5 + level * 2;
    for (let i = 0; i < gemCount; i++) {
        gems.push({
            x: Math.random() * (canvasWidth - 30),
            y: Math.random() * (canvasHeight - 150),
            width: 30,
            height: 30,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1
        });
    }
    
    // Generate enemies every 3 levels
    if (level % 3 === 0) {
        const enemyCount = Math.min(Math.floor(level / 3), 5);
        for (let i = 0; i < enemyCount; i++) {
            enemies.push({
                x: Math.random() * (canvasWidth - 40),
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
            x: Math.random() * (canvasWidth - 30),
            y: Math.random() * (canvasHeight - 150),
            width: 30,
            height: 30,
            type: powerType,
            rotation: 0,
            rotationSpeed: 0.05
        });
    }
}

function spawnBoss() {
    bossActive = true;
    boss = {
        x: canvasWidth / 2 - 50,
        y: 100,
        width: 100,
        height: 100,
        speed: 2,
        direction: 1,
        health: 10 * level,
        maxHealth: 10 * level,
        attackCooldown: 0,
        phase: 0,
        phaseTimer: 0
    };
}

function useAbility() {
    if (Date.now() < abilityCooldown) return;
    
    abilityCooldown = Date.now() + DRAGON_TYPES[currentDragon].cooldown;
    updateAbilityBar();
    
    if (soundEnabled) {
        abilitySound.currentTime = 0;
        abilitySound.play();
    }
    
    switch(currentDragon) {
        case "Fire":
            abilities.push({
                x: dragon.x + dragon.width/2 - 10,
                y: dragon.y,
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
            // Create 3 lightning bolts in a spread pattern
            for (let i = -1; i <= 1; i++) {
                abilities.push({
                    x: dragon.x + dragon.width/2 - 5 + i * 20,
                    y: dragon.y,
                    width: 10,
                    height: 30,
                    lifetime: 30,
                    damage: DRAGON_TYPES[currentDragon].damage,
                    type: "lightning"
                });
            }
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
    dragon.x = Math.max(0, Math.min(canvasWidth - dragon.width, dragon.x));
    dragon.y = Math.max(0, Math.min(canvasHeight - dragon.height, dragon.y));
    
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
            
            if (soundEnabled) {
                coinSound.currentTime = 0;
                coinSound.play();
            }
        } else {
            // Update gem rotation
            gem.rotation += gem.rotationSpeed;
        }
    }
    
    // Check powerup collisions
    for (let i = powerups.length - 1; i >= 0; i--) {
        const powerup = powerups[i];
        if (checkCollision(dragon, powerup)) {
            powerups.splice(i, 1);
            
            if (powerup.type === "extra_life") {
                lives++;
                if (soundEnabled) {
                    powerupSound.currentTime = 0;
                    powerupSound.play();
                }
            } else {
                powerupsActive[powerup.type] = true;
                powerupEndTime = Date.now() + 10000; // 10 seconds
                if (soundEnabled) {
                    powerupSound.currentTime = 0;
                    powerupSound.play();
                }
            }
            updateHUD();
        } else {
            // Update powerup rotation
            powerup.rotation += powerup.rotationSpeed;
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
        if (enemy.y > canvasHeight) {
            enemy.y = Math.random() * -100 - 40;
            enemy.x = Math.random() * (canvasWidth - enemy.width);
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
                
                if (soundEnabled) {
                    gameOverSound.currentTime = 0;
                    gameOverSound.play();
                }
                backgroundMusic.pause();
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
                    
                    if (soundEnabled) {
                        powerupSound.currentTime = 0;
                        powerupSound.play();
                    }
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
                    
                    if (soundEnabled) {
                        powerupSound.currentTime = 0;
                        powerupSound.play();
                    }
                }
            }
        }
    }
    
    // Update boss
    if (bossActive) {
        // Boss movement pattern
        boss.phaseTimer++;
        if (boss.phaseTimer > 180) { // Change phase every 3 seconds (60fps)
            boss.phase = (boss.phase + 1) % 3;
            boss.phaseTimer = 0;
        }
        
        switch(boss.phase) {
            case 0: // Left-right movement
                boss.x += boss.speed * boss.direction;
                if (boss.x + boss.width > canvasWidth || boss.x < 0) {
                    boss.direction *= -1;
                }
                break;
            case 1: // Circular movement
                const angle = boss.phaseTimer * Math.PI / 90;
                boss.x = canvasWidth/2 - boss.width/2 + Math.cos(angle) * 100;
                boss.y = 100 + Math.sin(angle) * 50;
                break;
            case 2: // Charge at player
                boss.x += (dragon.x + dragon.width/2 - (boss.x + boss.width/2)) * 0.05;
                break;
        }
        
        // Boss attacks
        if (Date.now() > boss.attackCooldown) {
            boss.attackCooldown = Date.now() + 2000;
            
            // Different attack patterns based on phase
            if (boss.phase === 2) {
                // Rapid fire when charging
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        enemies.push({
                            x: boss.x + boss.width/2 - 20,
                            y: boss.y + boss.height,
                            width: 40,
                            height: 40,
                            speed: 2 + Math.random(),
                            frozen: false,
                            frozenTime: 0
                        });
                    }, i * 300);
                }
            } else {
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
    }
    
    // Level progression
    if (gems.length === 0 && !bossActive) {
        level++;
        updateHUD();
        generateObjects();
        
        // Increase dragon speed slightly each level
        dragon.speed = DRAGON_TYPES[currentDragon].speed * (1 + level * 0.02);
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
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw background
    ctx.drawImage(bgImage, 0, 0, canvasWidth, canvasHeight);
    
    if (gameActive) {
        // Draw gems with rotation
        gems.forEach(gem => {
            ctx.save();
            ctx.translate(gem.x + gem.width/2, gem.y + gem.height/2);
            ctx.rotate(gem.rotation);
            ctx.drawImage(coinImage, -gem.width/2, -gem.height/2, gem.width, gem.height);
            ctx.restore();
        });
        
        // Draw powerups with rotation
        powerups.forEach(powerup => {
            ctx.save();
            ctx.translate(powerup.x + powerup.width/2, powerup.y + powerup.height/2);
            ctx.rotate(powerup.rotation);
            ctx.drawImage(powerupImage, -powerup.width/2, -powerup.height/2, powerup.width, powerup.height);
            
            // Draw icon for extra life
            if (powerup.type === "extra_life") {
                ctx.fillStyle = "red";
                ctx.font = "bold 20px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("+1", 0, 0);
            }
            ctx.restore();
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
                ctx.fillStyle = DRAGON_TYPES[currentDragon].abilityColor;
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
                ctx.fillStyle = DRAGON_TYPES[currentDragon].color;
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
                ctx.strokeStyle = DRAGON_TYPES[currentDragon].abilityColor;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(ability.x + ability.width/2, ability.y);
                ctx.lineTo(ability.x + ability.width/2, ability.y + ability.height);
                ctx.lineTo(ability.x + ability.width/2 + (Math.random() - 0.5) * 10, ability.y + ability.height/2);
                ctx.lineTo(ability.x + ability.width/2, ability.y);
                ctx.stroke();
            }
        });
        
        // Draw boss
        if (bossActive) {
            // Draw boss image (using monster image for now)
            ctx.drawImage(monsterImage, boss.x, boss.y, boss.width, boss.height);
            
            // Boss health bar background
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(boss.x, boss.y - 25, boss.width, 10);
            
            // Boss health bar
            const healthWidth = boss.width * (boss.health / boss.maxHealth);
            ctx.fillStyle = "#ff0000";
            ctx.fillRect(boss.x, boss.y - 25, healthWidth, 10);
            
            // Boss health text
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 12px Arial";
            ctx.textAlign = "center";
            ctx.fillText(`${boss.health}/${boss.maxHealth}`, boss.x + boss.width/2, boss.y - 15);
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
