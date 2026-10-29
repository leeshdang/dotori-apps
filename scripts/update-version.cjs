const fs = require('fs');
const path = require('path');

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const yyyy = now.getFullYear();
const mm = pad(now.getMonth() + 1);
const dd = pad(now.getDate());
const hh = pad(now.getHours());
const min = pad(now.getMinutes());
const versionStr = `DJL-${yyyy}${mm}${dd}_${hh}${min}`;

// 1. Update src/version.json
try {
  fs.writeFileSync(
    path.resolve(__dirname, '../src/version.json'),
    JSON.stringify({ version: versionStr, timestamp: Date.now() }, null, 2),
    'utf-8'
  );
} catch (e) {
  console.error(e);
}

// 2. Update package.json dotoriVersion
try {
  const pkgPath = path.resolve(__dirname, '../package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.dotoriVersion = versionStr;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf-8');
} catch (e) {
  console.error(e);
}

console.log(`[Dotori DJL Version Synchronized]: ${versionStr}`);
