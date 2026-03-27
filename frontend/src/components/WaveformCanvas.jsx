import React, { useRef, useEffect } from 'react';

export function WaveformCanvas({ 
  waveformData, 
  width = 800, 
  height = 60, 
  color = '#05D9E8',
  currentTime = 0,
  duration = 0,
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
    const barWidth = width / waveformData.length;
    
    // Draw waveform bars
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 4;
    
    waveformData.forEach((sample, index) => {
      const x = index * barWidth;
      const minHeight = Math.abs(sample.min) * centerY;
      const maxHeight = Math.abs(sample.max) * centerY;
      
      // Draw symmetric waveform
      ctx.fillRect(x, centerY - maxHeight, Math.max(barWidth - 1, 1), maxHeight);
      ctx.fillRect(x, centerY, Math.max(barWidth - 1, 1), minHeight);
    });
    
    // Draw playhead if playing
    if (duration > 0 && currentTime > 0) {
      const playheadX = (currentTime / duration) * width;
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#FF2A6D';
      ctx.fillRect(playheadX - 1, 0, 2, height);
      
      // Glow effect for playhead
      ctx.shadowColor = '#FF2A6D';
      ctx.shadowBlur = 8;
      ctx.fillRect(playheadX - 1, 0, 2, height);
    }
    
  }, [waveformData, width, height, color, currentTime, duration]);
  
  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        imageRendering: 'pixelated'
      }}
      data-testid="waveform-canvas"
    />
  );
}
