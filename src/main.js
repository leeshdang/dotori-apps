import './style.css';
import { t, setLang, getLang, LANGS } from './i18n.js';
import { acornSVG, squirrelSVG, MAX_TIER } from './art.js';
import * as PK from './parcel.js';
import * as WF from './wifi.js';
import * as DFS from './filesort.js';
import * as DBH from './blackhole.js';
import * as DWE from './weaponevo.js';

const GAMES = [
  { id: 'acorn', icon: '🌰', name: 'gameAcorn', title: 'Dotori Acorn Storage', tag: 'DAS' },
  { id: 'parcel', icon: '📦', name: 'gameParcel', title: 'Dotori Parcel King', tag: 'DPK' },
  { id: 'wifi', icon: '📶', name: 'gameWifi', title: 'Dotori WiFi Connect', tag: 'DWC' },
  { id: 'filesort', icon: '📁', name: 'gameFileSort', title: 'Dotori File Sort', tag: 'DFS' },
  { id: 'blackhole', icon: '🌌', name: 'gameBlackHole', title: 'Dotori Black Hole', tag: 'DBH' },
  { id: 'weaponevo', icon: '⚔️', name: 'gameWeaponEvo', title: 'Dotori Weapon 2048', tag: 'DWE' },
];
const curGame = () => GAMES.find((g) => g.id === S.game) || GAMES[0];
const verOf = () => APP_VERSION.replace(/^DAS/, curGame().tag);

const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'DAS-DEV_BUILD';
const COLS = 5, ROWS = 6, N = COLS * ROWS;
const FAMILY = ['Dotori VR Image Viewer', 'Dotori Image Viewer', 'Dotori 4k Downloader', 'Dotori QR Maker', 'Dotori Go-Learning', 'Dotori Screen Recorder', 'Dotori mp3 Player', 'Dotori Video Editor', 'Dotori Meme Maker', 'Dotori Flow'];

const S = {
  board: Array(N).fill(0),
  next: 1,
  score: 0,
  best: Number(localStorage.getItem('das_best') || 0),
  moves: 0,
  over: false,
  newBest: false,
  tab: 'play',
  menu: false,
  gmenu: false,
  game: GAMES.some((g) => g.id === localStorage.getItem('dotori_game')) ? localStorage.getItem('dotori_game') : 'acorn',
  modal: localStorage.getItem('dotori_terms_agreed') === 'true' ? null : 'terms-first',
  phone: false,
  say: null,
  happy: false,
  fx: {}, // idx -> 'drop' | 'merge'
};

const rand = (a) => a[Math.floor(Math.random() * a.length)];
const rollTier = () => { const r = Math.random(); return r < .6 ? 1 : r < .9 ? 2 : 3; };

function neighbors(i) {
  const x = i % COLS, y = Math.floor(i / COLS), out = [];
  if (x > 0) out.push(i - 1);
  if (x < COLS - 1) out.push(i + 1);
  if (y > 0) out.push(i - COLS);
  if (y < ROWS - 1) out.push(i + COLS);
  return out;
}
function group(i) {
  const tier = S.board[i], seen = new Set([i]), stack = [i];
  while (stack.length) for (const n of neighbors(stack.pop())) if (!seen.has(n) && S.board[n] === tier) { seen.add(n); stack.push(n); }
  return [...seen];
}

function newGame() {
  S.board = Array(N).fill(0); S.score = 0; S.moves = 0; S.over = false; S.newBest = false;
  S.next = rollTier(); S.fx = {}; S.say = null; render();
}

