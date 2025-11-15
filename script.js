/* Jogo da Cobra - script.js */

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');

let GRID = 20;              // tamanho de cada célula
let speed = 10;             // velocidade da cobra (ticks por segundo)
let snake, nextDir, dir, food, score;
let running = false;
let tickHandle;
let cols, rows;


// ===================== RESET =====================

function reset() {
    snake = [{ x: 5, y: 5 }];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    placeFood();
    draw();
}


// ===================== OVERLAY =====================

function overlayOpen(text) {
    document.getElementById('overlay-title').textContent = text;
    overlay.style.display = 'flex';
    overlay.style.pointerEvents = 'auto';
}


// ===================== INICIAR JOGO =====================

function startGame() {
    if (running) return;
    running = true;

    overlay.style.display = 'none';
    overlay.style.pointerEvents = 'none';

    tickHandle = setInterval(gameTick, 1000 / speed);
}


// ===================== PAUSAR =====================

function pauseGame() {
    if (!running) return;

    running = false;
    clearInterval(tickHandle);

    overlayOpen("Pausado");
}


// ===================== LOOP DO JOGO =====================

function gameTick() {
    dir = nextDir;

    const head = {
        x: snake[0].x + dir.x,
        y: snake[0].y + dir.y
    };

    // checagem de morte
    if (
        head.x < 0 || head.y < 0 ||
        head.x >= cols || head.y >= rows ||
        snake.some(s => s.x === head.x && s.y === head.y)
    ) {
        running = false;
        clearInterval(tickHandle);
        overlayOpen("Game Over — Sua pontuação: " + score + "\nClique para reiniciar");
        playBeep(220, 0.25);
        return;
    }

    snake.unshift(head);

    // comer comida
    if (head.x === food.x && head.y === food.y) {
        score++;
        playBeep(660, 0.1);
        placeFood();
    } else {
        snake.pop();
    }

    draw();
}


// ===================== DESENHAR =====================

function draw() {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // cobra
    ctx.fillStyle = "#0f0";
    snake.forEach(s => {
        ctx.fillRect(s.x * GRID, s.y * GRID, GRID - 2, GRID - 2);
    });

    // comida
    ctx.fillStyle = "#f00";
    ctx.fillRect(food.x * GRID, food.y * GRID, GRID - 2, GRID - 2);
}


// ===================== COMIDA =====================

function placeFood() {
    food = {
        x: Math.floor(Math.random() * cols),
        y: Math.floor(Math.random() * rows)
    };
}


// ===================== CONTROLES TECLADO =====================

window.addEventListener("keydown", e => {
    const k = e.key.toLowerCase();
    const map = {
        arrowup: { x: 0, y: -1 },
        arrowdown: { x: 0, y: 1 },
        arrowleft: { x: -1, y: 0 },
        arrowright: { x: 1, y: 0 },
        w: { x: 0, y: -1 },
        s: { x: 0, y: 1 },
        a: { x: -1, y: 0 },
        d: { x: 1, y: 0 }
    };

    // espaço = pausar/iniciar
    if (k === " ") {
        if (running) pauseGame();
        else startGame();
    }

    if (map[k]) {
        const nd = map[k];
        if (!(nd.x === -dir.x && nd.y === -dir.y)) {
            nextDir = nd;
        }
    }
});


// ===================== TOUCH CONTROLS =====================

let touchStart = null;

canvas.addEventListener("touchstart", e => {
    const t = e.touches[0];
    touchStart = { x: t.clientX, y: t.clientY };
});

canvas.addEventListener("touchend", e => {
    if (!touchStart) return;

    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;

    if (Math.abs(dx) > Math.abs(dy))
        nextDir = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
    else
        nextDir = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };

    touchStart = null;
});


// ===================== BOTÕES =====================

startBtn.addEventListener("click", () => {
    overlay.style.display = "none";
    reset();
    startGame();
});

pauseBtn.addEventListener("click", () => {
    if (running) pauseGame();
    else overlayOpen("Pausado");
});


// ===================== SOM =====================

function playBeep(freq, dur) {
    try {
        const a = new (window.AudioContext || window.webkitAudioContext)();
        const o = a.createOscillator();
        const g = a.createGain();

        o.type = "sine";
        o.frequency.value = freq;
        g.gain.value = 0.04;

        o.connect(g);
        g.connect(a.destination);

        o.start();
        setTimeout(() => {
            o.stop();
            a.close();
        }, dur * 1000);
    } catch (e) {}
}


// ===================== ADAPTAR CANVAS =====================

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height);

    canvas.width = Math.floor(size);
    canvas.height = Math.floor(size);

    cols = Math.floor(canvas.width / GRID);
    rows = Math.floor(canvas.height / GRID);

    draw();
}

window.addEventListener("resize", () => {
    resizeCanvas();
    reset();
});


// iniciar tudo
resizeCanvas();
reset();
overlayOpen("Clique em Start para jogar!");
