/* Jogo da Cobra - script.js
Mecânica simples com grid, toque, seta/WASD, níveis e aumento de velocidade.
*/


const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const overlay = document.getElementById('overlay');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');


const GRID = 20; // tamanho do bloco em px
let cols = Math.floor(canvas.width / GRID);
let rows = Math.floor(canvas.height / GRID);


let snake, food, dir, nextDir, running, score, level, speed, tickHandle;


function reset(){
cols = Math.floor(canvas.width / GRID);
rows = Math.floor(canvas.height / GRID);
snake = [{x:Math.floor(cols/2), y:Math.floor(rows/2)}];
dir = {x:1,y:0};
nextDir = dir;
placeFood();
score=0; level=1; speed=8; running=false;
scoreEl.textContent = score; levelEl.textContent = level;
draw();
}


function placeFood(){
while(true){
const f = {x:rand(0,cols-1), y:rand(0,rows-1)};
if(!snake.some(s=>s.x===f.x && s.y===f.y)){ food = f; break; }
}
}


function rand(a,b){ return Math.floor(Math.random()*(b-a+1))+a }


function gameTick(){
// update direction
dir = nextDir;
const head = {x:snake[0].x + dir.x, y:snake[0].y + dir.y};


// wrap-around (torus)
if(head.x < 0) head.x = cols-1;
if(head.x >= cols) head.x = 0;
if(head.y < 0) head.y = rows-1;
if(head.y >= rows) head.y = 0;


// collision com corpo
if(snake.some(s => s.x===head.x && s.y===head.y)){
gameOver();
return;
}


snake.unshift(head);


// comer comida?
if(head.x===food.x && head.y===food.y){
score += 10; scoreEl.textContent = score;
if(score % 50 === 0){ level++; levelEl.textContent = level; speed = Math.min(22, speed + 1);}
placeFood();
playBeep(880,0.05);
} else {
snake.pop();
}


draw();
}


function draw(){
ctx.clearRect(0,0,canvas.width,canvas.height);


// grid background subtle
resizeCanvas();
