const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, '..', 'src', 'main.js');
let code = fs.readFileSync(mainPath, 'utf8');

// 1. Import DWE
code = code.replace(
  "import * as DBH from './blackhole.js';",
  "import * as DBH from './blackhole.js';\nimport * as DWE from './weaponevo.js';"
);

// 2. Add to GAMES array
const oldGames = `  { id: 'blackhole', icon: '🌌', name: 'gameBlackHole', title: 'Dotori Black Hole', tag: 'DBH' },
];`;
const newGames = `  { id: 'blackhole', icon: '🌌', name: 'gameBlackHole', title: 'Dotori Black Hole', tag: 'DBH' },
  { id: 'weaponevo', icon: '⚔️', name: 'gameWeaponEvo', title: 'Dotori Weapon 2048', tag: 'DWE' },
];`;
code = code.replace(oldGames, newGames);

// 3. Add weaponevoStageHTML and weaponevoBody functions
const dweFns = `
function weaponevoStageHTML() {
  return \`<div class="stage"><div class="phone-frame"><div class="game-card dwe" id="dwe-root">
    <div class="nextbar">
      <div><small>Weapon 2048 Evolution</small><b style="font-size:18px">\${t('gameWeaponEvo')}</b></div>
      <div class="spacer"></div>
      <button class="icon-btn" data-act="restart" title="\${t('restart')}" aria-label="\${t('restart')}">🔄</button>
      <button class="icon-btn nb-sound" data-act="pk-sound" title="\${t('sound')}" aria-label="\${t('sound')}">\${PK.isMuted() ? '🔇' : '🔊'}</button>
    </div>
    <div class="hud">
      <div class="stat"><span>\${t('dweScore')}</span><b id="dwe-score">0</b></div>
      <div class="stat"><span>\${t('dweBest')}</span><b id="dwe-best">0</b></div>
      <div class="stat"><span>\${t('dweCodex')}</span><b id="dwe-codex" style="color:#facc15">0 / 12</b></div>
      <div class="stat" style="flex:1.4"><span>\${t('dweMax')}</span><b id="dwe-max" style="font-size:13px;white-space:nowrap">🗡️ 단검</b></div>
    </div>
    <div class="dwe-wrap">
      <div id="dwe-toast"></div>
      <div class="dwe-board" id="dwe-board"></div>
    </div>
    <div class="dwe-ctrl-bar">
      <button class="dwe-undo-btn" data-act="dwe-undo" id="btn-dwe-undo"><span>↩️</span><span>\${t('dweUndo')}</span></button>
      <div class="dwe-dpad">
        <button class="dwe-pad-btn dwe-pad-up" data-act="dwe-dir" data-dir="up" aria-label="Up">▲</button>
        <button class="dwe-pad-btn dwe-pad-left" data-act="dwe-dir" data-dir="left" aria-label="Left">◀</button>
        <button class="dwe-pad-btn dwe-pad-down" data-act="dwe-dir" data-dir="down" aria-label="Down">▼</button>
        <button class="dwe-pad-btn dwe-pad-right" data-act="dwe-dir" data-dir="right" aria-label="Right">▶</button>
      </div>
    </div>
    <p class="hint" style="white-space:pre-line">\${t('dweHow')}</p>
  </div></div></div>\`;
}

function weaponevoBody() {
  const unlocked = DWE.getUnlockedSet();
  if (S.tab === 'guide') {
    return \`<div class="card"><h3>\${t('dweGuideTitle')}</h3><div style="display:flex;flex-direction:column;gap:8px">\${t('dweGuide').map((s) => \`<div class="guide-row"><span style="font-size:13px;line-height:1.4">\${s}</span></div>\`).join('')}</div></div>\`;
  }
  return \`<div class="card"><h3>⚔️ \${t('dweCodex')} (\${unlocked.size} / \${DWE.WEAPONS.length})</h3>
    <p style="font-size:12px;color:#9ca3af;margin-bottom:10px">\${t('dweAboutDesc')}</p>
    <div class="dwe-codex-list">
      \${DWE.WEAPONS.map((w) => {
        const has = unlocked.has(w.val);
        return \`<div class="dwe-codex-item \${has ? '' : 'locked'}">
          <span class="dwe-codex-icon">\${has ? w.icon : '🔒'}</span>
          <div class="dwe-codex-info">
            <b>\${has ? w.name : '??? (미발견)'} <small style="display:inline;color:\${has ? w.color : '#64748b'}">(Lv.\${w.level} · \${w.val})</small></b>
            <small>\${has ? w.desc : '같은 무기 2개를 합쳐 해금하세요'}</small>
          </div>
          <span class="dwe-codex-stat">\${has ? 'ATK +' + w.atk : '---'}</span>
        </div>\`;
      }).join('')}
    </div>
  </div>\`;
}
`;

code = code.replace('function blackholeStageHTML()', dweFns + '\nfunction blackholeStageHTML()');

