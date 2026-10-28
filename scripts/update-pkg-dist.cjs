const fs = require('fs');
const path = require('path');

const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

pkg.scripts['dist:win'] = 'npm run build && electron-builder --win nsis --x64';
pkg.scripts['dist:win:portable'] = 'npm run build && electron-builder --win zip --x64';
pkg.scripts['dist:linux'] = 'npm run build && electron-builder --linux AppImage tar.gz --x64';

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
console.log('package.json updated with dist scripts!');
