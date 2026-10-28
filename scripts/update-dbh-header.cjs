const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'src', 'main.js');
let code = fs.readFileSync(target, 'utf8');

const oldBhHeader = `    <div class="nextbar">
      <div><small>Hole.io Style</small><b style="font-size:18px">\${t('gameBlackHole')}</b></div>
      <div class="spacer"></div>
      <button class="icon-btn nb-sound" data-act="pk-sound" title="\${t('sound')}" aria-label="\${t('sound')}">\${PK.isMuted() ? '🔇' : '🔊'}</button>
    </div>`;

const newBhHeader = `    <div class="nextbar">
      <div><small>Hole.io Style (30s)</small><b style="font-size:18px">\${t('gameBlackHole')}</b></div>
      <div class="spacer"></div>
      <button class="icon-btn" data-act="restart" title="\${t('restart')}" aria-label="\${t('restart')}">🔄</button>
      <button class="icon-btn nb-sound" data-act="pk-sound" title="\${t('sound')}" aria-label="\${t('sound')}">\${PK.isMuted() ? '🔇' : '🔊'}</button>
    </div>`;

code = code.replace(oldBhHeader, newBhHeader);
fs.writeFileSync(target, code, 'utf8');
console.log('blackholeStageHTML nextbar updated!');
