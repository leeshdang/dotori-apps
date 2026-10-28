import { t } from './i18n.js';

export const COLS = 10, ROWS = 16, C = 48;
// [w, h, weight]
const SHAPES = [[1, 1, 3], [2, 1, 5], [3, 1, 3], [4, 1, 1], [2, 2, 4], [3, 2, 3], [2, 3, 2], [1, 2, 2]];

export const SKINS = {
  kraft: {
    pal: ['#D9A566', '#C99352', '#E2B97E', '#BF8A4B', '#D0A060'],
    tape: '#F3E3C0', line: '#7A5226', bg: ['#2b2a2f', '#1b1b21'], snd: { f0: 150, f1: 55, nf: 600, nt: 'lowpass', nv: .34 },
  },
  blue: {
    pal: ['#4F8DF7', '#3B74D8', '#5FA8FF', '#2E5FBF', '#49B6D9'],
    tape: '#FFD43B', line: '#173A7A', bg: ['#1c2536', '#121722'], snd: { f0: 260, f1: 120, nf: 2200, nt: 'bandpass', nv: .3 },
  },
  gift: {
    pal: ['#FF9EC4', '#B79CFF', '#7FD8C8', '#FFD27F', '#8FC1FF'],
    tape: '#FFFFFF', line: '#7A3F6A', bg: ['#2d2236', '#1c1526'], snd: { f0: 330, f1: 200, nf: 900, nt: 'lowpass', nv: .18 },
  },
};
export const SKIN_KEYS = Object.keys(SKINS);

function shade(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(a < 0 ? v * (1 + a) : v + (255 - v) * a)));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

// strip position along an axis for a box of length len at relative index i: returns [offset, width] or null
function strip(i, len, cell, wd) {
  if (len % 2 === 1) return i === (len - 1) / 2 ? [(cell - wd) / 2, wd] : null;
  const m = len / 2;
  if (i === m - 1) return [cell - wd / 2, wd / 2];
  if (i === m) return [0, wd / 2];
  return null;
}

