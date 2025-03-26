// Game Constants
const DRAGON_TYPES = {
    "Fire": { 
        color: "#ff3333", 
        speed: 5, 
        ability: "Fireball", 
        cooldown: 3000, 
        damage: 3,
        description: "Shoots powerful fireballs"
    },
    "Ice": { 
        color: "#3333ff", 
        speed: 6, 
        ability: "Freeze", 
        cooldown: 5000, 
        duration: 3000,
        description: "Freezes all enemies temporarily"
    },
    "Storm": { 
        color: "#aa33ff", 
        speed: 7, 
        ability: "Lightning", 
        cooldown: 4000, 
        damage: 2,
        description: "Casts lightning that damages all enemies"
    }
};

// Sound Effects
const sounds = {
    bgMusic: new Audio("https://energetic-chiptune-video-game-music-platformer-8-bit-318348 (1).mp3"),
    coinSound: new Audio("https://mixkit-winning-a-coin-video-game-2069.wav"),
    loseSound: new Audio("https://mixkit-player-losing-or-failing-2042.wav"),
    hitSound: new Audio("https://github.com/yourusername/game-sounds/raw/main/hit-enemy.mp3"),
    levelClearSound: new Audio("https://github.com/yourusername/game-sounds/raw/main/level-clear.mp3"),
    bonusSound: new Audio("https://mixkit-bonus-earned-in-video-game-2058.wav"),
    fireSound: new Audio("https://mixkit-retro-arcade-casino-notification-211.wav"),
    freezeSound: new Audio("https://mixkit.co/sfx/preview/mixkit-ice-shatter-1251.mp3"),
    lightningSound: new Audio("https://mixkit.co/sfx/preview/mixkit-electronic-retro-block-hit-2185.mp3")
};

// Configure sounds
sounds.bgMusic.loop = true;
sounds.bgMusic.volume = 0.5;

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
let lastTime = 0;
let deltaTime = 0;

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
let explosions = [];
let particles = [];

// Image assets
const assets = {
    bg: 'https://i.postimg.cc/bs0QLhQh/Colorful-Abstract-Dancing-Image-Dance-Studio-Logo.jpg',
    dragon: 'https://i.postimg.cc/K3TvQxwh/dragon-removebg-preview.png',
    coin: 'https://i.postimg.cc/0MbNMpCQ/gold-coin-removebg-preview.png',
    monster: 'https://i.postimg.cc/0MFypbtC/monster-removebg-preview.png',
    powerup: 'https://i.postimg.cc/k2R3bf0L/star-removebg-preview.png',
    boss: 'https://i.postimg.cc/0MFypbtC/monster-removebg-preview.png'
};

// Sound functions
function playSound(soundName, volume = 1.0) {
    const sound = sounds[soundName].cloneNode();
    sound.volume = volume;
    sound.play().catch(e => console.log("Sound playback prevented:", e));
    return sound;
}

function stopSound(soundName) {
    sounds[soundName].pause();
    sounds[soundName].currentTime = 0;
}

// Load images
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