// 4. Update stageHTML()
code = code.replace(
  "if (S.game === 'blackhole') return blackholeStageHTML();",
  "if (S.game === 'weaponevo') return weaponevoStageHTML();\n  if (S.game === 'blackhole') return blackholeStageHTML();"
);

// 5. Update sidebarHTML()
code = code.replace(
  "if (S.game === 'blackhole') body = blackholeBody();",
  "if (S.game === 'weaponevo') body = weaponevoBody();\n    else if (S.game === 'blackhole') body = blackholeBody();"
);
code = code.replace(
  "if (S.game === 'blackhole') {\n      body = blackholeBody();",
  "if (S.game === 'weaponevo') {\n      body = weaponevoBody();\n    } else if (S.game === 'blackhole') {\n      body = blackholeBody();"
);

// 6. Update aboutDesc and gameOver in modalHTML()
code = code.replace(
  "S.game === 'blackhole' ? 'dbhAboutDesc' :",
  "S.game === 'weaponevo' ? 'dweAboutDesc' : S.game === 'blackhole' ? 'dbhAboutDesc' :"
);
code = code.replace(
  "S.game === 'blackhole' ? '<div style=\"font-size:64px\">🌌</div>' :",
  "S.game === 'weaponevo' ? '<div style=\"font-size:64px\">⚔️</div>' : S.game === 'blackhole' ? '<div style=\"font-size:64px\">🌌</div>' :"
);
code = code.replace(
  "S.game === 'blackhole' ? 'dbhGameOver' :",
  "S.game === 'weaponevo' ? 'dweGameOver' : S.game === 'blackhole' ? 'dbhGameOver' :"
);

// 7. Add dweOver callback
const dweOverFn = `function dweOver({ score, best, maxTile }) { S.score = score; S.newBest = score >= best && score > 0; S.modal = 'over'; render(); }\n`;
code = code.replace('function dbhOver', dweOverFn + 'function dbhOver');

// 8. Update render() lifecycle
code = code.replace(
  'DBH.setPaused(S.modal !== null);',
  'DBH.setPaused(S.modal !== null);\n  DWE.setPaused(S.modal !== null);'
);

const oldBlackholeAttach = `} else if (S.game === 'blackhole') {
    PK.detach();
    WF.detach();
    DFS.detach();
    const $ = (id) => document.getElementById(id);
    DBH.attach({ canvas: $('dbh-canvas'), score: $('dbh-score'), best: $('dbh-best'), time: $('dbh-time'), size: $('dbh-size'), count: $('dbh-count') }, { onGameOver: dbhOver });
  } else {`;

const newBlackholeAttach = `} else if (S.game === 'weaponevo') {
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
  } else {`;

code = code.replace(oldBlackholeAttach, newBlackholeAttach);

// Also add DWE.detach() in other branches
code = code.replace("if (S.game === 'parcel') {\n    WF.detach();\n    DFS.detach();\n    DBH.detach();", "if (S.game === 'parcel') {\n    WF.detach();\n    DFS.detach();\n    DBH.detach();\n    DWE.detach();");
code = code.replace("else if (S.game === 'wifi') {\n    PK.detach();\n    DFS.detach();\n    DBH.detach();", "else if (S.game === 'wifi') {\n    PK.detach();\n    DFS.detach();\n    DBH.detach();\n    DWE.detach();");
code = code.replace("else if (S.game === 'filesort') {\n    PK.detach();\n    WF.detach();\n    DBH.detach();", "else if (S.game === 'filesort') {\n    PK.detach();\n    WF.detach();\n    DBH.detach();\n    DWE.detach();");
code = code.replace("} else {\n    PK.detach();\n    WF.detach();\n    DFS.detach();\n    DBH.detach();\n  }", "} else {\n    PK.detach();\n    WF.detach();\n    DFS.detach();\n    DBH.detach();\n    DWE.detach();\n  }");

// 9. Update event listeners
code = code.replace(
  "if (S.game === 'blackhole') DBH.reset();",
  "if (S.game === 'weaponevo') DWE.reset();\n      else if (S.game === 'blackhole') DBH.reset();"
);
code = code.replace(
  "if (S.game === 'blackhole') { DBH.reset(); break; }",
  "if (S.game === 'weaponevo') { DWE.reset(); break; }\n      if (S.game === 'blackhole') { DBH.reset(); break; }"
);
code = code.replace(
  "if (S.game === 'blackhole') { DBH.reset(); break; }",
  "if (S.game === 'weaponevo') { DWE.reset(); break; }\n      if (S.game === 'blackhole') { DBH.reset(); break; }"
);

// Add dwe-dir and dwe-undo actions
const dweActions = `    case 'dwe-dir': DWE.move(el.dataset.dir); break;
    case 'dwe-undo': DWE.undo(); break;\n`;
code = code.replace("case 'pk-skin':", dweActions + "    case 'pk-skin':");

fs.writeFileSync(mainPath, code, 'utf8');
console.log('src/main.js successfully integrated with DWE!');
