const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  saveProjectToFile: (filePath, projectData) => 
    ipcRenderer.invoke('save-project-to-file', { filePath, projectData }),
  
  readFile: (filePath) => 
    ipcRenderer.invoke('read-file', filePath),
  
  saveFile: (defaultName, filters, data) => 
    ipcRenderer.invoke('save-file', { defaultName, filters, data }),
  
  // Storage
  storeGet: (key) => ipcRenderer.invoke('store-get', key),
  storeSet: (key, value) => ipcRenderer.invoke('store-set', key, value),
  
  // Audio
  getAudioDevices: () => ipcRenderer.invoke('get-audio-devices'),
  requestMicrophonePermission: () => ipcRenderer.invoke('request-microphone-permission'),
  
  // Menu event listeners
  onNewProject: (callback) => ipcRenderer.on('menu-new-project', callback),
  onSaveProject: (callback) => ipcRenderer.on('menu-save-project', callback),
  onSaveProjectAs: (callback) => ipcRenderer.on('save-project-as', callback),
  onExport: (callback) => ipcRenderer.on('menu-export', callback),
  onProjectOpened: (callback) => ipcRenderer.on('project-opened', callback),
  onAudioImported: (callback) => ipcRenderer.on('audio-imported', callback),
  
  // Transport controls
  onPlayPause: (callback) => ipcRenderer.on('transport-play-pause', callback),
  onStop: (callback) => ipcRenderer.on('transport-stop', callback),
  onRecord: (callback) => ipcRenderer.on('transport-record', callback),
  onRewind: (callback) => ipcRenderer.on('transport-rewind', callback),
  onForward: (callback) => ipcRenderer.on('transport-forward', callback),
  onGotoStart: (callback) => ipcRenderer.on('transport-goto-start', callback),
  
  // View controls
  onToggleMixer: (callback) => ipcRenderer.on('view-toggle-mixer', callback),
  onZoomIn: (callback) => ipcRenderer.on('view-zoom-in', callback),
  onZoomOut: (callback) => ipcRenderer.on('view-zoom-out', callback),
  onZoomReset: (callback) => ipcRenderer.on('view-zoom-reset', callback),
  
  // Audio controls
  onToggleMetronome: (callback) => ipcRenderer.on('audio-toggle-metronome', callback),
  onShowAudioSettings: (callback) => ipcRenderer.on('show-audio-settings', callback),
  onShowPreferences: (callback) => ipcRenderer.on('show-preferences', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // Platform info
  platform: process.platform,
  isElectron: true
});

// Log that preload script has loaded
console.log('TASCAM-8X Electron preload script loaded');
