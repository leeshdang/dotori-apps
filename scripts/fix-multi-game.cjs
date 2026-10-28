const fs = require('fs');
const path = require('path');

// 1. Update src/main.js
const mainPath = path.join(__dirname, '..', 'src', 'main.js');
let mainCode = fs.readFileSync(mainPath, 'utf8');

// Fix S.game initialization
mainCode = mainCode.replace(
  "game: localStorage.getItem('dotori_game') === 'parcel' ? 'parcel' : 'acorn',",
  "game: GAMES.some((g) => g.id === localStorage.getItem('dotori_game')) ? localStorage.getItem('dotori_game') : 'acorn',"
);

// Fix menuHTML to put all 5 games at the top
const oldMenuHead = `<nav class="menu" id="menu-panel">
    <a class="mi" href="https://dotoritools.com"`;

const newMenuHead = `<nav class="menu" id="menu-panel">
    <div style="padding:6px 10px 4px;font-size:11px;font-weight:700;color:#f472b6;letter-spacing:.04em">🎮 \${t('gameMenu')} (5종)</div>
    \${GAMES.map((g) => \`
      <button class="mi \${g.id === S.game ? 'cur' : ''}" data-act="game" data-g="\${g.id}">
        <span class="ico">\${g.icon}</span>
        <span style="flex:1"><b>\${t(g.name)}</b><small>\${g.title}</small></span>
        \${g.id === S.game ? '<span class="badge-now">플레이 중</span>' : '<span style="font-size:12px;color:#a5b4fc">시작 ▶</span>'}
      </button>
    \`).join('')}
    <hr>
    <a class="mi" href="https://dotoritools.com"`;

mainCode = mainCode.replace(oldMenuHead, newMenuHead);

// Fix sidebarHTML to include 'games' tab and full body support
const oldSidebar = `function sidebarHTML() {
  let body = '';
  if (S.game === 'blackhole' && S.tab !== 'settings') {
    body = blackholeBody();
  } else if (S.game === 'filesort' && S.tab !== 'settings') {
    body = filesortBody();
  } else if (S.game === 'wifi' && S.tab !== 'settings') {
    body = wifiBody();
  } else if (S.game === 'parcel' && S.tab !== 'settings') {
    body = parcelBody();
  } else if (S.tab === 'play') {
    body = \`<div class="card"><div class="mascot"><div class="squirrel \${S.happy ? 'happy' : ''}">\${squirrelSVG()}</div>
      <div class="bubble" id="bubble">\${esc(S.say || rand(t('say')))}</div></div></div>
      <div class="card"><h3>\${t('next')}</h3><div class="next"><div class="slot">\${acornSVG(S.next, 'nx')}</div><div><b style="font-family:Jua">\${t('tiers')[S.next - 1]}</b><div style="font-size:12px;color:#9ca3af">Lv.\${S.next}</div></div></div></div>
      <div class="card"><h3>\${t('storage')}</h3><div style="font-size:13px;color:#cbd0e0">\${S.board.filter(Boolean).length} / \${N}</div>
      <div style="height:10px;margin-top:8px;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden"><div style="height:100%;width:\${(S.board.filter(Boolean).length / N) * 100}%;background:linear-gradient(90deg,#ec4899,#6366f1,#0ea5e9);transition:width .3s"></div></div></div>\`;
  } else if (S.tab === 'guide') {
    body = \`<div class="card"><h3>\${t('guideTitle')}</h3><p style="font-size:13px;color:#9ca3af;margin-bottom:10px">\${t('guideDesc')}</p>
      <div style="display:flex;flex-direction:column;gap:8px">\${t('tiers').map((n, i) => \`<div class="guide-row">\${acornSVG(i + 1, 'gd')}<b>\${n}</b><span class="lv">Lv.\${i + 1}\${i < 6 ? ' → ' + (i + 2) : ' ★'}</span></div>\`).join('')}</div></div>\`;
  } else {
    body = \`<div class="card"><h3>\${t('langTitle')}</h3><div style="display:flex;flex-direction:column;gap:8px">
      \${LANGS.map((l) => \`<button class="lang-btn \${l.code === getLang() ? 'on' : ''}" data-act="lang" data-l="\${l.code}"><span>\${l.label}</span><span>\${l.code === getLang() ? '✓' : ''}</span></button>\`).join('')}</div></div>\`;
  }
  const tabs = [['play', '🌰', 'tabPlay'], ['guide', '📖', 'tabGuide'], ['settings', '⚙️', 'tabSettings']];
  return \`<aside class="sidebar"><div class="panel">\${body}</div>
    <div class="nav">\${tabs.map(([k, ic, lb]) => \`<button class="\${S.tab === k ? 'on' : ''}" data-act="tab" data-k="\${k}" id="tab-\${k}"><span>\${ic}</span>\${t(lb)}</button>\`).join('')}</div></aside>\`;
}`;

