const { app, BrowserWindow, ipcMain, nativeTheme, globalShortcut,
  dialog, shell, Notification , nativeImage 
} = require('electron/main')
const path = require('node:path')

let mainWindow

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('electron-fiddle', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('electron-fiddle')
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }

    dialog.showErrorBox('Welcome Back', `You arrived from: ${commandLine.pop().slice(0, -1)}`)
  })

  
  app.whenReady().then(() => {
    globalShortcut.register('Alt+I', () => {
      console.log('Electron loves global shortcuts!')
      dialog.showMessageBox({
        type: 'info',
        title: '提示',
        message: 'message'
      });
      new Notification({
        title: 'NOTIFICATION_TITLE',
        icon:'./images/icon.png',
        body: 'NOTIFICATION_BODY'
      }).show()
    })
    
    ipcMain.handle('ping', () => 'pong')
    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  })

  app.on('open-url', (event, url) => {
    dialog.showErrorBox('Welcome Back', `You arrived from: ${url}`)
  })
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon:"./images/icon.png",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadFile('index.html')
  
  mainWindow.setThumbarButtons([
    {
      tooltip: 'button1',
      icon: nativeImage.createFromPath(path.join(__dirname, './images/a1.png')),
      click () { console.log('button1 clicked') }
    }, {
      tooltip: 'button2',
      icon: nativeImage.createFromPath(path.join(__dirname, './images/a2.png')),
      flags: ['enabled', 'dismissonclick'],
      click () { console.log('button2 clicked.') }
    }
  ])
  mainWindow.setOverlayIcon(nativeImage.createFromPath('./images/a1.png'), 'Description for overlay')



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


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Handle window controls via IPC
ipcMain.on('shell:open', () => {
  const pageDirectory = __dirname.replace('app.asar', 'app.asar.unpacked')
  const pagePath = path.join('file://', pageDirectory, 'index.html')
  shell.openExternal(pagePath)
})

// jumpList
app.setUserTasks([
  {
    program: process.execPath,
    arguments: '--new-window',
    iconPath: process.execPath,
    iconIndex: 0,
    title: 'New Window',
    description: 'Create a new window'
  }
])

// 热加载
try {
  require('electron-reloader')(module, {});
} catch (_) {}