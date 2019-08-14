const {
  app,
  BrowserWindow,
  ipcMain,
} = require('electron');
const path = require('path');

app.setAppUserModelId(process.execPath);
let mainWindow;

ipcMain.on('setUserData', (event, data) => {
  global.userData = data;
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
    icon: path.join(__dirname, '/favicon.png'),
  });

  mainWindow.loadFile('./pages/index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
