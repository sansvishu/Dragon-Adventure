// Game Constants
const DRAGON_TYPES = {
    "fire": { 
        name: "Fire",
        color: "#ff3333", 
        speed: 5, 
        ability: "Fireball", 
        cooldown: 3000, 
        damage: 3,
        abilitySound: "fireSound"
    },
    "ice": { 
        name: "Ice",
        color: "#3333ff", 
        speed: 6, 
        ability: "Freeze", 
        cooldown: 5000, 
        duration: 3000,
        abilitySound: "freezeSound"
    },
    "storm": { 
        name: "Storm",
        color: "#aa33ff", 
        speed: 7, 
        ability: "Lightning", 
        cooldown: 4000, 
        damage: 2,
        abilitySound: "lightningSound"
    }
};

const POWERUP_TYPES = {
    "speed_boost": { color: "#00ff00", duration: 10000, name: "Speed Boost" },
    "invincible": { color: "#ffff00", duration: 10000, name: "Invincibility" },
    "magnet": { color: "#ff00ff", duration: 10000, name: "Gem Magnet" },
    "extra_life": { color: "#ff0000", name: "Extra Life" }
};

// Game State
let canvas, ctx;
let gameActive = false;
let score = 0;
let level = 1;
let lives = 3;
let currentDragon = "fire";
let bossActive = false;
let abilityCooldown = 0;
let powerupsActive = {};
let isMobile = false;
let lastTime = 0;
let deltaTime = 0;

// Game Objects
let dragon = {
    x: 400, y: 500, width: 60, height: 60,
    speed: DRAGON_TYPES["fire"].speed,
    dx: 0, dy: 0
};
let gems = [];
let enemies = [];
let powerups = [];
let abilities = [];
let boss = null;
let explosions = [];
let particles = [];

// DOM Elements
const domElements = {};

// Sound Effects
const sounds = {
    bgMusic: new Audio(),
    coinSound: new Audio(),
    loseSound: new Audio(),
    hitSound: new Audio(),
    levelClearSound: new Audio(),
    bonusSound: new Audio(),
    fireSound: new Audio(),
    freezeSound: new Audio(),
    lightningSound: new Audio(),
    bossSound: new Audio()
};

// Initialize game
async function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Check if mobile
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        document.getElementById('mobileControls').style.display = 'grid';
        setupMobileControls();
    }
    
    // Cache DOM elements
    cacheDOMElements();
    
    // Setup event listeners
    setupEventListeners();
    
    // Configure sounds
    configureSounds();
    
    // Start game loop
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
    const container = document.getElementById('gameContainer');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Adjust dragon position if game is active
    if (gameActive) {
        dragon.x = Math.min(dragon.x, canvas.width - dragon.width);
        dragon.y = Math.min(dragon.y, canvas.height - dragon.height);
    }
}

function cacheDOMElements() {
    // Screens
    domElements.menuScreen = document.getElementById('menuScreen');
    domElements.gameOverScreen = document.getElementById('gameOverScreen');
    domElements.dragonSelectScreen = document.getElementById('dragonSelectScreen');
    domElements.instructionsScreen = document.getElementById('instructionsScreen');
    domElements.pauseScreen = document.getElementById('pauseScreen');
    
    // Buttons
    domElements.startButton = document.getElementById('startButton');
    domElements.restartButton = document.getElementById('restartButton');
    domElements.quitButton = document.getElementById('quitButton');
    domElements.quitButton2 = document.getElementById('quitButton2');
    domElements.dragonSelectButton = document.getElementById('dragonSelectButton');
    domElements.instructionsButton = document.getElementById('instructionsButton');
    domElements.backToMenuButton = document.getElementById('backToMenuButton');
    domElements.backToMenuButton2 = document.getElementById('backToMenuButton2');
    domElements.resumeButton = document.getElementById('resumeButton');
    domElements.muteButton = document.getElementById('muteButton');
    
    // HUD Elements
    domElements.scoreDisplay = document.getElementById('scoreDisplay');
    domElements.levelDisplay = document.getElementById('levelDisplay');
    domElements.livesDisplay = document.getElementById('livesDisplay');
    domElements.dragonDisplay = document.getElementById('dragonDisplay');
    domElements.abilityBar = document.getElementById('abilityBar');
    domElements.abilityText = document.getElementById('abilityText');
    domElements.finalScore = document.getElementById('finalScore');
    domElements.finalLevel = document.getElementById('finalLevel');
    
    // Mobile Controls
    domElements.mobileControls = document.getElementById('mobileControls');
    domElements.upBtn = document.getElementById('upBtn');
    domElements.downBtn = document.getElementById('downBtn');
    domElements.leftBtn = document.getElementById('leftBtn');
    domElements.rightBtn = document.getElementById('rightBtn');
    domElements.abilityBtn = document.getElementById('abilityBtn');
}

