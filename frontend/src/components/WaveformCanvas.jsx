import React, { useRef, useEffect } from 'react';

export function WaveformCanvas({ 
  waveformData, 
  width = 800, 
  height = 60, 
  color = '#05D9E8',
  currentTime = 0,
  duration = 0,
  startTime = 0,
  endTime = null,
  zoomLevel = 1,
  className = ''
}) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas size with device pixel ratio
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    if (!waveformData || waveformData.length === 0) {
      // Draw empty state
      ctx.strokeStyle = '#2a2d35';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      return;
    }
    
    const centerY = height / 2;
    
    // Calculate visible portion based on zoom
    const actualEndTime = endTime !== null ? endTime : duration;
    const visibleDuration = actualEndTime - startTime;
    
    // Calculate which samples to display
    const samplesPerSecond = waveformData.length / duration;
    const startSample = Math.max(0, Math.floor(startTime * samplesPerSecond));
    const endSample = Math.min(waveformData.length, Math.ceil(actualEndTime * samplesPerSecond));
    const visibleSamples = endSample - startSample;
    
    if (visibleSamples <= 0) return;
    
    const barWidth = width / visibleSamples;
    
    // Draw waveform bars
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 4;
    
    for (let i = 0; i < visibleSamples; i++) {
      const sampleIndex = startSample + i;
      if (sampleIndex >= waveformData.length) break;
      
      const sample = waveformData[sampleIndex];
      const x = i * barWidth;
      const minHeight = Math.abs(sample.min) * centerY;
      const maxHeight = Math.abs(sample.max) * centerY;
      
      // Draw symmetric waveform
      ctx.fillRect(x, centerY - maxHeight, Math.max(barWidth - 0.5, 1), maxHeight);
      ctx.fillRect(x, centerY, Math.max(barWidth - 0.5, 1), minHeight);
    }
    
    // Draw playhead if current time is within visible range
    if (duration > 0 && currentTime >= startTime && currentTime <= actualEndTime) {
      const playheadX = ((currentTime - startTime) / visibleDuration) * width;
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#FF2A6D';
      ctx.fillRect(playheadX - 1, 0, 2, height);
      
      // Glow effect for playhead
      ctx.shadowColor = '#FF2A6D';
      ctx.shadowBlur = 8;
      ctx.fillRect(playheadX - 1, 0, 2, height);
    }
    
  }, [waveformData, width, height, color, currentTime, duration, startTime, endTime, zoomLevel]);
  
  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ 
        width: '100%', 
        height: `${height}px`,
      }}
      data-testid="waveform-canvas"
    />
  );
}
