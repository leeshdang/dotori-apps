const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'src', 'main.js');
let code = fs.readFileSync(target, 'utf8');

code = code.replace('<b id="dbh-time">60s</b>', '<b id="dbh-time">30s</b>');

const oldNextbar = `<div class="spacer"></div>
      <button class="icon-btn nb-sound" data-act="pk-sound" title="\${t('sound')}" aria-label="\${t('sound')}">\${PK.isMuted() ? '🔇' : '🔊'}</button>`;

const newNextbar = `<div class="spacer"></div>
      <button class="icon-btn" data-act="restart" title="\${t('restart')}" aria-label="\${t('restart')}">🔄</button>
      <button class="icon-btn nb-sound" data-act="pk-sound" title="\${t('sound')}" aria-label="\${t('sound')}">\${PK.isMuted() ? '🔇' : '🔊'}</button>`;

code = code.replace(oldNextbar, newNextbar);

fs.writeFileSync(target, code, 'utf8');
console.log('main.js updated cleanly!');
