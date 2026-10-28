// Pre-build hook: writes timestamp version (DAS-YYYYMMDD_HHMM)
const fs = require('fs');
const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const versionStr = `DAS-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
fs.writeFileSync('./src/version.json', JSON.stringify({ version: versionStr }, null, 2));
console.log('Version:', versionStr);
