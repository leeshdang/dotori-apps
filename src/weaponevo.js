import { t } from './i18n.js';
import { isMuted } from './parcel.js';

/*
  Dotori Weapon Evolution (DWE) - 2048 무기 진화 퍼즐
  - 4x4 그리드에서 상하좌우로 타일을 슬라이드하여 같은 무기를 합침
  - 나무 단검(2) -> 견습 단검(4) -> 강철 장검(8) -> ... -> 도토리 전설신검(2048) -> 우주 창조의 검(4096)
  - 무기 도감(Codex) 수집 시스템: 발견한 무기들이 영구 저장되며 스탯/스토리 열람 가능
  - 타격감 넘치는 Web Audio 사운드와 슬래시 파티클 이펙트
  - 제스처 스와이프, 키보드 방향키, 모바일 전용 D-Pad 터치 버튼 지원
  - 1회 실행 취소(Undo) 지원으로 전략적인 고득점 플레이 가능
*/

export const WEAPONS = [
  { level: 1, val: 2, name: '나무 단검', enName: 'Wooden Dagger', icon: '🪵', color: '#a8a29e', bg: 'linear-gradient(135deg, #44403c, #292524)', border: '#78716c', atk: 10, desc: '주변 나뭇가지로 깎아 만든 기초 단검' },
  { level: 2, val: 4, name: '견습 단검', enName: 'Apprentice Blade', icon: '🗡️', color: '#cbd5e1', bg: 'linear-gradient(135deg, #475569, #334155)', border: '#94a3b8', atk: 25, desc: '대장간 견습생이 담금질한 날카로운 칼' },
  { level: 3, val: 8, name: '강철 장검', enName: 'Steel Longsword', icon: '⚔️', color: '#93c5fd', bg: 'linear-gradient(135deg, #2563eb, #1e40af)', border: '#60a5fa', atk: 60, desc: '묵직하고 견고한 기사단의 제식 장검' },
  { level: 4, val: 16, name: '번개 레이피어', enName: 'Thunder Rapier', icon: '⚡', color: '#fde047', bg: 'linear-gradient(135deg, #ca8a04, #854d0e)', border: '#facc15', atk: 150, desc: '찌를 때마다 번갯불이 튀는 쾌검' },
  { level: 5, val: 32, name: '화염 대검', enName: 'Flame Greatsword', icon: '🔥', color: '#fdba74', bg: 'linear-gradient(135deg, #ea580c, #9a3412)', border: '#fb923c', atk: 350, desc: '꺼지지 않는 불꽃을 두른 맹렬한 대검' },
  { level: 6, val: 64, name: '빙결 카타나', enName: 'Frost Katana', icon: '❄️', color: '#7dd3fc', bg: 'linear-gradient(135deg, #0284c7, #075985)', border: '#38bdf8', atk: 800, desc: '베는 순간 적을 얼려버리는 혹한의 검' },
  { level: 7, val: 128, name: '공허의 룬검', enName: 'Void Runeblade', icon: '🔮', color: '#d8b4fe', bg: 'linear-gradient(135deg, #9333ea, #6b21a8)', border: '#c084fc', atk: 1800, desc: '고대 마법 문양이 새겨진 차원의 명검' },
  { level: 8, val: 256, name: '드래곤 슬레이어', enName: 'Dragon Slayer', icon: '🐉', color: '#f472b6', bg: 'linear-gradient(135deg, #db2777, #9d174d)', border: '#ec4899', atk: 4000, desc: '고대 용의 비늘조차 단숨에 베어내는 보검' },
  { level: 9, val: 512, name: '성기사 엑스칼리버', enName: 'Holy Excalibur', icon: '👑', color: '#fcd34d', bg: 'linear-gradient(135deg, #d97706, #78350f)', border: '#f59e0b', atk: 9000, desc: '선택받은 용사만이 쥘 수 있는 축복의 성검' },
  { level: 10, val: 1024, name: '은하 멸망검', enName: 'Galactic Edge', icon: '🌌', color: '#a5b4fc', bg: 'linear-gradient(135deg, #4f46e5, #312e81)', border: '#818cf8', atk: 20000, desc: '별자리의 힘을 응축한 초월적 파괴의 검' },
  { level: 11, val: 2048, name: '도토리 전설신검', enName: 'Dotori Godsword', icon: '🐿️', color: '#6ee7b7', bg: 'linear-gradient(135deg, #059669, #064e3b)', border: '#34d399', atk: 50000, desc: '도토리 왕국의 신비로운 힘이 깃든 궁극의 보물' },
  { level: 12, val: 4096, name: '우주 창조의 검', enName: 'Cosmic Origin', icon: '🌟', color: '#fda4af', bg: 'linear-gradient(135deg, #e11d48, #881337)', border: '#f43f5e', atk: 120000, desc: '온 우주의 시공간을 재창조하는 신화적 무기' },
];

