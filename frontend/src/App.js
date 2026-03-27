import React, { useEffect, useState } from 'react';
import './App.css';
import { useAudioEngine } from './hooks/useAudioEngine';
import { LCDDisplay } from './components/LCDDisplay';
import { TrackTimeline } from './components/TrackTimeline';
import { TransportControls } from './components/TransportControls';
import { ChannelStrip } from './components/ChannelStrip';
import { BounceDialog } from './components/BounceDialog';
import { ExportDialog } from './components/ExportDialog';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { 
  Faders, 
  Waveform, 
  FloppyDisk,
  FolderOpen,
  Info
} from '@phosphor-icons/react';
import localforage from 'localforage';

// Initialize storage
localforage.config({
  name: 'TASCAM8X',
  storeName: 'projects'
});

function App() {
  const [projectName, setProjectName] = useState('Untitled Project');
  const [showMixer, setShowMixer] = useState(true);
  const [recordingTrack, setRecordingTrack] = useState(null);
  
  const {
    isInitialized,
    isPlaying,
    isRecording,
    isPunchRecording,
    currentTime,
    bpm,
    setBpm,
    metronomeEnabled,
    setMetronomeEnabled,
    tracks,
    punchInEnabled,
    setPunchInEnabled,
    punchInMeasure,
    setPunchInMeasure,
    punchInBeat,
    setPunchInBeat,
    punchOutMeasure,
    setPunchOutMeasure,
    punchOutBeat,
    setPunchOutBeat,
    zoomLevel,
    setZoomLevel,
    scrollPosition,
    setScrollPosition,
    initAudio,
    play,
    pause,
    stop,
    seekTo,
    startRecording,
    stopRecording,
    updateTrack,
    loadAudioToTrack,
    clearTrack,
    bounceTracks,
    exportProject,
  } = useAudioEngine();
  
  // Initialize audio on first interaction
  const handleInitialize = async () => {
    if (!isInitialized) {
      await initAudio();
      toast.success('Audio engine initialized', {
        description: 'Ready to record and play'
      });
    }
  };
  
  // Handle record button
  const handleRecord = () => {
    if (isRecording) {
      stopRecording();
      setRecordingTrack(null);
    } else {
      // Find first armed track
      const armedTrackIndex = tracks.findIndex(t => t.armed);
      if (armedTrackIndex >= 0) {
        setRecordingTrack(armedTrackIndex);
        startRecording(armedTrackIndex);
      } else {
        toast.error('No track armed', {
          description: 'Arm a track first by clicking the REC button on a channel'
        });
      }
    }
  };
  
  // Handle rewind (go back 4 beats)
  const handleRewind = () => {
    const beatDuration = 60 / bpm;
    seekTo(Math.max(0, currentTime - beatDuration * 4));
  };
  
  // Handle fast forward (go forward 4 beats)
  const handleFastForward = () => {
    const beatDuration = 60 / bpm;
    seekTo(currentTime + beatDuration * 4);
  };
  
  // Save project
  const handleSaveProject = async () => {
    try {
      const projectData = {
        name: projectName,
        bpm,
        tracks: tracks.map(t => ({
          id: t.id,
          name: t.name,
          volume: t.volume,
          pan: t.pan,
          muted: t.muted,
          solo: t.solo,
          eqHigh: t.eqHigh,
          eqMid: t.eqMid,
          eqLow: t.eqLow,
          reverbSend: t.reverbSend,
          delaySend: t.delaySend,
          // Note: Audio data would need ArrayBuffer serialization
          hasAudio: !!t.audioBuffer
        })),
        savedAt: new Date().toISOString()
      };
      
      await localforage.setItem(`project_${projectName}`, projectData);
      toast.success('Project saved', {
        description: `"${projectName}" saved to local storage`
      });
    } catch (err) {
      toast.error('Save failed', {
        description: err.message
      });
    }
  };
  
  // Load project
  const handleLoadProject = async () => {
    try {
      const keys = await localforage.keys();
      const projectKeys = keys.filter(k => k.startsWith('project_'));
      
      if (projectKeys.length === 0) {
        toast.info('No saved projects', {
          description: 'Save a project first to load it later'
        });
        return;
      }
      
      // For simplicity, load the most recent project
      const projectData = await localforage.getItem(projectKeys[projectKeys.length - 1]);
      if (projectData) {
        setProjectName(projectData.name);
        setBpm(projectData.bpm);
        // Restore track settings (audio would need separate handling)
        projectData.tracks.forEach((savedTrack, index) => {
          updateTrack(index, {
            name: savedTrack.name,
            volume: savedTrack.volume,
            pan: savedTrack.pan,
            muted: savedTrack.muted,
            solo: savedTrack.solo,
            eqHigh: savedTrack.eqHigh,
            eqMid: savedTrack.eqMid,
            eqLow: savedTrack.eqLow,
            reverbSend: savedTrack.reverbSend,
            delaySend: savedTrack.delaySend,
          });
        });
        
        toast.success('Project loaded', {
          description: `"${projectData.name}" restored`
        });
      }
    } catch (err) {
      toast.error('Load failed', {
        description: err.message
      });
    }
  };
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;
      
      switch(e.code) {
        case 'Space':
          e.preventDefault();
          if (isPlaying) pause();
          else play();
          break;
        case 'KeyR':
          if (e.metaKey || e.ctrlKey) return;
          handleRecord();
          break;
        case 'Escape':
          stop();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, play, pause, stop]);
  
  return (
    <div 
      className="min-h-screen p-4 md:p-6 font-body"
      style={{ background: 'var(--bg-base)' }}
      onClick={handleInitialize}
      data-testid="app-container"
    >
      <Toaster position="top-right" theme="dark" />
      
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 
            className="font-brand text-2xl sm:text-3xl tracking-tighter"
            style={{ 
              color: 'var(--accent-cyan)',
              textShadow: '0 0 20px var(--accent-cyan)'
            }}
            data-testid="app-title"
          >
            TASCAM-8X
          </h1>
          <span className="font-lcd text-xs text-[var(--accent-pink)]">DIGITAL</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Project Name */}
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="px-3 py-1.5 bg-[var(--hardware-surface)] border border-[var(--border-subtle)] rounded text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)] w-40"
            placeholder="Project name"
            data-testid="project-name-input"
          />
          
          {/* Save/Load */}
          <button
            onClick={handleSaveProject}
            className="p-2 rounded bg-[var(--hardware-surface)] text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-colors"
            title="Save Project"
            data-testid="save-project-btn"
          >
            <FloppyDisk className="w-5 h-5" />
          </button>
          <button
            onClick={handleLoadProject}
            className="p-2 rounded bg-[var(--hardware-surface)] text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-colors"
            title="Load Project"
            data-testid="load-project-btn"
          >
            <FolderOpen className="w-5 h-5" />
          </button>
          
          {/* Bounce & Export */}
          <BounceDialog tracks={tracks} onBounce={bounceTracks} />
          <ExportDialog onExport={exportProject} />
          
          {/* View Toggle */}
          <button
            onClick={() => setShowMixer(!showMixer)}
            className={`p-2 rounded transition-colors ${
              showMixer 
                ? 'bg-[var(--accent-cyan)] text-black' 
                : 'bg-[var(--hardware-surface)] text-[var(--text-secondary)] hover:text-[var(--accent-cyan)]'
            }`}
            title={showMixer ? 'Hide Mixer' : 'Show Mixer'}
            data-testid="toggle-mixer-btn"
          >
            <Faders className="w-5 h-5" />
          </button>
        </div>
      </header>
      
      {/* Initialization Overlay */}
      {!isInitialized && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 cursor-pointer"
          data-testid="init-overlay"
        >
          <div className="text-center p-8">
            <Waveform className="w-16 h-16 text-[var(--accent-cyan)] mx-auto mb-4 animate-pulse" />
            <h2 className="font-brand text-2xl text-[var(--accent-cyan)] mb-2">
              Click anywhere to start
            </h2>
            <p className="text-[var(--text-secondary)] text-sm">
              Audio context requires user interaction to initialize
            </p>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="grid gap-4 md:gap-6">
        {/* LCD Display */}
        <LCDDisplay
          currentTime={currentTime}
          bpm={bpm}
          onBpmChange={setBpm}
          metronomeEnabled={metronomeEnabled}
          onMetronomeToggle={() => setMetronomeEnabled(!metronomeEnabled)}
          isPlaying={isPlaying}
          isRecording={isRecording}
        />
        
        {/* Timeline */}
        <TrackTimeline
          tracks={tracks}
          currentTime={currentTime}
          onLoadAudio={loadAudioToTrack}
          onClearTrack={clearTrack}
          onUpdateTrack={updateTrack}
          isRecording={isRecording || isPunchRecording}
          recordingTrackIndex={recordingTrack}
          zoomLevel={zoomLevel}
          onZoomChange={setZoomLevel}
          scrollPosition={scrollPosition}
          onScrollChange={setScrollPosition}
          onSeek={seekTo}
        />
        
        {/* Bottom Section: Transport + Mixer */}
        <div className={`grid gap-4 ${showMixer ? 'lg:grid-cols-[300px_1fr]' : ''}`}>
          {/* Transport Controls */}
          <TransportControls
            isPlaying={isPlaying}
            isRecording={isRecording}
            onPlay={play}
            onPause={pause}
            onStop={stop}
            onRecord={handleRecord}
            onRewind={handleRewind}
            onFastForward={handleFastForward}
            punchInEnabled={punchInEnabled}
            onPunchInToggle={() => setPunchInEnabled(!punchInEnabled)}
            punchInMeasure={punchInMeasure}
            onPunchInMeasureChange={setPunchInMeasure}
            punchInBeat={punchInBeat}
            onPunchInBeatChange={setPunchInBeat}
            punchOutMeasure={punchOutMeasure}
            onPunchOutMeasureChange={setPunchOutMeasure}
            punchOutBeat={punchOutBeat}
            onPunchOutBeatChange={setPunchOutBeat}
          />
          
          {/* Mixer */}
          {showMixer && (
            <div 
              className="hardware-panel rounded-lg p-4 overflow-x-auto"
              data-testid="mixer-section"
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--border-subtle)]">
                <span className="font-lcd text-xs tracking-[0.2em] text-[var(--text-secondary)]">
                  MIXER - 8 CHANNELS
                </span>
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <Info className="w-4 h-4" />
                  <span className="text-xs">Drag knobs to adjust</span>
                </div>
              </div>
              
              <div className="flex gap-2 min-w-max">
                {tracks.map((track, index) => (
                  <ChannelStrip
                    key={track.id}
                    track={track}
                    index={index}
                    onUpdateTrack={updateTrack}
                    onStartRecording={startRecording}
                    isRecording={isRecording && recordingTrack === index}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-8 text-center">
        <p className="font-lcd text-xs text-[var(--text-secondary)]">
          <span className="text-[var(--accent-cyan)]">SPACE</span> Play/Pause • 
          <span className="text-[var(--accent-pink)] ml-2">R</span> Record • 
          <span className="text-[var(--accent-yellow)] ml-2">ESC</span> Stop
        </p>
      </footer>
    </div>
  );
}

export default App;
