const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'src', 'style.css');
const dweCSS = `
/* --- Dotori Weapon Evolution (2048) styles --- */
.game-card.dwe { max-width: 500px; margin: 0 auto; }
.dwe-wrap { position: relative; padding: 12px; border-radius: 24px; background: linear-gradient(145deg, #1f202e, #11121d); box-shadow: inset 0 0 0 3px rgba(255,255,255,.08), 0 16px 36px rgba(0,0,0,.5); }
.dwe-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  background: rgba(10, 11, 18, 0.85);
  padding: 10px;
  border-radius: 18px;
  touch-action: none;
  user-select: none;
  aspect-ratio: 1 / 1;
}
.dwe-cell {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  transition: transform 0.12s ease, background 0.15s ease;
}
.dwe-cell.empty {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.04);
}
.dwe-cell.occupied {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  animation: dwePop 0.18s cubic-bezier(0.3, 1.6, 0.5, 1);
}
@keyframes dwePop {
  0% { transform: scale(0.6); opacity: 0.6; }
  100% { transform: scale(1); opacity: 1; }
}
.dwe-icon { font-size: 26px; line-height: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,.6)); }
.dwe-val { font-family: 'Jua', sans-serif; font-size: 18px; color: #fff; line-height: 1.1; margin-top: 2px; }
.dwe-name { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.85); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 90%; }

/* Mobile D-Pad Controls */
.dwe-ctrl-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
  gap: 10px;
}
.dwe-undo-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 14px;
  background: rgba(255,255,255,.07);
  border: 1px solid var(--line);
  font-size: 13px;
  font-weight: 700;
  transition: .15s;
}
.dwe-undo-btn:hover:not(:disabled) { background: rgba(255,255,255,.14); transform: translateY(-1px); }
.dwe-dpad {
  display: grid;
  grid-template-columns: repeat(3, 44px);
  grid-template-rows: repeat(2, 40px);
  gap: 4px;
}
.dwe-pad-btn {
  border-radius: 10px;
  background: rgba(255,255,255,.08);
  border: 1px solid var(--line);
  font-size: 16px;
  display: grid;
  place-items: center;
  user-select: none;
  touch-action: none;
  transition: .1s;
}
.dwe-pad-btn:active { background: var(--cta); transform: scale(.93); }
.dwe-pad-up { grid-column: 2; grid-row: 1; }
.dwe-pad-left { grid-column: 1; grid-row: 2; }
.dwe-pad-down { grid-column: 2; grid-row: 2; }
.dwe-pad-right { grid-column: 3; grid-row: 2; }

/* Toast */
#dwe-toast {
  position: absolute;
  top: 14%;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 18px;
  border-radius: 99px;
  background: linear-gradient(90deg, #f59e0b, #ec4899);
  color: #fff;
  font-family: 'Jua', sans-serif;
  font-size: 15px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.4);
  z-index: 20;
}
#dwe-toast.show { animation: dweToastAnim 1.8s ease forwards; }
@keyframes dweToastAnim {
  0% { opacity: 0; transform: translate(-50%, 14px) scale(.85); }
  15% { opacity: 1; transform: translate(-50%, 0) scale(1.05); }
  80% { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, -20px); }
}

/* Codex List */
.dwe-codex-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 380px;
  overflow-y: auto;
  padding-right: 4px;
}
.dwe-codex-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255,255,255,.04);
  border: 1px solid var(--line);
  transition: .15s;
}
.dwe-codex-item.locked {
  opacity: .4;
  filter: grayscale(1);
}
.dwe-codex-icon { font-size: 26px; }
.dwe-codex-info { flex: 1; }
.dwe-codex-info b { font-size: 14px; display: block; }
.dwe-codex-info small { font-size: 11px; color: #94a3b8; display: block; line-height: 1.3; }
.dwe-codex-stat { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #facc15; font-weight: 700; white-space: nowrap; }
`;

fs.appendFileSync(cssPath, dweCSS, 'utf8');
console.log('Appended DWE styles to src/style.css!');