export function getWeapon(val) {
  return WEAPONS.find(w => w.val === val) || {
    level: 13,
    val,
    name: '신화 초월검',
    enName: 'Mythic Origin',
    icon: '✨',
    color: '#f43f5e',
    bg: 'linear-gradient(135deg, #ec4899, #6366f1)',
    border: '#f472b6',
    atk: val * 30,
    desc: '인간의 영역을 넘어선 초신화적 에너지 검'
  };
}

let stage = {
  grid: Array(16).fill(0),
  score: 0,
  maxTile: 2,
  undoGrid: null,
  undoScore: 0,
  canUndo: false,
  over: false,
  won: false,
};

let best = Number(localStorage.getItem('dwe_best') || 0);
let unlockedSet = new Set(JSON.parse(localStorage.getItem('dwe_unlocked') || '[2]'));

let rootEl = null, boardEl = null, hud = {};
let onGameOver = () => {};
let attached = false, paused = false;

/* ---------- Audio (Web Audio API) ---------- */
let ac = null;
function audio() {
  if (isMuted()) return null;
  if (!ac) {
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; }
  }
  if (ac.state === 'suspended') ac.resume();
  return ac;
}

function sMove() {
  const ctx = audio(); if (!ctx) return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'triangle';
  o.frequency.setValueAtTime(260, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(380, ctx.currentTime + 0.08);
  g.gain.setValueAtTime(0.08, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  o.connect(g); g.connect(ctx.destination);
  o.start(); o.stop(ctx.currentTime + 0.08);
}

function sMerge(val) {
  const ctx = audio(); if (!ctx) return;
  const baseFreq = 300 + Math.min(12, Math.log2(val)) * 80;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(baseFreq, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.15);
  g.gain.setValueAtTime(0.18, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  o.connect(g); g.connect(ctx.destination);
  o.start(); o.stop(ctx.currentTime + 0.15);
}

function sFanfare() {
  const ctx = audio(); if (!ctx) return;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
    g.gain.setValueAtTime(0.16, ctx.currentTime + i * 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.22);
    o.connect(g); g.connect(ctx.destination);
    o.start(ctx.currentTime + i * 0.08);
    o.stop(ctx.currentTime + i * 0.08 + 0.22);
  });
}

/* ---------- 2048 Core Logic ---------- */
function spawnTile() {
  const emptyIndices = [];
  for (let i = 0; i < 16; i++) {
    if (stage.grid[i] === 0) emptyIndices.push(i);
  }
  if (emptyIndices.length === 0) return false;
  const idx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  const val = Math.random() < 0.9 ? 2 : 4;
  stage.grid[idx] = val;
  trackUnlock(val);
  return true;
}

function trackUnlock(val) {
  if (!unlockedSet.has(val)) {
    unlockedSet.add(val);
    localStorage.setItem('dwe_unlocked', JSON.stringify([...unlockedSet]));
    const w = getWeapon(val);
    sFanfare();
    showToast(`⚔️ 신규 무기 해금! [${w.name}]`);
  }
}

export function reset() {
  stage = {
    grid: Array(16).fill(0),
    score: 0,
    maxTile: 2,
    undoGrid: null,
    undoScore: 0,
    canUndo: false,
    over: false,
    won: false,
  };
  spawnTile();
  spawnTile();
  updateMaxTile();
  renderBoard();
  updateHud();
}

export function undo() {
  if (!stage.canUndo || !stage.undoGrid || stage.over) return;
  stage.grid = [...stage.undoGrid];
  stage.score = stage.undoScore;
  stage.canUndo = false;
  updateMaxTile();
  renderBoard();
  updateHud();
  showToast('↩️ 이전 상태로 되돌렸습니다');
}

function updateMaxTile() {
  stage.maxTile = Math.max(2, ...stage.grid);
}

function getLine(idx, dir) {
  const line = [];
  for (let i = 0; i < 4; i++) {
    if (dir === 'left') line.push(idx * 4 + i);
    else if (dir === 'right') line.push(idx * 4 + (3 - i));
    else if (dir === 'up') line.push(i * 4 + idx);
    else if (dir === 'down') line.push((3 - i) * 4 + idx);
  }
  return line;
}

export function move(dir) {
  if (stage.over || paused) return false;

  const prevGrid = [...stage.grid];
  const prevScore = stage.score;
  let moved = false;
  let gainedScore = 0;
  const newMergedVals = [];

  for (let i = 0; i < 4; i++) {
    const indices = getLine(i, dir);
    const lineVals = indices.map(idx => stage.grid[idx]).filter(v => v !== 0);
    const newLine = [];

    for (let j = 0; j < lineVals.length; j++) {
      if (j + 1 < lineVals.length && lineVals[j] === lineVals[j + 1]) {
        const mergedVal = lineVals[j] * 2;
        newLine.push(mergedVal);
        gainedScore += mergedVal;
        newMergedVals.push(mergedVal);
        trackUnlock(mergedVal);
        j++; // 다음 타일 건너뜀
      } else {
        newLine.push(lineVals[j]);
      }
    }

    while (newLine.length < 4) newLine.push(0);

    for (let j = 0; j < 4; j++) {
      if (stage.grid[indices[j]] !== newLine[j]) {
        moved = true;
      }
      stage.grid[indices[j]] = newLine[j];
    }
  }

  if (moved) {
    stage.undoGrid = prevGrid;
    stage.undoScore = prevScore;
    stage.canUndo = true;
    stage.score += gainedScore;

    if (stage.score > best) {
      best = stage.score;
      localStorage.setItem('dwe_best', String(best));
    }

    updateMaxTile();
    spawnTile();

    if (newMergedVals.length > 0) {
      sMerge(Math.max(...newMergedVals));
    } else {
      sMove();
    }

    renderBoard();
    updateHud();

    if (checkGameOver()) {
      stage.over = true;
      onGameOver({ score: stage.score, best, maxTile: stage.maxTile });
    }
    return true;
  }
  return false;
}

function checkGameOver() {
  for (let i = 0; i < 16; i++) {
    if (stage.grid[i] === 0) return false;
  }
  // 가로 인접 검사
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      if (stage.grid[r * 4 + c] === stage.grid[r * 4 + c + 1]) return false;
    }
  }
  // 세로 인접 검사
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 3; r++) {
      if (stage.grid[r * 4 + c] === stage.grid[(r + 1) * 4 + c]) return false;
    }
  }
  return true;
}

