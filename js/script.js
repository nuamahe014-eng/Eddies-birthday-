(() => {
'use strict';
/* ---------- Config ---------- */
const PRIZES = [1000, 500, 150, 100];
const WINNING_PRIZE = 150;               // fixed result, no randomness involved
const KEY = 'edna_birthday_jackpot_v1';  // unique localStorage key
/* NOTE: localStorage only stops casual repeat attempts in the same browser.
   Clearing site data, private mode or another device bypasses it. It is NOT tamper-proof security. */
const ORDER = ['welcome','boxes','laugh','heart','diamond','jackpot','win','letter','final'];
const $ = (id) => document.getElementById(id);
const fmt = (n) => 'GH₵' + n.toLocaleString('en-US');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let spinning = false;

/* ---------- Storage ---------- */
function readState() { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } }
function writeState(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* storage blocked */ } }
let state = readState(); // in-memory copy keeps the lock for this page view even if storage is blocked
const used = () => !!(state && state.used);

/* ---------- Navigation ---------- */
function go(name) {
  if (!ORDER.includes(name)) return;
  if (name === 'win' && !used()) name = 'jackpot';  // prize screen needs a completed spin
  document.querySelectorAll('.screen').forEach(s => { s.hidden = s.dataset.screen !== name; });
  const pct = Math.round(ORDER.indexOf(name) / (ORDER.length - 1) * 100);
  $('barFill').style.width = pct + '%';
  document.querySelector('.bar').setAttribute('aria-valuenow', pct);
  window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  if (name === 'jackpot') syncJackpot();
  if (name === 'win' || name === 'final') burst(name === 'win' ? 160 : 200);
  if (name === 'letter') petals();
}
document.addEventListener('click', (e) => {            // one delegated listener, no duplicates
  const b = e.target.closest('[data-go]');
  if (b && !b.disabled) go(b.dataset.go);
});

/* ---------- Floating hearts / diamonds ---------- */
(function ambient() {
  if (reduced) return;
  const fx = $('fx'), icons = ['❤️','💎','✨','💖','🎈'];
  setInterval(() => {
    if (document.hidden || fx.childElementCount > 14) return;
    const s = document.createElement('span');
    s.className = 'fl'; s.textContent = icons[Math.floor(Math.random() * icons.length)];
    s.style.left = Math.random() * 95 + 'vw';
    s.style.fontSize = 14 + Math.random() * 20 + 'px';
    s.style.animationDuration = 8 + Math.random() * 6 + 's';
    s.style.opacity = .6;
    s.addEventListener('animationend', () => s.remove());
    fx.appendChild(s);
  }, 900);
})();

/* ---------- Confetti (canvas; Math.random is used only for looks) ---------- */
const cv = $('confetti'), ctx = cv.getContext('2d');
let bits = [], raf = 0;
function sizeCv() { cv.width = innerWidth; cv.height = innerHeight; }
addEventListener('resize', sizeCv); sizeCv();
function burst(n) {
  if (reduced) return;
  const cols = ['#f5c542','#ff3d9a','#ffffff','#c2188f','#ffe9a0','#7a2bd1'];
  for (let i = 0; i < n; i++) bits.push({ x: cv.width / 2, y: cv.height * .35, vx: (Math.random() - .5) * 14, vy: Math.random() * -13 - 3, g: .25, s: 5 + Math.random() * 6, c: cols[i % cols.length], r: Math.random() * 6, life: 140 + Math.random() * 60 });
  if (!raf) raf = requestAnimationFrame(tick);
}
function tick() {
  ctx.clearRect(0, 0, cv.width, cv.height);
  bits = bits.filter(p => p.life-- > 0 && p.y < cv.height + 20);
  bits.forEach(p => { p.vy += p.g; p.x += p.vx; p.y += p.vy; p.r += .2; ctx.fillStyle = p.c; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); });
  raf = bits.length ? requestAnimationFrame(tick) : 0;
}

/* ---------- Laugh box ---------- */
$('laughGift').addEventListener('click', function () {
  this.classList.add('open'); this.disabled = true;
  $('laughMsg').hidden = false; $('laughNext').hidden = false; burst(60);
});

/* ---------- Heart box ---------- */
const COMPLIMENTS = [
  "Your beautiful smile can brighten someone's day. 😊",
  'Your personality makes you special. ✨',
  'Your caring nature deserves to be appreciated. 🤍',
  'You deserve happiness, peace, and genuine love. ❤️',
  'You have so many beautiful qualities worth celebrating. 💎'
];
let shown = 0;
$('heartBtn').addEventListener('click', function () {
  if (shown < COMPLIMENTS.length) {
    const li = document.createElement('li'); li.textContent = COMPLIMENTS[shown++];
    $('compliments').appendChild(li);
  }
  if (shown >= COMPLIMENTS.length) { this.hidden = true; $('heartNext').hidden = false; }
  else this.textContent = 'Another one 💖';
});