const newSidebar = `function sidebarHTML() {
  let body = '';
  if (S.tab === 'games') {
    body = \`<div class="card"><h3>🎮 \${t('gameMenu')}</h3>
      <p style="font-size:13px;color:#9ca3af;margin-bottom:12px">플레이할 게임을 선택하세요 (5종 전체 탑재)</p>
      <div style="display:flex;flex-direction:column;gap:10px">
        \${GAMES.map((g) => \`
          <button class="game-select-card \${g.id === S.game ? 'on' : ''}" data-act="game" data-g="\${g.id}">
            <span style="font-size:28px">\${g.icon}</span>
            <div style="flex:1;text-align:left">
              <b style="font-size:15px;color:#fff">\${t(g.name)}</b>
              <div style="font-size:12px;color:#9ca3af">\${g.title}</div>
            </div>
            \${g.id === S.game ? '<span class="badge-now">플레이 중</span>' : '<span class="play-btn-tag">시작 ▶</span>'}
          </button>
        \`).join('')}
      </div>
    </div>\`;
  } else if (S.tab === 'settings') {
    body = \`<div class="card"><h3>\${t('langTitle')}</h3><div style="display:flex;flex-direction:column;gap:8px">
      \${LANGS.map((l) => \`<button class="lang-btn \${l.code === getLang() ? 'on' : ''}" data-act="lang" data-l="\${l.code}"><span>\${l.label}</span><span>\${l.code === getLang() ? '✓' : ''}</span></button>\`).join('')}</div></div>\`;
  } else if (S.tab === 'guide') {
    if (S.game === 'blackhole') body = blackholeBody();
    else if (S.game === 'filesort') body = filesortBody();
    else if (S.game === 'wifi') body = wifiBody();
    else if (S.game === 'parcel') body = parcelBody();
    else {
      body = \`<div class="card"><h3>\${t('guideTitle')}</h3><p style="font-size:13px;color:#9ca3af;margin-bottom:10px">\${t('guideDesc')}</p>
        <div style="display:flex;flex-direction:column;gap:8px">\${t('tiers').map((n, i) => \`<div class="guide-row">\${acornSVG(i + 1, 'gd')}<b>\${n}</b><span class="lv">Lv.\${i + 1}\${i < 6 ? ' → ' + (i + 2) : ' ★'}</span></div>\`).join('')}</div></div>\`;
    }
  } else {
    // S.tab === 'play'
    if (S.game === 'blackhole') {
      body = blackholeBody();
    } else if (S.game === 'filesort') {
      body = filesortBody();
    } else if (S.game === 'wifi') {
      body = wifiBody();
    } else if (S.game === 'parcel') {
      body = parcelBody();
    } else {
      body = \`<div class="card"><div class="mascot"><div class="squirrel \${S.happy ? 'happy' : ''}">\${squirrelSVG()}</div>
        <div class="bubble" id="bubble">\${esc(S.say || rand(t('say')))}</div></div></div>
        <div class="card"><h3>\${t('next')}</h3><div class="next"><div class="slot">\${acornSVG(S.next, 'nx')}</div><div><b style="font-family:Jua">\${t('tiers')[S.next - 1]}</b><div style="font-size:12px;color:#9ca3af">Lv.\${S.next}</div></div></div></div>
        <div class="card"><h3>\${t('storage')}</h3><div style="font-size:13px;color:#cbd0e0">\${S.board.filter(Boolean).length} / \${N}</div>
        <div style="height:10px;margin-top:8px;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden"><div style="height:100%;width:\${(S.board.filter(Boolean).length / N) * 100}%;background:linear-gradient(90deg,#ec4899,#6366f1,#0ea5e9);transition:width .3s"></div></div></div>\`;
    }
  }
  const tabs = [
    ['play', '🕹️', 'tabPlay'],
    ['games', '🎮', 'gameMenu'],
    ['guide', '📖', 'tabGuide'],
    ['settings', '⚙️', 'tabSettings'],
  ];
  return \`<aside class="sidebar"><div class="panel">\${body}</div>
    <div class="nav">\${tabs.map(([k, ic, lb]) => \`<button class="\${S.tab === k ? 'on' : ''}" data-act="tab" data-k="\${k}" id="tab-\${k}"><span>\${ic}</span>\${t(lb)}</button>\`).join('')}</div></aside>\`;
}`;