/* ---------- Rendering & DOM ---------- */
function renderBoard() {
  if (!boardEl) return;
  boardEl.innerHTML = stage.grid.map((val, idx) => {
    if (val === 0) {
      return `<div class="dwe-cell empty" data-idx="${idx}"></div>`;
    }
    const w = getWeapon(val);
    return `<div class="dwe-cell occupied" data-idx="${idx}" style="background:${w.bg};border-color:${w.border}">
      <span class="dwe-icon">${w.icon}</span>
      <b class="dwe-val">${val}</b>
      <small class="dwe-name">${w.name}</small>
    </div>`;
  }).join('');
}

function updateHud() {
  if (hud.score) hud.score.textContent = stage.score;
  if (hud.best) hud.best.textContent = best;
  if (hud.max) {
    const mw = getWeapon(stage.maxTile);
    hud.max.innerHTML = `<span>${mw.icon} ${mw.name}</span> <small style="color:${mw.color}">(Lv.${mw.level})</small>`;
  }
  if (hud.count) {
    hud.count.textContent = `${unlockedSet.size} / ${WEAPONS.length}`;
  }
  if (hud.undoBtn) {
    hud.undoBtn.disabled = !stage.canUndo;
    hud.undoBtn.style.opacity = stage.canUndo ? '1' : '0.45';
  }
}