/* ---------- Photo fallback ---------- */
let triedJpeg = false;
$('memImg').addEventListener('error', () => {
  if (!triedJpeg) { triedJpeg = true; $('memImg').src = 'assets/images/edna-memory.jpeg?v=2'; return; } // .jpg missing, try .jpeg
  $('memImg').hidden = true; $('memPh').hidden = false;
});

/* ---------- Music ---------- 
const audio = $('audio'), playBtn = $('playBtn'), musicBtn = $('musicBtn');
let audioBad = false;
function setPlayUI(on) { playBtn.textContent = on ? '⏸' : '▶'; musicBtn.classList.toggle('on', on); }
function toggleAudio() {
  if (audioBad) { $('audioMsg').textContent = 'Add assets/audio/birthday-song.mp3 to hear the song 🎶'; return; }
  if (audio.paused) {
    const p = audio.play();
    if (p && p.catch) p.catch(() => { audioBad = true; setPlayUI(false); $('audioMsg').textContent = 'The song could not be played right now.'; });
  } else audio.pause();
}
audio.addEventListener('error', () => { audioBad = true; setPlayUI(false); $('audioMsg').textContent = 'Song file not found yet 🎶'; });
audio.addEventListener('play', () => setPlayUI(true));
audio.addEventListener('pause', () => setPlayUI(false));
audio.addEventListener('timeupdate', () => { if (audio.duration) $('seek').value = audio.currentTime / audio.duration * 100; });
$('seek').addEventListener('input', (e) => { if (audio.duration) audio.currentTime = e.target.value / 100 * audio.duration; });
$('vol').addEventListener('input', (e) => { audio.volume = e.target.value / 100; });
audio.volume = .8;
playBtn.addEventListener('click', toggleAudio);
musicBtn.addEventListener('click', toggleAudio);

/* ---------- Jackpot ---------- */
const tilesEl = $('tiles');
PRIZES.forEach(p => { const d = document.createElement('div'); d.className = 'tile'; d.dataset.p = p; d.textContent = fmt(p); tilesEl.appendChild(d); });
function hot(p, win) {
  tilesEl.querySelectorAll('.tile').forEach(t => { const m = +t.dataset.p === p; t.classList.toggle('hot', !win && m); t.classList.toggle('win', !!win && m); });
}
function lockUI() { $('spinBtn').disabled = true; $('spinBtn').textContent = 'ATTEMPT USED 🔒'; }
function showResult() {
  $('reel').textContent = fmt(WINNING_PRIZE) + ' 💵'; $('reel').parentElement.classList.add('done');
  hot(WINNING_PRIZE, true); lockUI();
  $('jpNote').textContent = '🎉 Your one attempt is done, and it was a winner!'; $('jpNext').hidden = false;
}
function syncJackpot() { if (used() && !spinning) showResult(); }

$('spinBtn').addEventListener('click', () => {
  if (spinning || used()) return;                 // ignores rapid repeat clicks
  spinning = true;
  state = { used: true, prize: WINNING_PRIZE, at: Date.now() };
  writeState(state);                              // attempt registered immediately
  lockUI();
  // Deterministic sequence: cycles every prize, slows down, always ends on index of 150.
  const winIdx = PRIZES.indexOf(WINNING_PRIZE), total = PRIZES.length * 4 + winIdx + 1;
  let step = 0;
  (function next() {
    const p = PRIZES[step % PRIZES.length];
    $('reel').textContent = fmt(p); hot(p);
    step++;
    if (step >= total) { finish(); return; }
    setTimeout(next, reduced ? 60 : 60 + Math.pow(step / total, 3) * 520);
  })();
  function finish() {
    spinning = false; showResult(); burst(200);
    setTimeout(() => burst(120), 700); setTimeout(() => burst(120), 1400);
    setTimeout(() => go('win'), 2800);
  }
});

/* ---------- Claim ---------- */
$('claimBtn').addEventListener('click', function () { $('claimMsg').hidden = false; this.disabled = true; burst(80); });

/* ---------- Letter petals ---------- */
let petalsDone = false;
function petals() {
  if (petalsDone || reduced) return; petalsDone = true;
  const l = document.querySelector('.letter');
  for (let i = 0; i < 14; i++) {
    const p = document.createElement('i'); p.className = 'petal';
    p.style.left = Math.random() * 100 + '%'; p.style.animationDuration = 6 + Math.random() * 6 + 's'; p.style.animationDelay = Math.random() * 6 + 's';
    l.appendChild(p);
  }
}

/* ---------- Replay: revisits screens, never resets the jackpot ---------- */
$('replayBtn').addEventListener('click', () => go('welcome'));

go('welcome');
})();
