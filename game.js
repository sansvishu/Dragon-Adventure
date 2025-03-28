// Game Constants
const DRAGON_TYPES = {
    "fire": { 
        name: "Fire",
        color: "#ff3333", 
        speed: 5, 
        ability: "Fireball", 
        cooldown: 3000, 
        damage: 3,
        description: "Shoots powerful fireballs",
        abilitySound: "fireSound"
    },
    "ice": { 
        name: "Ice",
        color: "#3333ff", 
        speed: 6, 
        ability: "Freeze", 
        cooldown: 5000, 
        duration: 3000,
        description: "Freezes all enemies temporarily",
        abilitySound: "freezeSound"
    },
    "storm": { 
        name: "Storm",
        color: "#aa33ff", 
        speed: 7, 
        ability: "Lightning", 
        cooldown: 4000, 
        damage: 2,
        description: "Casts lightning that damages all enemies",
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
const GameState = {
    MENU: 0,
    PLAYING: 1,
    GAME_OVER: 2,
    DRAGON_SELECT: 3,
    INSTRUCTIONS: 4,
    PAUSED: 5,
    LOADING: 6
};

// Game Variables
let canvas, ctx;
let gameState = GameState.LOADING;
let score = 0;
let highScore = localStorage.getItem('dragonAdventureHighScore') || 0;
let level = 1;
let lives = 3;
let currentDragon = "fire";
let bossActive = false;
let abilityCooldown = 0;
let powerupsActive = {};
let isMobile = false;
let lastTime = 0;
let deltaTime = 0;
let loadingProgress = 0;

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

// Image assets
const assets = {
    bg: 'images/background.jpg',
    dragon: 'images/dragon.png',
    fireDragon: 'images/fire-dragon.png',
    iceDragon: 'images/ice-dragon.png',
    stormDragon: 'images/storm-dragon.png',
    coin: 'images/gem.png',
    monster: 'images/enemy.png',
    powerup: 'images/powerup.png',
    boss: 'images/boss.png'
};

// Sound Effects
const sounds = {
    bgMusic: new Audio('sounds/background.mp3'),
    coinSound: new Audio('sounds/coin.mp3'),
    loseSound: new Audio('sounds/lose.mp3'),
    hitSound: new Audio('sounds/hit.mp3'),
    levelClearSound: new Audio('sounds/level-clear.mp3'),
    bonusSound: new Audio('sounds/bonus.mp3'),
    fireSound: new Audio('sounds/fire.mp3'),
    freezeSound: new Audio('sounds/freeze.mp3'),
    lightningSound: new Audio('sounds/lightning.mp3'),
    bossSound: new Audio('sounds/boss.mp3'),
    selectSound: new Audio('sounds/select.mp3')
};

// DOM Elements
let domElements = {};

// Utility Functions
function playSound(soundName, volume = 1.0) {
    if (!domElements.muteButton.classList.contains('muted')) {
        const sound = sounds[soundName].cloneNode();
        sound.volume = volume;
        sound.play().catch(e => console.log("Sound playback prevented:", e));
        return sound;
    }
    return null;
}

function stopSound(soundName) {
    sounds[soundName].pause();
    sounds[soundName].currentTime = 0;
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            loadingProgress += 10;
            updateLoadingScreen();
            resolve(img);
        };
        img.onerror = reject;
        img.src = src;
    });
}

function updateLoadingScreen() {
    const progress = Math.min(loadingProgress, 100);
    domElements.loadingProgress.style.width = `${progress}%`;
    
    if (progress >= 100) {
        setTimeout(() => {
            gameState = GameState.MENU;
            domElements.loadingScreen.classList.remove('active');
            domElements.menuScreen.classList.add('active');
        }, 500);
    }
}

