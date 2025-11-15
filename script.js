/* Jogo da Cobra - script.js
running=false; clearInterval(tickHandle);
overlayOpen('Game Over — Sua pontuação: ' + score + '\nClique para reiniciar');
playBeep(220,0.25);
}


function overlayOpen(text){
document.getElementById('overlay-title').textContent = text;
overlay.style.pointerEvents = 'auto';
}


function startGame(){
if(running) return;
running=true; overlay.style.pointerEvents='none';
tickHandle = setInterval(gameTick, 1000 / speed);
}


function pauseGame(){
if(!running) return;
running=false; clearInterval(tickHandle); overlayOpen('Pausado');
}


// control handlers
window.addEventListener('keydown', e=>{
const k = e.key.toLowerCase();
if(k===' '){ if(running) pauseGame(); else startGame(); }
const map = {arrowup:{x:0,y:-1},arrowdown:{x:0,y:1},arrowleft:{x:-1,y:0},arrowright:{x:1,y:0},w:{x:0,y:-1},s:{x:0,y:1},a:{x:-1,y:0},d:{x:1,y:0}};
if(map[k]){
const nd = map[k];
// evitar inverter direção
if(!(nd.x === -dir.x && nd.y === -dir.y)) nextDir = nd;
}
});


// touch controls: simple swipe detection
let touchStart = null;
canvas.addEventListener('touchstart', e=>{ const t=e.touches[0]; touchStart={x:t.clientX,y:t.clientY}; });
canvas.addEventListener('touchend', e=>{
if(!touchStart) return; const t = e.changedTouches[0]; const dx = t.clientX - touchStart.x; const dy = t.clientY - touchStart.y;
if(Math.abs(dx) > Math.abs(dy)) nextDir = dx>0?{x:1,y:0}:{x:-1,y:0}; else nextDir = dy>0?{x:0,y:1}:{x:0,y:-1};
touchStart = null;
});


startBtn.addEventListener('click', ()=>{ if(!running){ startGame(); } });
pauseBtn.addEventListener('click', ()=>{ if(running) pauseGame(); else overlayOpen('Pausado'); });
// corrigido: clique apenas no botão Start
startBtn.addEventListener('click', ()=>{ reset(); startGame(); overlay.style.pointerEvents='none'; overlay.style.display='none'; });('click', ()=>{ reset(); startGame(); overlay.style.pointerEvents='none'; });


// sound beep using WebAudio
function playBeep(freq,dur){
try{
const a = new (window.AudioContext || window.webkitAudioContext)();
const o = a.createOscillator(); const g = a.createGain();
o.type='sine'; o.frequency.value = freq; g.gain.value = 0.02;
o.connect(g); g.connect(a.destination);
o.start(); setTimeout(()=>{ o.stop(); a.close(); }, dur*1000);
}catch(e){/* no audio */}
}


// iniciar
reset();


// ajustar canvas para tela responsiva
function resizeCanvas(){
const rect = canvas.getBoundingClientRect();
// manter resolução interna constante para aparência nítida -> escala mantendo aspect
const size = Math.min(rect.width, rect.height);
canvas.width = Math.floor(size);
canvas.height = Math.floor(size);
cols = Math.floor(canvas.width / GRID);
rows = Math.floor(canvas.height / GRID);
draw();
}
window.addEventListener('resize', ()=>{ resizeCanvas(); reset(); });
resizeCanvas();