function setupEventListeners() {
    // Button events
    domElements.startButton.addEventListener('click', startGame);
    domElements.restartButton.addEventListener('click', startGame);
    domElements.quitButton.addEventListener('click', showMenu);
    domElements.quitButton2.addEventListener('click', showMenu);
    domElements.dragonSelectButton.addEventListener('click', showDragonSelect);
    domElements.instructionsButton.addEventListener('click', showInstructions);
    domElements.backToMenuButton.addEventListener('click', showMenu);
    domElements.backToMenuButton2.addEventListener('click', showMenu);
    domElements.resumeButton.addEventListener('click', resumeGame);
    domElements.muteButton.addEventListener('click', toggleMute);
    
    // Dragon selection
    document.querySelectorAll('.dragon-option').forEach(option => {
        option.addEventListener('click', () => selectDragon(option.dataset.dragon));
    });
    
    // Keyboard controls
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    window.addEventListener('keydown', handleGlobalKeys);
}

function configureSounds() {
    // Configure sound properties
    sounds.bgMusic.loop = true;
    sounds.bgMusic.volume = 0.4;
    
    // Set all other sounds to appropriate volumes
    Object.keys(sounds).forEach(key => {
        if (key !== 'bgMusic') {
            sounds[key].volume = 0.7;
        }
    });
}

function setupMobileControls() {
    const handleTouchStart = (direction) => {
        if (!gameActive) return;
        
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
    
    domElements.upBtn.addEventListener('touchstart', () => handleTouchStart('up'));
    domElements.upBtn.addEventListener('touchend', () => handleTouchEnd('up'));
    
    domElements.downBtn.addEventListener('touchstart', () => handleTouchStart('down'));
    domElements.downBtn.addEventListener('touchend', () => handleTouchEnd('down'));
    
    domElements.leftBtn.addEventListener('touchstart', () => handleTouchStart('left'));
    domElements.leftBtn.addEventListener('touchend', () => handleTouchEnd('left'));
    
    domElements.rightBtn.addEventListener('touchstart', () => handleTouchStart('right'));
    domElements.rightBtn.addEventListener('touchend', () => handleTouchEnd('right'));
    
    domElements.abilityBtn.addEventListener('touchstart', useAbility);
    
    // Prevent default to avoid scrolling
    document.querySelectorAll('.mobile-btn').forEach(btn => {
        btn.addEventListener('touchstart', (e) => e.preventDefault());
    });
}

function handleGlobalKeys(e) {
    if (e.key === 'Escape') {
        if (gameActive) {
            pauseGame();
        } else if (document.getElementById('pauseScreen').classList.contains('active')) {
            resumeGame();
        }
    }
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

function toggleMute() {
    const isMuted = domElements.muteButton.classList.toggle('muted');
    const icon = domElements.muteButton.querySelector('#muteIcon');
    const text = domElements.muteButton.querySelector('#muteText');
    
    icon.textContent = isMuted ? "🔇" : "🔊";
    text.textContent = isMuted ? "Sound Off" : "Sound On";
    
    Object.values(sounds).forEach(sound => {
        sound.muted = isMuted;
    });
}

function showMenu() {
    gameActive = false;
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    domElements.menuScreen.classList.add('active');
    sounds.bgMusic.pause();
}

function showDragonSelect() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    domElements.dragonSelectScreen.classList.add('active');
}

function showInstructions() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    domElements.instructionsScreen.classList.add('active');
}

