import { t } from './i18n.js';
import { isMuted } from './parcel.js';

export const MAX_LEVEL = 30;
const INF = 9999;
const REP_COST = 4;
const HOUSE_COLORS = ['#f472b6', '#60a5fa', '#fbbf24', '#34d399', '#a78bfa', '#fb923c', '#22d3ee', '#f87171'];

/* ---------- helpers ---------- */
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let x = Math.imul(a ^ (a >>> 15), 1 | a); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
function nbs(i, n) { const r = (i / n) | 0, c = i % n, o = []; if (r > 0) o.push(i - n); if (r < n - 1) o.push(i + n); if (c > 0) o.push(i - 1); if (c < n - 1) o.push(i + 1); return o; }
const shuffle = (a, rnd) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

function evaluate(L, cab, rep) {
  const { n, R, router } = L, N = n * n, dist = new Int16Array(N).fill(INF);
  let changed = true, guard = 0;
  while (changed && guard++ < 400) {
    changed = false;
    for (let i = 0; i < N; i++) {
      if (!cab[i]) continue;
      let m = INF;
      for (const k of L.nb[i]) { if (k === router) m = 0; else if (cab[k] && dist[k] < INF && dist[k] < m) m = dist[k]; }
      if (m === INF) continue;
      const d = m + 1;
      if (d <= R) { const nd = rep[i] ? 0 : d; if (nd < dist[i]) { dist[i] = nd; changed = true; } }
    }
  }
  const powered = L.houses.map((h) => L.nb[h].some((k) => k === router || (cab[k] && dist[k] < INF)));
  return { dist, powered };
}

/* ---------- par solver (shortest-path Steiner heuristic + repeaters) ---------- */
function solveOnce(L, rnd) {
  const { n, router } = L, N = n * n, T = new Set(), left = [...L.houses];
  const free = (i) => !L.obst.has(i) && i !== router && !L.houseSet.has(i);
  while (left.length) {
    const d = new Int16Array(N).fill(INF), par = new Int16Array(N).fill(-1), q = [];
    for (const c of T) { d[c] = 0; q.push(c); }
    for (const k of nbs(router, n)) if (free(k) && d[k] === INF) { d[k] = 1; par[k] = -1; q.push(k); }
    for (let h = 0; h < q.length; h++) {
      const u = q[h];
      for (const k of shuffle(nbs(u, n), rnd)) if (free(k) && d[k] === INF) { d[k] = d[u] + 1; par[k] = u; q.push(k); }
    }
    let best = null, bc = INF;
    for (const h of left) {
      for (const k of nbs(h, n)) {
        let c = INF;
        if (k === router || T.has(k)) c = 0; else if (d[k] < INF) c = d[k];
        c += rnd() * 0.9;
        if (c < bc) { bc = c; best = { h, k }; }
      }
    }
    if (!best) return null;
    let k = best.k;
    if (k !== router) while (k !== -1 && !T.has(k)) { T.add(k); k = par[k]; }
    left.splice(left.indexOf(best.h), 1);
  }
  // BFS from router over T, place repeaters
  const eff = new Map(), rep = new Set(), q = [];
  for (const k of nbs(router, n)) if (T.has(k)) { eff.set(k, 1); q.push(k); }
  for (let h = 0; h < q.length; h++) {
    const u = q[h], kids = nbs(u, n).filter((k) => T.has(k) && !eff.has(k));
    let e = eff.get(u);
    if (e >= L.R && kids.length) { rep.add(u); e = 0; }
    for (const k of kids) { eff.set(k, e + 1); q.push(k); }
  }
  const cab = new Uint8Array(N), rp = new Uint8Array(N);
  T.forEach((c) => (cab[c] = 1)); rep.forEach((c) => (rp[c] = 1));
  if (!evaluate(L, cab, rp).powered.every(Boolean)) return null;
  return T.size + REP_COST * rep.size;
}

