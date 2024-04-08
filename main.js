// -*- coding: utf-8 -*-

const { app, BrowserWindow, ipcMain, nativeTheme, globalShortcut,
  dialog, shell, Notification , nativeImage ,Menu 
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

  let template = [
    {
      label: '文件',
      submenu: [
        {label: '打开',
        accelerator: 'Ctrl+O',
        click(){
          console.log("open")
        }
        }
      ]
    },
    {
    label: '编辑',
    submenu: [{
      label: '撤销',
      accelerator: 'CmdOrCtrl+Z',
      role: 'undo'
    }, {
      label: '重做',
      accelerator: 'Shift+CmdOrCtrl+Z',
      role: 'redo'
    }, {
      type: 'separator'
    }, {
      label: '剪切',
      accelerator: 'CmdOrCtrl+X',
      role: 'cut'
    }, {
      label: '复制',
      accelerator: 'CmdOrCtrl+C',
      role: 'copy'
    }, {
      label: '粘贴',
      accelerator: 'CmdOrCtrl+V',
      role: 'paste'
    }, {
      label: '全选',
      accelerator: 'CmdOrCtrl+A',
      role: 'selectall'
    }]
  }, {
    label: '查看',
    submenu: [{
      label: '重载',
      accelerator: 'CmdOrCtrl+R',
      click: function (item, focusedWindow) {
        if (focusedWindow) {
          // 重载之后, 刷新并关闭所有的次要窗体
          if (focusedWindow.id === 1) {
            BrowserWindow.getAllWindows().forEach(function (win) {
              if (win.id > 1) {
                win.close()
              }
            })
          }
          focusedWindow.reload()
        }
      }
    }, {
      label: '切换全屏',
      accelerator: (function () {
        if (process.platform === 'darwin') {
          return 'Ctrl+Command+F'
        } else {
          return 'F11'
        }
      })(),
      click: function (item, focusedWindow) {
        if (focusedWindow) {
          focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
        }
      }
    }, {
      label: '切换开发者工具',
      accelerator: (function () {
        if (process.platform === 'darwin') {
          return 'Alt+Command+I'
        } else {
          return 'Ctrl+Shift+I'
        }
      })(),
      click: function (item, focusedWindow) {
        if (focusedWindow) {
          focusedWindow.toggleDevTools()
        }
      }
    }, {
      type: 'separator'
    }, {
      label: '应用程序菜单演示',
      click: function (item, focusedWindow) {
        if (focusedWindow) {
          const options = {
            type: 'info',
            title: '应用程序菜单演示',
            buttons: ['好的'],
            message: '此演示用于 "菜单" 部分, 展示如何在应用程序菜单中创建可点击的菜单项.'
          }
          dialog.showMessageBox(focusedWindow, options, function () {})
        }
      }
    }]
  }, {
    label: '窗口',
    role: 'window',
    submenu: [{
      label: '最小化',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize'
    }, {
      label: '关闭',
      accelerator: 'CmdOrCtrl+W',
      role: 'close'
    }, {
      type: 'separator'
    }, {
      label: '重新打开窗口',
      accelerator: 'CmdOrCtrl+Shift+T',
      enabled: false,
      key: 'reopenMenuItem',
      click: function () {
        app.emit('activate')
      }
    }]
  }, {
    label: '帮助',
    role: 'help',
    submenu: [{
      label: '学习更多',
      click: function () {
        shell.openExternal('http://electron.atom.io')
      }
    }]
  }]

  // 获取当前应用程序菜单
  const existingMenu = Menu.getApplicationMenu();

  const translatedMenuTemplate = existingMenu.items.map(menuItem => {
    if (menuItem.label === 'File') {
      menuItem.label = '文件';
    } else if (menuItem.label === 'Edit' || menuItem.label === '编辑') {
      menuItem.label = '编辑1';
    } else if (menuItem.label === 'View') {
      menuItem.label = '视图';
    }
    return menuItem;
  });

  // 创建新的菜单模板
  const newMenuTemplate = [
    // 添加原有的菜单项
    ...translatedMenuTemplate,
    // 添加新的菜单项
    ...template
  ];

  // 创建菜单对象
  const newMenu = Menu.buildFromTemplate(newMenuTemplate);

  // 将菜单应用到窗口
  Menu.setApplicationMenu(newMenu);

  ipcMain.handle('dark-mode:toggle', () => {
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = 'light'
    } else {
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