function showToast(msg) {
  const tEl = document.getElementById('dwe-toast');
  if (!tEl) return;
  tEl.textContent = msg;
  tEl.classList.remove('show');
  void tEl.offsetWidth;
  tEl.classList.add('show');
}

/* ---------- Pointer / Gesture / Keyboard Events ---------- */
let touchStartX = 0, touchStartY = 0, touchStartTime = 0;

function onPointerDown(e) {
  touchStartX = e.clientX;
  touchStartY = e.clientY;
  touchStartTime = Date.now();
}

function onPointerUp(e) {
  const dx = e.clientX - touchStartX;
  const dy = e.clientY - touchStartY;
  const dist = Math.hypot(dx, dy);
  const duration = Date.now() - touchStartTime;

  if (dist > 28 && duration < 800) {
    if (Math.abs(dx) > Math.abs(dy)) {
      move(dx > 0 ? 'right' : 'left');
    } else {
      move(dy > 0 ? 'down' : 'up');
    }
  }
}

function onKeyDown(e) {
  if (!attached || paused) return;
  if (['ArrowUp', 'KeyW'].includes(e.code)) { e.preventDefault(); move('up'); }
  else if (['ArrowDown', 'KeyS'].includes(e.code)) { e.preventDefault(); move('down'); }
  else if (['ArrowLeft', 'KeyA'].includes(e.code)) { e.preventDefault(); move('left'); }
  else if (['ArrowRight', 'KeyD'].includes(e.code)) { e.preventDefault(); move('right'); }
  else if (['KeyU', 'Backspace'].includes(e.code)) { e.preventDefault(); undo(); }
  else if (e.code === 'KeyR') { e.preventDefault(); reset(); }
}

/* ---------- Public Lifecycle ---------- */
export function attach(els, callbacks) {
  rootEl = els.root;
  boardEl = els.board;
  hud = {
    score: els.score,
    best: els.best,
    max: els.max,
    count: els.count,
    undoBtn: els.undoBtn,
  };
  onGameOver = callbacks.onGameOver || (() => {});
  attached = true;

  if (stage.grid.every(v => v === 0) || stage.over) {
    reset();
  } else {
    renderBoard();
    updateHud();
  }

  if (boardEl) {
    boardEl.addEventListener('pointerdown', onPointerDown);
    boardEl.addEventListener('pointerup', onPointerUp);
  }
  window.addEventListener('keydown', onKeyDown);
}

export function detach() {
  attached = false;
  if (boardEl) {
    boardEl.removeEventListener('pointerdown', onPointerDown);
    boardEl.removeEventListener('pointerup', onPointerUp);
  }
  window.removeEventListener('keydown', onKeyDown);
}

export function setPaused(p) { paused = p; }
export const getBest = () => best;
export const getUnlockedCount = () => unlockedSet.size;
export const getUnlockedSet = () => unlockedSet;