const levelCache = {};
function buildLevel(level) {
  if (levelCache[level]) return levelCache[level];
  const n = Math.min(10, 6 + Math.floor((level - 1) / 5));
  const nh = Math.min(8, 2 + Math.floor((level - 1) / 3));
  const R = Math.max(3, 8 - Math.floor((level - 1) / 3));
  const nObs = Math.floor(n * n * (0.06 + Math.min(level, 20) * 0.006));
  for (let attempt = 0; attempt < 80; attempt++) {
    const rnd = rng(level * 7919 + attempt * 104729 + 13);
    const N = n * n, used = new Set();
    const router = Math.floor(n / 2 - 1 + rnd() * 3) * n + Math.floor(n / 2 - 1 + rnd() * 3);
    used.add(router);
    const man = (a, b) => Math.abs(((a / n) | 0) - ((b / n) | 0)) + Math.abs((a % n) - (b % n));
    const houses = [];
    let guard = 0;
    while (houses.length < nh && guard++ < 500) {
      const c = Math.floor(rnd() * N);
      if (used.has(c)) continue;
      if (man(c, router) < 3 || houses.some((h) => man(h, c) < 2)) continue;
      houses.push(c); used.add(c);
    }
    if (houses.length < nh) continue;
    const obst = new Set();
    guard = 0;
    while (obst.size < nObs && guard++ < 500) { const c = Math.floor(rnd() * N); if (!used.has(c)) { obst.add(c); used.add(c); } }
    const L = { n, R, router, houses, houseSet: new Set(houses), obst, nb: Array.from({ length: N }, (_, i) => nbs(i, n)), level };
    let par = INF;
    for (let k = 0; k < 28; k++) { const c = solveOnce(L, rng(level * 31 + attempt * 977 + k * 131)); if (c !== null && c < par) par = c; }
    if (par === INF) continue;
    L.par = par;
    return (levelCache[level] = L);
  }
  throw new Error('level generation failed');
}

/* ---------- progress ---------- */
let prog = {};
try { prog = JSON.parse(localStorage.getItem('wf_progress') || '{}'); } catch { prog = {}; }
export const getStars = (n) => prog[n] || 0;
export function unlocked() { let m = 0; for (const k of Object.keys(prog)) if (prog[k] > 0) m = Math.max(m, Number(k)); return Math.min(MAX_LEVEL, m + 1); }
function saveStars(n, s) { if (s > (prog[n] || 0)) { prog[n] = s; localStorage.setItem('wf_progress', JSON.stringify(prog)); } }

/* ---------- state ---------- */
let L = null, cab, rep, ev, tool = 'cable', level = Number(localStorage.getItem('wf_level') || 1);
let cv, g, hud = {}, raf = 0, attached = false, paused = false, cbs = {}, hover = -1, painting = null, winTimer = 0, won = false, prevPowered = [];
export const getLevel = () => level;
export const getTool = () => tool;
export function setTool(k) { tool = k; }
export const getInfo = () => ({ level, par: L ? L.par : 0, R: L ? L.R : 0 });
export function setPaused(p) { paused = p; }

export function loadLevel(n) {
  level = Math.max(1, Math.min(MAX_LEVEL, n));
  localStorage.setItem('wf_level', String(level));
  L = buildLevel(level); const N = L.n * L.n;
  cab = new Uint8Array(N); rep = new Uint8Array(N); won = false; clearTimeout(winTimer);
  recompute(false); updateHud();
}
export const reset = () => loadLevel(level);
const cost = () => { let c = 0; for (let i = 0; i < cab.length; i++) if (cab[i]) c += 1 + (rep[i] ? REP_COST : 0); return c; };

function recompute(sound = true) {
  ev = evaluate(L, cab, rep);
  if (sound && ev.powered.some((p, i) => p && !prevPowered[i])) sConnect();
  prevPowered = ev.powered.slice();
  updateHud();
  const all = ev.powered.every(Boolean);
  if (all && !won) {
    won = true; clearTimeout(winTimer);
    winTimer = setTimeout(() => {
      if (!won) return;
      const c = cost(), stars = c <= L.par ? 3 : c <= L.par + 3 ? 2 : 1;
      saveStars(level, stars); sWin();
      cbs.onWin && cbs.onWin({ level, stars, cost: c, par: L.par });
    }, 700);
  } else if (!all && won) { won = false; clearTimeout(winTimer); }
}
function updateHud() {
  if (!L) return;
  const set = (k, v) => hud[k] && (hud[k].textContent = v);
  set('level', level); set('cost', cost()); set('par', L.par); set('range', L.R);
  const ok = ev ? ev.powered.filter(Boolean).length : 0;
  set('conn', `${ok}/${L.houses.length}`);
  if (hud.bar) hud.bar.style.width = `${(ok / L.houses.length) * 100}%`;
}