export function drawCell(g, px, py, cell, conn, skinKey, size = C, alpha = 1) {
  const sk = SKINS[skinKey], s = size, k = s / C;
  const p = 2 * k, col = sk.pal[cell.ci % sk.pal.length];
  const x0 = px + (conn.l ? 0 : p), y0 = py + (conn.t ? 0 : p);
  const x1 = px + s - (conn.r ? 0 : p), y1 = py + s - (conn.b ? 0 : p);
  const R = 9 * k;
  g.save(); g.globalAlpha = alpha;
  const rad = [!conn.l && !conn.t ? R : 0, !conn.r && !conn.t ? R : 0, !conn.r && !conn.b ? R : 0, !conn.l && !conn.b ? R : 0];
  g.beginPath(); g.roundRect(x0, y0, x1 - x0, y1 - y0, rad);
  const grad = g.createLinearGradient(0, y0, 0, y1);
  grad.addColorStop(0, shade(col, .18)); grad.addColorStop(1, shade(col, -.12));
  g.fillStyle = grad; g.fill();
  g.clip();
  const { rx, ry, w, h } = cell;
  if (skinKey === 'kraft') {
    if (ry === 0) { g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(x0, py + s * .26, x1 - x0, 2 * k); }
    const sx = strip(rx, w, s, 12 * k);
    if (sx) {
      g.fillStyle = sk.tape; g.fillRect(px + sx[0], y0, sx[1], y1 - y0);
      g.fillStyle = 'rgba(120,80,30,.18)'; g.fillRect(px + sx[0], y0, sx[1], y1 - y0);
      g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(px + sx[0], y0, sx[1] * .35, y1 - y0);
    }
    if (ry === h - 1 && rx === 0 && w >= 2) { g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(px + 8 * k, py + s - 20 * k, 16 * k, 10 * k); g.fillStyle = '#555'; g.fillRect(px + 10 * k, py + s - 17 * k, 12 * k, 2 * k); g.fillRect(px + 10 * k, py + s - 13 * k, 8 * k, 2 * k); }
  } else if (skinKey === 'blue') {
    g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = 2 * k;
    for (const f of [.33, .66]) { g.beginPath(); g.moveTo(x0, py + s * f); g.lineTo(x1, py + s * f); g.stroke(); }
    g.strokeStyle = 'rgba(0,0,0,.2)';
    for (const f of [.36, .69]) { g.beginPath(); g.moveTo(x0, py + s * f + 2 * k); g.lineTo(x1, py + s * f + 2 * k); g.stroke(); }
    const sx = strip(rx, w, s, 22 * k);
    if (ry === 0 && sx) { g.fillStyle = 'rgba(8,20,50,.65)'; g.beginPath(); g.roundRect(px + sx[0], py + 8 * k, sx[1], 8 * k, 4 * k); g.fill(); }
    g.fillStyle = sk.tape;
    if (!conn.l && !conn.t) { g.beginPath(); g.arc(x0 + 7 * k, y0 + 7 * k, 2.4 * k, 0, 7); g.fill(); }
    if (!conn.r && !conn.b) { g.beginPath(); g.arc(x1 - 7 * k, y1 - 7 * k, 2.4 * k, 0, 7); g.fill(); }
  } else {
    const sx = strip(rx, w, s, 11 * k), sy = strip(ry, h, s, 11 * k);
    g.fillStyle = 'rgba(255,255,255,.92)';
    if (sx) g.fillRect(px + sx[0], y0, sx[1], y1 - y0);
    if (sy) g.fillRect(x0, py + sy[0], x1 - x0, sy[1]);
    g.fillStyle = 'rgba(255,215,120,.9)';
    if (sx) g.fillRect(px + sx[0] + sx[1] * .35, y0, sx[1] * .3, y1 - y0);
    if (ry === 0 && rx === Math.floor((w - 1) / 2) && w % 2 === 1) {
      g.fillStyle = '#FFE08A'; g.beginPath(); g.ellipse(px + s / 2 - 8 * k, py + 12 * k, 8 * k, 5 * k, -.5, 0, 7); g.ellipse(px + s / 2 + 8 * k, py + 12 * k, 8 * k, 5 * k, .5, 0, 7); g.fill();
      g.fillStyle = '#F59E0B'; g.beginPath(); g.arc(px + s / 2, py + 13 * k, 4 * k, 0, 7); g.fill();
    }
  }
  g.restore();
  // outline on outer sides
  g.save(); g.globalAlpha = alpha * .55; g.strokeStyle = sk.line; g.lineWidth = 2 * k; g.lineCap = 'round';
  const seg = (a, b, c, d) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); };
  if (!conn.t) seg(x0 + rad[0], y0, x1 - rad[1], y0);
  if (!conn.b) seg(x0 + rad[3], y1, x1 - rad[2], y1);
  if (!conn.l) seg(x0, y0 + rad[0], x0, y1 - rad[3]);
  if (!conn.r) seg(x1, y0 + rad[1], x1, y1 - rad[2]);
  g.restore();
}

/* ---------- state ---------- */
let grid, cur, nextP, score, lines, level, placed, over, paused, userPaused, clearing, lastDrop, idc;
let skin = localStorage.getItem('pk_skin');
if (!SKINS[skin]) skin = 'kraft';
let best = Number(localStorage.getItem('pk_best') || 0);
let muted = localStorage.getItem('pk_mute') === '1';
let cv, nextCv, g, ng, hud = {}, raf = 0, attached = false, onOver = () => {}, onPause = () => {};
let toastTimer = 0, newBest = false;

const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