async function loadAssets() {
    try {
        const imagePromises = Object.entries(assets).map(([key, src]) => 
            loadImage(src).then(img => ({ key, img }))
        );
        
        const loadedImages = await Promise.all(imagePromises);
        loadedImages.forEach(({ key, img }) => assets[key] = img);
        
        // Preload sounds
        Object.values(sounds).forEach(sound => {
            sound.load().then(() => {
                loadingProgress += 2;
                updateLoadingScreen();
            }).catch(e => {
                console.error("Error loading sound:", e);
                loadingProgress += 2;
                updateLoadingScreen();
            });
        });
        
    } catch (error) {
        console.error("Error loading assets:", error);
        throw error;
    }
}

// Game Initialization
function cacheDOMElements() {
    domElements = {
        // Screens
        menuScreen: document.getElementById('menuScreen'),
        gameOverScreen: document.getElementById('gameOverScreen'),
        dragonSelectScreen: document.getElementById('dragonSelectScreen'),
        instructionsScreen: document.getElementById('instructionsScreen'),
        loadingScreen: document.getElementById('loadingScreen'),
        pauseScreen: document.getElementById('pauseScreen'),
        
        // Buttons
        startButton: document.getElementById('startButton'),
        restartButton: document.getElementById('restartButton'),
        quitButton: document.getElementById('quitButton'),
        quitButton2: document.getElementById('quitButton2'),
        quitButton3: document.getElementById('quitButton3'),
        dragonSelectButton: document.getElementById('dragonSelectButton'),
        instructionsButton: document.getElementById('instructionsButton'),
        backToMenuButton: document.getElementById('backToMenuButton'),
        backToMenuButton2: document.getElementById('backToMenuButton2'),
        resumeButton: document.getElementById('resumeButton'),
        muteButton: document.getElementById('muteButton'),
        
        // HUD Elements
        scoreDisplay: document.getElementById('scoreDisplay'),
        levelDisplay: document.getElementById('levelDisplay'),
        livesDisplay: document.getElementById('livesDisplay'),
        dragonDisplay: document.getElementById('dragonDisplay'),
        abilityBar: document.getElementById('abilityBar'),
        abilityText: document.getElementById('abilityText'),
        finalScore: document.getElementById('finalScore'),
        finalLevel: document.getElementById('finalLevel'),
        highScore: document.getElementById('highScore'),
        
        // Loading
        loadingProgress: document.getElementById('loadingProgress'),
        
        // Mobile Controls
        mobileControls: document.getElementById('mobileControls'),
        upBtn: document.getElementById('upBtn'),
        downBtn: document.getElementById('downBtn'),
        leftBtn: document.getElementById('leftBtn'),
        rightBtn: document.getElementById('rightBtn'),
        abilityBtn: document.getElementById('abilityBtn')
    };
}

function setupEventListeners() {
    // Button events
    domElements.startButton.addEventListener('click', startGame);
    domElements.restartButton.addEventListener('click', startGame);
    domElements.quitButton.addEventListener('click', showQuitConfirm);
    domElements.quitButton2.addEventListener('click', showQuitConfirm);
    domElements.quitButton3.addEventListener('click', showQuitConfirm);
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
    
    // Window resize
    window.addEventListener('resize', handleResize);
}

function showQuitConfirm() {
    showMenu();
}

function showMenu() {
    gameState = GameState.MENU;
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    domElements.menuScreen.classList.add('active');
    stopSound('bgMusic');
}

function showDragonSelect() {
    gameState = GameState.DRAGON_SELECT;
    domElements.menuScreen.classList.remove('active');
    domElements.dragonSelectScreen.classList.add('active');
    playSound('selectSound');
}

function showInstructions() {
    gameState = GameState.INSTRUCTIONS;
    domElements.menuScreen.classList.remove('active');
    domElements.instructionsScreen.classList.add('active');
    playSound('selectSound');
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
    
    if (!isMuted && gameState === GameState.PLAYING) {
        playSound('bgMusic');
    }
}