/* ---------- audio ---------- */
let ac = null;
function audio() {
  if (isMuted()) return null;
  if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } }
  if (ac.state === 'suspended') ac.resume();
  return ac;
}
function tone(a, f0, f1, dur, vol, type = 'sine', delay = 0) {
  const t0 = a.currentTime + delay, o = a.createOscillator(), gn = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
  gn.gain.setValueAtTime(vol, t0); gn.gain.exponentialRampToValueAtTime(.001, t0 + dur);
  o.connect(gn); gn.connect(a.destination); o.start(t0); o.stop(t0 + dur + .02);
}
const sPlace = () => { const a = audio(); if (a) tone(a, 520, 380, .06, .08, 'square'); };
const sErase = () => { const a = audio(); if (a) tone(a, 300, 180, .07, .08, 'triangle'); };
const sRep = () => { const a = audio(); if (a) { tone(a, 440, 880, .16, .12, 'sine'); tone(a, 660, 1320, .2, .08, 'sine', .06); } };
const sConnect = () => { const a = audio(); if (a) { tone(a, 784, 784, .18, .12, 'triangle'); tone(a, 1175, 1175, .25, .1, 'triangle', .08); } };
const sWin = () => { const a = audio(); if (a) [523, 659, 784, 1047, 1319].forEach((f, i) => tone(a, f, f, .4, .12, 'triangle', i * .09)); };

/* ---------- input ---------- */
const blocked = (i) => L.obst.has(i) || i === L.router || L.houseSet.has(i);
function cellAt(e) {
  const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
  if (x < 0 || y < 0 || x >= 1 || y >= 1) return -1;
  return Math.floor(y * L.n) * L.n + Math.floor(x * L.n);
}
function apply(i, mode) {
  if (i < 0 || blocked(i)) return;
  if (mode === 'add' && !cab[i]) { cab[i] = 1; sPlace(); recompute(); }
  else if (mode === 'erase' && cab[i]) { cab[i] = 0; rep[i] = 0; sErase(); recompute(); }
}
function onDown(e) {
  if (paused || !L) return;
  e.preventDefault(); cv.setPointerCapture(e.pointerId);
  const i = cellAt(e);
  if (i < 0 || blocked(i)) return;
  if (tool === 'repeater') {
    if (!cab[i]) { cab[i] = 1; rep[i] = 1; sRep(); }
    else if (!rep[i]) { rep[i] = 1; sRep(); }
    else { rep[i] = 0; sErase(); }
    recompute(); return;
  }
  painting = tool === 'erase' ? 'erase' : 'add';
  apply(i, painting);
}
function onMove(e) {
  if (!L) return;
  hover = cellAt(e);
  if (painting && !paused) apply(hover, painting);
}
const onUp = () => { painting = null; };

