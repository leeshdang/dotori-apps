import { t } from './i18n.js';
import { isMuted } from './parcel.js';

/*
  Dotori File Sort (DFS)
  세계관: Dotori OS 바탕화면에 쏟아지는 파일들을 정리!
  - 폴더:
    1. 🖼️ 사진 폴더 (dotori-photos)
    2. 🎬 영상 폴더 (dotori-media)
    3. 📄 문서 폴더 (dotori-docs)
    4. 📦 압축기 (DotoriZip 연동 - .zip 압축 해제 or 압축)
    5. 🛡️ 안티바이러스 격리소 (Dotori Vaccine - 바이러스 감지)
    6. 🗑️ 휴지통 (중복 파일 폐기 or 오염 파일 제거)

  특수 파일:
  - 🗜️ 압축파일 (.zip): 드래그하여 DotoriZip에 넣으면 압축이 풀리며 안의 파일들이 쏟아져 나옴!
  - 👥 중복 파일 (DUP): DotoriSearch로 찾은 동일 중복 파일! 휴지통에 버려야 정리 보너스
  - 👾 바이러스/악성 파일 (VIRUS): 붉은 글리치! 안티바이러스 격리소에 넣거나 휴지통에 격리
*/

export const FILE_TYPES = {
  photo: { id: 'photo', name: '사진', icon: '🖼️', exts: ['.png', '.jpg', '.gif', '.raw'], targetFolder: 'photo', color: '#ec4899' },
  video: { id: 'video', name: '영상', icon: '🎬', exts: ['.mp4', '.mkv', '.mov', '.avi'], targetFolder: 'video', color: '#6366f1' },
  doc: { id: 'doc', name: '문서', icon: '📄', exts: ['.pdf', '.docx', '.xlsx', '.txt'], targetFolder: 'doc', color: '#0ea5e9' },
  archive: { id: 'archive', name: '압축', icon: '📦', exts: ['.zip', '.tar', '.7z'], targetFolder: 'zip', color: '#f59e0b', isArchive: true },
  duplicate: { id: 'duplicate', name: '중복', icon: '👥', exts: ['.dup', '_copy.jpg', '(1).mp4'], targetFolder: 'trash', color: '#a855f7', isDup: true },
  virus: { id: 'virus', name: '바이러스', icon: '👾', exts: ['.exe', '.vbs', '.bat'], targetFolder: 'quarantine', color: '#ef4444', isVirus: true },
};

export const FOLDERS = [
  { id: 'photo', name: '사진 보관함', icon: '🖼️', sub: 'Dotori Gallery', accept: ['photo'], color: '#ec4899' },
  { id: 'video', name: '영상 보관함', icon: '🎬', sub: 'Dotori Video', accept: ['video'], color: '#6366f1' },
  { id: 'doc', name: '문서 서고', icon: '📄', sub: 'Dotori Docs', accept: ['doc'], color: '#0ea5e9' },
  { id: 'zip', name: 'DotoriZip', icon: '🗜️', sub: '압축 해제 센터', accept: ['archive'], color: '#f59e0b' },
  { id: 'quarantine', name: 'Dotori Vaccine', icon: '🛡️', sub: '위협 격리소', accept: ['virus'], color: '#10b981' },
  { id: 'trash', name: '휴지통', icon: '🗑️', sub: '중복/불필요 폐기', accept: ['duplicate'], color: '#64748b' },
];

let stage = {
  score: 0,
  combo: 0,
  maxCombo: 0,
  lives: 3,
  time: 60,
  sorted: 0,
  files: [], // 화면에 떠다니거나 대기 중인 파일들
  over: false,
};

let best = Number(localStorage.getItem('dfs_best') || 0);
let cv, g, hud = {}, raf = 0, attached = false, paused = false, timerInterval = 0;
let dragFile = null, dragOffset = { x: 0, y: 0 };
let onGameOver = () => {};
let particles = [];
let toasts = [];

function randItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function spawnFile(x, y, forceType = null) {
  const typeKeys = Object.keys(FILE_TYPES);
  // 점수에 따라 바이러스/압축/중복 등장 확률 조절
  let pool = ['photo', 'photo', 'video', 'video', 'doc', 'doc'];
  if (stage.score >= 100) pool.push('archive', 'archive');
  if (stage.score >= 250) pool.push('duplicate', 'duplicate');
  if (stage.score >= 400) pool.push('virus');
  
  const typeKey = forceType || randItem(pool);
  const ft = FILE_TYPES[typeKey];
  const ext = randItem(ft.exts);
  const baseNames = ['family', 'vacation', 'project', 'backup', 'report', 'doggo', 'travel', 'secret', 'dance'];
  const name = `${randItem(baseNames)}${ext}`;

  const W = cv ? cv.width : 560;
  const H = cv ? cv.height : 620;

  return {
    id: Math.random().toString(36).slice(2),
    type: typeKey,
    ft,
    name,
    x: x !== undefined ? x : 100 + Math.random() * (W - 240),
    y: y !== undefined ? y : 140 + Math.random() * (H - 320),
    vx: (Math.random() - 0.5) * 0.8,
    vy: (Math.random() - 0.5) * 0.8,
    w: 80,
    h: 88,
    rot: (Math.random() - 0.5) * 0.1,
    scale: 1,
  };
}

export function reset() {
  stage = {
    score: 0,
    combo: 0,
    maxCombo: 0,
    lives: 3,
    time: 60,
    sorted: 0,
    files: [],
    over: false,
  };
  dragFile = null;
  particles = [];
  toasts = [];
  for (let i = 0; i < 6; i++) {
    stage.files.push(spawnFile());
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
      endGame(true);
    }
    // 주기적으로 새 파일 유입 (최대 10개 유지)
    if (stage.files.length < 8 && Math.random() < 0.6) {
      stage.files.push(spawnFile());
    }
    updateHud();
  }, 1000);
}

