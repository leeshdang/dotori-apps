import { t } from './i18n.js';
import { isMuted } from './parcel.js';

/*
  Dotori Black Hole (DBH)
  컨셉: Hole.io 느낌의 중독성 넘치는 블랙홀 흡수 정리 게임
  - 화면에 다양한 크기/등급의 물건(도토리, 택배상자, 컴퓨터, 가구, 건물 등)이 쏟아짐
  - 플레이어는 마우스/터치로 블랙홀을 조작
  - 블랙홀의 크기(반경)보다 작은 물건만 빨아들여 흡수 가능
  - 흡수할 때마다 블랙홀이 성장(반경 증가 + 레벨업)하며 더 거대한 물건을 삼킬 수 있음!
  - 제한 시간(60초) 동안 최대한 많은 물건을 흡수해 최고 점수 달성
*/

export const TIERS = [
  { minR: 0, maxR: 24, name: '아기 도토리 & 잎사귀', desc: '작은 것부터 차근차근!' },
  { minR: 24, maxR: 38, name: '택배 상자 & 책 & 사과', desc: '주변 소품들을 삼키세요' },
  { minR: 38, maxR: 56, name: '노트북 & 의자 & 드럼통', desc: '가구와 전자기기 흡수!' },
  { minR: 56, maxR: 80, name: '소파 & 자동차 & 자판기', desc: '탈것과 대형 가구 삼키기' },
  { minR: 80, maxR: 120, name: '트럭 & 도토리나무', desc: '거대한 트럭과 자연물!' },
  { minR: 120, maxR: 999, name: '빌딩 & 도토리 데이터센터', desc: '모든 것을 집어삼키는 초거대 블랙홀!' },
];

export const ITEM_DEFS = [
  // Size 1 (Radius ~10..16)
  { type: 'acorn', icon: '🌰', name: '도토리', radius: 12, pts: 10, color: '#e0a060' },
  { type: 'leaf', icon: '🍃', name: '나뭇잎', radius: 10, pts: 8, color: '#4ade80' },
  { type: 'apple', icon: '🍎', name: '사과', radius: 14, pts: 12, color: '#f87171' },
  { type: 'coin', icon: '🪙', name: '도토리 코인', radius: 11, pts: 15, color: '#facc15' },

  // Size 2 (Radius ~20..26)
  { type: 'box', icon: '📦', name: '택배 상자', radius: 20, pts: 25, color: '#d9a566' },
  { type: 'book', icon: '📚', name: '책 더미', radius: 18, pts: 22, color: '#60a5fa' },
  { type: 'coffee', icon: '☕', name: '머그컵', radius: 16, pts: 18, color: '#cbd5e1' },

  // Size 3 (Radius ~32..42)
  { type: 'laptop', icon: '💻', name: '노트북', radius: 30, pts: 50, color: '#94a3b8' },
  { type: 'chair', icon: '🪑', name: '의자', radius: 28, pts: 45, color: '#a78bfa' },
  { type: 'barrel', icon: '🛢️', name: '드럼통', radius: 34, pts: 60, color: '#fb923c' },

  // Size 4 (Radius ~48..60)
  { type: 'sofa', icon: '🛋️', name: '소파', radius: 46, pts: 100, color: '#ec4899' },
  { type: 'car', icon: '🚗', name: '승용차', radius: 52, pts: 130, color: '#38bdf8' },
  { type: 'vending', icon: '🎰', name: '자판기', radius: 48, pts: 115, color: '#f43f5e' },

  // Size 5 (Radius ~70..90)
  { type: 'truck', icon: '🚚', name: '택배 트럭', radius: 72, pts: 250, color: '#fbbf24' },
  { type: 'tree', icon: '🌳', name: '도토리나무', radius: 78, pts: 300, color: '#22c55e' },

  // Size 6 (Radius ~105..135)
  { type: 'building', icon: '🏢', name: '오피스 빌딩', radius: 110, pts: 600, color: '#818cf8' },
  { type: 'datacenter', icon: '🏬', name: '데이터센터', radius: 125, pts: 800, color: '#c084fc' },
];

