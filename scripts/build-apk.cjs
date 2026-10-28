const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const androidDir = path.join(rootDir, 'android');
const srcApk = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
const distDir = path.join(rootDir, 'dist-apk');
const destApk = path.join(distDir, 'DotoriGames.apk');
const rootApk = path.join(rootDir, 'DotoriGames.apk');

const env = {
  ...process.env,
  JAVA_HOME: 'C:\\Program Files\\Android\\Android Studio\\jbr',
  ANDROID_HOME: 'C:\\Users\\leesh\\AppData\\Local\\Android\\Sdk',
  PATH: `C:\\Program Files\\Android\\Android Studio\\jbr\\bin;${process.env.PATH}`,
};

console.log('Building Android APK via Gradle...');
execSync('.\\gradlew.bat assembleDebug', { cwd: androidDir, env, stdio: 'inherit' });

if (fs.existsSync(srcApk)) {
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
  fs.copyFileSync(srcApk, destApk);
  fs.copyFileSync(srcApk, rootApk);
  console.log('Successfully created APK:');
  console.log(' - ' + destApk);
  console.log(' - ' + rootApk);
} else {
  console.error('Error: APK file not found at ' + srcApk);
  process.exit(1);
}
