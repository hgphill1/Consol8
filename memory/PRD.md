# TASCAM-8X Digital 8-Track Recorder - PRD

## Original Problem Statement
Build a digital eight track recorder application similar to TASCAM 8-tracker with:
- Hard limit of 8 tracks with bounce capability
- Built-in metronome
- Punch in/out based on measure/beat (not just timecode)
- Tempo/BPM setting per project
- Audio file import (drag & drop)
- Microphone recording
- Track effects: Hall reverb, analog delay, Hi/Mid/Low EQ
- Waveform visualization
- WAV/MP3 export
- Browser local storage
- Retro 80s TASCAM + cyberpunk aesthetic
- Analog-style sliders and faux-LCD display

## User Personas
1. **Home Recording Artists** - Musicians who need a simple, intuitive multitrack recorder
2. **Podcast Producers** - Content creators who need to layer multiple audio tracks
3. **Beat Makers** - Producers who want to record loops and samples with precise timing

## Core Requirements (Static)
- [x] 8-track hard limit with bounce-to-one capability
- [x] Built-in metronome with BPM control
- [x] Measure/beat-based punch in/out
- [x] Audio file import via drag-drop
- [x] Microphone recording (Web Audio API)
- [x] Track effects: Reverb, Delay, EQ (High/Mid/Low)
- [x] Waveform visualization (Canvas API)
- [x] WAV export (MP3 pending encoder)
- [x] IndexedDB/localStorage for project persistence

## What's Been Implemented (January 2026)

### Frontend Components
- **LCDDisplay**: Faux-LCD panel showing timecode, measure:beat, BPM with metronome toggle
- **TrackTimeline**: 8 horizontal tracks with waveform visualization, drag-drop import
- **ChannelStrip**: Volume fader, pan, EQ knobs (Hi/Mid/Lo), reverb/delay sends
- **TransportControls**: Play, Pause, Stop, Record, Rewind, Fast Forward
- **BounceDialog**: Select multiple tracks to bounce to single track
- **ExportDialog**: Export mixdown as WAV/MP3

### Audio Engine (useAudioEngine hook)
- Web Audio API based processing
- BiquadFilter for 3-band EQ
- ConvolverNode for hall reverb
- DelayNode with feedback for analog delay
- MediaRecorder for microphone input
- Metronome with precise scheduling

### UI/UX
- Retro 80s TASCAM aesthetic with cyberpunk colors
- Neon cyan (#05D9E8) and pink (#FF2A6D) accents
- VT323 font for LCD displays
- Analog-style volume faders
- Scanline effect on LCD screen

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] 8-track recording/playback
- [x] Audio file import
- [x] Waveform visualization
- [x] Transport controls
- [x] Volume/Pan mixing

### P1 (Important) - Partially Done
- [x] Metronome
- [x] Bounce tracks
- [x] Effects (Reverb/Delay/EQ)
- [x] Punch in/out UI
- [ ] Actual punch recording logic
- [ ] MP3 encoder integration

### P2 (Nice to Have)
- [ ] Undo/Redo history
- [ ] Track copy/paste
- [ ] Time signature changes
- [ ] Multiple project slots
- [ ] Audio waveform zoom
- [ ] Track automation

## Next Action Items
1. Implement actual punch-in recording logic (trigger recording at specified measure/beat)
2. Add MP3 encoder library for MP3 export
3. Improve audio buffer serialization for full project save/restore
4. Add keyboard shortcut help overlay
5. Consider adding track automation curves