let stage = {
  hole: { x: 300, y: 300, r: 22, targetX: 300, targetY: 300, speed: 8 },
  items: [],
  score: 0,
  absorbedCount: 0,
  time: 30,
  over: false,
};

let best = Number(localStorage.getItem('dbh_best') || 0);
let cv, g, hud = {}, raf = 0, attached = false, paused = false, timerInterval = 0;
let onGameOver = () => {};
let particles = [];
let toasts = [];

function rand(min, max) { return min + Math.random() * (max - min); }

function spawnItem(forceTier = null) {
  const W = cv ? cv.width : 640;
  const H = cv ? cv.height : 640;

  // 블랙홀 크기에 맞춰 주변에 적합한 물건 위주로 생성
  let pool = ITEM_DEFS.filter(def => {
    if (forceTier !== null) return true;
    // 블랙홀 크기보다 너무 큰 물건은 후반에만 등장
    return def.radius <= stage.hole.r * 1.5;
  });
  if (pool.length === 0) pool = ITEM_DEFS.slice(0, 4);

  const def = pool[Math.floor(Math.random() * pool.length)];
  const angle = Math.random() * Math.PI * 2;
  const dist = rand(stage.hole.r + 60, Math.min(W, H) * 0.45);

  let x = stage.hole.x + Math.cos(angle) * dist;
  let y = stage.hole.y + Math.sin(angle) * dist;

  // 화면 경계 안전 보정
  x = Math.max(def.radius + 20, Math.min(W - def.radius - 20, x));
  y = Math.max(def.radius + 20, Math.min(H - def.radius - 20, y));

  return {
    id: Math.random().toString(36).slice(2),
    ...def,
    x,
    y,
    scale: 1,
    sucking: false,
    suckProgress: 0,
  };
}

export function reset() {
  const W = cv ? cv.width : 640;
  const H = cv ? cv.height : 640;
  stage = {
    hole: { x: W / 2, y: H / 2, r: 22, targetX: W / 2, targetY: H / 2, speed: 7 },
    items: [],
    score: 0,
    absorbedCount: 0,
    time: 30,
    over: false,
  };
  particles = [];
  toasts = [];

  // 초기 물건 25개 스폰
  for (let i = 0; i < 28; i++) {
    stage.items.push(spawnItem());
  }

  updateHud();
  startTimer();
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (paused || stage.over || !attached) return;
    stage.time--;
    if (stage.time <= 0) {
      stage.time = 0;
      endGame();
    }
    // 주기적으로 맵에 물건 30개 채워두기
    while (stage.items.length < 32) {
      stage.items.push(spawnItem());
    }
    updateHud();
  }, 1000);
}

function endGame() {
  stage.over = true;
  clearInterval(timerInterval);
  if (stage.score > best) {
    best = stage.score;
    localStorage.setItem('dbh_best', String(best));
  }
  updateHud();
  onGameOver({ score: stage.score, best, count: stage.absorbedCount });
}

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

function sSuck(size) {
  const a = audio(); if (!a) return;
  const o = a.createOscillator(), gn = a.createGain();
  const freq = Math.max(80, 480 - size * 3);
  o.type = 'sine';
  o.frequency.setValueAtTime(freq, a.currentTime);
  o.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.4), a.currentTime + 0.15);
  gn.gain.setValueAtTime(0.15, a.currentTime);
  gn.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.15);
  o.connect(gn); gn.connect(a.destination);
  o.start(); o.stop(a.currentTime + 0.16);
}

function sLevelUp() {
  const a = audio(); if (!a) return;
  [523, 659, 784, 1046].forEach((f, i) => {
    setTimeout(() => {
      const o = a.createOscillator(), g = a.createGain();
      o.type = 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(0.12, a.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.2);
      o.connect(g); g.connect(a.destination);
      o.start(); o.stop(a.currentTime + 0.22);
    }, i * 60);
  });
}

function toast(text, x, y, color = '#f472b6') {
  toasts.push({ text, x, y, color, life: 1.0 });
}

function addParticles(x, y, color) {
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 3.5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      life: 1.0,
      size: 3 + Math.random() * 3,
    });
  }
}