async function loadAssets() {
    try {
        const [
            bgImage, 
            dragonImage, 
            coinImage, 
            monsterImage, 
            powerupImage,
            bossImage
        ] = await Promise.all([
            loadImage(assets.bg),
            loadImage(assets.dragon),
            loadImage(assets.coin),
            loadImage(assets.monster),
            loadImage(assets.powerup),
            loadImage(assets.boss)
        ]);
        
        return {
            bgImage, dragonImage, coinImage, 
            monsterImage, powerupImage, bossImage
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
    Object.assign(assets, images);
    
    // Event listeners
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('restartButton').addEventListener('click', startGame);
    document.getElementById('quitButton').addEventListener('click', () => {
        if (confirm("Are you sure you want to quit?")) {
            window.close();
        }
    });
    document.getElementById('quitButton2').addEventListener('click', () => {
        if (confirm("Are you sure you want to quit?")) {
            window.close();
        }
    });
    document.getElementById('dragonSelectButton').addEventListener('click', selectDragon);
    document.getElementById('muteButton').addEventListener('click', toggleMute);
    
    // Keyboard controls
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    
    // Start game loop
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function toggleMute() {
    const muteButton = document.getElementById('muteButton');
    const isMuted = sounds.bgMusic.muted;
    
    // Toggle all sounds
    Object.values(sounds).forEach(sound => {
        sound.muted = !isMuted;
    });
    
    muteButton.textContent = isMuted ? "Mute" : "Unmute";
}

function setupMobileControls() {
    const upBtn = document.getElementById('upBtn');
    const downBtn = document.getElementById('downBtn');
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const abilityBtn = document.getElementById('abilityBtn');
    
    // Touch events
    const handleTouchStart = (direction) => {
        const speed = dragon.speed * (powerupsActive.speed_boost ? 1.5 : 1);
        switch(direction) {
            case 'up': dragon.dy = -speed; break;
            case 'down': dragon.dy = speed; break;
            case 'left': dragon.dx = -speed; break;
            case 'right': dragon.dx = speed; break;
        }
    };
    
    const handleTouchEnd = (direction) => {
        switch(direction) {
            case 'up': if (dragon.dy < 0) dragon.dy = 0; break;
            case 'down': if (dragon.dy > 0) dragon.dy = 0; break;
            case 'left': if (dragon.dx < 0) dragon.dx = 0; break;
            case 'right': if (dragon.dx > 0) dragon.dx = 0; break;
        }
    };
    
    upBtn.addEventListener('touchstart', () => handleTouchStart('up'));
    upBtn.addEventListener('touchend', () => handleTouchEnd('up'));
    
    downBtn.addEventListener('touchstart', () => handleTouchStart('down'));
    downBtn.addEventListener('touchend', () => handleTouchEnd('down'));
    
    leftBtn.addEventListener('touchstart', () => handleTouchStart('left'));
    leftBtn.addEventListener('touchend', () => handleTouchEnd('left'));
    
    rightBtn.addEventListener('touchstart', () => handleTouchStart('right'));
    rightBtn.addEventListener('touchend', () => handleTouchEnd('right'));
    
    abilityBtn.addEventListener('touchstart', useAbility);
    
    // Prevent default to avoid scrolling
    document.querySelectorAll('.mobile-btn').forEach(btn => {
        btn.addEventListener('touchstart', (e) => e.preventDefault());
    });
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
        case 'Escape':
            togglePause();
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

function togglePause() {
    if (gameOver) return;
    
    gameActive = !gameActive;
    if (gameActive) {
        document.getElementById('menuScreen').style.display = 'none';
        sounds.bgMusic.play();
        lastTime = performance.now();
    } else {
        document.getElementById('menuScreen').style.display = 'flex';
        document.querySelector('#menuScreen h1').textContent = 'Game Paused';
        sounds.bgMusic.pause();
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
    explosions = [];
    particles = [];
    
    // Generate initial objects
    generateObjects();
    
    // Hide menus
    document.getElementById('menuScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
    
    // Play background music
    playSound('bgMusic');
    
    // Update HUD
    updateHUD();
    
    // Reset ability cooldown
    abilityCooldown = 0;
    document.getElementById('abilityBar').style.transform = 'scaleX(0)';
    document.getElementById('abilityText').textContent = "Ability Ready (Press Space)";
}

function selectDragon() {
    const dragons = Object.keys(DRAGON_TYPES);
    const currentIndex = dragons.indexOf(currentDragon);
    currentDragon = dragons[(currentIndex + 1) % dragons.length];
    
    document.getElementById('dragonDisplay').textContent = currentDragon;
    dragon.speed = DRAGON_TYPES[currentDragon].speed;
    
    // Show dragon info tooltip
    const dragonInfo = DRAGON_TYPES[currentDragon];
    alert(`Selected: ${currentDragon} Dragon\nAbility: ${dragonInfo.ability}\n${dragonInfo.description}`);
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
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1
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
                frozenTime: 0,
                health: 1 + Math.floor(level / 5)
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
            type: powerType,
            rotation: 0,
            rotationSpeed: 0.05
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
        attackCooldown: 0,
        phase: 1,
        lastPhaseChange: 0
    };
}

function useAbility() {
    if (Date.now() < abilityCooldown || !gameActive) return;
    
    abilityCooldown = Date.now() + DRAGON_TYPES[currentDragon].cooldown;
    updateAbilityBar();
    
    switch(currentDragon) {
        case "Fire":
            playSound('fireSound');
            abilities.push({
                x: dragon.x + dragon.width/2 - 10,
                y: dragon.y - 10,
                width: 20,
                height: 20,
                speed: 10,
                damage: DRAGON_TYPES[currentDragon].damage,
                type: "fireball"
            });
            break;
            
        case "Ice":
            playSound('freezeSound');
            enemies.forEach(enemy => {
                enemy.frozen = true;
                enemy.frozenTime = Date.now() + DRAGON_TYPES[currentDragon].duration;
            });
            
            for (let i = 0; i < 50; i++) {
                particles.push({
                    x: dragon.x + dragon.width/2,
                    y: dragon.y + dragon.height/2,
                    size: Math.random() * 5 + 2,
                    color: `rgba(150, 200, 255, ${Math.random() * 0.7 + 0.3})`,
                    speedX: (Math.random() - 0.5) * 5,
                    speedY: (Math.random() - 0.5) * 5,
                    life: 60 + Math.random() * 60
                });
            }
            break;
            
        case "Storm":
            playSound('lightningSound');
            for (let i = 0; i < 3; i++) {
                abilities.push({
                    x: dragon.x + dragon.width/2 - 5,
                    y: dragon.y - 30 - i * 20,
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

function gameLoop(timestamp) {
    deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    if (gameActive) {
        update(deltaTime);
    }
    render();
    requestAnimationFrame(gameLoop);
}

function update(deltaTime) {
    const deltaFactor = deltaTime / 16.67;
    
    dragon.x += dragon.dx * deltaFactor;
    dragon.y += dragon.dy * deltaFactor;
    
    dragon.x = Math.max(0, Math.min(canvas.width - dragon.width, dragon.x));
    dragon.y = Math.max(0, Math.min(canvas.height - dragon.height, dragon.y));
    
    if (powerupsActive.magnet) {
        gems.forEach(gem => {
            const dx = dragon.x + dragon.width/2 - (gem.x + gem.width/2);
            const dy = dragon.y + dragon.height/2 - (gem.y + gem.height/2);
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance > 0 && distance < 200) {
                gem.x += dx / distance * 3 * deltaFactor;
                gem.y += dy / distance * 3 * deltaFactor;
            }
        });
    }
    
    if (powerupsActive.speed_boost || powerupsActive.invincible || powerupsActive.magnet) {
        if (Date.now() > powerupEndTime) {
            powerupsActive.speed_boost = false;
            powerupsActive.invincible = false;
            powerupsActive.magnet = false;
        }
    }
    
    gems.forEach(gem => {
        gem.rotation += gem.rotationSpeed * deltaFactor;
    });
    
    for (let i = gems.length - 1; i >= 0; i--) {
        const gem = gems[i];
        if (checkCollision(dragon, gem)) {
            gems.splice(i, 1);
            score += 10;
            playSound('coinSound');
            updateHUD();
            
            for (let j = 0; j < 10; j++) {
                particles.push({
                    x: gem.x + gem.width/2,
                    y: gem.y + gem.height/2,
                    size: Math.random() * 4 + 2,
                    color: `rgba(255, 215, 0, ${Math.random() * 0.7 + 0.3})`,
                    speedX: (Math.random() - 0.5) * 3,
                    speedY: (Math.random() - 0.5) * 3,
                    life: 30 + Math.random() * 30
                });
            }
        }
    }
    
    powerups.forEach(powerup => {
        powerup.rotation += powerup.rotationSpeed * deltaFactor;
    });
    
    for (let i = powerups.length - 1; i >= 0; i--) {
        const powerup = powerups[i];
        if (checkCollision(dragon, powerup)) {
            powerups.splice(i, 1);
            playSound('bonusSound');
            
            if (powerup.type === "extra_life") {
                lives++;
                for (let j = 0; j < 15; j++) {
                    particles.push({
                        x: powerup.x + powerup.width/2,
                        y: powerup.y + powerup.height/2,
                        size: Math.random() * 5 + 3,
                        color: `rgba(255, 50, 50, ${Math.random() * 0.7 + 0.3})`,
                        speedX: (Math.random() - 0.5) * 4,
                        speedY: (Math.random() - 0.5) * 4,
                        life: 40 + Math.random() * 40
                    });
                }
            } else {
                powerupsActive[powerup.type] = true;
                powerupEndTime = Date.now() + 10000;
                
                for (let j = 0; j < 20; j++) {
                    particles.push({
                        x: powerup.x + powerup.width/2,
                        y: powerup.y + powerup.height/2,
                        size: Math.random() * 6 + 2,
                        color: `rgba(255, 255, 100, ${Math.random() * 0.7 + 0.3})`,
                        speedX: (Math.random() - 0.5) * 5,
                        speedY: (Math.random() - 0.5) * 5,
                        life: 50 + Math.random() * 50
                    });
                }
            }
            updateHUD();
        }
    }
    
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        if (enemy.frozen && Date.now() < enemy.frozenTime) {
            continue;
        } else if (enemy.frozen) {
            enemy.frozen = false;
        }
        
        enemy.y += enemy.speed * deltaFactor;
        
        if (enemy.y > canvas.height) {
            enemy.y = Math.random() * -100 - 40;
            enemy.x = Math.random() * (canvas.width - enemy.width);
        }
        
        if (!powerupsActive.invincible && checkCollision(dragon, enemy)) {
            lives--;
            playSound('hitSound');
            updateHUD();
            
            createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
            
            if (lives <= 0) {
                gameOver = true;
                gameActive = false;
                playSound('loseSound');
                stopSound('bgMusic');
                document.getElementById('finalScore').textContent = score;
                document.getElementById('finalLevel').textContent = level;
                document.getElementById('gameOverScreen').style.display = 'flex';
            } else {
                powerupsActive.invincible = true;
                powerupEndTime = Date.now() + 2000;
            }
            
            enemies.splice(i, 1);
        }
    }
    
    for (let i = abilities.length - 1; i >= 0; i--) {
        const ability = abilities[i];
        
        if (ability.type === "fireball") {
            ability.y -= ability.speed * deltaFactor;
            
            if (ability.y + ability.height < 0) {
                abilities.splice(i, 1);
                continue;
            }
            
            for (let j = enemies.length - 1; j >= 0; j--) {
                if (checkCollision(ability, enemies[j])) {
                    enemies[j].health -= ability.damage;
                    
                    if (enemies[j].health <= 0) {
                        createExplosion(enemies[j].x + enemies[j].width/2, enemies[j].y + enemies[j].height/2);
                        enemies.splice(j, 1);
                        score += 20;
                    }
                    
                    abilities.splice(i, 1);
                    updateHUD();
                    break;
                }
            }
            
            if (bossActive && checkCollision(ability, boss)) {
                boss.health -= ability.damage;
                abilities.splice(i, 1);
                
                createExplosion(ability.x + ability.width/2, ability.y + ability.height/2, 10);
                
                if (boss.health <= 0) {
                    for (let k = 0; k < 100; k++) {
                        particles.push({
                            x: boss.x + boss.width/2,
                            y: boss.y + boss.height/2,
                            size: Math.random() * 8 + 4,
                            color: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.8)`,
                            speedX: (Math.random() - 0.5) * 10,
                            speedY: (Math.random() - 0.5) * 10,
                            life: 60 + Math.random() * 60
                        });
                    }
                    
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
            
            for (let j = enemies.length - 1; j >= 0; j--) {
                if (checkCollision(ability, enemies[j])) {
                    enemies[j].health -= ability.damage;
                    
                    if (enemies[j].health <= 0) {
                        createExplosion(enemies[j].x + enemies[j].width/2, enemies[j].y + enemies[j].height/2);
                        enemies.splice(j, 1);
                        score += 20;
                        updateHUD();
                    }
                }
            }
            
            if (bossActive && checkCollision(ability, boss)) {
                boss.health -= ability.damage;
                
                if (boss.health <= 0) {
                    for (let k = 0; k < 100; k++) {
                        particles.push({
                            x: boss.x + boss.width/2,
                            y: boss.y + boss.height/2,
                            size: Math.random() * 8 + 4,
                            color: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.8)`,
                            speedX: (Math.random() - 0.5) * 10,
                            speedY: (Math.random() - 0.5) * 10,
                            life: 60 + Math.random() * 60
                        });
                    }
                    
                    bossActive = false;
                    score += 100 * level;
                    updateHUD();
                }
            }
        }
    }
    
    if (bossActive) {
        boss.x += boss.speed * boss.direction * deltaFactor;
        
        if (boss.x + boss.width > canvas.width || boss.x < 0) {
            boss.direction *= -1;
        }
        
        if (Date.now() - boss.lastPhaseChange > 10000) {
            boss.lastPhaseChange = Date.now();
            boss.phase++;
            boss.speed += 0.5;
            
            for (let i = 0; i < 50; i++) {
                particles.push({
                    x: boss.x + boss.width/2,
                    y: boss.y + boss.height/2,
                    size: Math.random() * 6 + 3,
                    color: `rgba(255, 0, 0, ${Math.random() * 0.7 + 0.3})`,
                    speedX: (Math.random() - 0.5) * 8,
                    speedY: (Math.random() - 0.5) * 8,
                    life: 40 + Math.random() * 40
                });
            }
        }
        
        if (Date.now() > boss.attackCooldown) {
            boss.attackCooldown = Date.now() + 2000 / boss.phase;
            
            const attackCount = 1 + Math.floor(boss.phase / 2);
            for (let i = 0; i < attackCount; i++) {
                enemies.push({
                    x: boss.x + boss.width/2 - 20 + (i * 40 - (attackCount-1)*20),
                    y: boss.y + boss.height,
                    width: 40,
                    height: 40,
                    speed: 2 * boss.phase,
                    frozen: false,
                    frozenTime: 0,
                    health: 1
                });
            }
        }
    }
    
    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].radius += explosions[i].growthRate * deltaFactor;
        explosions[i].alpha -= 0.02 * deltaFactor;
        
        if (explosions[i].alpha <= 0) {
            explosions.splice(i, 1);
        }
    }
    
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].x += particles[i].speedX * deltaFactor;
        particles[i].y += particles[i].speedY * deltaFactor;
        particles[i].life--;
        
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
    
    if (gems.length === 0 && !bossActive) {
        playSound('levelClearSound');
        level++;
        updateHUD();
        generateObjects();
    }
}

function createExplosion(x, y, particleCount = 20) {
    explosions.push({
        x, y,
        radius: 5,
        growthRate: 2,
        alpha: 1,
        color: `rgba(255, 150, 50, 1)`
    });
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x, y,
            size: Math.random() * 6 + 2,
            color: `rgba(255, ${Math.floor(100 + Math.random() * 155)}, 0, ${Math.random() * 0.7 + 0.3})`,
            speedX: (Math.random() - 0.5) * 8,
            speedY: (Math.random() - 0.5) * 8,
            life: 30 + Math.random() * 30
        });
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(assets.bgImage, 0, 0, canvas.width, canvas.height);
    
    if (gameActive) {
        gems.forEach(gem => {
            ctx.save();
            ctx.translate(gem.x + gem.width/2, gem.y + gem.height/2);
            ctx.rotate(gem.rotation);
            ctx.drawImage(assets.coinImage, -gem.width/2, -gem.height/2, gem.width, gem.height);
            ctx.restore();
        });
        
        powerups.forEach(powerup => {
            ctx.save();
            ctx.translate(powerup.x + powerup.width/2, powerup.y + powerup.height/2);
            ctx.rotate(powerup.rotation);
            ctx.drawImage(assets.powerupImage, -powerup.width/2, -powerup.height/2, powerup.width, powerup.height);
            
            if (powerup.type === "extra_life") {
                ctx.fillStyle = "red";
                ctx.font = "bold 20px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("+1", 0, 0);
            }
            ctx.restore();
        });
        
        enemies.forEach(enemy => {
            if (enemy.frozen) {
                ctx.save();
                ctx.globalAlpha = 0.7;
                ctx.drawImage(assets.monsterImage, enemy.x, enemy.y, enemy.width, enemy.height);
                ctx.restore();
                
                ctx.fillStyle = "rgba(100, 100, 255, 0.3)";
                ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            } else {
                ctx.drawImage(assets.monsterImage, enemy.x, enemy.y, enemy.width, enemy.height);
            }
        });
        
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
                
                const gradient = ctx.createRadialGradient(
                    ability.x + ability.width/2,
                    ability.y + ability.height/2,
                    ability.width/3,
                    ability.x + ability.width/2,
                    ability.y + ability.height/2,
                    ability.width/2 + 5
                );
                gradient.addColorStop(0, "rgba(255, 100, 0, 0.8)");
                gradient.addColorStop(1, "rgba(255, 100, 0, 0)");
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(
                    ability.x + ability.width/2,
                    ability.y + ability.height/2,
                    ability.width/2 + 5,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                
                if (Math.random() < 0.3) {
                    particles.push({
                        x: ability.x + ability.width/2,
                        y: ability.y + ability.height,
                        size: Math.random() * 3 + 1,
                        color: `rgba(255, ${Math.floor(100 + Math.random() * 100)}, 0, ${Math.random() * 0.5 + 0.5})`,
                        speedX: (Math.random() - 0.5) * 2,
                        speedY: -Math.random() * 2,
                        life: 20 + Math.random() * 20
                    });
                }
            } 
            else if (ability.type === "lightning") {
                ctx.strokeStyle = "#aa33ff";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(ability.x + ability.width/2, ability.y);
                ctx.lineTo(ability.x + ability.width/2, ability.y + ability.height);
                ctx.stroke();
                
                ctx.strokeStyle = "rgba(200, 150, 255, 0.5)";
                ctx.lineWidth = 8;
                ctx.beginPath();
                ctx.moveTo(ability.x + ability.width/2, ability.y);
                ctx.lineTo(ability.x + ability.width/2, ability.y + ability.height);
                ctx.stroke();
                
                if (Math.random() < 0.5) {
                    particles.push({
                        x: ability.x + ability.width/2 + (Math.random() - 0.5) * 10,
                        y: ability.y + Math.random() * ability.height,
                        size: Math.random() * 2 + 1,
                        color: `rgba(200, 150, 255, ${Math.random() * 0.5 + 0.5})`,
                        speedX: (Math.random() - 0.5) * 3,
                        speedY: (Math.random() - 0.5) * 3,
                        life: 10 + Math.random() * 10
                    });
                }
            }
        });
        
        if (bossActive) {
            ctx.drawImage(assets.bossImage, boss.x, boss.y, boss.width, boss.height);
            
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(boss.x + 10, boss.y - 25, boss.width - 20, 15);
            
            const healthWidth = (boss.width - 20) * (boss.health / boss.maxHealth);
            const healthColor = healthWidth > (boss.width - 20) * 0.5 ? "#00ff00" : 
                              healthWidth > (boss.width - 20) * 0.25 ? "#ffff00" : "#ff0000";
            
            ctx.fillStyle = healthColor;
            ctx.fillRect(boss.x + 10, boss.y - 25, healthWidth, 15);
            
            ctx.fillStyle = "white";
            ctx.font = "bold 12px Arial";
            ctx.textAlign = "center";
            ctx.fillText(
                `BOSS: ${Math.ceil(boss.health)}/${boss.maxHealth}`, 
                boss.x + boss.width/2, 
                boss.y - 12
            );
            
            ctx.fillStyle = "rgba(255, 0, 0, 0.7)";
            ctx.font = "bold 14px Arial";
            ctx.fillText(
                `PHASE ${boss.phase}`, 
                boss.x + boss.width/2, 
                boss.y - 40
            );
        }
        
        explosions.forEach(explosion => {
            ctx.fillStyle = explosion.color.replace(/[\d\.]+\)$/, explosion.alpha + ")");
            ctx.beginPath();
            ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        
        particles.forEach(particle => {
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.drawImage(assets.dragonImage, dragon.x, dragon.y, dragon.width, dragon.height);
        
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
        
        if (powerupsActive.speed_boost || powerupsActive.invincible || powerupsActive.magnet) {
            const remainingTime = Math.max(0, (powerupEndTime - Date.now()) / 1000).toFixed(1);
            let powerupText = "";
            
            if (powerupsActive.speed_boost) powerupText += "SPEED ";
            if (powerupsActive.invincible) powerupText += "INVINCIBLE ";
            if (powerupsActive.magnet) powerupText += "MAGNET ";
            
            powerupText += `(${remainingTime}s)`;
            
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.font = "bold 16px Arial";
            ctx.textAlign = "center";
            ctx.fillText(
                powerupText,
                canvas.width / 2,
                30
            );
        }
    }
}

// Start the game when everything is loaded
window.addEventListener('load', init);