function setupMobileControls() {
    const handleTouchStart = (direction) => {
        if (gameState !== GameState.PLAYING) return;
        
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
    switch(e.key) {
        case 'Escape':
            if (gameState === GameState.PLAYING) {
                pauseGame();
            } else if (gameState === GameState.PAUSED) {
                resumeGame();
            }
            break;
    }
}

function keyDown(e) {
    if (gameState !== GameState.PLAYING) return;
    
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

function pauseGame() {
    gameState = GameState.PAUSED;
    domElements.pauseScreen.classList.add('active');
    sounds.bgMusic.pause();
}

function resumeGame() {
    gameState = GameState.PLAYING;
    domElements.pauseScreen.classList.remove('active');
    lastTime = performance.now();
    playSound('bgMusic');
}

function handleResize() {
    if (!canvas) return;
    
    // Adjust canvas size while maintaining aspect ratio
    const container = document.getElementById('gameContainer');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    const aspectRatio = 800 / 600;
    let newWidth, newHeight;
    
    if (containerWidth / containerHeight > aspectRatio) {
        newHeight = containerHeight;
        newWidth = containerHeight * aspectRatio;
    } else {
        newWidth = containerWidth;
        newHeight = containerWidth / aspectRatio;
    }
    
    canvas.width = newWidth;
    canvas.height = newHeight;
    
    // Adjust dragon position
    if (gameState === GameState.PLAYING) {
        dragon.x = Math.min(dragon.x, canvas.width - dragon.width);
        dragon.y = Math.min(dragon.y, canvas.height - dragon.height);
    }
}

// Game Logic
function startGame() {
    // Reset game state
    gameState = GameState.PLAYING;
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
    playSound('bgMusic');
    
    // Update HUD
    updateHUD();
    
    // Reset ability cooldown
    abilityCooldown = 0;
    domElements.abilityBar.style.transform = 'scaleX(1)';
    domElements.abilityText.textContent = `${DRAGON_TYPES[currentDragon].ability} Ready (Press Space)`;
    
    // Set dragon image based on type
    assets.dragon = assets[`${currentDragon}Dragon`] || assets.dragon;
    
    lastTime = performance.now();
}

function selectDragon(type) {
    currentDragon = type;
    dragon.speed = DRAGON_TYPES[type].speed;
    
    domElements.dragonDisplay.textContent = DRAGON_TYPES[type].name;
    showMenu();
    playSound('selectSound');
}

function generateObjects() {
    // Generate gems - 5 gems plus 1 per level (but not too many)
    const gemCount = Math.min(5 + level, 15);
    for (let i = 0; i < gemCount; i++) {
        gems.push(createGem());
    }
    
    // Generate enemies every 3 levels
    if (level % 3 === 0) {
        const enemyCount = Math.min(Math.floor(level / 3), 4);
        for (let i = 0; i < enemyCount; i++) {
            enemies.push(createEnemy());
        }
    }
    
    // Generate boss every 10 levels
    if (level % 10 === 0) {
        spawnBoss();
    }
    
    // Generate powerups (40% chance)
    if (Math.random() < 0.4) {
        powerups.push(createPowerup());
    }
}

function createGem() {
    return {
        x: Math.random() * (canvas.width - 30),
        y: Math.random() * (canvas.height - 150),
        width: 30,
        height: 30,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        value: 10 + Math.floor(level / 2)
    };
}

function createEnemy() {
    return {
        x: Math.random() * (canvas.width - 40),
        y: Math.random() * -100 - 40,
        width: 40,
        height: 40,
        speed: 1 + Math.random() * 1.5,
        frozen: false,
        frozenTime: 0,
        health: 1,
        value: 20
    };
}

function createPowerup() {
    const powerTypes = Object.keys(POWERUP_TYPES);
    const powerType = Math.random() < 0.7 ? 
        powerTypes[Math.floor(Math.random() * powerTypes.length)] : 
        "extra_life";
    
    return {
        x: Math.random() * (canvas.width - 30),
        y: Math.random() * (canvas.height - 150),
        width: 30,
        height: 30,
        type: powerType,
        rotation: 0,
        rotationSpeed: 0.05
    };
}

function spawnBoss() {
    bossActive = true;
    playSound('bossSound');
    
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
    if (Date.now() < abilityCooldown || gameState !== GameState.PLAYING) return;
    
    abilityCooldown = Date.now() + DRAGON_TYPES[currentDragon].cooldown;
    updateAbilityBar();
    
    playSound(DRAGON_TYPES[currentDragon].abilitySound);
    
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
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('dragonAdventureHighScore', highScore);
    }
}

// Game Loop
function gameLoop(timestamp) {
    deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    if (gameState === GameState.PLAYING) {
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
            playSound('coinSound');
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
            playSound('bonusSound');
            
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
            playSound('hitSound');
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
    playSound('levelClearSound');
}

function levelComplete() {
    playSound('levelClearSound');
    level++;
    updateHUD();
    generateObjects();
}

function gameOver() {
    gameState = GameState.GAME_OVER;
    playSound('loseSound');
    stopSound('bgMusic');
    
    domElements.finalScore.textContent = score;
    domElements.finalLevel.textContent = level;
    domElements.highScore.textContent = highScore;
    
    domElements.gameOverScreen.classList.add('active');
}

// Rendering
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.drawImage(assets.bgImage, 0, 0, canvas.width, canvas.height);
    
    if (gameState === GameState.PLAYING) {
        // Draw gems
        gems.forEach(gem => {
            ctx.save();
            ctx.translate(gem.x + gem.width/2, gem.y + gem.height/2);
            ctx.rotate(gem.rotation);
            ctx.drawImage(assets.coinImage, -gem.width/2, -gem.height/2, gem.width, gem.height);
            ctx.restore();
        });
        
        // Draw powerups
        powerups.forEach(powerup => {
            ctx.save();
            ctx.translate(powerup.x + powerup.width/2, powerup.y + powerup.height/2);
            ctx.rotate(powerup.rotation);
            ctx.drawImage(assets.powerupImage, -powerup.width/2, -powerup.height/2, powerup.width, powerup.height);
            
            if (powerup.type === "extra_life") {
                ctx.fillStyle = POWERUP_TYPES[powerup.type].color;
                ctx.font = "bold 18px Arial";
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
                ctx.drawImage(assets.monsterImage, enemy.x, enemy.y, enemy.width, enemy.height);
                ctx.restore();
                
                ctx.fillStyle = "rgba(100, 100, 255, 0.3)";
                ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            } else {
                ctx.drawImage(assets.monsterImage, enemy.x, enemy.y, enemy.width, enemy.height);
            }
        });
        
        // Draw abilities
        abilities.forEach(ability => {
            if (ability.type === "fireball") {
                drawFireball(ability);
            } 
            else if (ability.type === "lightning") {
                drawLightning(ability);
            }
        });
        
        // Draw boss
        if (bossActive) {
            drawBoss();
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
        ctx.drawImage(assets.dragon, dragon.x, dragon.y, dragon.width, dragon.height);
        
        // Draw invincibility effect
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

function drawBoss() {
    ctx.drawImage(assets.bossImage, boss.x, boss.y, boss.width, boss.height);
    
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
    
    // Phase indicator
    ctx.fillStyle = "rgba(255, 0, 0, 0.6)";
    ctx.font = "bold 12px Arial";
    ctx.fillText(
        `PHASE ${boss.phase}`, 
        boss.x + boss.width/2, 
        boss.y - 35
    );
}

// Initialize the game
async function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Check if mobile
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Cache DOM elements
    cacheDOMElements();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load assets
    await loadAssets();
    
    // Handle initial resize
    handleResize();
    
    // Start game loop
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

// Start the game when everything is loaded
window.addEventListener('load', init);