function pauseGame() {
    gameActive = false;
    domElements.pauseScreen.classList.add('active');
    sounds.bgMusic.pause();
}

function resumeGame() {
    gameActive = true;
    domElements.pauseScreen.classList.remove('active');
    lastTime = performance.now();
    sounds.bgMusic.play();
}

function selectDragon(type) {
    currentDragon = type;
    dragon.speed = DRAGON_TYPES[type].speed;
    domElements.dragonDisplay.textContent = DRAGON_TYPES[type].name;
    showMenu();
}

function startGame() {
    // Reset game state
    gameActive = true;
    score = 0;
    level = 1;
    lives = 3;
    bossActive = false;
    
    // Reset dragon
    dragon.x = canvas.width / 2 - dragon.width / 2;
    dragon.y = canvas.height - dragon.height - 20;
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
    
    // Reset powerups
    powerupsActive = {};
    
    // Generate initial objects
    generateObjects();
    
    // Hide menus
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Play background music
    if (!domElements.muteButton.classList.contains('muted')) {
        sounds.bgMusic.currentTime = 0;
        sounds.bgMusic.play();
    }
    
    // Update HUD
    updateHUD();
    
    // Reset ability cooldown
    abilityCooldown = 0;
    domElements.abilityBar.style.transform = 'scaleX(1)';
    domElements.abilityText.textContent = `${DRAGON_TYPES[currentDragon].ability} Ready (Press Space)`;
    
    lastTime = performance.now();
}

function generateObjects() {
    // Generate gems
    const gemCount = Math.min(5 + level, 15);
    for (let i = 0; i < gemCount; i++) {
        gems.push({
            x: Math.random() * (canvas.width - 30),
            y: Math.random() * (canvas.height - 150),
            width: 30,
            height: 30,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            value: 10 + Math.floor(level / 2)
        });
    }
    
    // Generate enemies every 3 levels
    if (level % 3 === 0) {
        const enemyCount = Math.min(Math.floor(level / 3), 4);
        for (let i = 0; i < enemyCount; i++) {
            enemies.push({
                x: Math.random() * (canvas.width - 40),
                y: Math.random() * -100 - 40,
                width: 40,
                height: 40,
                speed: 1 + Math.random() * 1.5,
                frozen: false,
                frozenTime: 0,
                health: 1,
                value: 20
            });
        }
    }
    
    // Generate boss every 10 levels
    if (level % 10 === 0) {
        spawnBoss();
    }
    
    // Generate powerups (40% chance)
    if (Math.random() < 0.4) {
        const powerTypes = Object.keys(POWERUP_TYPES);
        const powerType = Math.random() < 0.7 ? 
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
    if (!domElements.muteButton.classList.contains('muted')) {
        sounds.bossSound.currentTime = 0;
        sounds.bossSound.play();
    }
    
    boss = {
        x: canvas.width / 2 - 50,
        y: 100,
        width: 100,
        height: 100,
        speed: 1.5,
        direction: 1,
        health: 5 + level,
        maxHealth: 5 + level,
        attackCooldown: 0,
        phase: 1,
        lastPhaseChange: 0,
        value: 50 * level
    };
}

function useAbility() {
    if (Date.now() < abilityCooldown || !gameActive) return;
    
    abilityCooldown = Date.now() + DRAGON_TYPES[currentDragon].cooldown;
    updateAbilityBar();
    
    if (!domElements.muteButton.classList.contains('muted')) {
        sounds[DRAGON_TYPES[currentDragon].abilitySound].currentTime = 0;
        sounds[DRAGON_TYPES[currentDragon].abilitySound].play();
    }
    
    switch(currentDragon) {
        case "fire":
            abilities.push({
                x: dragon.x + dragon.width/2 - 10,
                y: dragon.y - 10,
                width: 20,
                height: 20,
                speed: 8,
                damage: DRAGON_TYPES[currentDragon].damage,
                type: "fireball"
            });
            break;
            
        case "ice":
            enemies.forEach(enemy => {
                enemy.frozen = true;
                enemy.frozenTime = Date.now() + DRAGON_TYPES[currentDragon].duration;
            });
            
            createParticles({
                x: dragon.x + dragon.width/2,
                y: dragon.y + dragon.height/2,
                count: 30,
                color: [150, 200, 255],
                size: [2, 6],
                speed: 4,
                life: [40, 80]
            });
            break;
            
        case "storm":
            for (let i = 0; i < 2; i++) {
                abilities.push({
                    x: dragon.x + dragon.width/2 - 5,
                    y: dragon.y - 30 - i * 20,
                    width: 10,
                    height: 30,
                    lifetime: 25,
                    damage: DRAGON_TYPES[currentDragon].damage,
                    type: "lightning"
                });
            }
            break;
    }
}

function updateAbilityBar() {
    const abilityBar = domElements.abilityBar;
    abilityBar.style.transform = 'scaleX(0)';
    
    const startTime = Date.now();
    const duration = DRAGON_TYPES[currentDragon].cooldown;
    
    function animate() {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        abilityBar.style.transform = `scaleX(${progress})`;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            domElements.abilityText.textContent = `${DRAGON_TYPES[currentDragon].ability} Ready (Press Space)`;
        }
    }
    
    domElements.abilityText.textContent = `${DRAGON_TYPES[currentDragon].ability} Cooldown`;
    animate();
}

