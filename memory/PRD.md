# TASCAM-8X Digital 8-Track Recorder - PRD

## Original Problem Statement
Build a digital eight track recorder application similar to TASCAM 8-tracker with:
- Hard limit of 8 tracks with bounce capability
- Built-in metronome
- Punch in/out based on measure/beat
- Tempo/BPM setting per project
- Audio file import (drag & drop)
- Microphone recording
- Track effects: Hall reverb, analog delay, Hi/Mid/Low EQ
- Waveform visualization
- WAV/MP3 export
- Browser local storage
- Retro 80s TASCAM + cyberpunk aesthetic

## Desktop App Requirements (Added)
- macOS desktop application using Electron
- DMG installer
- Native file system access
- Menu bar integration
- System audio device selection

## What's Been Implemented (January 2026)

### Web Application Features
- **8-Track Recording**: Hard-limited with microphone recording and file import
- **LCD Display**: Faux-LCD with timecode, measure:beat, BPM
- **Transport Controls**: Play, Pause, Stop, Record, Rewind, FF
- **Mixer Section**: 8 channels with volume faders, pan, 3-band EQ, reverb/delay
- **Punch In/Out**: Measure/beat-based recording points
- **Bounce & Export**: Merge tracks, export WAV/MP3 (192kbps via lamejs)
- **Timeline**: Zoom (1x-10x), navigation, click-to-seek, time ruler
- **Audio Settings**: Device selection, sample rate, buffer size

### Desktop App (Electron)
- **main.js**: Main process with native menus and IPC
- **preload.js**: Secure context bridge for renderer
- **Native Menu Bar**: Full menu with File, Edit, Transport, View, Audio, Window, Help
- **File Operations**: Open/Save project dialogs, Import audio
- **Audio Settings**: Native device enumeration
- **Keyboard Shortcuts**: Space=Play, R=Record, ⌘S=Save, etc.
- **macOS Entitlements**: Microphone access, file access
- **DMG Build Config**: electron-builder configuration

### File Structure
```
/app/
├── frontend/           # React web app
│   └── src/
│       ├── components/
│       │   ├── AudioSettingsDialog.jsx
│       │   ├── BounceDialog.jsx
│       │   ├── ChannelStrip.jsx
│       │   ├── ExportDialog.jsx
│       │   ├── LCDDisplay.jsx
│       │   ├── TrackTimeline.jsx
│       │   ├── TransportControls.jsx
│       │   └── WaveformCanvas.jsx
│       ├── hooks/
│       │   ├── useAudioEngine.js
│       │   └── useElectron.js
│       └── utils/
│           └── audioUtils.js
│
└── desktop-app/        # Electron wrapper
    ├── main.js
    ├── preload.js
    ├── package.json
    ├── entitlements.mac.plist
    ├── build.sh
    └── README.md
```

## Build Instructions

### Desktop App Build
```bash
cd /app/desktop-app
./build.sh
```

Or manually:
```bash
cd /app/frontend && yarn build
cd /app/desktop-app && npm install
cp -r ../frontend/build .
npm run build:mac
```

The DMG will be in `desktop-app/dist/`.

## Next Action Items
1. Add app icon (1024x1024 PNG → .icns)
2. Code signing for distribution
3. Windows build support
4. Track automation curves
5. Undo/redo history
