const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// Set Application User Model ID for Windows Taskbar grouping and official Dotori icon display
if (process.platform === 'win32') {
  app.setAppUserModelId('com.dotori.janggilearning');
}

let mainWindow;

function getIconPath() {
  const appRoot = app.getAppPath();
  const isWin = process.platform === 'win32';
  const candidates = isWin
    ? [
        path.join(appRoot, 'build', 'icon.ico'),
        path.join(appRoot, 'build', 'icon.png'),
        path.join(__dirname, '../build/icon.ico'),
        path.join(__dirname, '../build/icon.png'),
      ]
    : [
        path.join(appRoot, 'build', 'icon.png'),
        path.join(appRoot, 'build', 'icon.ico'),
        path.join(__dirname, '../build/icon.png'),
        path.join(__dirname, '../build/icon.ico'),
      ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return path.join(__dirname, '../build/icon.png');
}


// [Dotori] Apply the language selected in the installer (dotori-lang.txt) on first launch.
function dotoriHookInstallLang(win, extraKeys) {
  win.webContents.on('did-finish-load', () => {
    let lang = null;
    try {
      lang = require('fs').readFileSync(path.join(process.resourcesPath, 'dotori-lang.txt'), 'utf8').trim();
    } catch (e) { return; }
    if (!/^(ko|en|ja|zh)$/.test(lang)) return;
    const keys = JSON.stringify(['dotori_lang'].concat(extraKeys || []));
    win.webContents.executeJavaScript(
      "(function(){try{if(localStorage.getItem('dotori_lang_installed')==='" + lang + "')return false;" +
      keys + ".forEach(function(k){localStorage.setItem(k,'" + lang + "')});" +
      "localStorage.setItem('dotori_lang_installed','" + lang + "');return true;}catch(e){return false;}})()"
    ).then((changed) => { if (changed) win.webContents.reload(); }).catch(() => {});
  });
}

function createWindow() {
  const iconPath = getIconPath();

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    title: 'Dotori Janggi Learning',
    icon: iconPath,
    autoHideMenuBar: true,
    backgroundColor: '#090a10',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  // Load the built local dist/index.html
  dotoriHookInstallLang(mainWindow, ["djl_lang"]);
  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
