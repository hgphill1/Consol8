import React from 'react';
import { timeToMeasureBeat, formatTime } from '../utils/audioUtils';
import { Metronome, Play, Pause, Record } from '@phosphor-icons/react';

export function LCDDisplay({
  currentTime,
  bpm,
  onBpmChange,
  metronomeEnabled,
  onMetronomeToggle,
  isPlaying,
  isRecording,
}) {
  const { measure, beat } = timeToMeasureBeat(currentTime, bpm);
  
  return (
    <div 
      className="hardware-panel rounded-lg p-4 lcd-scanlines"
      data-testid="lcd-display"
    >
      <div 
        className="rounded-lg p-4"
        style={{ 
          background: 'linear-gradient(180deg, #0a1510 0%, #0d1a15 50%, #081210 100%)',
          boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.5), 0 0 20px rgba(1, 255, 195, 0.1)'
        }}
      >
        {/* Top Status Bar */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1a2f25]">
          <span className="font-lcd text-sm tracking-wider" style={{ color: '#017a5c' }}>
            TASCAM-8X DIGITAL
          </span>
          <div className="flex items-center gap-4">
            {isRecording && (
              <div className="flex items-center gap-1.5" data-testid="recording-indicator">
                <Record weight="fill" className="w-3 h-3 text-[#FF3B30] animate-pulse" />
                <span className="font-lcd text-xs text-[#FF3B30]">REC</span>
              </div>
            )}
            {isPlaying && !isRecording && (
              <div className="flex items-center gap-1.5" data-testid="playing-indicator">
                <Play weight="fill" className="w-3 h-3 text-[var(--lcd-text)]" />
                <span className="font-lcd text-xs text-[var(--lcd-text)]">PLAY</span>
              </div>
            )}
            {!isPlaying && !isRecording && (
              <div className="flex items-center gap-1.5" data-testid="stopped-indicator">
                <Pause weight="fill" className="w-3 h-3 text-[#017a5c]" />
                <span className="font-lcd text-xs text-[#017a5c]">STOP</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Main Display Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Timecode */}
          <div className="text-center">
            <span className="font-lcd text-xs tracking-[0.2em] block mb-1" style={{ color: '#017a5c' }}>
              TIMECODE
            </span>
            <span 
              className="font-lcd text-3xl sm:text-4xl tracking-wide"
              style={{ 
                color: 'var(--lcd-text)',
                textShadow: '0 0 10px var(--lcd-text), 0 0 20px var(--lcd-text)'
              }}
              data-testid="lcd-timecode"
            >
              {formatTime(currentTime)}
            </span>
          </div>
          
          {/* Measure:Beat */}
          <div className="text-center">
            <span className="font-lcd text-xs tracking-[0.2em] block mb-1" style={{ color: '#017a5c' }}>
              MEASURE:BEAT
            </span>
            <span 
              className="font-lcd text-4xl sm:text-5xl tracking-wide"
              style={{ 
                color: 'var(--lcd-text)',
                textShadow: '0 0 10px var(--lcd-text), 0 0 20px var(--lcd-text)'
              }}
              data-testid="lcd-measure-beat"
            >
              {measure.toString().padStart(3, '0')}:{beat}
            </span>
          </div>
          
          {/* BPM & Metronome */}
          <div className="text-center">
            <span className="font-lcd text-xs tracking-[0.2em] block mb-1" style={{ color: '#017a5c' }}>
              TEMPO
            </span>
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center">
                <button
                  onClick={() => onBpmChange(Math.max(20, bpm - 1))}
                  className="w-6 h-6 flex items-center justify-center text-[var(--lcd-text)] hover:bg-[#1a2f25] rounded transition-colors"
                  data-testid="bpm-decrease"
                >
                  <span className="font-lcd text-lg">-</span>
                </button>
                <input
                  type="number"
                  value={bpm}
                  onChange={(e) => onBpmChange(Math.max(20, Math.min(300, parseInt(e.target.value) || 120)))}
                  className="w-16 bg-transparent text-center font-lcd text-3xl sm:text-4xl outline-none"
                  style={{ 
                    color: 'var(--lcd-text)',
                    textShadow: '0 0 10px var(--lcd-text), 0 0 20px var(--lcd-text)'
                  }}
                  min="20"
                  max="300"
                  data-testid="lcd-bpm-display"
                />
                <button
                  onClick={() => onBpmChange(Math.min(300, bpm + 1))}
                  className="w-6 h-6 flex items-center justify-center text-[var(--lcd-text)] hover:bg-[#1a2f25] rounded transition-colors"
                  data-testid="bpm-increase"
                >
                  <span className="font-lcd text-lg">+</span>
                </button>
              </div>
              
              <button
                onClick={onMetronomeToggle}
                className={`p-2 rounded transition-all ${
                  metronomeEnabled 
                    ? 'bg-[#1a2f25] text-[var(--lcd-text)]' 
                    : 'text-[#017a5c] hover:text-[var(--lcd-text)]'
                }`}
                style={metronomeEnabled ? {
                  boxShadow: '0 0 10px var(--lcd-text), inset 0 1px 2px rgba(0,0,0,0.5)'
                } : {}}
                data-testid="metronome-toggle"
              >
                <Metronome weight={metronomeEnabled ? 'fill' : 'regular'} className="w-6 h-6" />
              </button>
            </div>
            <span className="font-lcd text-xs" style={{ color: '#017a5c' }}>BPM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
