const fs = require('fs');
const path = require('path');

const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

pkg.scripts['cap:sync'] = 'npx cap sync android';
pkg.scripts['build:apk'] = 'npm run build && npx cap sync android && node scripts/build-apk.cjs';

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
console.log('package.json scripts updated!');