mainCode = mainCode.replace(oldSidebar, newSidebar);

// Fix case 'game' in event listener
const oldGameCase = `case 'game':
      S.game = el.dataset.g; S.gmenu = false; S.tab = 'play'; localStorage.setItem('dotori_game', S.game); break;`;

const newGameCase = `case 'game':
      S.game = el.dataset.g;
      S.gmenu = false;
      S.menu = false;
      S.modal = null;
      S.tab = 'play';
      localStorage.setItem('dotori_game', S.game);
      if (S.game === 'blackhole') DBH.reset();
      else if (S.game === 'filesort') DFS.reset();
      else if (S.game === 'wifi') WF.reset();
      else if (S.game === 'parcel') PK.reset();
      else newGame();
      break;`;

mainCode = mainCode.replace(oldGameCase, newGameCase);

fs.writeFileSync(mainPath, mainCode, 'utf8');
console.log('src/main.js updated successfully!');

// 2. Update src/style.css
const cssPath = path.join(__dirname, '..', 'src', 'style.css');
let cssCode = fs.readFileSync(cssPath, 'utf8');

const additionalCSS = `
/* --- Mobile Header & Game Select Card Enhancements --- */
@media (max-width: 899px) {
  .header { padding: 8px 10px; gap: 8px; }
  .title, .tag, .ver, .pill, #btn-phone { display: none !important; }
  .gamesel { flex: 1; min-width: 0; margin: 0 4px; }
  .gs-btn { width: 100%; justify-content: center; padding: 8px 12px; font-size: 14px; background: linear-gradient(90deg, rgba(236,72,153,.3), rgba(99,102,241,.3)); border-color: rgba(244,114,182,.5); }
  .gs-name { max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .gs-menu { width: min(340px, calc(100vw - 20px)); left: 50%; transform: translateX(-50%); top: 52px; z-index: 100; }
  .cta { padding: 8px 12px; font-size: 13px; min-height: 40px; }
  .workspace { flex-direction: column; overflow-y: auto; }
  .stage { flex: none; padding: 10px; }
  .sidebar { width: 100%; max-width: none; border-left: 0; border-top: 1px solid var(--line); min-height: 280px; }
}

.game-select-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255,255,255,.05);
  border: 1px solid var(--line);
  transition: .15s;
  cursor: pointer;
  width: 100%;
}
.game-select-card:hover {
  background: rgba(255,255,255,.1);
  transform: translateY(-2px);
}
.game-select-card.on {
  border-color: #f472b6;
  background: linear-gradient(135deg, rgba(236,72,153,.22), rgba(99,102,241,.22));
  box-shadow: 0 0 16px rgba(236,72,153,.25);
}
.play-btn-tag {
  font-size: 12px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 99px;
  background: rgba(99,102,241,.25);
  color: #c7d2fe;
  border: 1px solid rgba(165,180,252,.4);
  white-space: nowrap;
}
`;

cssCode += additionalCSS;
fs.writeFileSync(cssPath, cssCode, 'utf8');
console.log('src/style.css updated successfully!');
