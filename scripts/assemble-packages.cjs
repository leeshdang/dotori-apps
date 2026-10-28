const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const targetPkgDir = 'D:\\Package\\Dotori_Acorn_Storage';

if (!fs.existsSync(targetPkgDir)) {
  fs.mkdirSync(targetPkgDir, { recursive: true });
}

console.log('--- 1. Packaging Web Zip ---');
const webStaging = path.join(rootDir, 'dist-web-staging');
if (fs.existsSync(webStaging)) fs.rmSync(webStaging, { recursive: true, force: true });
fs.mkdirSync(webStaging, { recursive: true });

// Copy dist contents (index.html, assets, icons, etc.) excluding installer/binary files
const distDir = path.join(rootDir, 'dist');
const filesToCopy = ['index.html', 'assets', 'favicon.png', 'icon.png', 'apple-touch-icon.png'];
for (const item of filesToCopy) {
  const src = path.join(distDir, item);
  const dest = path.join(webStaging, item);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
  }
}

const webZipPath = path.join(targetPkgDir, 'Dotori-AcornStorage-web.zip');
if (fs.existsSync(webZipPath)) fs.unlinkSync(webZipPath);

try {
  // Use PowerShell Compress-Archive
  execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${webStaging}\\*' -DestinationPath '${webZipPath}' -Force"`, { stdio: 'inherit' });
  console.log(`Web zip created: ${webZipPath} (${fs.statSync(webZipPath).size} bytes)`);
} catch (e) {
  console.error('Failed to create web zip:', e);
} finally {
  if (fs.existsSync(webStaging)) fs.rmSync(webStaging, { recursive: true, force: true });
}

console.log('--- 2. Copying Windows Executable ---');
const winExe = path.join(distDir, 'Dotori-AcornStorage-win-x64.exe');
if (fs.existsSync(winExe)) {
  const destExe = path.join(targetPkgDir, 'Dotori-AcornStorage-win-x64.exe');
  fs.copyFileSync(winExe, destExe);
  console.log(`Copied Windows Installer -> ${destExe} (${fs.statSync(destExe).size} bytes)`);
} else {
  console.warn(`Windows Installer not found at ${winExe}`);
}

console.log('--- 3. Copying Windows Portable Zip ---');
// electron-builder win zip output is typically Dotori-AcornStorage-win-x64.zip or Dotori Acorn Storage 1.0.0.zip or Dotori-AcornStorage-portable.zip
const possibleZips = [
  path.join(distDir, 'Dotori-AcornStorage-portable.zip'),
  path.join(distDir, 'Dotori Acorn Storage-1.0.0-win.zip'),
  path.join(distDir, 'Dotori-AcornStorage-win-x64.zip'),
  path.join(distDir, 'Dotori Acorn Storage-1.0.0.zip')
];
let foundZip = possibleZips.find(p => fs.existsSync(p));
if (!foundZip) {
  // Check any zip in dist
  const distFiles = fs.readdirSync(distDir);
  const anyZip = distFiles.find(f => f.endsWith('.zip') && !f.includes('web'));
  if (anyZip) foundZip = path.join(distDir, anyZip);
}
if (foundZip) {
  const destZip = path.join(targetPkgDir, 'Dotori-AcornStorage-portable.zip');
  fs.copyFileSync(foundZip, destZip);
  console.log(`Copied Portable Zip -> ${destZip} (${fs.statSync(destZip).size} bytes)`);
} else {
  console.warn('Windows Portable zip not found yet.');
}

console.log('--- 4. Copying Linux AppImage ---');
const linuxAppImage = path.join(rootDir, 'release-pkg', 'Dotori-AcornStorage-linux.AppImage');
if (fs.existsSync(linuxAppImage)) {
  const destAppImage = path.join(targetPkgDir, 'Dotori-AcornStorage-linux.AppImage');
  fs.copyFileSync(linuxAppImage, destAppImage);
  console.log(`Copied Linux AppImage -> ${destAppImage} (${fs.statSync(destAppImage).size} bytes)`);
} else {
  console.warn(`Linux AppImage not found at ${linuxAppImage}`);
}

console.log('--- 5. Copying Android APK ---');
const apkSrc = path.join(rootDir, 'DotoriGames.apk');
if (fs.existsSync(apkSrc)) {
  const destApk = path.join(targetPkgDir, 'Dotori-AcornStorage.apk');
  fs.copyFileSync(apkSrc, destApk);
  console.log(`Copied Android APK -> ${destApk} (${fs.statSync(destApk).size} bytes)`);
  // Also keep a copy as DotoriGames.apk
  fs.copyFileSync(apkSrc, path.join(targetPkgDir, 'DotoriGames.apk'));
} else {
  console.warn(`Android APK not found at ${apkSrc}`);
}

console.log('--- Assembly completed. Destination summary: ---');
const finalFiles = fs.readdirSync(targetPkgDir);
for (const f of finalFiles) {
  const st = fs.statSync(path.join(targetPkgDir, f));
  console.log(`- ${f}: ${(st.size / 1024 / 1024).toFixed(2)} MB (${st.size} bytes)`);
}
