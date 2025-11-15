/* Jogo da Cobra - script.js */

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');

const GRID = 20;
let cols, rows;

let snake, food, dir, nextDir, running, score, level, speed, tickHandle;

function reset() {
  cols = Math.floor(canvas.width / GRID);
  rows = Math.floor(canvas.height / GRID);

  snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
  dir = { x: 1, y: 0 };
  nextDir = dir;

  placeFood();

  score = 0;
  level = 1;
  speed = 8;
  running = false;

  scoreEl.textContent = score;
  levelEl.textContent = level;

  draw();
}

function placeFood() {
  while (true) {
    const f = {
      x: rand(0, cols - 1),
      y: rand(0, rows - 1)
    };

    if (!snake.some(s => s.x === f.x && s.y === f.y)) {
      food = f;
      break;
    }
  }
}

function rand(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

function gameTick() {
  dir = nextDir;

  const head = {
    x: snake[0].x + dir.x,
    y: snake[0].y + dir.y
  };

  // bordas (wrap)
  if (head.x < 0) head.x = cols - 1;
  if (head.x >= cols) head.x = 0;
  if (head.y < 0) head.y = rows - 1;
  if (head.y >= rows) head.y = 0;

  // colisão
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    gameOver();
    return;
  }

  snake.unshift(head);

  // comer
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;

    if (score % 50 === 0) {
      level++;
      levelEl.textContent = level;
      speed = Math.min(22, speed + 1);
    }

    placeFood();
    playBeep(880, 0.05);
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // food
  ctx.fillStyle = '#ff6b6b';
  roundRect(ctx, food.x * GRID + 4, food.y * GRID + 4, GRID - 8, GRID - 8, 6);

  // snake
  for (let i = snake.length - 1; i >= 0; i--) {
    const s = snake[i];

    if (i === 0) {
      const g = ctx.createLinearGradient(
        s.x * GRID,
        s.y * GRID,
        (s.x + 1) * GRID,
        (s.y + 1) * GRID
      );
      g.addColorStop(0, '#00ffa3');
      g.addColorStop(1, '#7b61ff');
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = 'rgba(0,255,163,0.12)';
    }

    roundRect(ctx, s.x * GRID + 2, s.y * GRID + 2, GRID - 4, GRID - 4, 4);
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

function gameOver() {
  running = false;
  clearInterval(tickHandle);
  overlayOpen("Game Over — Aperte espaço para reiniciar");
  playBeep(220, 0.25);
}

function overlayOpen(text) {
  document.getElementById('overlay-title').textContent = text;
  overlay.style.display = 'flex';
  overlay.style.pointerEvents = 'auto';
}

function startGame() {
  if (running) return;

  overlay.style.display = 'none';
  overlay.style.pointerEvents = 'none';

  running = true;
  tickHandle = setInterval(gameTick, 1000 / speed);
}

function pauseGame() {
  if (!running) return;
  running = false;
  clearInterval(tickHandle);
  overlayOpen("Pausado");
}

// controls
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();

  if (k === ' ') {
    if (running) pauseGame();
    else startGame();
  }

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

  if (map[k]) {
    const nd = map[k];
    if (!(nd.x === -dir.x && nd.y === -dir.y)) nextDir = nd;
  }
});

// touch
let touchStart = null;

canvas.addEventListener('touchstart', e => {
  const t = e.touches[0];
  touchStart = { x: t.clientX, y: t.clientY };
});

canvas.addEventListener('touchend', e => {
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

// audio
function playBeep(freq, dur) {
  try {
    const a = new (window.AudioContext || window.webkitAudioContext)();
    const o = a.createOscillator();
    const g = a.createGain();

    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.value = 0.02;

    o.connect(g);
    g.connect(a.destination);

    o.start();
    setTimeout(() => {
      o.stop();
      a.close();
    }, dur * 1000);
  } catch (e) {}
}

// inicializa + começa sozinho
reset();
setTimeout(startGame, 300);

// responsivo
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const size = Math.min(rect.width, rect.height);
  canvas.width = size;
  canvas.height = size;

  cols = Math.floor(size / GRID);
  rows = Math.floor(size / GRID);

  draw();
}

window.addEventListener('resize', () => {
  resizeCanvas();
  reset();
  startGame();
});

resizeCanvas();