function updateHud() {
  if (hud.score) hud.score.textContent = stage.score;
  if (hud.best) hud.best.textContent = Math.max(best, stage.score);
  if (hud.time) hud.time.textContent = `${stage.time}s`;
  if (hud.size) hud.size.textContent = `${Math.round(stage.hole.r)}m`;
  if (hud.count) hud.count.textContent = stage.absorbedCount;
}

/* ---------- Main Loop & Physics ---------- */
function updatePhysics() {
  if (stage.over || paused) return;

  const h = stage.hole;
  // 부드러운 블랙홀 이동
  const dx = h.targetX - h.x;
  const dy = h.targetY - h.y;
  h.x += dx * 0.14;
  h.y += dy * 0.14;

  // 물건 흡수 충돌 검사
  for (let i = stage.items.length - 1; i >= 0; i--) {
    const item = stage.items[i];
    const dist = Math.hypot(item.x - h.x, item.y - h.y);

    // 블랙홀 빨려들어감 판정
    if (dist < h.r) {
      if (item.radius <= h.r * 0.95) {
        // 완전히 빨려들어감!
        item.sucking = true;
        item.x += (h.x - item.x) * 0.35;
        item.y += (h.y - item.y) * 0.35;
        item.scale *= 0.75;

        if (item.scale < 0.15) {
          // 흡수 완료
          stage.score += item.pts;
          stage.absorbedCount++;
          const prevTier = TIERS.findIndex(t => h.r >= t.minR && h.r < t.maxR);
          
          // 블랙홀 성장 (점진적 반경 증가)
          const growth = Math.max(0.3, (item.radius / h.r) * 0.9);
          h.r = Math.min(160, h.r + growth);
          
          const newTier = TIERS.findIndex(t => h.r >= t.minR && h.r < t.maxR);
          if (newTier > prevTier && newTier !== -1) {
            sLevelUp();
            toast(`🌟 레벨업! ${TIERS[newTier].name}`, h.x, h.y - h.r - 20, '#38bdf8');
          }

          sSuck(item.radius);
          addParticles(item.x, item.y, item.color);
          toast(`+${item.pts}`, item.x, item.y, '#facc15');

          stage.items.splice(i, 1);
          stage.items.push(spawnItem());
          updateHud();
        }
      } else {
        // 너무 커서 튕겨남 (아직 못 삼킴)
        const pushAngle = Math.atan2(item.y - h.y, item.x - h.x);
        item.x = h.x + Math.cos(pushAngle) * (h.r + item.radius + 2);
        item.y = h.y + Math.sin(pushAngle) * (h.r + item.radius + 2);
      }
    } else if (dist < h.r * 1.6 && item.radius <= h.r) {
      // 인력 (Gravitational Pull) 효과
      const pullFactor = 0.08 * (1 - dist / (h.r * 1.6));
      item.x += (h.x - item.x) * pullFactor;
      item.y += (h.y - item.y) * pullFactor;
    }
  }
}