/* ---------- render ---------- */
function draw(now) {
  const W = cv.width, s = W / L.n, T = now / 1000;
  const bg = g.createLinearGradient(0, 0, W, W); bg.addColorStop(0, '#16233f'); bg.addColorStop(1, '#0d1226');
  g.fillStyle = bg; g.fillRect(0, 0, W, W);
  for (let r = 0; r < L.n; r++) for (let c = 0; c < L.n; c++) {
    g.fillStyle = (r + c) % 2 ? 'rgba(255,255,255,.035)' : 'rgba(255,255,255,.015)';
    g.fillRect(c * s, r * s, s, s);
  }
  const cx = (i) => (i % L.n) * s + s / 2, cy = (i) => ((i / L.n) | 0) * s + s / 2;
  // obstacles
  for (const i of L.obst) {
    const x = cx(i), y = cy(i), k = (i * 7 + L.n) % 3;
    if (k === 0) { g.fillStyle = '#7a5230'; g.fillRect(x - s * .05, y + s * .05, s * .1, s * .25); g.fillStyle = '#2f9e5b'; g.beginPath(); g.arc(x, y - s * .05, s * .27, 0, 7); g.fill(); g.fillStyle = '#46c57a'; g.beginPath(); g.arc(x - s * .08, y - s * .13, s * .12, 0, 7); g.fill(); }
    else if (k === 1) { g.fillStyle = '#6b7280'; g.beginPath(); g.ellipse(x, y + s * .06, s * .3, s * .22, 0, 0, 7); g.fill(); g.fillStyle = '#9ca3af'; g.beginPath(); g.ellipse(x - s * .08, y, s * .13, s * .09, 0, 0, 7); g.fill(); }
    else { g.fillStyle = '#1d4e89'; g.beginPath(); g.ellipse(x, y, s * .36, s * .26, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(160,210,255,.6)'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, s * .15, .2, 2.6); g.stroke(); }
  }
  // cable segments
  const segColor = (a, b) => {
    const da = a === L.router ? 0 : ev.dist[a], db = b === L.router ? 0 : ev.dist[b];
    if (da >= INF || db >= INF) return null;
    const rem = L.R - Math.max(da, db), f = rem / L.R;
    return f > .5 ? '#34d399' : f > .25 ? '#fbbf24' : '#fb923c';
  };
  const seg = (a, b) => {
    const col = segColor(a, b);
    g.lineCap = 'round';
    g.strokeStyle = '#070b18'; g.lineWidth = s * .26; g.beginPath(); g.moveTo(cx(a), cy(a)); g.lineTo(cx(b), cy(b)); g.stroke();
    g.strokeStyle = col || 'rgba(239,68,68,.6)'; g.lineWidth = s * .15; g.beginPath(); g.moveTo(cx(a), cy(a)); g.lineTo(cx(b), cy(b)); g.stroke();
    if (col) { g.save(); g.strokeStyle = 'rgba(255,255,255,.65)'; g.lineWidth = s * .05; g.setLineDash([s * .1, s * .3]); g.lineDashOffset = -T * s * .8; g.beginPath(); g.moveTo(cx(a), cy(a)); g.lineTo(cx(b), cy(b)); g.stroke(); g.restore(); }
  };
  for (let i = 0; i < cab.length; i++) {
    if (!cab[i]) continue;
    for (const k of L.nb[i]) {
      if (k === L.router || L.houseSet.has(k)) { if (k === L.router || true) seg(i, k); }
      else if (cab[k] && k > i) seg(i, k);
    }
  }
  // cable nodes
  for (let i = 0; i < cab.length; i++) {
    if (!cab[i]) continue;
    const x = cx(i), y = cy(i), pw = ev.dist[i] < INF, rem = pw ? L.R - ev.dist[i] : 0;
    if (rep[i]) {
      const pulse = pw ? (T * 1.5) % 1 : 0;
      if (pw) { g.strokeStyle = `rgba(196,181,253,${.6 * (1 - pulse)})`; g.lineWidth = 3; g.beginPath(); g.arc(x, y, s * (.3 + pulse * .35), 0, 7); g.stroke(); }
      g.fillStyle = pw ? '#7c3aed' : '#4b3b7a'; g.beginPath(); g.arc(x, y, s * .3, 0, 7); g.fill();
      g.strokeStyle = '#ddd6fe'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(x, y + s * .17); g.lineTo(x, y - s * .02); g.stroke();
      g.beginPath(); g.arc(x, y - s * .05, s * .1, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
      g.beginPath(); g.arc(x, y - s * .05, s * .18, Math.PI * 1.2, Math.PI * 1.8); g.stroke();
    } else {
      g.fillStyle = pw ? '#0b1020' : '#3a1020'; g.beginPath(); g.arc(x, y, s * .2, 0, 7); g.fill();
      g.strokeStyle = pw ? (rem / L.R > .5 ? '#34d399' : rem / L.R > .25 ? '#fbbf24' : '#fb923c') : '#ef4444'; g.lineWidth = 2.5; g.stroke();
      g.fillStyle = pw ? '#fff' : '#ef4444'; g.font = `700 ${s * .26}px 'JetBrains Mono', monospace`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(pw ? rem : '×', x, y + 1);
    }
  }
  // router
  { const x = cx(L.router), y = cy(L.router), p = (T * .8) % 1;
    for (let k = 0; k < 2; k++) { const q = (p + k * .5) % 1; g.strokeStyle = `rgba(125,211,252,${.5 * (1 - q)})`; g.lineWidth = 3; g.beginPath(); g.arc(x, y, s * (.4 + q * .9), 0, 7); g.stroke(); }
    g.strokeStyle = '#e5e7eb'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - s * .2, y - s * .1); g.lineTo(x - s * .26, y - s * .36); g.moveTo(x + s * .2, y - s * .1); g.lineTo(x + s * .26, y - s * .36); g.stroke();
    g.fillStyle = '#f8fafc'; g.beginPath(); g.roundRect(x - s * .36, y - s * .16, s * .72, s * .34, s * .1); g.fill();
    g.fillStyle = '#38bdf8'; [-.2, 0, .2].forEach((o) => { g.beginPath(); g.arc(x + s * o, y + s * .01, s * .045, 0, 7); g.fill(); });
  }
  // houses
  L.houses.forEach((h, idx) => {
    const x = cx(h), y = cy(h), pw = ev.powered[idx], col = HOUSE_COLORS[idx % HOUSE_COLORS.length];
    g.fillStyle = pw ? '#f1f5f9' : '#94a3b8'; g.fillRect(x - s * .27, y - s * .04, s * .54, s * .36);
    g.fillStyle = pw ? col : '#64748b'; g.beginPath(); g.moveTo(x - s * .34, y - s * .02); g.lineTo(x, y - s * .34); g.lineTo(x + s * .34, y - s * .02); g.closePath(); g.fill();
    g.fillStyle = pw ? '#fde047' : '#334155'; g.fillRect(x - s * .19, y + s * .04, s * .14, s * .13); g.fillRect(x + s * .05, y + s * .04, s * .14, s * .13);
    g.fillStyle = '#7a5230'; g.fillRect(x - s * .05, y + s * .18, s * .1, s * .14);
    if (pw) {
      g.strokeStyle = '#34d399'; g.lineWidth = 3; g.lineCap = 'round';
      for (let k = 1; k <= 3; k++) { g.beginPath(); g.arc(x, y - s * .38, s * .07 * k, Math.PI * 1.2, Math.PI * 1.8); g.stroke(); }
    } else {
      g.fillStyle = '#ef4444'; g.font = `700 ${s * .26}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('✕', x, y - s * .4);
    }
  });
  // hover
  if (hover >= 0 && !paused && !blocked(hover)) {
    g.strokeStyle = tool === 'erase' ? 'rgba(248,113,113,.9)' : tool === 'repeater' ? 'rgba(196,181,253,.9)' : 'rgba(125,211,252,.9)';
    g.lineWidth = 3; g.beginPath(); g.roundRect((hover % L.n) * s + 3, ((hover / L.n) | 0) * s + 3, s - 6, s - 6, 8); g.stroke();
  }
}
function loop(now) { raf = requestAnimationFrame(loop); if (attached && L) draw(now); }

/* ---------- public ---------- */
export function attach(els, callbacks) {
  cv = els.canvas; g = cv.getContext('2d'); cbs = callbacks || {};
  hud = { level: els.level, cost: els.cost, par: els.par, range: els.range, conn: els.conn, bar: els.bar };
  attached = true;
  if (!L) loadLevel(Math.min(level, unlocked()));
  updateHud();
  cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointermove', onMove);
  cv.addEventListener('pointerup', onUp); cv.addEventListener('pointercancel', onUp); cv.addEventListener('pointerleave', () => { hover = -1; });
  if (!raf) raf = requestAnimationFrame(loop);
}
export function detach() { attached = false; cancelAnimationFrame(raf); raf = 0; painting = null; }
export { t as _t };
