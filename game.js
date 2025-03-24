let pirateName = "";
let lives = 3;
let score = 0;
let treasuresCollected = 0;
let level = 1;

const clues = [
    "The treasure is buried near a tall palm tree. 🌴",
    "Look for a big rock shaped like a turtle. 🪨",
    "Dig where the sand is golden and soft. 🏖️",
    "You're close! The treasure chest is hidden under a pile of seashells. 🐚"
];

const events = [
    "You found a shiny gold coin! 💰",
    "A friendly parrot gives you a hint: 'Look for the big rock!' 🦜",
    "You stumbled upon a map! It shows the treasure is close. 🗺️",
    "You take a break and enjoy the ocean breeze. 🌊",
    "You found a mysterious key! It might unlock something later. 🔑"
];

function startGame() {
    pirateName = document.getElementById("pirate-name").value;
    if (!pirateName) {
        alert("Please enter a pirate name!");
        return;
    }

    document.getElementById("player-info").classList.add("hidden");
    document.getElementById("game-screen").classList.remove("hidden");
    nextLevel();
}

function nextLevel() {
    if (level > 3) {
        showGameOver();
        return;
    }

    document.getElementById("level-text").innerText = `Level ${level}`;
    document.getElementById("lives-text").innerText = `Lives left: ❤️ x ${lives}`;
    document.getElementById("score-text").innerText = `Score: ⭐ ${score}`;
    document.getElementById("treasure-text").innerText = `Treasures collected: 💎 x ${treasuresCollected}`;

    generateMathProblem();
}

function generateMathProblem() {
    const problemData = generateMathProblemData(level);
    document.getElementById("problem").innerText = `What is ${problemData.problem}?`;
    document.getElementById("answer").value = "";
    document.getElementById("answer").focus();
    document.getElementById("event-text").innerText = "";
}

function generateMathProblemData(level) {
    let num1, num2, operator;
    if (level === 1) {
        num1 = randomInt(1, 10);
        num2 = randomInt(1, 10);
        operator = randomChoice(["+", "-"]);
    } else if (level === 2) {
        num1 = randomInt(10, 20);
        num2 = randomInt(1, 10);
        operator = randomChoice(["+", "-", "*"]);
    } else {
        num1 = randomInt(1, 10);
        num2 = randomInt(1, 5);
        operator = randomChoice(["*", "/"]);
        if (operator === "/") {
            num1 = num2 * randomInt(1, 5);  // Ensure whole numbers
        }
    }

    const answer = evaluateMathProblem(num1, num2, operator);
    const problem = `${num1} ${operator} ${num2}`;
    return { problem, answer };
}

function evaluateMathProblem(num1, num2, operator) {
    if (operator === "+") return num1 + num2;
    if (operator === "-") return num1 - num2;
    if (operator === "*") return num1 * num2;
    if (operator === "/") return Math.floor(num1 / num2);
}

function checkAnswer() {
    const answer = parseInt(document.getElementById("answer").value);
    const problemData = generateMathProblemData(level);
    if (answer === problemData.answer) {
        score += 10;
        treasuresCollected += 1;
        const event = randomChoice(events);
        document.getElementById("event-text").innerText = event;
        level++;
        nextLevel();
    } else {
        lives--;
        document.getElementById("lives-text").innerText = `Lives left: ❤️ x ${lives}`;
        if (lives === 0) {
            showGameOver();
        } else {
            generateMathProblem();
        }
    }
}

function showGameOver() {
    document.getElementById("game-screen").classList.add("hidden");
    document.getElementById("game-over").classList.remove("hidden");
    document.getElementById("final-score").innerText = `Your final score is: ⭐ ${score}`;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
