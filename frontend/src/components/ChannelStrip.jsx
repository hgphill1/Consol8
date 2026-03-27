import React, { useState, useCallback } from 'react';
import { 
  SpeakerHigh, 
  SpeakerSlash, 
  Star,
  Microphone
} from '@phosphor-icons/react';

// Rotary Knob Component
function Knob({ value, onChange, min = -12, max = 12, label, color = 'cyan' }) {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(0);
  
  const normalizedValue = (value - min) / (max - min);
  const rotation = normalizedValue * 270 - 135;
  
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartValue(value);
    e.preventDefault();
  };
  
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const delta = startY - e.clientY;
    const range = max - min;
    const newValue = Math.max(min, Math.min(max, startValue + (delta / 100) * range));
    onChange(newValue);
  }, [isDragging, startY, startValue, min, max, onChange]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  const colorStyles = {
    cyan: { 
      glow: '0 0 8px var(--accent-cyan)',
      indicator: 'var(--accent-cyan)'
    },
    pink: {
      glow: '0 0 8px var(--accent-pink)',
      indicator: 'var(--accent-pink)'
    },
    yellow: {
      glow: '0 0 8px var(--accent-yellow)',
      indicator: 'var(--accent-yellow)'
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <span className="font-lcd text-[8px] tracking-wider text-[var(--text-secondary)] mb-1">
        {label}
      </span>
      <div
        className="relative w-10 h-10 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        {/* Knob body */}
        <div
          className="w-full h-full rounded-full"
          style={{
            background: 'linear-gradient(135deg, #3a3a3a 0%, #1a1a1a 50%, #0a0a0a 100%)',
            boxShadow: `
              0 4px 8px rgba(0, 0, 0, 0.5),
              inset 0 1px 1px rgba(255, 255, 255, 0.1),
              0 0 0 2px #2a2a2a
            `,
            transform: `rotate(${rotation}deg)`
          }}
        >
          {/* Indicator line */}
          <div
            className="absolute top-1.5 left-1/2 w-0.5 h-2.5 rounded-full -translate-x-1/2"
            style={{ 
              backgroundColor: colorStyles[color].indicator,
              boxShadow: colorStyles[color].glow
            }}
          />
        </div>
      </div>
      <span className="font-lcd text-[10px] text-[var(--lcd-text)] mt-1">
        {value > 0 ? '+' : ''}{Math.round(value)}
      </span>
    </div>
  );
}