function newPiece() {
  const tot = SHAPES.reduce((a, s) => a + s[2], 0);
  let r = Math.random() * tot, s = SHAPES[0];
  for (const sh of SHAPES) { if ((r -= sh[2]) < 0) { s = sh; break; } }
  return { w: s[0], h: s[1], x: 0, y: 0, ci: Math.floor(Math.random() * 5), id: ++idc };
}
function collide(p, x, y, w = p.w, h = p.h) {
  if (x < 0 || x + w > COLS || y + h > ROWS) return true;
  for (let r = y; r < y + h; r++) for (let c = x; c < x + w; c++) if (r >= 0 && grid[r][c]) return true;
  return false;
}

export function reset() {
  grid = emptyGrid(); score = 0; lines = 0; level = 1; placed = 0; over = false; userPaused = false;
  clearing = null; idc = 0; newBest = false; lastDrop = performance.now();
  nextP = newPiece(); spawn(); updateHud(); drawNext();
}
function spawn() {
  cur = nextP; nextP = newPiece();
  cur.x = Math.floor((COLS - cur.w) / 2); cur.y = 0;
  drawNext();
  if (collide(cur, cur.x, cur.y)) endGame();
}
function endGame() {
  over = true;
  if (score > best) { best = score; newBest = true; localStorage.setItem('pk_best', String(best)); }
  updateHud();
  onOver({ score, newBest });
}

/* ---------- audio ---------- */
let ac = null;
function audio() {
  if (muted) return null;
  if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } }
  if (ac.state === 'suspended') ac.resume();
  return ac;
}
function noise(a, dur, freq, type, vol) {
  const n = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = a.createBufferSource(), f = a.createBiquadFilter(), gn = a.createGain();
  s.buffer = buf; f.type = type; f.frequency.value = freq; gn.gain.value = vol;
  s.connect(f); f.connect(gn); gn.connect(a.destination); s.start();
}
function tone(a, f0, f1, dur, vol, type = 'sine', delay = 0) {
  const t0 = a.currentTime + delay, o = a.createOscillator(), gn = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
  gn.gain.setValueAtTime(vol, t0); gn.gain.exponentialRampToValueAtTime(.001, t0 + dur);
  o.connect(gn); gn.connect(a.destination); o.start(t0); o.stop(t0 + dur + .02);
}
function sThump(power = 1) {
  const a = audio(); if (!a) return; const s = SKINS[skin].snd;
  tone(a, s.f0, s.f1, .16, .4 * power); noise(a, .1, s.nf, s.nt, s.nv * power);
}
function sTick() { const a = audio(); if (a) noise(a, .035, 2600, 'highpass', .1); }
function sMove() { const a = audio(); if (a) noise(a, .02, 1400, 'bandpass', .04); }
function sClear(n) { const a = audio(); if (!a) return; [523, 659, 784, 1047].slice(0, 2 + Math.min(n, 2)).forEach((f, i) => tone(a, f, f, .35, .12, 'triangle', i * .07)); }

