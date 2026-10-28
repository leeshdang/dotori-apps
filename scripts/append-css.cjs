const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'src', 'style.css');
const additionalCSS = `
/* --- Dotori Black Hole styles --- */
.game-card.dbh { max-width: 640px; margin: 0 auto; }
.dbh-wrap { position: relative; display: grid; place-items: center; padding: 6px; border-radius: 22px; background: linear-gradient(145deg, #1b1928, #0d0c15); box-shadow: inset 0 0 0 3px rgba(255,255,255,.1), 0 10px 24px rgba(0,0,0,.4); }
#dbh-canvas { width: 100%; max-width: 540px; height: auto; aspect-ratio: 1 / 1; border-radius: 14px; display: block; touch-action: none; cursor: crosshair; user-select: none; }
.dbh-tier-badge { padding: 8px 12px; border-radius: 12px; background: rgba(255,255,255,.05); border-left: 4px solid #a855f7; display: flex; flex-direction: column; gap: 2px; }
.dbh-tier-badge b { font-size: 13px; color: #c084fc; }
.dbh-tier-badge small { font-size: 11px; color: #94a3b8; }
`;

fs.appendFileSync(cssPath, additionalCSS, 'utf8');
console.log('Appended DBH CSS successfully!');
