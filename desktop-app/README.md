# TASCAM-8X Desktop App

A macOS desktop application version of the TASCAM-8X Digital 8-Track Recorder.

## Features

- **Native macOS Application** - Runs as a standalone .app with full system integration
- **Native File System Access** - Save/load projects to any location on your Mac
- **Menu Bar Integration** - Full menu bar with keyboard shortcuts
- **System Audio Device Selection** - Choose your input/output audio devices
- **Native Export** - Export directly to files using native dialogs

## Prerequisites

Before building, ensure you have:

1. **Node.js** (v18 or later)
2. **Yarn** package manager
3. **Xcode Command Line Tools** (for macOS builds)

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Node.js (using Homebrew)
brew install node

# Install Yarn
npm install -g yarn
```

## Building the Desktop App

### Step 1: Install Dependencies

```bash
# Install desktop app dependencies
cd desktop-app
npm install

# Install frontend dependencies (if not already done)
cd ../frontend
yarn install
```

### Step 2: Build the React Frontend

```bash
cd ../frontend
yarn build
```

### Step 3: Copy Build to Desktop App

```bash
# Copy the React build to the desktop app
cp -r build ../desktop-app/
```

### Step 4: Build the macOS DMG

```bash
cd ../desktop-app
npm run build:mac
```

The built `.dmg` file will be in `desktop-app/dist/`.

## Development Mode

To run the app in development mode:

```bash
# Terminal 1: Start the React dev server
cd frontend
yarn start

# Terminal 2: Start Electron in dev mode
cd desktop-app
NODE_ENV=development npm start
```

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Play/Pause | Space |
| Record | R |
| Stop | Escape |
| Rewind | ← |
| Fast Forward | → |
| Go to Start | Home |
| New Project | ⌘N |
| Open Project | ⌘O |
| Save Project | ⌘S |
| Save As | ⌘⇧S |
| Import Audio | ⌘I |
| Export Mixdown | ⌘E |
| Toggle Mixer | ⌘M |
| Zoom In | ⌘+ |
| Zoom Out | ⌘- |
| Reset Zoom | ⌘0 |
| Toggle Metronome | ⌘K |

## Project Structure

```
desktop-app/
├── main.js              # Electron main process
├── preload.js           # Preload script for IPC
├── package.json         # Electron dependencies and build config
├── entitlements.mac.plist  # macOS permissions
├── assets/              # App icons and resources
│   └── icon.icns        # macOS app icon
├── build/               # React production build (copied)
└── dist/                # Built installers
```

## Creating the App Icon

To create a proper macOS app icon:

1. Create a 1024x1024 PNG image for your icon
2. Use iconutil to create the .icns file:

```bash
# Create iconset directory
mkdir icon.iconset

# Create required sizes
sips -z 16 16     icon.png --out icon.iconset/icon_16x16.png
sips -z 32 32     icon.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32     icon.png --out icon.iconset/icon_32x32.png
sips -z 64 64     icon.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128   icon.png --out icon.iconset/icon_128x128.png
sips -z 256 256   icon.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256   icon.png --out icon.iconset/icon_256x256.png
sips -z 512 512   icon.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512   icon.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png

# Create icns file
iconutil -c icns icon.iconset -o assets/icon.icns
```

## Code Signing (Optional)

For distribution outside the App Store, you may want to sign the app:

```bash
# Sign the app
codesign --deep --force --verify --verbose --sign "Developer ID Application: YOUR NAME" dist/mac/TASCAM-8X.app

# Notarize the DMG
xcrun notarytool submit dist/TASCAM-8X-*.dmg --apple-id YOUR_APPLE_ID --password YOUR_APP_SPECIFIC_PASSWORD --team-id YOUR_TEAM_ID
```

## Troubleshooting

### "App is damaged" error on macOS
If you see this error, it's because the app isn't signed. Run:
```bash
xattr -cr /Applications/TASCAM-8X.app
```

### Audio permissions
The app will request microphone permissions on first launch. If denied, go to:
System Preferences → Security & Privacy → Microphone → Enable TASCAM-8X

### Build failures
Make sure you have the latest Xcode Command Line Tools:
```bash
sudo xcode-select --reset
xcode-select --install
```

## License

MIT License