function createParticles(options) {
    const { x, y, count, color, size, speed, life } = options;
    
    for (let i = 0; i < count; i++) {
        particles.push({
            x,
            y,
            size: Math.random() * (size[1] - size[0]) + size[0],
            color: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${Math.random() * 0.7 + 0.3})`,
            speedX: (Math.random() - 0.5) * speed,
            speedY: (Math.random() - 0.5) * speed,
            life: Math.random() * (life[1] - life[0]) + life[0]
        });
    }
}

function createExplosion(x, y, particleCount = 15) {
    explosions.push({
        x, y,
        radius: 5,
        growthRate: 1.5,
        alpha: 1,
        color: `rgba(255, 150, 50, 1)`
    });
    
    createParticles({
        x, y,
        count: particleCount,
        color: [255, 150, 50],
        size: [2, 5],
        speed: 6,
        life: [20, 40]
    });
}

function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

function updateHUD() {
    domElements.scoreDisplay.textContent = score;
    domElements.levelDisplay.textContent = level;
    domElements.livesDisplay.textContent = lives;
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
    
    // Update dragon position
    dragon.x += dragon.dx * deltaFactor;
    dragon.y += dragon.dy * deltaFactor;
    
    // Keep dragon within bounds
    dragon.x = Math.max(0, Math.min(canvas.width - dragon.width, dragon.x));
    dragon.y = Math.max(0, Math.min(canvas.height - dragon.height, dragon.y));
    
    // Magnet powerup effect
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
    
    // Update powerups timer
    if (Object.values(powerupsActive).some(Boolean)) {
        if (Date.now() > powerupEndTime) {
            Object.keys(powerupsActive).forEach(key => {
                powerupsActive[key] = false;
            });
        }
    }
    
    // Update gems rotation
    gems.forEach(gem => {
        gem.rotation += gem.rotationSpeed * deltaFactor;
    });
    
    // Check gem collisions
    for (let i = gems.length - 1; i >= 0; i--) {
        const gem = gems[i];
        if (checkCollision(dragon, gem)) {
            gems.splice(i, 1);
            score += gem.value;
            if (!domElements.muteButton.classList.contains('muted')) {
                sounds.coinSound.currentTime = 0;
                sounds.coinSound.play();
            }
            updateHUD();
            
            createParticles({
                x: gem.x + gem.width/2,
                y: gem.y + gem.height/2,
                count: 8,
                color: [255, 215, 0],
                size: [2, 5],
                speed: 2,
                life: [20, 40]
            });
        }
    }
    
    // Update powerups rotation
    powerups.forEach(powerup => {
        powerup.rotation += powerup.rotationSpeed * deltaFactor;
    });
    
    // Check powerup collisions
    for (let i = powerups.length - 1; i >= 0; i--) {
        const powerup = powerups[i];
        if (checkCollision(dragon, powerup)) {
            powerups.splice(i, 1);
            if (!domElements.muteButton.classList.contains('muted')) {
                sounds.bonusSound.currentTime = 0;
                sounds.bonusSound.play();
            }
            
            if (powerup.type === "extra_life") {
                lives++;
                createParticles({
                    x: powerup.x + powerup.width/2,
                    y: powerup.y + powerup.height/2,
                    count: 10,
                    color: [255, 50, 50],
                    size: [2, 6],
                    speed: 3,
                    life: [30, 60]
                });
            } else {
                powerupsActive[powerup.type] = true;
                powerupEndTime = Date.now() + POWERUP_TYPES[powerup.type].duration;
                
                createParticles({
                    x: powerup.x + powerup.width/2,
                    y: powerup.y + powerup.height/2,
                    count: 15,
                    color: [255, 255, 100],
                    size: [2, 7],
                    speed: 4,
                    life: [40, 80]
                });
            }
            updateHUD();
        }
    }
    
    // Update enemies
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
            if (!domElements.muteButton.classList.contains('muted')) {
                sounds.hitSound.currentTime = 0;
                sounds.hitSound.play();
            }
            updateHUD();
            
            createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 15);
            
            if (lives <= 0) {
                gameOver();
            } else {
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
            ability.y -= ability.speed * deltaFactor;
            
            if (ability.y + ability.height < 0) {
                abilities.splice(i, 1);
                continue;
            }
            
            // Check enemy collisions
            for (let j = enemies.length - 1; j >= 0; j--) {
                if (checkCollision(ability, enemies[j])) {
                    enemies[j].health -= ability.damage;
                    
                    if (enemies[j].health <= 0) {
                        createExplosion(enemies[j].x + enemies[j].width/2, enemies[j].y + enemies[j].height/2, 10);
                        score += enemies[j].value;
                        enemies.splice(j, 1);
                    }
                    
                    abilities.splice(i, 1);
                    updateHUD();
                    break;
                }
            }
            
            // Check boss collision
            if (bossActive && checkCollision(ability, boss)) {
                boss.health -= ability.damage;
                abilities.splice(i, 1);
                
                createExplosion(ability.x + ability.width/2, ability.y + ability.height/2, 8);
                
                if (boss.health <= 0) {
                    defeatBoss();
                }
            }
        }
        else if (ability.type === "lightning") {
            ability.lifetime--;
            
            if (ability.lifetime <= 0) {
                abilities.splice(i, 1);
                continue;
            }
            
            // Damage all enemies in range
            for (let j = enemies.length - 1; j >= 0; j--) {
                if (checkCollision(ability, enemies[j])) {
                    enemies[j].health -= ability.damage;
                    
                    if (enemies[j].health <= 0) {
                        createExplosion(enemies[j].x + enemies[j].width/2, enemies[j].y + enemies[j].height/2, 10);
                        score += enemies[j].value;
                        enemies.splice(j, 1);
                        updateHUD();
                    }
                }
            }
            
            // Damage boss
            if (bossActive && checkCollision(ability, boss)) {
                boss.health -= ability.damage;
                
                if (boss.health <= 0) {
                    defeatBoss();
                }
            }
        }
    }
    
    // Update boss
    if (bossActive) {
        boss.x += boss.speed * boss.direction * deltaFactor;
        
        if (boss.x + boss.width > canvas.width || boss.x < 0) {
            boss.direction *= -1;
        }
        
        // Boss phase changes
        if (Date.now() - boss.lastPhaseChange > 15000) {
            boss.lastPhaseChange = Date.now();
            boss.phase++;
            boss.speed += 0.3;
            
            createParticles({
                x: boss.x + boss.width/2,
                y: boss.y + boss.height/2,
                count: 30,
                color: [255, 0, 0],
                size: [2, 7],
                speed: 6,
                life: [30, 60]
            });
        }
        
        // Boss attacks
        if (Date.now() > boss.attackCooldown) {
            boss.attackCooldown = Date.now() + 3000 / boss.phase;
            
            const attackCount = 1 + Math.floor(boss.phase / 3);
            for (let i = 0; i < attackCount; i++) {
                enemies.push(createEnemy());
            }
        }
    }
    
    // Update explosions
    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].radius += explosions[i].growthRate * deltaFactor;
        explosions[i].alpha -= 0.015 * deltaFactor;
        
        if (explosions[i].alpha <= 0) {
            explosions.splice(i, 1);
        }
    }
    
    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].x += particles[i].speedX * deltaFactor;
        particles[i].y += particles[i].speedY * deltaFactor;
        particles[i].life--;
        
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
    
    // Level complete check
    if (gems.length === 0 && !bossActive) {
        levelComplete();
    }
}

function defeatBoss() {
    createParticles({
        x: boss.x + boss.width/2,
        y: boss.y + boss.height/2,
        count: 50,
        color: [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)],
        size: [3, 9],
        speed: 8,
        life: [40, 80]
    });
    
    bossActive = false;
    score += boss.value;
    updateHUD();
    if (!domElements.muteButton.classList.contains('muted')) {
        sounds.levelClearSound.currentTime = 0;
        sounds.levelClearSound.play();
    }
}

function levelComplete() {
    if (!domElements.muteButton.classList.contains('muted')) {
        sounds.levelClearSound.currentTime = 0;
        sounds.levelClearSound.play();
    }
    level++;
    updateHUD();
    generateObjects();
}

function gameOver() {
    gameActive = false;
    if (!domElements.muteButton.classList.contains('muted')) {
        sounds.loseSound.currentTime = 0;
        sounds.loseSound.play();
    }
    sounds.bgMusic.pause();
    
    domElements.finalScore.textContent = score;
    domElements.finalLevel.textContent = level;
    domElements.gameOverScreen.classList.add('active');
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    if (gameActive) {
        // Draw gems
        gems.forEach(gem => {
            ctx.save();
            ctx.translate(gem.x + gem.width/2, gem.y + gem.height/2);
            ctx.rotate(gem.rotation);
            
            ctx.fillStyle = '#f8d030';
            ctx.beginPath();
            ctx.moveTo(0, -gem.height/2);
            ctx.lineTo(gem.width/3, -gem.height/4);
            ctx.lineTo(gem.width/2, 0);
            ctx.lineTo(gem.width/3, gem.height/4);
            ctx.lineTo(0, gem.height/2);
            ctx.lineTo(-gem.width/3, gem.height/4);
            ctx.lineTo(-gem.width/2, 0);
            ctx.lineTo(-gem.width/3, -gem.height/4);
            ctx.closePath();
            ctx.fill();
            
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(0, 0, gem.width/4, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });
        
        // Draw powerups
        powerups.forEach(powerup => {
            ctx.save();
            ctx.translate(powerup.x + powerup.width/2, powerup.y + powerup.height/2);
            ctx.rotate(powerup.rotation);
            
            ctx.fillStyle = POWERUP_TYPES[powerup.type].color;
            ctx.beginPath();
            ctx.moveTo(0, -powerup.height/2);
            for (let i = 1; i <= 5; i++) {
                const angle = (i * 2 * Math.PI / 5) - Math.PI/2;
                const radius = i % 2 === 0 ? powerup.height/3 : powerup.height/2;
                ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            }
            ctx.closePath();
            ctx.fill();
            
            if (powerup.type === "extra_life") {
                ctx.fillStyle = "white";
                ctx.font = "bold 14px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("+1", 0, 0);
            }
            
            ctx.restore();
        });
        
        // Draw enemies
        enemies.forEach(enemy => {
            if (enemy.frozen) {
                ctx.save();
                ctx.globalAlpha = 0.7;
                drawEnemy(enemy);
                ctx.restore();
                
                ctx.fillStyle = "rgba(100, 100, 255, 0.3)";
                ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            } else {
                drawEnemy(enemy);
            }
        });
        
        function drawEnemy(enemy) {
            ctx.fillStyle = '#ff3333';
            ctx.beginPath();
            ctx.arc(
                enemy.x + enemy.width/2,
                enemy.y + enemy.height/2,
                enemy.width/2,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            // Eyes
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(
                enemy.x + enemy.width/3,
                enemy.y + enemy.height/3,
                enemy.width/8,
                0,
                Math.PI * 2
            );
            ctx.arc(
                enemy.x + enemy.width * 2/3,
                enemy.y + enemy.height/3,
                enemy.width/8,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            // Mouth
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(
                enemy.x + enemy.width/2,
                enemy.y + enemy.height/2,
                enemy.width/4,
                0.1 * Math.PI,
                0.9 * Math.PI
            );
            ctx.stroke();
        }
        
        // Draw abilities
        abilities.forEach(ability => {
            if (ability.type === "fireball") {
                drawFireball(ability);
            } 
            else if (ability.type === "lightning") {
                drawLightning(ability);
            }
        });
        
        function drawFireball(fireball) {
            ctx.fillStyle = "#ff9933";
            ctx.beginPath();
            ctx.arc(
                fireball.x + fireball.width/2,
                fireball.y + fireball.height/2,
                fireball.width/2,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            ctx.fillStyle = "#ff3333";
            ctx.beginPath();
            ctx.arc(
                fireball.x + fireball.width/2,
                fireball.y + fireball.height/2,
                fireball.width/3,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            const gradient = ctx.createRadialGradient(
                fireball.x + fireball.width/2,
                fireball.y + fireball.height/2,
                fireball.width/3,
                fireball.x + fireball.width/2,
                fireball.y + fireball.height/2,
                fireball.width/2 + 4
            );
            gradient.addColorStop(0, "rgba(255, 100, 0, 0.7)");
            gradient.addColorStop(1, "rgba(255, 100, 0, 0)");
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(
                fireball.x + fireball.width/2,
                fireball.y + fireball.height/2,
                fireball.width/2 + 4,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            if (Math.random() < 0.2) {
                particles.push({
                    x: fireball.x + fireball.width/2,
                    y: fireball.y + fireball.height,
                    size: Math.random() * 2 + 1,
                    color: `rgba(255, ${Math.floor(100 + Math.random() * 100)}, 0, ${Math.random() * 0.5 + 0.5})`,
                    speedX: (Math.random() - 0.5) * 1.5,
                    speedY: -Math.random() * 1.5,
                    life: 15 + Math.random() * 15
                });
            }
        }
        
        function drawLightning(lightning) {
            ctx.strokeStyle = "#aa33ff";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(lightning.x + lightning.width/2, lightning.y);
            ctx.lineTo(lightning.x + lightning.width/2, lightning.y + lightning.height);
            ctx.stroke();
            
            ctx.strokeStyle = "rgba(200, 150, 255, 0.4)";
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(lightning.x + lightning.width/2, lightning.y);
            ctx.lineTo(lightning.x + lightning.width/2, lightning.y + lightning.height);
            ctx.stroke();
            
            if (Math.random() < 0.3) {
                particles.push({
                    x: lightning.x + lightning.width/2 + (Math.random() - 0.5) * 8,
                    y: lightning.y + Math.random() * lightning.height,
                    size: Math.random() * 1.5 + 1,
                    color: `rgba(200, 150, 255, ${Math.random() * 0.5 + 0.5})`,
                    speedX: (Math.random() - 0.5) * 2,
                    speedY: (Math.random() - 0.5) * 2,
                    life: 8 + Math.random() * 8
                });
            }
        }
        
        // Draw boss
        if (bossActive) {
            drawBoss();
        }
        
        function drawBoss() {
            ctx.fillStyle = '#aa0000';
            ctx.beginPath();
            ctx.arc(
                boss.x + boss.width/2,
                boss.y + boss.height/2,
                boss.width/2,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            // Eyes
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(
                boss.x + boss.width/3,
                boss.y + boss.height/3,
                boss.width/8,
                0,
                Math.PI * 2
            );
            ctx.arc(
                boss.x + boss.width * 2/3,
                boss.y + boss.height/3,
                boss.width/8,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            // Mouth
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(
                boss.x + boss.width/2,
                boss.y + boss.height/2,
                boss.width/4,
                0.1 * Math.PI,
                0.9 * Math.PI
            );
            ctx.stroke();
            
            // Health bar
            ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
            ctx.fillRect(boss.x + 10, boss.y - 25, boss.width - 20, 12);
            
            const healthWidth = (boss.width - 20) * (boss.health / boss.maxHealth);
            const healthColor = healthWidth > (boss.width - 20) * 0.5 ? "#00ff00" : 
                              healthWidth > (boss.width - 20) * 0.25 ? "#ffff00" : "#ff0000";
            
            ctx.fillStyle = healthColor;
            ctx.fillRect(boss.x + 10, boss.y - 25, healthWidth, 12);
            
            ctx.fillStyle = "white";
            ctx.font = "bold 10px Arial";
            ctx.textAlign = "center";
            ctx.fillText(
                `BOSS: ${Math.ceil(boss.health)}/${boss.maxHealth}`, 
                boss.x + boss.width/2, 
                boss.y - 18
            );
        }
        
        // Draw explosions
        explosions.forEach(explosion => {
            ctx.fillStyle = explosion.color.replace(/[\d\.]+\)$/, explosion.alpha + ")");
            ctx.beginPath();
            ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw particles
        particles.forEach(particle => {
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw dragon
        drawDragon();
        
        function drawDragon() {
            ctx.fillStyle = DRAGON_TYPES[currentDragon].color;
            ctx.beginPath();
            ctx.moveTo(dragon.x + dragon.width/2, dragon.y);
            ctx.lineTo(dragon.x + dragon.width, dragon.y + dragon.height/2);
            ctx.lineTo(dragon.x + dragon.width/2, dragon.y + dragon.height);
            ctx.lineTo(dragon.x, dragon.y + dragon.height/2);
            ctx.closePath();
            ctx.fill();
            
            // Eyes
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(
                dragon.x + dragon.width/3,
                dragon.y + dragon.height/3,
                dragon.width/8,
                0,
                Math.PI * 2
            );
            ctx.arc(
                dragon.x + dragon.width * 2/3,
                dragon.y + dragon.height/3,
                dragon.width/8,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            // Wings
            ctx.fillStyle = DRAGON_TYPES[currentDragon].color;
            ctx.beginPath();
            ctx.moveTo(dragon.x + dragon.width/2, dragon.y + dragon.height/3);
            ctx.lineTo(dragon.x, dragon.y + dragon.height/2);
            ctx.lineTo(dragon.x + dragon.width/2, dragon.y + dragon.height * 2/3);
            ctx.lineTo(dragon.x + dragon.width, dragon.y + dragon.height/2);
            ctx.closePath();
            ctx.fill();
            
            // Invincibility effect
            if (powerupsActive.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
                ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(
                    dragon.x + dragon.width/2,
                    dragon.y + dragon.height/2,
                    dragon.width/2 + 3,
                    0,
                    Math.PI * 2
                );
                ctx.stroke();
            }
        }
        
        // Draw active powerups timer
        if (Object.values(powerupsActive).some(Boolean)) {
            const remainingTime = Math.max(0, (powerupEndTime - Date.now()) / 1000).toFixed(1);
            let powerupText = "";
            
            if (powerupsActive.speed_boost) powerupText += "SPEED ";
            if (powerupsActive.invincible) powerupText += "INVINCIBLE ";
            if (powerupsActive.magnet) powerupText += "MAGNET ";
            
            powerupText += `(${remainingTime}s)`;
            
            ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
            ctx.font = "bold 14px Arial";
            ctx.textAlign = "center";
            ctx.fillText(powerupText, canvas.width / 2, 25);
        }
    }
}

// Start the game when everything is loaded
window.addEventListener('load', init);