function place(i) {
  if (S.over || S.board[i]) return;
  S.board[i] = S.next; S.fx = { [i]: 'drop' }; S.moves++;
  let chain = 0, cur = i, merged = false, reachedMax = false;
  for (;;) {
    const g = group(cur);
    if (g.length < 3) break;
    const tier = S.board[cur];
    chain++; merged = true;
    S.score += g.length * tier * 10 * chain;
    g.forEach((k) => (S.board[k] = 0));
    if (tier >= MAX_TIER) { S.score += 500; reachedMax = true; break; }
    S.board[cur] = tier + 1; S.fx[cur] = 'merge';
  }
  S.next = rollTier();
  S.say = reachedMax ? t('sayMax') : merged ? rand(t('sayMerge')) : rand(t('say'));
  S.happy = merged;
  if (S.score > S.best) { S.best = S.score; S.newBest = true; localStorage.setItem('das_best', String(S.best)); }
  if (S.board.every(Boolean)) { S.over = true; S.say = rand(t('sayOver')); S.modal = 'over'; }
  render();
  S.happy = false;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

function headerHTML() {
  const full = S.board.filter(Boolean).length >= N - 3;
  return `<header class="header">
    <div class="menu-wrap">
      <button class="icon-btn" data-act="menu" id="btn-menu" aria-label="${t('menu')}">≡</button>
      ${S.menu ? menuHTML() : ''}
    </div>
    <div class="brand-badge"><img src="./icon.png" alt="Dotori"></div>
    <h1 class="title">${curGame().title}</h1>
    <span class="tag">${curGame().tag}</span><span class="ver" id="ver-badge">v${verOf()}</span>
    <div class="gamesel">
      <button class="gs-btn" data-act="gsel" id="btn-games" aria-label="${t('gameMenu')}"><span class="gs-ico">${curGame().icon}</span><span class="gs-name">${t(curGame().name)}</span><span class="gs-caret">▾</span></button>
      ${S.gmenu ? `<div class="menu gs-menu" id="games-panel"><div class="gs-head">${t('gameMenu')}</div>${GAMES.map((g) => `<button class="mi ${g.id === S.game ? 'cur' : ''}" data-act="game" data-g="${g.id}" id="game-${g.id}"><span class="ico">${g.icon}</span><span>${t(g.name)}<small>${g.title}</small></span>${g.id === S.game ? '<span class="badge-now">▶</span>' : ''}</button>`).join('')}</div>` : ''}
    </div>
    <div class="spacer"></div>
    <button class="icon-btn" data-act="phone" id="btn-phone" title="${t('phoneFrame')}" aria-label="${t('phoneFrame')}">${S.phone ? '🖥️' : '📱'}</button>
    <div class="pill"><i class="dot ${full ? 'red' : ''}"></i><span class="txt-hide">${full ? t('statusFull') : t('statusReady')}</span></div>
    <button class="cta" data-act="restart" id="btn-restart">${t('restart')}</button>
  </header>`;
}

function menuHTML() {
  return `<nav class="menu" id="menu-panel">
    <div style="padding:6px 10px 4px;font-size:11px;font-weight:700;color:#f472b6;letter-spacing:.04em">🎮 ${t('gameMenu')} (5종)</div>
    ${GAMES.map((g) => `
      <button class="mi ${g.id === S.game ? 'cur' : ''}" data-act="game" data-g="${g.id}">
        <span class="ico">${g.icon}</span>
        <span style="flex:1"><b>${t(g.name)}</b><small>${g.title}</small></span>
        ${g.id === S.game ? '<span class="badge-now">플레이 중</span>' : '<span style="font-size:12px;color:#a5b4fc">시작 ▶</span>'}
      </button>
    `).join('')}
    <hr>
    <a class="mi" href="https://dotoritools.com" target="_blank" rel="noopener noreferrer"><i class="pulse-dot"></i><span>${t('menuPortal')}<small>https://dotoritools.com</small></span><span class="ext">↗</span></a>
    <a class="mi" href="https://celebmypet.com" target="_blank" rel="noopener noreferrer"><span class="ico">🐾</span><span>${t('menuCeleb')}<small>https://celebmypet.com</small></span><span class="ext">↗</span></a>
    <button class="mi" data-act="terms"><span class="ico">📜</span><span>${t('menuTerms')}</span></button>
    <a class="mi" href="https://dotori-flow.vercel.app/" target="_blank" rel="noopener noreferrer"><span class="ico">🐞</span><span>${t('menuBug')}<small>Dotori Flow</small></span><span class="ext">↗</span></a>
    <button class="mi" data-act="about"><span class="ico">ℹ️</span><span>${t('menuAbout')}</span></button>
    <hr>
    <button class="mi" data-act="exit"><span class="ico">⏻</span><span>${t('menuExit')}</span></button>
    <hr>
    <div style="padding:6px 10px;font-size:11px;color:#9ca3af">${t('menuFamily')}</div>
    ${FAMILY.map((f) => `<div class="mi" style="min-height:30px;padding:3px 10px;font-size:12px;color:#cbd0e0">${f}</div>`).join('')}
    <div class="mi" style="min-height:30px;padding:3px 10px;font-size:12px;color:#fff">Dotori Acorn Storage<span class="badge-now">${t('currentApp')}</span></div>
  </nav>`;
}

function boardHTML() {
  return S.board.map((tier, i) => {
    const fx = S.fx[i] || (tier ? 'idle' : '');
    return tier
      ? `<div class="cell ${fx}" data-i="${i}">${acornSVG(tier, 'c' + i)}</div>`
      : `<button class="cell empty" data-act="place" data-i="${i}" aria-label="slot ${i + 1}"><span class="ghost">${acornSVG(S.next, 'gh' + i)}</span></button>`;
  }).join('');
}

function parcelStageHTML() {
  return `<div class="stage"><div class="phone-frame"><div class="game-card pk" id="pk-root">
    <div class="nextbar"><canvas id="pk-next" width="140" height="72"></canvas><div><small>${t('pkNext')}</small><b>${t('gameParcel')}</b></div>
      <button class="icon-btn nb-sound" data-act="pk-sound" id="btn-sound" title="${t('sound')}" aria-label="${t('sound')}">${PK.isMuted() ? '🔇' : '🔊'}</button></div>
    <div class="hud">
      <div class="stat"><span>${t('score')}</span><b id="pk-score">0</b></div>
      <div class="stat"><span>${t('best')}</span><b id="pk-best">0</b></div>
      <div class="stat"><span>${t('lines')}</span><b id="pk-lines">0</b></div>
      <div class="stat"><span>${t('level')}</span><b id="pk-level">1</b></div>
    </div>
    <div class="pk-wrap"><canvas id="pk-canvas" width="${PK.COLS * PK.C}" height="${PK.ROWS * PK.C}"></canvas>
      <div id="pk-toast"></div>
      <button id="pk-pause" class="pk-pause" data-act="pk-resume" hidden><b>⏸ ${t('paused')}</b><span>${t('resume')}</span></button></div>
    <div class="pk-ctrl">
      <button class="pk-btn" data-pk="left" aria-label="left">◀</button><button class="pk-btn" data-pk="rotate" aria-label="rotate">⟳</button>
      <button class="pk-btn" data-pk="down" aria-label="down">▼</button><button class="pk-btn" data-pk="drop" aria-label="drop">⤓</button>
      <button class="pk-btn" data-pk="right" aria-label="right">▶</button>
    </div>
    <p class="hint" style="white-space:pre-line">${t('pkHow')}</p>
  </div></div></div>`;
}

function parcelBody() {
  if (S.tab === 'guide') {
    return `<div class="card"><h3>${t('pkGuideTitle')}</h3><div style="display:flex;flex-direction:column;gap:8px">${t('pkGuide').map((s, i) => `<div class="guide-row"><b style="font-family:Jua;font-size:18px;color:#f9a8d4">${i + 1}</b><span style="font-size:13px">${s}</span></div>`).join('')}</div></div>`;
  }
  return `<div class="card"><h3>${t('skinTitle')}</h3><p style="font-size:12px;color:#9ca3af;margin-bottom:10px">${t('skinHint')}</p>
    <div class="skins">${PK.SKIN_KEYS.map((k, i) => `<button class="skin-card ${PK.getSkin() === k ? 'on' : ''}" data-act="pk-skin" data-k="${k}" id="skin-${k}"><img src="${PK.skinPreview(k)}" alt=""><b>${t('skins')[i]}</b></button>`).join('')}</div></div>
    <div class="card"><div class="truck">
      <svg viewBox="0 0 160 70" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="4" y="6" width="100" height="42" rx="6" fill="#2a2d3a" stroke="#8892b0" stroke-width="2"/><path d="M108 18h28l16 16v14h-44z" fill="#ec4899" stroke="#9d174d" stroke-width="2"/><path d="M114 23h18l9 10h-27z" fill="#bfe9ff"/><rect x="12" y="28" width="22" height="20" rx="3" fill="#D9A566"/><rect x="36" y="18" width="20" height="30" rx="3" fill="#4F8DF7"/><rect x="58" y="34" width="24" height="14" rx="3" fill="#FF9EC4"/><circle cx="32" cy="54" r="9" fill="#111" stroke="#9ca3af" stroke-width="3"/><circle cx="122" cy="54" r="9" fill="#111" stroke="#9ca3af" stroke-width="3"/><circle cx="142" cy="54" r="9" fill="#111" stroke="#9ca3af" stroke-width="3"/></svg>
      <div><b style="font-family:Jua;font-size:17px">${t('gameParcel')}</b><p style="font-size:12px;color:#9ca3af;margin-top:4px;white-space:pre-line">${esc(t('pkHow'))}</p></div></div></div>
    <div class="card"><h3>${t('sound')}</h3><button class="lang-btn ${PK.isMuted() ? '' : 'on'}" data-act="pk-sound"><span>${PK.isMuted() ? '🔇' : '🔊'} ${t('sound')}</span><span>${PK.isMuted() ? t('soundOff') : t('soundOn')}</span></button></div>`;
}

function wifiStageHTML() {
  const info = WF.getInfo();
  const curTool = WF.getTool();
  return `<div class="stage"><div class="phone-frame"><div class="game-card wf" id="wf-root">
    <div class="nextbar">
      <div><small>${t('wfLevelSelect')}</small><b style="font-size:18px">Level ${info.level}</b></div>
      <div class="wf-stars-hud">${'★'.repeat(WF.getStars(info.level))}${'☆'.repeat(3 - WF.getStars(info.level))}</div>
      <div class="spacer"></div>
      <button class="icon-btn" data-act="restart" title="${t('restart')}" aria-label="${t('restart')}">🔄</button>
      <button class="icon-btn nb-sound" data-act="pk-sound" title="${t('sound')}" aria-label="${t('sound')}">${PK.isMuted() ? '🔇' : '🔊'}</button>
    </div>
    <div class="hud">
      <div class="stat"><span>${t('wfCost')}</span><b id="wf-cost">0</b></div>
      <div class="stat"><span>${t('wfPar')}</span><b id="wf-par">${info.par}</b></div>
      <div class="stat"><span>${t('wfRange')}</span><b id="wf-range">${info.R}</b></div>
      <div class="stat"><span>${t('wfConnected')}</span><b id="wf-conn">0/0</b></div>
    </div>
    <div class="wf-wrap">
      <canvas id="wf-canvas" width="480" height="480"></canvas>
    </div>
    <div class="wf-tools">
      <button class="wf-tool-btn ${curTool === 'cable' ? 'on' : ''}" data-act="wf-tool" data-tool="cable">
        <span>🔌</span><small>${t('wfCable')}</small>
      </button>
      <button class="wf-tool-btn ${curTool === 'repeater' ? 'on' : ''}" data-act="wf-tool" data-tool="repeater">
        <span>📡</span><small>${t('wfRepeater')}</small>
      </button>
      <button class="wf-tool-btn ${curTool === 'erase' ? 'on' : ''}" data-act="wf-tool" data-tool="erase">
        <span>🧹</span><small>${t('wfErase')}</small>
      </button>
    </div>
    <p class="hint" style="white-space:pre-line">${t('wfHow')}</p>
  </div></div></div>`;
}

function wifiBody() {
  if (S.tab === 'guide') {
    return `<div class="card"><h3>${t('wfGuideTitle')}</h3><div style="display:flex;flex-direction:column;gap:8px">${t('wfGuide').map((s, i) => `<div class="guide-row"><b style="font-family:Jua;font-size:18px;color:#38bdf8">${i + 1}</b><span style="font-size:13px">${s}</span></div>`).join('')}</div></div>`;
  }
  const unl = WF.unlocked();
  return `<div class="card"><h3>${t('wfLevelSelect')}</h3>
    <div class="wf-level-grid">
      ${Array.from({ length: WF.MAX_LEVEL }, (_, i) => i + 1).map((lv) => {
        const isLock = lv > unl;
        const isCur = lv === WF.getLevel();
        const stars = WF.getStars(lv);
        return `<button class="wf-lvl-btn ${isCur ? 'cur' : ''} ${isLock ? 'lock' : ''}" data-act="wf-level" data-lv="${lv}" ${isLock ? 'disabled' : ''}>
          <span>${lv}</span>
          <small>${isLock ? '🔒' : stars > 0 ? '★'.repeat(stars) : '•'}</small>
        </button>`;
      }).join('')}
    </div>
  </div>
  <div class="card">
    <div style="font-size:13px;color:#cbd0e0;line-height:1.6">${t('wfAboutDesc')}</div>
  </div>`;
}

function filesortStageHTML() {
  return `<div class="stage"><div class="phone-frame"><div class="game-card dfs" id="dfs-root">
    <div class="nextbar">
      <div><small>Dotori OS</small><b style="font-size:18px">${t('gameFileSort')}</b></div>
      <div class="spacer"></div>
      <button class="icon-btn nb-sound" data-act="pk-sound" title="${t('sound')}" aria-label="${t('sound')}">${PK.isMuted() ? '🔇' : '🔊'}</button>
    </div>
    <div class="hud">
      <div class="stat"><span>${t('dfsScore')}</span><b id="dfs-score">0</b></div>
      <div class="stat"><span>${t('dfsBest')}</span><b id="dfs-best">0</b></div>
      <div class="stat"><span>${t('dfsTime')}</span><b id="dfs-time">60s</b></div>
      <div class="stat"><span>${t('dfsLives')}</span><b id="dfs-lives" style="letter-spacing:2px">❤️❤️❤️</b></div>
      <div class="stat"><span>${t('dfsCombo')}</span><b id="dfs-combo">-</b></div>
    </div>
    <div class="dfs-wrap">
      <canvas id="dfs-canvas" width="560" height="620"></canvas>
    </div>
    <p class="hint" style="white-space:pre-line">${t('dfsHow')}</p>
  </div></div></div>`;
}

function filesortBody() {
  if (S.tab === 'guide') {
    return `<div class="card"><h3>${t('dfsGuideTitle')}</h3><div style="display:flex;flex-direction:column;gap:8px">${t('dfsGuide').map((s) => `<div class="guide-row"><span style="font-size:13px;line-height:1.4">${s}</span></div>`).join('')}</div></div>`;
  }
  return `<div class="card"><h3>DotoriTools Universe</h3>
    <p style="font-size:13px;color:#cbd0e0;line-height:1.6;margin-bottom:12px">${t('dfsAboutDesc')}</p>
    <div style="display:flex;flex-direction:column;gap:8px">
      <div class="dfs-app-badge" style="border-left:4px solid #f59e0b">
        <b>🗜️ DotoriZip</b>
        <small>압축파일을 즉시 해제하여 내부 리소스 복구</small>
      </div>
      <div class="dfs-app-badge" style="border-left:4px solid #a855f7">
        <b>🔍 DotoriSearch</b>
        <small>중복 파일(DUP)을 탐색하여 안전하게 폐기</small>
      </div>
      <div class="dfs-app-badge" style="border-left:4px solid #10b981">
        <b>🛡️ Dotori Vaccine</b>
        <small>바이러스 및 악성 실행파일을 탐지하여 격리</small>
      </div>
    </div>
  </div>`;
}


function weaponevoStageHTML() {
  return `<div class="stage"><div class="phone-frame"><div class="game-card dwe" id="dwe-root">
    <div class="nextbar">
      <div><small>Weapon 2048 Evolution</small><b style="font-size:18px">${t('gameWeaponEvo')}</b></div>
      <div class="spacer"></div>
      <button class="icon-btn" data-act="restart" title="${t('restart')}" aria-label="${t('restart')}">🔄</button>
      <button class="icon-btn nb-sound" data-act="pk-sound" title="${t('sound')}" aria-label="${t('sound')}">${PK.isMuted() ? '🔇' : '🔊'}</button>
    </div>
    <div class="hud">
      <div class="stat"><span>${t('dweScore')}</span><b id="dwe-score">0</b></div>
      <div class="stat"><span>${t('dweBest')}</span><b id="dwe-best">0</b></div>
      <div class="stat"><span>${t('dweCodex')}</span><b id="dwe-codex" style="color:#facc15">0 / 12</b></div>
      <div class="stat" style="flex:1.4"><span>${t('dweMax')}</span><b id="dwe-max" style="font-size:13px;white-space:nowrap">🗡️ 단검</b></div>
    </div>
    <div class="dwe-wrap">
      <div id="dwe-toast"></div>
      <div class="dwe-board" id="dwe-board"></div>
    </div>
    <div class="dwe-ctrl-bar">
      <button class="dwe-undo-btn" data-act="dwe-undo" id="btn-dwe-undo"><span>↩️</span><span>${t('dweUndo')}</span></button>
      <div class="dwe-dpad">
        <button class="dwe-pad-btn dwe-pad-up" data-act="dwe-dir" data-dir="up" aria-label="Up">▲</button>
        <button class="dwe-pad-btn dwe-pad-left" data-act="dwe-dir" data-dir="left" aria-label="Left">◀</button>
        <button class="dwe-pad-btn dwe-pad-down" data-act="dwe-dir" data-dir="down" aria-label="Down">▼</button>
        <button class="dwe-pad-btn dwe-pad-right" data-act="dwe-dir" data-dir="right" aria-label="Right">▶</button>
      </div>
    </div>
    <p class="hint" style="white-space:pre-line">${t('dweHow')}</p>
  </div></div></div>`;
}

function weaponevoBody() {
  const unlocked = DWE.getUnlockedSet();
  if (S.tab === 'guide') {
    return `<div class="card"><h3>${t('dweGuideTitle')}</h3><div style="display:flex;flex-direction:column;gap:8px">${t('dweGuide').map((s) => `<div class="guide-row"><span style="font-size:13px;line-height:1.4">${s}</span></div>`).join('')}</div></div>`;
  }
  return `<div class="card"><h3>⚔️ ${t('dweCodex')} (${unlocked.size} / ${DWE.WEAPONS.length})</h3>
    <p style="font-size:12px;color:#9ca3af;margin-bottom:10px">${t('dweAboutDesc')}</p>
    <div class="dwe-codex-list">
      ${DWE.WEAPONS.map((w) => {
        const has = unlocked.has(w.val);
        return `<div class="dwe-codex-item ${has ? '' : 'locked'}">
          <span class="dwe-codex-icon">${has ? w.icon : '🔒'}</span>
          <div class="dwe-codex-info">
            <b>${has ? w.name : '??? (미발견)'} <small style="display:inline;color:${has ? w.color : '#64748b'}">(Lv.${w.level} · ${w.val})</small></b>
            <small>${has ? w.desc : '같은 무기 2개를 합쳐 해금하세요'}</small>
          </div>
          <span class="dwe-codex-stat">${has ? 'ATK +' + w.atk : '---'}</span>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

function blackholeStageHTML() {
  return `<div class="stage"><div class="phone-frame"><div class="game-card dbh" id="dbh-root">
    <div class="nextbar">
      <div><small>Hole.io Style (30s)</small><b style="font-size:18px">${t('gameBlackHole')}</b></div>
      <div class="spacer"></div>
      <button class="icon-btn" data-act="restart" title="${t('restart')}" aria-label="${t('restart')}">🔄</button>
      <button class="icon-btn nb-sound" data-act="pk-sound" title="${t('sound')}" aria-label="${t('sound')}">${PK.isMuted() ? '🔇' : '🔊'}</button>
    </div>
    <div class="hud">
      <div class="stat"><span>${t('dbhScore')}</span><b id="dbh-score">0</b></div>
      <div class="stat"><span>${t('dbhBest')}</span><b id="dbh-best">0</b></div>
      <div class="stat"><span>${t('dbhTime')}</span><b id="dbh-time">30s</b></div>
      <div class="stat"><span>${t('dbhSize')}</span><b id="dbh-size" style="color:#c084fc">22m</b></div>
      <div class="stat"><span>${t('dbhCount')}</span><b id="dbh-count">0</b></div>
    </div>
    <div class="dbh-wrap">
      <canvas id="dbh-canvas" width="620" height="620"></canvas>
    </div>
    <p class="hint" style="white-space:pre-line">${t('dbhHow')}</p>
  </div></div></div>`;
}

function blackholeBody() {
  if (S.tab === 'guide') {
    return `<div class="card"><h3>${t('dbhGuideTitle')}</h3><div style="display:flex;flex-direction:column;gap:8px">${t('dbhGuide').map((s) => `<div class="guide-row"><span style="font-size:13px;line-height:1.4">${s}</span></div>`).join('')}</div></div>`;
  }
  return `<div class="card"><h3>블랙홀 성장 단계</h3>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${DBH.TIERS.map((tier, idx) => `
        <div class="dbh-tier-badge">
          <b>Tier ${idx + 1}. ${tier.name}</b>
          <small>${tier.desc}</small>
        </div>
      `).join('')}
    </div>
  </div>
  <div class="card">
    <p style="font-size:13px;color:#cbd0e0;line-height:1.6">${t('dbhAboutDesc')}</p>
  </div>`;
}

function stageHTML() {
  if (S.game === 'weaponevo') return weaponevoStageHTML();
  if (S.game === 'blackhole') return blackholeStageHTML();
  if (S.game === 'filesort') return filesortStageHTML();
  if (S.game === 'wifi') return wifiStageHTML();
  return S.game === 'parcel' ? parcelStageHTML() : acornStageHTML();
}

function acornStageHTML() {
  return `<div class="stage"><div class="phone-frame"><div class="game-card">
    <div class="nextbar"><div class="nb-slot">${acornSVG(S.next, 'nb')}</div><div><small>${t('next')}</small><b>${t('tiers')[S.next - 1]}</b></div><span class="nb-lv">Lv.${S.next}</span></div>
    <div class="hud">
      <div class="stat"><span>${t('score')}</span><b id="score">${S.score}</b></div>
      <div class="stat"><span>${t('best')}</span><b>${S.best}</b></div>
      <div class="stat"><span>${t('moves')}</span><b>${S.moves}</b></div>
    </div>
    <div class="crate"><div class="board" id="board">${boardHTML()}</div></div>
    <p class="hint">${t('howTo')}</p>
  </div></div></div>`;
}

function sidebarHTML() {
  let body = '';
  if (S.tab === 'games') {
    body = `<div class="card"><h3>🎮 ${t('gameMenu')}</h3>
      <p style="font-size:13px;color:#9ca3af;margin-bottom:12px">플레이할 게임을 선택하세요 (5종 전체 탑재)</p>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${GAMES.map((g) => `
          <button class="game-select-card ${g.id === S.game ? 'on' : ''}" data-act="game" data-g="${g.id}">
            <span style="font-size:28px">${g.icon}</span>
            <div style="flex:1;text-align:left">
              <b style="font-size:15px;color:#fff">${t(g.name)}</b>
              <div style="font-size:12px;color:#9ca3af">${g.title}</div>
            </div>
            ${g.id === S.game ? '<span class="badge-now">플레이 중</span>' : '<span class="play-btn-tag">시작 ▶</span>'}
          </button>
        `).join('')}
      </div>
    </div>`;
  } else if (S.tab === 'settings') {
    body = `<div class="card"><h3>${t('langTitle')}</h3><div style="display:flex;flex-direction:column;gap:8px">
      ${LANGS.map((l) => `<button class="lang-btn ${l.code === getLang() ? 'on' : ''}" data-act="lang" data-l="${l.code}"><span>${l.label}</span><span>${l.code === getLang() ? '✓' : ''}</span></button>`).join('')}</div></div>`;
  } else if (S.tab === 'guide') {
    if (S.game === 'weaponevo') body = weaponevoBody();
    else if (S.game === 'blackhole') body = blackholeBody();
    else if (S.game === 'filesort') body = filesortBody();
    else if (S.game === 'wifi') body = wifiBody();
    else if (S.game === 'parcel') body = parcelBody();
    else {
      body = `<div class="card"><h3>${t('guideTitle')}</h3><p style="font-size:13px;color:#9ca3af;margin-bottom:10px">${t('guideDesc')}</p>
        <div style="display:flex;flex-direction:column;gap:8px">${t('tiers').map((n, i) => `<div class="guide-row">${acornSVG(i + 1, 'gd')}<b>${n}</b><span class="lv">Lv.${i + 1}${i < 6 ? ' → ' + (i + 2) : ' ★'}</span></div>`).join('')}</div></div>`;
    }
  } else {
    // S.tab === 'play'
    if (S.game === 'weaponevo') {
      body = weaponevoBody();
    } else if (S.game === 'blackhole') {
      body = blackholeBody();
    } else if (S.game === 'filesort') {
      body = filesortBody();
    } else if (S.game === 'wifi') {
      body = wifiBody();
    } else if (S.game === 'parcel') {
      body = parcelBody();
    } else {
      body = `<div class="card"><div class="mascot"><div class="squirrel ${S.happy ? 'happy' : ''}">${squirrelSVG()}</div>
        <div class="bubble" id="bubble">${esc(S.say || rand(t('say')))}</div></div></div>
        <div class="card"><h3>${t('next')}</h3><div class="next"><div class="slot">${acornSVG(S.next, 'nx')}</div><div><b style="font-family:Jua">${t('tiers')[S.next - 1]}</b><div style="font-size:12px;color:#9ca3af">Lv.${S.next}</div></div></div></div>
        <div class="card"><h3>${t('storage')}</h3><div style="font-size:13px;color:#cbd0e0">${S.board.filter(Boolean).length} / ${N}</div>
        <div style="height:10px;margin-top:8px;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden"><div style="height:100%;width:${(S.board.filter(Boolean).length / N) * 100}%;background:linear-gradient(90deg,#ec4899,#6366f1,#0ea5e9);transition:width .3s"></div></div></div>`;
    }
  }
  const tabs = [
    ['play', '🕹️', 'tabPlay'],
    ['games', '🎮', 'gameMenu'],
    ['guide', '📖', 'tabGuide'],
    ['settings', '⚙️', 'tabSettings'],
  ];
  return `<aside class="sidebar"><div class="panel">${body}</div>
    <div class="nav">${tabs.map(([k, ic, lb]) => `<button class="${S.tab === k ? 'on' : ''}" data-act="tab" data-k="${k}" id="tab-${k}"><span>${ic}</span>${t(lb)}</button>`).join('')}</div></aside>`;
}

function langRow() {
  return `<div class="lang-row">${LANGS.map((l) => `<button class="${l.code === getLang() ? 'on' : ''}" data-act="lang" data-l="${l.code}">${l.label}</button>`).join('')}</div>`;
}

function modalHTML() {
  const m = S.modal;
  if (!m) return '';
  if (m === 'terms-first' || m === 'terms') {
    const first = m === 'terms-first';
    return `<div class="backdrop" ${first ? '' : 'data-act="close-bd"'}><div class="modal">
      ${first ? langRow() : ''}<h2>📜 ${t('menuTerms')}</h2><div class="terms">${esc(t('termsText'))}</div>
      ${first ? `<button class="btn-primary" data-act="agree" id="btn-agree">${t('agree')}</button>` : `<button class="btn-sec" data-act="close">${t('close')}</button>`}
    </div></div>`;
  }
  if (m === 'about') {
    return `<div class="backdrop" data-act="close-bd"><div class="modal">
      <div class="brand-badge" style="width:72px;height:72px;margin:0 auto;border-radius:20px"><img src="./icon.png" alt="Dotori" style="border-radius:18px"></div>
      <h2>${curGame().title} <span class="tag">${curGame().tag}</span></h2>
      <span class="ver-badge" id="about-version">v${verOf()}</span>
      <p class="about-desc">${esc(t(S.game === 'weaponevo' ? 'dweAboutDesc' : S.game === 'blackhole' ? 'dbhAboutDesc' : S.game === 'filesort' ? 'dfsAboutDesc' : S.game === 'wifi' ? 'wfAboutDesc' : S.game === 'parcel' ? 'pkAboutDesc' : 'aboutDesc'))}</p>
      <p style="font-size:14px">${t('developer')} : leeshdang@gmail.com</p>
      <button class="link-btn" data-act="terms">${t('viewTerms')}</button>
      <button class="btn-sec" data-act="close">${t('close')}</button>
    </div></div>`;
  }
  if (m === 'over') {
    return `<div class="backdrop"><div class="modal">
      <div class="big-acorn">${S.game === 'weaponevo' ? '<div style="font-size:64px">⚔️</div>' : S.game === 'blackhole' ? '<div style="font-size:64px">🌌</div>' : S.game === 'filesort' ? '<div style="font-size:64px">📁</div>' : S.game === 'parcel' ? '<div style="font-size:64px">📦</div>' : acornSVG(2, 'ov')}</div><h2>${t(S.game === 'weaponevo' ? 'dweGameOver' : S.game === 'blackhole' ? 'dbhGameOver' : S.game === 'filesort' ? 'dfsGameOver' : S.game === 'parcel' ? 'pkGameOver' : 'gameOver')}</h2>
      <p style="color:#9ca3af">${t('finalScore')}</p><p style="font-family:Jua;font-size:40px;background:linear-gradient(90deg,#f9a8d4,#a5b4fc);-webkit-background-clip:text;background-clip:text;color:transparent">${S.score}</p>
      ${S.newBest ? `<p style="margin:6px 0">${t('newBest')}</p>` : ''}
      <button class="btn-primary" style="margin-top:14px" data-act="again" id="btn-again">${t('playAgain')}</button>
    </div></div>`;
  }
  if (m === 'wf-win') {
    const d = S.wfWinData || { stars: 3, cost: 0, par: 0, level: 1 };
    return `<div class="backdrop"><div class="modal">
      <div style="font-size:64px;margin-bottom:8px">🎉</div>
      <h2>${t('wfLevelClear')}</h2>
      <div style="font-size:32px;color:#facc15;margin:8px 0">${'★'.repeat(d.stars)}${'☆'.repeat(3 - d.stars)}</div>
      <p style="color:#9ca3af">${t('wfCostAchieved')}: <b style="color:#fff;font-size:20px">${d.cost}</b> / ${t('wfPar')}: ${d.par}</p>
      <button class="btn-primary" style="margin-top:16px" data-act="wf-next" id="btn-wf-next">${t('wfNextLevel')}</button>
      <button class="btn-sec" data-act="close">${t('close')}</button>
    </div></div>`;
  }
  return '';
}

function pkOver({ score, newBest }) { S.score = score; S.newBest = newBest; S.modal = 'over'; render(); }
function wfWin(data) { S.wfWinData = data; S.modal = 'wf-win'; render(); }
function dfsOver({ score, best, sorted }) { S.score = score; S.newBest = score >= best && score > 0; S.modal = 'over'; render(); }
function dweOver({ score, best, maxTile }) { S.score = score; S.newBest = score >= best && score > 0; S.modal = 'over'; render(); }
function dbhOver({ score, best, count }) { S.score = score; S.newBest = score >= best && score > 0; S.modal = 'over'; render(); }

function render() {
  document.documentElement.lang = getLang();
  document.title = `${curGame().title} - ${t(curGame().name)}`;
  document.getElementById('app').innerHTML =
    `<div class="app ${S.phone ? 'phone' : ''} g-${S.game}">${headerHTML()}<main class="workspace">${stageHTML()}${sidebarHTML()}</main></div>${modalHTML()}`;
  PK.setPaused(S.modal !== null);
  WF.setPaused(S.modal !== null);
  DFS.setPaused(S.modal !== null);
  DBH.setPaused(S.modal !== null);
  DWE.setPaused(S.modal !== null);
  if (S.game === 'parcel') {
    WF.detach();
    DFS.detach();
    DBH.detach();
    DWE.detach();
    const $ = (id) => document.getElementById(id);
    PK.attach({ root: $('pk-root'), canvas: $('pk-canvas'), next: $('pk-next'), score: $('pk-score'), best: $('pk-best'), lines: $('pk-lines'), level: $('pk-level'), toast: $('pk-toast'), pause: $('pk-pause') }, { onOver: pkOver });
  } else if (S.game === 'wifi') {
    PK.detach();
    DFS.detach();
    DBH.detach();
    DWE.detach();
    const $ = (id) => document.getElementById(id);
    WF.attach({ canvas: $('wf-canvas'), level: $('wf-level'), cost: $('wf-cost'), par: $('wf-par'), range: $('wf-range'), conn: $('wf-conn') }, { onWin: wfWin });
  } else if (S.game === 'filesort') {
    PK.detach();
    WF.detach();
    DBH.detach();
    DWE.detach();
    const $ = (id) => document.getElementById(id);
    DFS.attach({ canvas: $('dfs-canvas'), score: $('dfs-score'), best: $('dfs-best'), time: $('dfs-time'), lives: $('dfs-lives'), combo: $('dfs-combo') }, { onGameOver: dfsOver });
  } else if (S.game === 'weaponevo') {
    PK.detach();
    WF.detach();
    DFS.detach();
    DBH.detach();
    const $ = (id) => document.getElementById(id);
    DWE.attach({ root: $('dwe-root'), board: $('dwe-board'), score: $('dwe-score'), best: $('dwe-best'), max: $('dwe-max'), count: $('dwe-codex'), undoBtn: $('btn-dwe-undo') }, { onGameOver: dweOver });
  } else if (S.game === 'blackhole') {
    PK.detach();
    WF.detach();
    DFS.detach();
    DWE.detach();
    const $ = (id) => document.getElementById(id);
    DBH.attach({ canvas: $('dbh-canvas'), score: $('dbh-score'), best: $('dbh-best'), time: $('dbh-time'), size: $('dbh-size'), count: $('dbh-count') }, { onGameOver: dbhOver });
  } else {
    PK.detach();
    WF.detach();
    DFS.detach();
    DBH.detach();
    DWE.detach();
  }
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el) {
    if ((S.menu && !e.target.closest('.menu-wrap')) || (S.gmenu && !e.target.closest('.gamesel'))) { S.menu = false; S.gmenu = false; render(); }
    return;
  }
  const act = el.dataset.act;
  if (act === 'close-bd' && e.target !== el) return;
  if (act !== 'gsel' && act !== 'game') S.gmenu = false;
  switch (act) {
    case 'place': place(Number(el.dataset.i)); return;
    case 'menu': S.menu = !S.menu; S.gmenu = false; break;
    case 'gsel': S.gmenu = !S.gmenu; S.menu = false; break;
    case 'game':
      S.game = el.dataset.g;
      S.gmenu = false;
      S.menu = false;
      S.modal = null;
      S.tab = 'play';
      localStorage.setItem('dotori_game', S.game);
      if (S.game === 'weaponevo') DWE.reset();
      else if (S.game === 'blackhole') DBH.reset();
      else if (S.game === 'filesort') DFS.reset();
      else if (S.game === 'wifi') WF.reset();
      else if (S.game === 'parcel') PK.reset();
      else newGame();
      break;
    case 'phone': S.phone = !S.phone; break;
    case 'restart':
      if (S.game === 'weaponevo') { DWE.reset(); break; }
      if (S.game === 'weaponevo') { DWE.reset(); break; }
      if (S.game === 'blackhole') { DBH.reset(); break; }
      if (S.game === 'filesort') { DFS.reset(); break; }
      if (S.game === 'wifi') { WF.reset(); break; }
      if (S.game === 'parcel') { PK.reset(); break; }
      newGame(); return;
    case 'again':
      S.modal = null;
      if (S.game === 'blackhole') { DBH.reset(); break; }
      if (S.game === 'filesort') { DFS.reset(); break; }
      if (S.game === 'wifi') { WF.reset(); break; }
      if (S.game === 'parcel') { PK.reset(); break; }
      newGame(); return;
        case 'dwe-dir': DWE.move(el.dataset.dir); break;
    case 'dwe-undo': DWE.undo(); break;
    case 'pk-skin': PK.setSkin(el.dataset.k); break;
    case 'pk-sound': PK.toggleMute(); break;
    case 'pk-resume': PK.togglePause(); return;
    case 'wf-tool': WF.setTool(el.dataset.tool); break;
    case 'wf-level': WF.loadLevel(Number(el.dataset.lv)); break;
    case 'wf-next':
      S.modal = null;
      WF.loadLevel(WF.getLevel() + 1);
      break;
    case 'tab': S.tab = el.dataset.k; break;
    case 'lang': setLang(el.dataset.l); break;
    case 'terms': S.modal = S.modal === 'terms-first' ? 'terms-first' : 'terms'; S.menu = false; break;
    case 'about': S.modal = 'about'; S.menu = false; break;
    case 'agree': localStorage.setItem('dotori_terms_agreed', 'true'); S.modal = null; break;
    case 'close': case 'close-bd': S.modal = null; break;
    case 'exit': S.menu = false; if (window.confirm(t('menuExitConfirm'))) window.close(); break;
  }
  render();
});

S.next = rollTier();
render();
