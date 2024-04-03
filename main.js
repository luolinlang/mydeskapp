const { app, BrowserWindow, ipcMain, nativeTheme, globalShortcut,
  dialog
} = require('electron/main')
const path = require('node:path')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon:"./images/icon.png",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')

  ipcMain.handle('dark-mode:toggle', () => {
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = 'light'
    } else {4
      nativeTheme.themeSource = 'dark'
    }
    return nativeTheme.shouldUseDarkColors
  })

  ipcMain.handle('dark-mode:system', () => {
    nativeTheme.themeSource = 'system'
  })

  
}

app.whenReady().then(() => {
  globalShortcut.register('Alt+I', () => {
    console.log('Electron loves global shortcuts!')
    dialog.showMessageBox({
      type: 'info',
      title: '提示',
      message: 'message'
    });
  })
  
  ipcMain.handle('ping', () => 'pong')
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

try {
  require('electron-reloader')(module, {});
} catch (_) {}