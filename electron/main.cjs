const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

app.setAppUserModelId('com.dotori.acornstorage');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    backgroundColor: '#090A10',
    autoHideMenuBar: true,
    icon: path.join(__dirname, '..', 'build', 'icon.ico'),
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
