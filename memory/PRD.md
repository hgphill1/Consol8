# CONSOLE-8X Digital 8-Track Recorder - PRD

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
- Retro 80s + cyberpunk aesthetic

## Desktop App Requirements
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
- **App Icon**: Custom SVG icon with 8-channel mixer design

### Icon Created
- Location: `/app/desktop-app/assets/icon.svg`
- Design: 8-channel mixer with CONSOLE-8X branding
- Cyberpunk color scheme (cyan/pink accents)
- Convert to .icns for macOS using iconutil

## Build Instructions

### Desktop App Build
```bash
cd /app/desktop-app
./build.sh
```

### Creating macOS Icon
```bash
# Install librsvg (for SVG to PNG conversion)
brew install librsvg

# Convert SVG to PNG
rsvg-convert -w 1024 -h 1024 icon.svg > icon.png

# Create iconset
mkdir icon.iconset
sips -z 16 16 icon.png --out icon.iconset/icon_16x16.png
sips -z 32 32 icon.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32 icon.png --out icon.iconset/icon_32x32.png
sips -z 64 64 icon.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128 icon.png --out icon.iconset/icon_128x128.png
sips -z 256 256 icon.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256 icon.png --out icon.iconset/icon_256x256.png
sips -z 512 512 icon.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512 icon.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png

# Create .icns file
iconutil -c icns icon.iconset -o assets/icon.icns
```

## Next Action Items
1. Code signing for distribution (requires Apple Developer ID)
2. Windows build support
3. Track automation curves
4. Undo/redo history
