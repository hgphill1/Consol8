import { useEffect, useCallback } from 'react';

// Check if running in Electron
export const isElectron = () => {
  return window.electronAPI !== undefined;
};

// Hook to handle Electron menu commands
export function useElectronMenus({
  onNewProject,
  onSaveProject,
  onSaveProjectAs,
  onExport,
  onProjectOpened,
  onAudioImported,
  onPlayPause,
  onStop,
  onRecord,
  onRewind,
  onForward,
  onGotoStart,
  onToggleMixer,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onToggleMetronome,
  onShowAudioSettings,
  onShowPreferences,
}) {
  useEffect(() => {
    if (!isElectron()) return;

    const api = window.electronAPI;

    // File operations
    if (onNewProject) api.onNewProject(onNewProject);
    if (onSaveProject) api.onSaveProject(onSaveProject);
    if (onSaveProjectAs) api.onSaveProjectAs((_, data) => onSaveProjectAs(data));
    if (onExport) api.onExport(onExport);
    if (onProjectOpened) api.onProjectOpened((_, data) => onProjectOpened(data));
    if (onAudioImported) api.onAudioImported((_, data) => onAudioImported(data));

    // Transport
    if (onPlayPause) api.onPlayPause(onPlayPause);
    if (onStop) api.onStop(onStop);
    if (onRecord) api.onRecord(onRecord);
    if (onRewind) api.onRewind(onRewind);
    if (onForward) api.onForward(onForward);
    if (onGotoStart) api.onGotoStart(onGotoStart);

    // View
    if (onToggleMixer) api.onToggleMixer(onToggleMixer);
    if (onZoomIn) api.onZoomIn(onZoomIn);
    if (onZoomOut) api.onZoomOut(onZoomOut);
    if (onZoomReset) api.onZoomReset(onZoomReset);

    // Audio
    if (onToggleMetronome) api.onToggleMetronome(onToggleMetronome);
    if (onShowAudioSettings) api.onShowAudioSettings(onShowAudioSettings);
    if (onShowPreferences) api.onShowPreferences(onShowPreferences);

    return () => {
      // Cleanup listeners
      api.removeAllListeners('menu-new-project');
      api.removeAllListeners('menu-save-project');
      api.removeAllListeners('save-project-as');
      api.removeAllListeners('menu-export');
      api.removeAllListeners('project-opened');
      api.removeAllListeners('audio-imported');
      api.removeAllListeners('transport-play-pause');
      api.removeAllListeners('transport-stop');
      api.removeAllListeners('transport-record');
      api.removeAllListeners('transport-rewind');
      api.removeAllListeners('transport-forward');
      api.removeAllListeners('transport-goto-start');
      api.removeAllListeners('view-toggle-mixer');
      api.removeAllListeners('view-zoom-in');
      api.removeAllListeners('view-zoom-out');
      api.removeAllListeners('view-zoom-reset');
      api.removeAllListeners('audio-toggle-metronome');
      api.removeAllListeners('show-audio-settings');
      api.removeAllListeners('show-preferences');
    };
  }, [
    onNewProject, onSaveProject, onSaveProjectAs, onExport,
    onProjectOpened, onAudioImported, onPlayPause, onStop,
    onRecord, onRewind, onForward, onGotoStart, onToggleMixer,
    onZoomIn, onZoomOut, onZoomReset, onToggleMetronome,
    onShowAudioSettings, onShowPreferences
  ]);
}

// Save file using Electron's native dialog
export async function saveFileNative(defaultName, filters, data) {
  if (!isElectron()) {
    // Fallback for web
    const blob = new Blob([data]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = defaultName;
    a.click();
    URL.revokeObjectURL(url);
    return { success: true };
  }

  return window.electronAPI.saveFile(defaultName, filters, data);
}

// Read file using Electron
export async function readFileNative(filePath) {
  if (!isElectron()) {
    return { success: false, error: 'Not running in Electron' };
  }
  return window.electronAPI.readFile(filePath);
}

// Save project to file
export async function saveProjectToFile(filePath, projectData) {
  if (!isElectron()) {
    // Fallback to localStorage for web
    localStorage.setItem('tascam8x_project', JSON.stringify(projectData));
    return { success: true };
  }
  return window.electronAPI.saveProjectToFile(filePath, projectData);
}

// Store operations
export async function storeGet(key) {
  if (!isElectron()) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }
  return window.electronAPI.storeGet(key);
}

export async function storeSet(key, value) {
  if (!isElectron()) {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  }
  return window.electronAPI.storeSet(key, value);
}

// Request microphone permission
export async function requestMicrophonePermission() {
  if (isElectron()) {
    return window.electronAPI.requestMicrophonePermission();
  }
  // For web, just try to get user media
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch {
    return false;
  }
}
