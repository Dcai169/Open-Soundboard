const { app, BrowserWindow, globalShortcut, ipcRenderer, ipcMain, Menu, MenuItem, Tray } = require('electron');
const path = require('path');
const fs = require('fs');
const Binding = require('./Binding');
var config = require('./../data/binding-config.json');

let tray = null // placeholder for tray

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Send bindings to renderer process.
  mainWindow.webContents.send('sync-config', JSON.stringify(config));

  // Create Tray Icon
  if (!tray) {
    tray = new Tray('./src/contents/placeholder_icon.png');
    tray.setToolTip('Open Soundboard');
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: 'Configure', type: 'normal', click: (menuItem, browserWindow, event) => { (BrowserWindow.getAllWindows().length === 0 ? createWindow() : mainWindow.focus()) } },
      { label: 'Quit', type: 'normal', click: (menuItem, browserWindow, event) => { app.quit() } },
    ]));
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (!config["close-to-tray"]) {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

async function readBindings() {
  let data = fs.readFile('./../data/binding-config.json');
  return JSON.parse(data);
}

ipcMain.handle('add-binding', async (event, arg) => {
  let newBind = JSON.parse(arg);
  console.log(newBind);

  // Stuff to do when user registers a new binding
  globalShortcut.register(newBind.key_bind, generate_callback(newBind));
  return 200;
});

function generate_callback(bind) {
  // Add binding to config file
  config.bindings.push(bind);

  // Return a function to be used as a callback on shortcut press
  return () => {
    console.log(bind.file_path);
  };
}