function draw(now) {
  const W = cv.width, H = cv.height;

  // 시티 / 창고 바닥 그리드 배경
  const bg = g.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#151726');
  bg.addColorStop(1, '#0b0c14');
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);

  // 타일 패턴
  g.strokeStyle = 'rgba(255, 255, 255, 0.035)';
  g.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < W; x += gridSize) {
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke();
  }
  for (let y = 0; y < H; y += gridSize) {
    g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
  }

  const h = stage.hole;

  // 1. 블랙홀 렌더링 (Hole.io 스타일의 깊은 심연과 이벤트 호라이즌)
  g.save();
  // 외부 중력 왜곡 글로우
  const glow = g.createRadialGradient(h.x, h.y, h.r * 0.7, h.x, h.y, h.r * 1.35);
  glow.addColorStop(0, 'rgba(147, 51, 234, 0.6)');
  glow.addColorStop(0.5, 'rgba(236, 72, 153, 0.3)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  g.fillStyle = glow;
  g.beginPath();
  g.arc(h.x, h.y, h.r * 1.35, 0, Math.PI * 2);
  g.fill();

  // 회전하는 아크 테두리 (Event Horizon)
  const rot = (now / 1000) * 1.5;
  g.strokeStyle = '#c084fc';
  g.lineWidth = 3;
  g.beginPath();
  g.arc(h.x, h.y, h.r + 2, rot, rot + Math.PI * 1.5);
  g.stroke();

  // 내부 칠흑 블랙홀 구멍 (입체감 있는 심연 그림자)
  const holeGrad = g.createRadialGradient(h.x - h.r * 0.2, h.y - h.r * 0.2, h.r * 0.1, h.x, h.y, h.r);
  holeGrad.addColorStop(0, '#000000');
  holeGrad.addColorStop(0.85, '#050508');
  holeGrad.addColorStop(1, '#1e1136');
  g.fillStyle = holeGrad;
  g.beginPath();
  g.arc(h.x, h.y, h.r, 0, Math.PI * 2);
  g.fill();
  g.restore();

  // 2. 바닥 물건들 렌더링
  for (const item of stage.items) {
    g.save();
    g.translate(item.x, item.y);
    g.scale(item.scale, item.scale);

    // 그림자
    g.fillStyle = 'rgba(0, 0, 0, 0.35)';
    g.beginPath();
    g.ellipse(0, item.radius * 0.65, item.radius * 0.85, item.radius * 0.4, 0, 0, Math.PI * 2);
    g.fill();

    // 물건 원형 뱃지 베이스
    g.fillStyle = item.color;
    g.beginPath();
    g.arc(0, 0, item.radius, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    g.lineWidth = 2;
    g.stroke();

    // 아이콘 이모지
    const fontSize = Math.max(14, item.radius * 1.2);
    g.font = `${fontSize}px sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(item.icon, 0, 1);

    // 블랙홀보다 큰지 여부 시각적 인디케이터 (빨간 느낌표)
    if (item.radius > h.r * 0.95) {
      g.font = '700 11px sans-serif';
      g.fillStyle = '#ef4444';
      g.fillText('⚠️', 0, -item.radius - 4);
    }

    g.restore();
  }

  // 3. 파티클
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.035;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    g.save();
    g.globalAlpha = p.life;
    g.fillStyle = p.color;
    g.beginPath();
    g.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }

  // 4. 플로팅 토스트
  for (let i = toasts.length - 1; i >= 0; i--) {
    const t = toasts[i];
    t.y -= 1.3;
    t.life -= 0.025;
    if (t.life <= 0) {
      toasts.splice(i, 1);
      continue;
    }
    g.save();
    g.globalAlpha = t.life;
    g.font = "700 16px 'Jua', sans-serif";
    g.fillStyle = t.color;
    g.textAlign = 'center';
    g.shadowColor = 'rgba(0,0,0,0.8)';
    g.shadowBlur = 6;
    g.fillText(t.text, t.x, t.y);
    g.restore();
  }
}

function loop(now) {
  raf = requestAnimationFrame(loop);
  if (attached && cv) {
    updatePhysics();
    draw(now);
  }
}

/* ---------- Pointer Events (Black Hole Target Follow) ---------- */
function getCanvasPos(e) {
  const rect = cv.getBoundingClientRect();
  const scaleX = cv.width / rect.width;
  const scaleY = cv.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}

function onPointerMove(e) {
  if (stage.over || paused) return;
  const pos = getCanvasPos(e);
  stage.hole.targetX = Math.max(stage.hole.r, Math.min(cv.width - stage.hole.r, pos.x));
  stage.hole.targetY = Math.max(stage.hole.r, Math.min(cv.height - stage.hole.r, pos.y));
}

/* ---------- Public Attach/Detach ---------- */
export function attach(els, callbacks) {
  cv = els.canvas;
  g = cv.getContext('2d');
  hud = {
    score: els.score,
    best: els.best,
    time: els.time,
    size: els.size,
    count: els.count,
  };
  onGameOver = callbacks.onGameOver || (() => {});
  attached = true;

  if (stage.items.length === 0 || stage.over || stage.time <= 0) reset();
  else startTimer();
  updateHud();

  cv.addEventListener('pointermove', onPointerMove);
  cv.addEventListener('pointerdown', onPointerMove);

  if (!raf) raf = requestAnimationFrame(loop);
}

export function detach() {
  attached = false;
  clearInterval(timerInterval);
  cancelAnimationFrame(raf);
  raf = 0;
}

export function setPaused(p) {
  paused = p;
}

export const getBest = () => best;
