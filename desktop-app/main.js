const { app, BrowserWindow, Menu, dialog, ipcMain, systemPreferences } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');

// Initialize persistent storage
const store = new Store();

let mainWindow;

// Create the main application window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: 'CONSOLE-8X Digital Recorder',
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#050505',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true
    }
  });

  // Load the React app
  const isDev = process.env.NODE_ENV === 'development';
  
  // Try multiple paths for the build
  const possiblePaths = [
    path.join(__dirname, 'build', 'index.html'),
    path.join(process.resourcesPath, 'app', 'build', 'index.html'),
    path.join(app.getAppPath(), 'build', 'index.html')
  ];
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // Find the first path that exists
    let loadPath = possiblePaths[0];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        loadPath = p;
        break;
      }
    }
    
    console.log('Loading from:', loadPath);
    mainWindow.loadFile(loadPath);
    
    // Open dev tools to debug if needed
    // mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create application menu
  createMenu();
}

// Create native menu bar
function createMenu() {
  const template = [
    {
      label: 'CONSOLE-8X',
      submenu: [
        { label: 'About CONSOLE-8X', role: 'about' },
        { type: 'separator' },
        {
          label: 'Preferences...',
          accelerator: 'CmdOrCtrl+,',
          click: () => showPreferences()
        },
        { type: 'separator' },
        { label: 'Hide CONSOLE-8X', role: 'hide' },
        { label: 'Hide Others', role: 'hideOthers' },
        { label: 'Show All', role: 'unhide' },
        { type: 'separator' },
        { label: 'Quit', role: 'quit' }
      ]
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow.webContents.send('menu-new-project')
        },
        {
          label: 'Open Project...',
          accelerator: 'CmdOrCtrl+O',
          click: () => openProject()
        },
        { type: 'separator' },
        {
          label: 'Save Project',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow.webContents.send('menu-save-project')
        },
        {
          label: 'Save Project As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => saveProjectAs()
        },
        { type: 'separator' },
        {
          label: 'Import Audio...',
          accelerator: 'CmdOrCtrl+I',
          click: () => importAudio()
        },
        {
          label: 'Export Mixdown...',
          accelerator: 'CmdOrCtrl+E',
          click: () => mainWindow.webContents.send('menu-export')
        },
        { type: 'separator' },
        { label: 'Close', role: 'close' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', role: 'undo' },
        { label: 'Redo', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', role: 'cut' },
        { label: 'Copy', role: 'copy' },
        { label: 'Paste', role: 'paste' },
        { label: 'Select All', role: 'selectAll' }
      ]
    },
    {
      label: 'Transport',
      submenu: [
        {
          label: 'Play/Pause',
          accelerator: 'Space',
          click: () => mainWindow.webContents.send('transport-play-pause')
        },
        {
          label: 'Stop',
          accelerator: 'Escape',
          click: () => mainWindow.webContents.send('transport-stop')
        },
        {
          label: 'Record',
          accelerator: 'R',
          click: () => mainWindow.webContents.send('transport-record')
        },
        { type: 'separator' },
        {
          label: 'Rewind',
          accelerator: 'Left',
          click: () => mainWindow.webContents.send('transport-rewind')
        },
        {
          label: 'Fast Forward',
          accelerator: 'Right',
          click: () => mainWindow.webContents.send('transport-forward')
        },
        { type: 'separator' },
        {
          label: 'Go to Start',
          accelerator: 'Home',
          click: () => mainWindow.webContents.send('transport-goto-start')
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Mixer',
          accelerator: 'CmdOrCtrl+M',
          click: () => mainWindow.webContents.send('view-toggle-mixer')
        },
        { type: 'separator' },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => mainWindow.webContents.send('view-zoom-in')
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: () => mainWindow.webContents.send('view-zoom-out')
        },
        {
          label: 'Reset Zoom',
          accelerator: 'CmdOrCtrl+0',
          click: () => mainWindow.webContents.send('view-zoom-reset')
        },
        { type: 'separator' },
        { label: 'Toggle Full Screen', role: 'togglefullscreen' },
        { type: 'separator' },
        { label: 'Toggle Developer Tools', role: 'toggleDevTools' }
      ]
    },
    {
      label: 'Audio',
      submenu: [
        {
          label: 'Audio Device Settings...',
          click: () => showAudioSettings()
        },
        { type: 'separator' },
        {
          label: 'Toggle Metronome',
          accelerator: 'CmdOrCtrl+K',
          click: () => mainWindow.webContents.send('audio-toggle-metronome')
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { label: 'Minimize', role: 'minimize' },
        { label: 'Zoom', role: 'zoom' },
        { type: 'separator' },
        { label: 'Bring All to Front', role: 'front' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Keyboard Shortcuts',
          click: () => showKeyboardShortcuts()
        },
        { type: 'separator' },
        {
          label: 'CONSOLE-8X Documentation',
          click: () => {
            require('electron').shell.openExternal('https://github.com/tascam-8x/docs');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Open project file
async function openProject() {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Open Project',
    filters: [
      { name: 'TASCAM-8X Project', extensions: ['t8x', 'json'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ['openFile']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      const project = JSON.parse(data);
      mainWindow.webContents.send('project-opened', { filePath, project });
    } catch (err) {
      dialog.showErrorBox('Error', `Failed to open project: ${err.message}`);
    }
  }
}

// Save project as
async function saveProjectAs() {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Project As',
    defaultPath: 'Untitled.t8x',
    filters: [
      { name: 'TASCAM-8X Project', extensions: ['t8x'] }
    ]
  });

  if (!result.canceled && result.filePath) {
    mainWindow.webContents.send('save-project-as', { filePath: result.filePath });
  }
}

// Import audio file
async function importAudio() {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Import Audio',
    filters: [
      { name: 'Audio Files', extensions: ['wav', 'mp3', 'aiff', 'flac', 'ogg', 'm4a'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ['openFile', 'multiSelections']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    mainWindow.webContents.send('audio-imported', { filePaths: result.filePaths });
  }
}

// Show audio settings dialog
function showAudioSettings() {
  mainWindow.webContents.send('show-audio-settings');
}

// Show preferences
function showPreferences() {
  mainWindow.webContents.send('show-preferences');
}

// Show keyboard shortcuts
function showKeyboardShortcuts() {
  const shortcuts = `
CONSOLE-8X Keyboard Shortcuts

Transport:
  Space - Play/Pause
  R - Record
  Escape - Stop
  ← → - Rewind/Fast Forward
  Home - Go to Start

File:
  ⌘N - New Project
  ⌘O - Open Project
  ⌘S - Save Project
  ⌘⇧S - Save As
  ⌘I - Import Audio
  ⌘E - Export Mixdown

View:
  ⌘M - Toggle Mixer
  ⌘+ - Zoom In
  ⌘- - Zoom Out
  ⌘0 - Reset Zoom

Audio:
  ⌘K - Toggle Metronome
  `;
  
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Keyboard Shortcuts',
    message: shortcuts,
    buttons: ['OK']
  });
}

// IPC Handlers

// Save project to file
ipcMain.handle('save-project-to-file', async (event, { filePath, projectData }) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(projectData, null, 2));
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Read file
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    return { success: true, buffer: buffer.buffer };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Save file (for export)
ipcMain.handle('save-file', async (event, { defaultName, filters, data }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Audio',
    defaultPath: defaultName,
    filters: filters
  });

  if (!result.canceled && result.filePath) {
    try {
      fs.writeFileSync(result.filePath, Buffer.from(data));
      return { success: true, filePath: result.filePath };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
  return { success: false, canceled: true };
});

// Get audio devices
ipcMain.handle('get-audio-devices', async () => {
  // Note: Actual device enumeration happens in renderer via navigator.mediaDevices
  // This is a placeholder for any native audio device handling
  return { success: true };
});

// Store get/set
ipcMain.handle('store-get', (event, key) => {
  return store.get(key);
});

ipcMain.handle('store-set', (event, key, value) => {
  store.set(key, value);
  return true;
});

// Request microphone permission (macOS)
ipcMain.handle('request-microphone-permission', async () => {
  if (process.platform === 'darwin') {
    const status = systemPreferences.getMediaAccessStatus('microphone');
    if (status !== 'granted') {
      const granted = await systemPreferences.askForMediaAccess('microphone');
      return granted;
    }
    return true;
  }
  return true;
});

// App lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle certificate errors (for development)
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  event.preventDefault();
  callback(true);
});
