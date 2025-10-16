// Nazwa pliku: script.js

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gravityBtn = document.getElementById('gravityBtn');
const jumpBtn = document.getElementById('jumpBtn');
const scoreField = document.getElementById('score');
let music = document.getElementById('music');

const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;

// Bohater
let hero = {
    x: 80, y: GAME_HEIGHT - 80,
    size: 40,
    vy: 0, gravity: 1,
    jumpPower: -16, doubleJumpReady: true,
    color: "#25d8ea",
    gravityDir: 1
};

let obstacles = []; // Przeszkody
let platforms = [
    {x: 0, y: GAME_HEIGHT-40, w: GAME_WIDTH, h: 40}
];
let levelSpeed = 6;
let gameOver = false, score = 0, checkpoint = 0;
let levelMusicStarted = false;
let canDoubleJump = true;

// Mechanika: generowanie przeszkód i synchronizacja z muzyką
function spawnObstacle() {
    let type = Math.random() > 0.5 ? 'spike' : 'pit';
    let obs = {x: GAME_WIDTH, w: 40, h: type === 'spike' ? 40 : 60, type};
    obstacles.push(obs);
}
setInterval(spawnObstacle, 1500); // Synchronizacja do rytmu (zmień tempo jak chcesz)

function jump() {
    if (hero.y === GAME_HEIGHT - hero.size - 40 || hero.gravityDir === -1 && hero.y === 0) {
        hero.vy = hero.jumpPower * hero.gravityDir;
        canDoubleJump = true;
    } else if (canDoubleJump) {
        hero.vy = hero.jumpPower * hero.gravityDir;
        canDoubleJump = false;
        efekcik(hero.x, hero.y); // Efekt cząsteczkowy!
    }
}

function flipGravity() {
    hero.gravityDir *= -1;
    hero.jumpPower *= -1;
}

jumpBtn.onclick = jump;
gravityBtn.onclick = flipGravity;

document.addEventListener('keydown', e => {
    if (e.code === 'Space') jump();
    if (e.code === 'KeyG') flipGravity();
});

function drawHero() {
    ctx.fillStyle = hero.color;
    ctx.fillRect(hero.x, hero.y, hero.size, hero.size);
}

function drawObstacles() {
    ctx.fillStyle = "#ff595e";
    for (let obs of obstacles) {
        ctx.fillRect(obs.x, GAME_HEIGHT - obs.h - 40, obs.w, obs.h);
    }
}
function drawPlatforms() {
    ctx.fillStyle = "#fcbf49";
    for (let pf of platforms) {
        ctx.fillRect(pf.x, pf.y, pf.w, pf.h);
    }
}
function updateObstacles() {
    for (let obs of obstacles) {
        obs.x -= levelSpeed;
    }
    obstacles = obstacles.filter(obs => obs.x + obs.w > 0);
}
function checkCollisions() {
    for (let obs of obstacles) {
        if (hero.x + hero.size > obs.x && hero.x < obs.x + obs.w &&
            hero.y + hero.size > GAME_HEIGHT - obs.h - 40 &&
            hero.y < GAME_HEIGHT - 40) {
                gameOver = true;
                checkpoint = score;
                efekcik(hero.x, hero.y); // Efekt cząsteczkowy!
                setTimeout(reset, 1200);
        }
    }
    if (hero.y + hero.size > GAME_HEIGHT - 40) {
        hero.y = GAME_HEIGHT - hero.size - 40;
        hero.vy = 0;
        canDoubleJump = true;
    }
    if (hero.y < 0) {
        hero.y = 0;
        hero.vy = 0;
        canDoubleJump = true;
    }
}
function reset() {
    hero.x = 80;
    hero.y = GAME_HEIGHT - 80;
    hero.vy = 0;
    obstacle = [];
    score = checkpoint;
    gameOver = false;
}

function efekcik(x, y) {
    // Wywołanie efektu eksplozji z WASM
    window.particlesModulePromise.then(module => {
        module.spawnExplosion(x, y, 30);
    });
}

function rysujParticles(ctx) {
    window.particlesModulePromise.then(module => {
        module.updateParticles(0.016);
        const arr = module.getParticles();
        for (let i = 0; i < arr.length; ++i) {
            let p = arr[i];
            // W zależności od eksportu: [x, y, life, r, g, b]
            ctx.fillStyle = `rgba(${p[3]*255},${p[4]*255},${p[5]*255},${p[2]})`;
            ctx.beginPath();
            ctx.arc(p[0], p[1], 8*p[2], 0, 2*Math.PI);
            ctx.fill();
        }
    });
}

function gameLoop() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    if (!levelMusicStarted) { music.play(); levelMusicStarted = true; }
    drawPlatforms();
    drawObstacles();
    drawHero();
    rysujParticles(ctx);

    if (!gameOver) {
        hero.y += hero.vy;
        hero.vy += hero.gravity * hero.gravityDir;
        updateObstacles();
        checkCollisions();
        score++;
    } else {
        ctx.font = "48px sans-serif";
        ctx.fillStyle = "#fff";
        ctx.fillText("Koniec!", GAME_WIDTH/2 - 100, GAME_HEIGHT/2);
    }
    scoreField.innerText = "Wynik: " + score;
    requestAnimationFrame(gameLoop);
}
gameLoop();
