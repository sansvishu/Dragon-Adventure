// [Previous game constants and variables...]

// Modified init() function for mobile
async function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size to window size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Adjust dragon position for mobile
        dragon.x = canvas.width / 2 - dragon.width / 2;
        dragon.y = canvas.height - dragon.height - 20;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Check if mobile
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        document.getElementById('mobileControls').style.display = 'flex';
        setupMobileControls();
        
        // Adjust HUD text for mobile
        document.getElementById('abilityText').textContent = "Ability Ready (Tap A)";
    }
    
    // [Rest of your init function...]
}

// Enhanced mobile controls
function setupMobileControls() {
    const controls = {
        up: false,
        down: false,
        left: false,
        right: false
    };

    function updateMovement() {
        const speed = dragon.speed * (powerupsActive.speed_boost ? 1.5 : 1);
        dragon.dx = (controls.right - controls.left) * speed;
        dragon.dy = (controls.down - controls.up) * speed;
    }

    // Touch events
    function handleTouchStart(direction) {
        controls[direction] = true;
        updateMovement();
    }

    function handleTouchEnd(direction) {
        controls[direction] = false;
        updateMovement();
    }

    // Button event listeners
    document.getElementById('upBtn').addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleTouchStart('up');
    });
    document.getElementById('upBtn').addEventListener('touchend', (e) => {
        e.preventDefault();
        handleTouchEnd('up');
    });
    
    // [Repeat for down, left, right buttons...]

    document.getElementById('abilityBtn').addEventListener('touchstart', (e) => {
        e.preventDefault();
        useAbility();
    });

    // Prevent default touch behaviors
    document.querySelectorAll('.mobile-btn').forEach(btn => {
        btn.addEventListener('touchstart', (e) => e.preventDefault());
        btn.addEventListener('touchend', (e) => e.preventDefault());
    });
}

// Modified game loop for mobile performance
function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    deltaTime = timestamp - lastTime;
    
    // Cap deltaTime to prevent large jumps when tab is inactive
    if (deltaTime > 100) deltaTime = 16.67;
    
    if (gameActive) {
        update(deltaTime);
    }
    render();
    
    lastTime = timestamp;
    requestAnimationFrame(gameLoop);
}

// [Rest of your game.js remains the same...]