/* ---------- actions ---------- */
function toast(msg) {
  const el = hud.toast; if (!el) return;
  el.textContent = msg; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
}
function updateHud() {
  if (hud.score) hud.score.textContent = score;
  if (hud.best) hud.best.textContent = Math.max(best, score);
  if (hud.lines) hud.lines.textContent = lines;
  if (hud.level) hud.level.textContent = level;
}
function lock() {
  const { w, h, x, y } = cur;
  let tight = true;
  for (let c = x; c < x + w; c++) { const b = y + h; if (!(b >= ROWS || grid[b][c])) tight = false; }
  for (let ry = 0; ry < h; ry++) for (let rx = 0; rx < w; rx++) grid[y + ry][x + rx] = { id: cur.id, ci: cur.ci, rx, ry, w, h };
  placed++; score += w * h * 2;
  sThump(Math.min(1.4, .6 + w * h * .15));
  let msg = '';
  if (tight) { const b = w * h * 5; score += b; msg = `${t('pkTight')} +${b}`; }
  const rows = [];
  for (let r = 0; r < ROWS; r++) if (grid[r].every(Boolean)) rows.push(r);
  if (rows.length) {
    const add = [0, 100, 300, 600, 1000][Math.min(rows.length, 4)] * level;
    score += add; msg = `${t('pkClear')} +${add}`;
    clearing = { rows, t: performance.now() }; sClear(rows.length); cur = null;
  } else spawn();
  if (msg) toast(msg);
  updateHud();
}
function finishClear() {
  const rows = clearing.rows, n = rows.length;
  grid = grid.filter((_, r) => !rows.includes(r));
  while (grid.length < ROWS) grid.unshift(Array(COLS).fill(null));
  lines += n; level = 1 + Math.floor(placed / 12);
  clearing = null;
  if (grid.every((r) => r.every((c) => !c))) { score += 3000; toast(t('pkPerfect') + ' +3000'); }
  lastDrop = performance.now(); spawn(); updateHud();
}
const live = () => attached && !over && !paused && !userPaused && !clearing && cur;
export function act(a) {
  if (!live()) return;
  if (a === 'left' || a === 'right') { const dx = a === 'left' ? -1 : 1; if (!collide(cur, cur.x + dx, cur.y)) { cur.x += dx; sMove(); } }
  else if (a === 'rotate') {
    const w = cur.h, h = cur.w;
    for (const k of [0, -1, 1, -2, 2, -3, 3]) { const nx = cur.x + k; if (!collide(cur, nx, cur.y, w, h)) { cur.w = w; cur.h = h; cur.x = nx; sTick(); break; } }
  } else if (a === 'down') { if (!collide(cur, cur.x, cur.y + 1)) { cur.y++; score++; lastDrop = performance.now(); updateHud(); } else lock(); }
  else if (a === 'drop') { let d = 0; while (!collide(cur, cur.x, cur.y + 1)) { cur.y++; d++; } score += d; lock(); }
}
export function togglePause() { if (over) return; userPaused = !userPaused; syncPause(); }
function syncPause() { if (hud.pause) hud.pause.hidden = !(userPaused); onPause(userPaused); }
export const isUserPaused = () => userPaused;

/* ---------- render ---------- */
function drawPieceCells(ctx, p, ox, oy, size, alpha) {
  for (let ry = 0; ry < p.h; ry++) for (let rx = 0; rx < p.w; rx++) {
    drawCell(ctx, ox + rx * size, oy + ry * size, { ci: p.ci, rx, ry, w: p.w, h: p.h },
      { l: rx > 0, r: rx < p.w - 1, t: ry > 0, b: ry < p.h - 1 }, skin, size, alpha);
  }
}
function drawNext() {
  if (!ng || !nextP) return;
  const W = nextCv.width, H = nextCv.height, sz = 22;
  ng.clearRect(0, 0, W, H);
  drawPieceCells(ng, nextP, (W - nextP.w * sz) / 2, (H - nextP.h * sz) / 2, sz, 1);
}
function draw() {
  if (!g) return;
  const sk = SKINS[skin], W = COLS * C, H = ROWS * C;
  const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, sk.bg[0]); bg.addColorStop(1, sk.bg[1]);
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(255,255,255,.045)'; g.lineWidth = 1;
  for (let c = 1; c < COLS; c++) { g.beginPath(); g.moveTo(c * C, 0); g.lineTo(c * C, H); g.stroke(); }
  for (let r = 1; r < ROWS; r++) { g.beginPath(); g.moveTo(0, r * C); g.lineTo(W, r * C); g.stroke(); }
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const cell = grid[r][c]; if (!cell) continue;
    const same = (rr, cc) => rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS && grid[rr][cc] && grid[rr][cc].id === cell.id;
    drawCell(g, c * C, r * C, cell, { l: same(r, c - 1), r: same(r, c + 1), t: same(r - 1, c), b: same(r + 1, c) }, skin);
  }
  if (clearing) {
    const k = Math.min(1, (performance.now() - clearing.t) / 300);
    g.fillStyle = `rgba(255,255,255,${.85 * (1 - k)})`;
    for (const r of clearing.rows) g.fillRect(0, r * C, W, C);
  }
  if (cur && !over) {
    let gy = cur.y; while (!collide(cur, cur.x, gy + 1)) gy++;
    if (gy > cur.y) {
      g.save(); g.strokeStyle = 'rgba(255,255,255,.4)'; g.setLineDash([7, 6]); g.lineWidth = 2;
      g.beginPath(); g.roundRect(cur.x * C + 3, gy * C + 3, cur.w * C - 6, cur.h * C - 6, 8); g.stroke(); g.restore();
    }
    drawPieceCells(g, cur, cur.x * C, cur.y * C, C, 1);
  }
}
function loop(now) {
  raf = requestAnimationFrame(loop);
  if (!attached) return;
  if (clearing && now - clearing.t > 300) finishClear();
  if (live() && now - lastDrop > Math.max(110, 760 - (level - 1) * 65)) {
    lastDrop = now;
    if (!collide(cur, cur.x, cur.y + 1)) cur.y++; else lock();
  }
  draw();
}

