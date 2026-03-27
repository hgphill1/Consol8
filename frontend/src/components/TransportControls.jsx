import React from 'react';
import { 
  Play, 
  Pause, 
  Stop, 
  Record, 
  Rewind, 
  FastForward,
  ArrowsIn
} from '@phosphor-icons/react';

export function TransportControls({
  isPlaying,
  isRecording,
  onPlay,
  onPause,
  onStop,
  onRecord,
  onRewind,
  onFastForward,
  punchInEnabled,
  onPunchInToggle,
  punchInMeasure,
  onPunchInMeasureChange,
  punchInBeat,
  onPunchInBeatChange,
  punchOutMeasure,
  onPunchOutMeasureChange,
  punchOutBeat,
  onPunchOutBeatChange,
}) {
  return (
    <div className="hardware-panel rounded-lg p-4" data-testid="transport-controls">
      <div className="flex flex-col gap-4">
        {/* Main Transport Buttons */}
        <div className="flex items-center justify-center gap-3">
          {/* Rewind */}
          <button
            onClick={onRewind}
            className="transport-btn w-12 h-12 rounded-lg flex items-center justify-center text-[var(--text-primary)]"
            data-testid="rewind-button"
          >
            <Rewind weight="fill" className="w-5 h-5" />
          </button>
          
          {/* Stop */}
          <button
            onClick={onStop}
            className="transport-btn w-12 h-12 rounded-lg flex items-center justify-center text-[var(--text-primary)]"
            data-testid="stop-button"
          >
            <Stop weight="fill" className="w-5 h-5" />
          </button>
          
          {/* Play/Pause */}
          <button
            onClick={isPlaying ? onPause : onPlay}
            className={`transport-btn w-16 h-16 rounded-lg flex items-center justify-center ${
              isPlaying ? 'active' : ''
            }`}
            data-testid="play-button"
          >
            {isPlaying ? (
              <Pause weight="fill" className="w-7 h-7 text-[var(--accent-cyan)]" />
            ) : (
              <Play weight="fill" className="w-7 h-7 text-[var(--text-primary)]" />
            )}
          </button>
          
          {/* Record */}
          <button
            onClick={onRecord}
            className={`transport-btn w-14 h-14 rounded-lg flex items-center justify-center ${
              isRecording ? 'recording' : ''
            }`}
            data-testid="record-button"
          >
            <Record 
              weight="fill" 
              className={`w-6 h-6 ${isRecording ? 'text-[var(--accent-red)]' : 'text-[var(--text-primary)]'}`}
            />
          </button>
          
          {/* Fast Forward */}
          <button
            onClick={onFastForward}
            className="transport-btn w-12 h-12 rounded-lg flex items-center justify-center text-[var(--text-primary)]"
            data-testid="fast-forward-button"
          >
            <FastForward weight="fill" className="w-5 h-5" />
          </button>
        </div>
        
        {/* Punch In/Out Controls */}
        <div className="pt-3 border-t border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-3">
            <span className="font-lcd text-xs tracking-[0.2em] text-[var(--text-secondary)]">
              PUNCH IN/OUT
            </span>
            <button
              onClick={onPunchInToggle}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
                punchInEnabled 
                  ? 'bg-[var(--accent-pink)] text-white' 
                  : 'bg-[var(--hardware-surface)] text-[var(--text-secondary)] hover:text-[var(--accent-pink)]'
              }`}
              style={punchInEnabled ? { boxShadow: '0 0 12px var(--accent-pink)' } : {}}
              data-testid="punch-in-toggle"
            >
              <ArrowsIn weight="bold" className="w-3.5 h-3.5" />
              {punchInEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Punch In */}
            <div className="space-y-1">
              <span className="font-lcd text-[10px] text-[var(--text-secondary)] tracking-wider">
                IN POINT
              </span>
              <div className="flex items-center gap-1">
                <div className="flex-1">
                  <label className="font-lcd text-[8px] text-[var(--text-secondary)]">MEAS</label>
                  <input
                    type="number"
                    value={punchInMeasure}
                    onChange={(e) => onPunchInMeasureChange(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    className="w-full px-2 py-1 bg-[var(--lcd-bg)] text-[var(--lcd-text)] font-lcd text-sm rounded border border-[#1a2f25] outline-none focus:border-[var(--lcd-text)]"
                    disabled={!punchInEnabled}
                    data-testid="punch-in-measure"
                  />
                </div>
                <span className="text-[var(--text-secondary)] mt-3">:</span>
                <div className="w-12">
                  <label className="font-lcd text-[8px] text-[var(--text-secondary)]">BEAT</label>
                  <input
                    type="number"
                    value={punchInBeat}
                    onChange={(e) => onPunchInBeatChange(Math.max(1, Math.min(4, parseInt(e.target.value) || 1)))}
                    min="1"
                    max="4"
                    className="w-full px-2 py-1 bg-[var(--lcd-bg)] text-[var(--lcd-text)] font-lcd text-sm rounded border border-[#1a2f25] outline-none focus:border-[var(--lcd-text)]"
                    disabled={!punchInEnabled}
                    data-testid="punch-in-beat"
                  />
                </div>
              </div>
            </div>
            
            {/* Punch Out */}
            <div className="space-y-1">
              <span className="font-lcd text-[10px] text-[var(--text-secondary)] tracking-wider">
                OUT POINT
              </span>
              <div className="flex items-center gap-1">
                <div className="flex-1">
                  <label className="font-lcd text-[8px] text-[var(--text-secondary)]">MEAS</label>
                  <input
                    type="number"
                    value={punchOutMeasure}
                    onChange={(e) => onPunchOutMeasureChange(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    className="w-full px-2 py-1 bg-[var(--lcd-bg)] text-[var(--lcd-text)] font-lcd text-sm rounded border border-[#1a2f25] outline-none focus:border-[var(--lcd-text)]"
                    disabled={!punchInEnabled}
                    data-testid="punch-out-measure"
                  />
                </div>
                <span className="text-[var(--text-secondary)] mt-3">:</span>
                <div className="w-12">
                  <label className="font-lcd text-[8px] text-[var(--text-secondary)]">BEAT</label>
                  <input
                    type="number"
                    value={punchOutBeat}
                    onChange={(e) => onPunchOutBeatChange(Math.max(1, Math.min(4, parseInt(e.target.value) || 1)))}
                    min="1"
                    max="4"
                    className="w-full px-2 py-1 bg-[var(--lcd-bg)] text-[var(--lcd-text)] font-lcd text-sm rounded border border-[#1a2f25] outline-none focus:border-[var(--lcd-text)]"
                    disabled={!punchInEnabled}
                    data-testid="punch-out-beat"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