export function ChannelStrip({
  track,
  index,
  onUpdateTrack,
  onStartRecording,
  isRecording,
}) {
  const handleVolumeChange = (e) => {
    onUpdateTrack(index, { volume: parseFloat(e.target.value) });
  };
  
  const handlePanChange = (e) => {
    onUpdateTrack(index, { pan: parseFloat(e.target.value) });
  };
  
  return (
    <div 
      className="track-strip rounded-lg p-3 flex flex-col gap-3 min-w-[80px]"
      data-testid={`channel-strip-${index + 1}`}
    >
      {/* Track Number */}
      <div className="text-center">
        <span 
          className="font-lcd text-xl"
          style={{ 
            color: track.armed ? 'var(--accent-red)' : 'var(--accent-cyan)',
            textShadow: track.armed 
              ? '0 0 10px var(--accent-red)' 
              : '0 0 10px var(--accent-cyan)'
          }}
        >
          {(index + 1).toString().padStart(2, '0')}
        </span>
      </div>
      
      {/* EQ Section */}
      <div className="space-y-2 py-2 border-y border-[var(--border-subtle)]">
        <Knob
          value={track.eqHigh}
          onChange={(v) => onUpdateTrack(index, { eqHigh: v })}
          min={-12}
          max={12}
          label="HI"
          color="cyan"
        />
        <Knob
          value={track.eqMid}
          onChange={(v) => onUpdateTrack(index, { eqMid: v })}
          min={-12}
          max={12}
          label="MID"
          color="pink"
        />
        <Knob
          value={track.eqLow}
          onChange={(v) => onUpdateTrack(index, { eqLow: v })}
          min={-12}
          max={12}
          label="LO"
          color="yellow"
        />
      </div>
      
      {/* Effects Sends */}
      <div className="space-y-2 pb-2 border-b border-[var(--border-subtle)]">
        <Knob
          value={track.reverbSend * 100}
          onChange={(v) => onUpdateTrack(index, { reverbSend: v / 100 })}
          min={0}
          max={100}
          label="VERB"
          color="cyan"
        />
        <Knob
          value={track.delaySend * 100}
          onChange={(v) => onUpdateTrack(index, { delaySend: v / 100 })}
          min={0}
          max={100}
          label="DLY"
          color="pink"
        />
      </div>
      
      {/* Pan */}
      <div className="flex flex-col items-center">
        <span className="font-lcd text-[8px] tracking-wider text-[var(--text-secondary)]">PAN</span>
        <input
          type="range"
          min="-1"
          max="1"
          step="0.01"
          value={track.pan}
          onChange={handlePanChange}
          className="w-12 h-1.5 mt-1 appearance-none bg-[var(--hardware-surface)] rounded cursor-pointer"
          style={{
            background: `linear-gradient(to right, 
              var(--accent-cyan) ${(track.pan + 1) * 50}%, 
              var(--hardware-surface) ${(track.pan + 1) * 50}%)`
          }}
          data-testid={`track-${index + 1}-pan`}
        />
        <span className="font-lcd text-[10px] text-[var(--text-secondary)] mt-0.5">
          {track.pan === 0 ? 'C' : track.pan < 0 ? `L${Math.abs(Math.round(track.pan * 100))}` : `R${Math.round(track.pan * 100)}`}
        </span>
      </div>
      
      {/* Volume Fader */}
      <div className="flex-grow flex flex-col items-center">
        <span className="font-lcd text-[8px] tracking-wider text-[var(--text-secondary)] mb-1">VOL</span>
        <div className="relative h-28 w-10 flex items-center justify-center">
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.01"
            value={track.volume}
            onChange={handleVolumeChange}
            className="analog-slider vertical-slider"
            data-testid={`track-${index + 1}-volume-slider`}
          />
          {/* Level indicator */}
          <div 
            className="absolute right-0 bottom-0 w-1 rounded-full pointer-events-none"
            style={{
              height: `${(track.volume / 1.5) * 100}%`,
              background: track.volume > 1 
                ? 'linear-gradient(to top, var(--accent-cyan), var(--accent-red))'
                : 'var(--accent-cyan)',
              boxShadow: '0 0 8px var(--accent-cyan)'
            }}
          />
        </div>
        <span className="font-lcd text-[10px] text-[var(--lcd-text)] mt-1">
          {track.volume === 0 ? '-∞' : `${Math.round((track.volume - 0.75) * 40)}dB`}
        </span>
      </div>
      
      {/* Channel Buttons */}
      <div className="flex flex-col gap-1.5">
        {/* Record Arm */}
        <button
          onClick={() => {
            if (track.armed) {
              onStartRecording(index);
            } else {
              onUpdateTrack(index, { armed: true });
            }
          }}
          className={`w-full py-1.5 rounded text-xs font-medium transition-all flex items-center justify-center gap-1 ${
            track.armed 
              ? 'bg-[var(--accent-red)] text-white' 
              : 'bg-[var(--hardware-surface)] text-[var(--text-secondary)] hover:text-[var(--accent-red)]'
          }`}
          style={track.armed ? { 
            boxShadow: '0 0 12px var(--accent-red)',
            animation: isRecording ? 'pulse-red 1s infinite' : 'none'
          } : {}}
          data-testid={`channel-${index + 1}-arm`}
        >
          <Microphone weight={track.armed ? 'fill' : 'regular'} className="w-3.5 h-3.5" />
          REC
        </button>
        
        {/* Mute */}
        <button
          onClick={() => onUpdateTrack(index, { muted: !track.muted })}
          className={`w-full py-1.5 rounded text-xs font-medium transition-all flex items-center justify-center gap-1 ${
            track.muted 
              ? 'bg-[var(--accent-yellow)] text-black' 
              : 'bg-[var(--hardware-surface)] text-[var(--text-secondary)] hover:text-[var(--accent-yellow)]'
          }`}
          data-testid={`channel-${index + 1}-mute`}
        >
          {track.muted 
            ? <SpeakerSlash weight="fill" className="w-3.5 h-3.5" />
            : <SpeakerHigh weight="regular" className="w-3.5 h-3.5" />
          }
          M
        </button>
        
        {/* Solo */}
        <button
          onClick={() => onUpdateTrack(index, { solo: !track.solo })}
          className={`w-full py-1.5 rounded text-xs font-medium transition-all flex items-center justify-center gap-1 ${
            track.solo 
              ? 'bg-[var(--accent-cyan)] text-black' 
              : 'bg-[var(--hardware-surface)] text-[var(--text-secondary)] hover:text-[var(--accent-cyan)]'
          }`}
          style={track.solo ? { boxShadow: '0 0 10px var(--accent-cyan)' } : {}}
          data-testid={`channel-${index + 1}-solo`}
        >
          <Star weight={track.solo ? 'fill' : 'regular'} className="w-3.5 h-3.5" />
          S
        </button>
      </div>
    </div>
  );
}