/* ---------- public ---------- */
export function attach(els, cbs) {
  cv = els.canvas; nextCv = els.next; g = cv.getContext('2d'); ng = nextCv.getContext('2d');
  hud = { score: els.score, best: els.best, lines: els.lines, level: els.level, toast: els.toast, pause: els.pause };
  onOver = cbs.onOver; onPause = cbs.onPause || (() => {});
  attached = true;
  if (!grid) reset();
  syncPause(); updateHud(); drawNext();
  els.root.querySelectorAll('[data-pk]').forEach((b) => {
    const a = b.dataset.pk; let iv = 0, to = 0;
    const stop = () => { clearTimeout(to); clearInterval(iv); };
    b.addEventListener('pointerdown', (e) => {
      e.preventDefault(); audio(); act(a);
      if (a === 'left' || a === 'right' || a === 'down') { to = setTimeout(() => { iv = setInterval(() => act(a), 70); }, 220); }
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => b.addEventListener(ev, stop));
  });
  if (!raf) raf = requestAnimationFrame(loop);
}
export function detach() { attached = false; cancelAnimationFrame(raf); raf = 0; }
export function setPaused(p) { paused = p; }
export const getSkin = () => skin;
export function setSkin(k) { if (SKINS[k]) { skin = k; localStorage.setItem('pk_skin', k); drawNext(); } }
export const isMuted = () => muted;
export function toggleMute() { muted = !muted; localStorage.setItem('pk_mute', muted ? '1' : '0'); }
export const getBest = () => best;

const previews = {};
export function skinPreview(k) {
  if (previews[k]) return previews[k];
  const c = document.createElement('canvas'); c.width = 144; c.height = 96; const x = c.getContext('2d');
  const old = skin; skin = k;
  const boxes = [{ w: 2, h: 2, ci: 0, ox: 0, oy: 0 }, { w: 1, h: 2, ci: 2, ox: 2, oy: 0 }, { w: 3, h: 1, ci: 1, ox: 0, oy: 2 }];
  const sz = 30;
  for (const b of boxes) drawPieceCells(x, b, 8 + b.ox * sz, 4 + b.oy * sz, sz, 1);
  skin = old;
  return (previews[k] = c.toDataURL());
}

window.addEventListener('keydown', (e) => {
  if (!attached) return;
  const m = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'rotate', KeyX: 'rotate', ArrowDown: 'down', Space: 'drop', KeyA: 'left', KeyD: 'right', KeyW: 'rotate', KeyS: 'down' }[e.code];
  if (e.code === 'KeyP') { togglePause(); return; }
  if (m && !paused) { e.preventDefault(); audio(); act(m); }
});
document.addEventListener('visibilitychange', () => { if (document.hidden && attached && !over && !userPaused) { userPaused = true; syncPause(); } });
