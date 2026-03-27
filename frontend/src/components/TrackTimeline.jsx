import React, { useState, useRef } from 'react';
import { WaveformCanvas } from './WaveformCanvas';
import { 
  Microphone, 
  SpeakerHigh, 
  SpeakerSlash, 
  Star,
  Trash,
  Upload
} from '@phosphor-icons/react';

export function TrackTimeline({
  tracks,
  currentTime,
  onLoadAudio,
  onClearTrack,
  onUpdateTrack,
  isRecording,
  recordingTrackIndex,
}) {
  const [dragOverTrack, setDragOverTrack] = useState(null);
  const fileInputRefs = useRef([]);
  
  const handleDragOver = (e, trackIndex) => {
    e.preventDefault();
    setDragOverTrack(trackIndex);
  };
  
  const handleDragLeave = () => {
    setDragOverTrack(null);
  };
  
  const handleDrop = async (e, trackIndex) => {
    e.preventDefault();
    setDragOverTrack(null);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('audio/')) {
        onLoadAudio(trackIndex, file);
      }
    }
  };
  
  const handleFileSelect = (trackIndex, e) => {
    const file = e.target.files?.[0];
    if (file) {
      onLoadAudio(trackIndex, file);
    }
    e.target.value = '';
  };
  
  // Calculate max duration for timeline
  const maxDuration = Math.max(
    60, // Minimum 60 seconds display
    ...tracks.map(t => t.audioBuffer ? t.audioBuffer.duration : 0)
  );
  
  return (
    <div className="hardware-panel rounded-lg p-4" data-testid="track-timeline">
      {/* Timeline Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--border-subtle)]">
        <span className="font-lcd text-xs tracking-[0.2em] text-[var(--text-secondary)]">
          TIMELINE - 8 TRACKS
        </span>
        <div className="flex items-center gap-4 font-lcd text-xs text-[var(--text-secondary)]">
          <span>00:00</span>
          <div className="w-32 h-px bg-[var(--border-subtle)]" />
          <span>{Math.floor(maxDuration / 60).toString().padStart(2, '0')}:{Math.floor(maxDuration % 60).toString().padStart(2, '0')}</span>
        </div>
      </div>
      
      {/* Tracks */}
      <div className="space-y-2">
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className={`relative flex items-center gap-3 p-2 rounded transition-all ${
              dragOverTrack === index ? 'drop-zone drag-over' : ''
            } ${track.muted ? 'opacity-50' : ''}`}
            style={{
              background: track.armed 
                ? 'linear-gradient(90deg, rgba(255, 58, 48, 0.15) 0%, transparent 50%)'
                : 'linear-gradient(90deg, rgba(26, 29, 36, 0.8) 0%, rgba(17, 19, 26, 0.8) 100%)'
            }}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            data-testid={`track-${index + 1}`}
          >
            {/* Track Number & Name */}
            <div className="w-24 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span 
                  className="font-lcd text-lg"
                  style={{ 
                    color: track.armed ? 'var(--accent-red)' : 'var(--accent-cyan)',
                    textShadow: track.armed 
                      ? '0 0 8px var(--accent-red)' 
                      : '0 0 8px var(--accent-cyan)'
                  }}
                >
                  {(index + 1).toString().padStart(2, '0')}
                </span>
              </div>
              <input
                type="text"
                value={track.name}
                onChange={(e) => onUpdateTrack(index, { name: e.target.value.slice(0, 20) })}
                className="w-full bg-transparent text-xs text-[var(--text-secondary)] outline-none border-b border-transparent hover:border-[var(--border-subtle)] focus:border-[var(--accent-cyan)] transition-colors"
                data-testid={`track-${index + 1}-name`}
              />
            </div>
            
            {/* Track Controls */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Record Arm */}
              <button
                onClick={() => onUpdateTrack(index, { armed: !track.armed })}
                className={`p-1.5 rounded transition-all ${
                  track.armed 
                    ? 'bg-[var(--accent-red)] text-white' 
                    : 'bg-[var(--hardware-surface)] text-[var(--text-secondary)] hover:text-[var(--accent-red)]'
                }`}
                style={track.armed ? { boxShadow: '0 0 10px var(--accent-red)' } : {}}
                data-testid={`track-${index + 1}-arm`}
              >
                <Microphone weight={track.armed ? 'fill' : 'regular'} className="w-4 h-4" />
              </button>
              
              {/* Mute */}
              <button
                onClick={() => onUpdateTrack(index, { muted: !track.muted })}
                className={`p-1.5 rounded transition-all ${
                  track.muted 
                    ? 'bg-[var(--accent-yellow)] text-black' 
                    : 'bg-[var(--hardware-surface)] text-[var(--text-secondary)] hover:text-[var(--accent-yellow)]'
                }`}
                data-testid={`track-${index + 1}-mute`}
              >
                {track.muted 
                  ? <SpeakerSlash weight="fill" className="w-4 h-4" />
                  : <SpeakerHigh weight="regular" className="w-4 h-4" />
                }
              </button>
              
              {/* Solo */}
              <button
                onClick={() => onUpdateTrack(index, { solo: !track.solo })}
                className={`p-1.5 rounded transition-all ${
                  track.solo 
                    ? 'bg-[var(--accent-cyan)] text-black' 
                    : 'bg-[var(--hardware-surface)] text-[var(--text-secondary)] hover:text-[var(--accent-cyan)]'
                }`}
                style={track.solo ? { boxShadow: '0 0 10px var(--accent-cyan)' } : {}}
                data-testid={`track-${index + 1}-solo`}
              >
                <Star weight={track.solo ? 'fill' : 'regular'} className="w-4 h-4" />
              </button>
            </div>
            
            {/* Waveform Area */}
            <div 
              className="flex-grow h-[60px] rounded overflow-hidden waveform-track relative"
              style={{ minWidth: '200px' }}
            >
              {track.waveformData ? (
                <WaveformCanvas
                  waveformData={track.waveformData}
                  width={600}
                  height={60}
                  color={track.armed ? '#FF2A6D' : '#05D9E8'}
                  currentTime={currentTime}
                  duration={track.audioBuffer?.duration || 0}
                  className="w-full h-full"
                />
              ) : (
                <div 
                  className="flex items-center justify-center h-full text-[var(--text-secondary)] cursor-pointer hover:bg-[rgba(5,217,232,0.05)] transition-colors"
                  onClick={() => fileInputRefs.current[index]?.click()}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  <span className="text-xs">Drop audio file or click to import</span>
                </div>
              )}
              
              {/* Recording indicator */}
              {isRecording && recordingTrackIndex === index && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-[rgba(255,58,48,0.2)]"
                  data-testid={`track-${index + 1}-recording`}
                >
                  <span className="font-lcd text-[var(--accent-red)] animate-pulse">RECORDING...</span>
                </div>
              )}
              
              <input
                ref={el => fileInputRefs.current[index] = el}
                type="file"
                accept="audio/*"
                onChange={(e) => handleFileSelect(index, e)}
                className="hidden"
                data-testid={`track-${index + 1}-file-input`}
              />
            </div>
            
            {/* Clear Track */}
            {track.audioBuffer && (
              <button
                onClick={() => onClearTrack(index)}
                className="p-1.5 rounded bg-[var(--hardware-surface)] text-[var(--text-secondary)] hover:text-[var(--accent-red)] hover:bg-[rgba(255,58,48,0.1)] transition-all"
                data-testid={`track-${index + 1}-clear`}
              >
                <Trash weight="regular" className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      
      {/* Playhead */}
      {maxDuration > 0 && (
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-[var(--accent-pink)] pointer-events-none z-10"
          style={{
            left: `${(currentTime / maxDuration) * 100}%`,
            boxShadow: '0 0 8px var(--accent-pink)'
          }}
          data-testid="timeline-playhead"
        />
      )}
    </div>
  );
}