function endGame(timeUp = false) {
  stage.over = true;
  clearInterval(timerInterval);
  if (stage.score > best) {
    best = stage.score;
    localStorage.setItem('dfs_best', String(best));
  }
  updateHud();
  onGameOver({ score: stage.score, best, sorted: stage.sorted, timeUp });
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
function sTone(freq, dur, type = 'sine') {
  const a = audio(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0.12, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
  o.connect(g); g.connect(a.destination);
  o.start(); o.stop(a.currentTime + dur);
}
function sSuccess() { sTone(587, 0.1, 'triangle'); setTimeout(() => sTone(880, 0.15, 'triangle'), 80); }
function sUnzip() { [440, 554, 659, 880].forEach((f, i) => setTimeout(() => sTone(f, 0.08, 'sine'), i * 60)); }
function sFail() { sTone(200, 0.25, 'sawtooth'); }

/* ---------- Drop Check ---------- */
function getFolderRects() {
  const W = cv.width, H = cv.height;
  const fw = (W - 48) / 3;
  const fh = 90;
  // 3개 상단, 3개 하단
  return FOLDERS.map((f, i) => {
    const isBottom = i >= 3;
    const col = i % 3;
    const x = 16 + col * (fw + 8);
    const y = isBottom ? H - fh - 16 : 16;
    return { folder: f, x, y, w: fw, h: fh };
  });
}

function toast(text, x, y, color = '#22c55e') {
  toasts.push({ text, x, y, color, life: 1.0 });
}

function addParticles(x, y, color) {
  for (let i = 0; i < 16; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
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

function checkDrop(file) {
  const folderRects = getFolderRects();
  const cx = file.x + file.w / 2;
  const cy = file.y + file.h / 2;

  let targetRect = null;
  for (const fr of folderRects) {
    if (cx >= fr.x && cx <= fr.x + fr.w && cy >= fr.y && cy <= fr.y + fr.h) {
      targetRect = fr;
      break;
    }
  }

  if (!targetRect) {
    // 아무 폴더에도 드롭 안 됨 -> 그대로 둠
    return false;
  }

  const { folder } = targetRect;
  const isMatch = folder.accept.includes(file.type);

  if (isMatch) {
    // 성공!
    stage.combo++;
    if (stage.combo > stage.maxCombo) stage.maxCombo = stage.combo;
    const pts = 20 + stage.combo * 5;
    stage.score += pts;
    stage.sorted++;
    addParticles(cx, cy, folder.color);

    if (file.type === 'archive') {
      sUnzip();
      toast(`🗜️ DotoriZip 압축 해제! +${pts}`, cx, cy, '#f59e0b');
      // 압축 해제 시 내부에서 새로운 사진/문서/영상 파일 3개가 튀어나옴!
      for (let k = 0; k < 3; k++) {
        const nf = spawnFile(file.x + (k - 1) * 35, file.y + (k - 1) * 20);
        stage.files.push(nf);
      }
    } else if (file.type === 'virus') {
      sSuccess();
      toast(`🛡️ 바이러스 격리 완료! +${pts}`, cx, cy, '#10b981');
    } else if (file.type === 'duplicate') {
      sSuccess();
      toast(`🗑️ 중복 파일 청소! +${pts}`, cx, cy, '#a855f7');
    } else {
      sSuccess();
      toast(`+${pts} ${stage.combo > 1 ? `(${stage.combo} Combo!)` : ''}`, cx, cy, '#22c55e');
    }

    // 파일 제거 및 보충
    stage.files = stage.files.filter((f) => f.id !== file.id);
    if (stage.files.length < 5) stage.files.push(spawnFile());
    updateHud();
    return true;
  } else {
    // 잘못 넣음! (감점 및 하트 감소)
    stage.combo = 0;
    stage.score = Math.max(0, stage.score - 25);
    stage.lives--;
    sFail();
    toast(`잘못된 분류! -25 💔`, cx, cy, '#ef4444');
    addParticles(cx, cy, '#ef4444');

    if (stage.lives <= 0) {
      endGame(false);
    }
    updateHud();
    return false;
  }
}

function updateHud() {
  if (hud.score) hud.score.textContent = stage.score;
  if (hud.best) hud.best.textContent = Math.max(best, stage.score);
  if (hud.lives) hud.lives.textContent = '❤️'.repeat(Math.max(0, stage.lives)) + '🖤'.repeat(Math.max(0, 3 - stage.lives));
  if (hud.time) hud.time.textContent = `${stage.time}s`;
  if (hud.combo) hud.combo.textContent = stage.combo > 0 ? `${stage.combo}x` : '-';
}

/* ---------- Rendering ---------- */
function draw(now) {
  const W = cv.width, H = cv.height;

  // 배경 (Dotori OS 데스크톱 감성 다크 테마)
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0c0d16');
  bg.addColorStop(1, '#08080f');
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);

  // 중앙 은은한 도토리 로고 워터마크
  g.save();
  g.globalAlpha = 0.04;
  g.font = '700 160px sans-serif';
  g.textAlign = 'center';
  g.fillStyle = '#fff';
  g.fillText('🌰', W / 2, H / 2 + 50);
  g.restore();

  // 폴더들 그리기
  const folderRects = getFolderRects();
  for (const fr of folderRects) {
    const { folder, x, y, w, h } = fr;
    g.save();
    g.fillStyle = 'rgba(255, 255, 255, 0.04)';
    g.strokeStyle = folder.color;
    g.lineWidth = 2;
    g.beginPath();
    g.roundRect(x, y, w, h, 14);
    g.fill();
    g.stroke();

    // 상단 탭 장식
    g.fillStyle = folder.color;
    g.beginPath();
    g.roundRect(x + 12, y + 4, 34, 4, 2);
    g.fill();

    // 폴더 아이콘 & 텍스트
    g.font = '28px sans-serif';
    g.textAlign = 'left';
    g.textBaseline = 'middle';
    g.fillText(folder.icon, x + 12, y + h / 2 - 4);

    g.font = "700 13px 'Noto Sans KR', sans-serif";
    g.fillStyle = '#f1f5f9';
    g.fillText(folder.name, x + 48, y + h / 2 - 10);

    g.font = "10px 'JetBrains Mono', monospace";
    g.fillStyle = '#94a3b8';
    g.fillText(folder.sub, x + 48, y + h / 2 + 8);
    g.restore();
  }

  // 떠다니는 파일들 업데이트 및 렌더링
  for (const file of stage.files) {
    if (file !== dragFile) {
      file.x += file.vx;
      file.y += file.vy;
      // 바운스 바운더리
      if (file.x < 10) { file.x = 10; file.vx *= -1; }
      if (file.x + file.w > W - 10) { file.x = W - 10 - file.w; file.vx *= -1; }
      if (file.y < 120) { file.y = 120; file.vy *= -1; }
      if (file.y + file.h > H - 120) { file.y = H - 120 - file.h; file.vy *= -1; }
    }

    g.save();
    g.translate(file.x + file.w / 2, file.y + file.h / 2);
    g.rotate(file.rot);
    if (file === dragFile) g.scale(1.12, 1.12);

    // 카드 백그라운드
    g.shadowColor = file === dragFile ? file.ft.color : 'rgba(0,0,0,0.4)';
    g.shadowBlur = file === dragFile ? 20 : 8;
    g.fillStyle = file.ft.isVirus ? 'rgba(239, 68, 68, 0.25)' : 'rgba(30, 32, 48, 0.85)';
    g.strokeStyle = file.ft.color;
    g.lineWidth = file === dragFile ? 2.5 : 1.5;
    g.beginPath();
    g.roundRect(-file.w / 2, -file.h / 2, file.w, file.h, 12);
    g.fill();
    g.stroke();

    // 글리치 효과 (바이러스인 경우)
    if (file.ft.isVirus) {
      g.fillStyle = 'rgba(239, 68, 68, 0.15)';
      g.fillRect(-file.w / 2, -file.h / 2 + Math.random() * file.h, file.w, 4);
    }

    // 파일 아이콘
    g.font = '32px sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(file.ft.icon, 0, -12);

    // 파일 이름
    g.font = "600 10px 'JetBrains Mono', sans-serif";
    g.fillStyle = '#e2e8f0';
    g.fillText(file.name, 0, 24);

    // 태그 뱃지
    if (file.ft.isDup) {
      g.fillStyle = '#a855f7';
      g.font = "700 8px sans-serif";
      g.fillText('DUP!', 0, -32);
    }

    g.restore();
  }

  // 파티클
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.03;
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

  // 플로팅 토스트
  for (let i = toasts.length - 1; i >= 0; i--) {
    const t = toasts[i];
    t.y -= 1.2;
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
  if (attached && cv) draw(now);
}

/* ---------- Pointer Events (Drag & Drop) ---------- */
function getCanvasPos(e) {
  const rect = cv.getBoundingClientRect();
  const scaleX = cv.width / rect.width;
  const scaleY = cv.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}

function onPointerDown(e) {
  if (stage.over || paused) return;
  const pos = getCanvasPos(e);
  // 맨 위 레이어부터 역순 탐색
  for (let i = stage.files.length - 1; i >= 0; i--) {
    const f = stage.files[i];
    if (pos.x >= f.x && pos.x <= f.x + f.w && pos.y >= f.y && pos.y <= f.y + f.h) {
      dragFile = f;
      dragOffset = { x: pos.x - f.x, y: pos.y - f.y };
      // 맨 앞으로 가져오기
      stage.files.splice(i, 1);
      stage.files.push(f);
      cv.setPointerCapture(e.pointerId);
      break;
    }
  }
}

function onPointerMove(e) {
  if (!dragFile) return;
  const pos = getCanvasPos(e);
  dragFile.x = pos.x - dragOffset.x;
  dragFile.y = pos.y - dragOffset.y;
}

function onPointerUp(e) {
  if (!dragFile) return;
  checkDrop(dragFile);
  dragFile = null;
}

/* ---------- Public Attach/Detach ---------- */
export function attach(els, callbacks) {
  cv = els.canvas;
  g = cv.getContext('2d');
  hud = {
    score: els.score,
    best: els.best,
    lives: els.lives,
    time: els.time,
    combo: els.combo,
  };
  onGameOver = callbacks.onGameOver || (() => {});
  attached = true;

  if (stage.files.length === 0) reset();
  updateHud();

  cv.addEventListener('pointerdown', onPointerDown);
  cv.addEventListener('pointermove', onPointerMove);
  cv.addEventListener('pointerup', onPointerUp);
  cv.addEventListener('pointercancel', onPointerUp);

  if (!raf) raf = requestAnimationFrame(loop);
}

export function detach() {
  attached = false;
  clearInterval(timerInterval);
  cancelAnimationFrame(raf);
  raf = 0;
  dragFile = null;
}

export function setPaused(p) {
  paused = p;
}

export const getBest = () => best;
