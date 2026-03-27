// Audio Utilities for 8-Track Recorder

// Convert time in seconds to measure:beat format
export function timeToMeasureBeat(timeInSeconds, bpm, beatsPerMeasure = 4) {
  const beatsPerSecond = bpm / 60;
  const totalBeats = timeInSeconds * beatsPerSecond;
  const measure = Math.floor(totalBeats / beatsPerMeasure) + 1;
  const beat = Math.floor(totalBeats % beatsPerMeasure) + 1;
  return { measure, beat };
}

// Convert measure:beat to time in seconds
export function measureBeatToTime(measure, beat, bpm, beatsPerMeasure = 4) {
  const beatsPerSecond = bpm / 60;
  const totalBeats = (measure - 1) * beatsPerMeasure + (beat - 1);
  return totalBeats / beatsPerSecond;
}

// Format time for display (MM:SS:mmm)
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(3, '0')}`;
}

// Get audio buffer from file
export async function loadAudioFile(file, audioContext) {
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  return audioBuffer;
}

// Create waveform data from audio buffer
export function extractWaveformData(audioBuffer, samples = 1000) {
  const channelData = audioBuffer.getChannelData(0);
  const blockSize = Math.floor(channelData.length / samples);
  const waveformData = [];
  
  for (let i = 0; i < samples; i++) {
    const start = blockSize * i;
    let min = 1.0;
    let max = -1.0;
    
    for (let j = 0; j < blockSize; j++) {
      const value = channelData[start + j] || 0;
      if (value < min) min = value;
      if (value > max) max = value;
    }
    
    waveformData.push({ min, max });
  }
  
  return waveformData;
}

// Merge multiple audio buffers into one (for bounce)
export function mergeAudioBuffers(audioContext, buffers, volumes = []) {
  if (buffers.length === 0) return null;
  
  const maxLength = Math.max(...buffers.map(b => b ? b.length : 0));
  const sampleRate = audioContext.sampleRate;
  const outputBuffer = audioContext.createBuffer(2, maxLength, sampleRate);
  
  for (let channel = 0; channel < 2; channel++) {
    const outputData = outputBuffer.getChannelData(channel);
    
    buffers.forEach((buffer, index) => {
      if (!buffer) return;
      const volume = volumes[index] !== undefined ? volumes[index] : 1;
      const inputChannel = buffer.numberOfChannels > channel ? channel : 0;
      const inputData = buffer.getChannelData(inputChannel);
      
      for (let i = 0; i < inputData.length; i++) {
        outputData[i] += inputData[i] * volume;
      }
    });
  }
  
  return outputBuffer;
}

// Convert AudioBuffer to WAV Blob
export function audioBufferToWav(audioBuffer) {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  
  const dataLength = audioBuffer.length * blockAlign;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);
  
  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);
  
  // Interleave channels and write audio data
  const offset = 44;
  const channelData = [];
  for (let i = 0; i < numChannels; i++) {
    channelData.push(audioBuffer.getChannelData(i));
  }
  
  let index = 0;
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      let sample = channelData[channel][i];
      sample = Math.max(-1, Math.min(1, sample));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset + index, sample, true);
      index += 2;
    }
  }
  
  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Create impulse response for reverb
export function createReverbImpulse(audioContext, duration = 2, decay = 2) {
  const sampleRate = audioContext.sampleRate;
  const length = sampleRate * duration;
  const impulse = audioContext.createBuffer(2, length, sampleRate);
  
  for (let channel = 0; channel < 2; channel++) {
    const channelData = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      channelData[i] = (Math.random() * 2 - 1) * Math.exp(-t * decay);
    }
  }
  
  return impulse;
}

// DB to linear gain conversion
export function dbToGain(db) {
  return Math.pow(10, db / 20);
}

// Linear gain to DB conversion
export function gainToDb(gain) {
  if (gain <= 0) return -Infinity;
  return 20 * Math.log10(gain);
}

// Generate unique ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Calculate beat time for metronome scheduling
export function calculateNextBeatTime(currentTime, bpm, lastBeatTime) {
  const beatInterval = 60 / bpm;
  if (lastBeatTime === null) return currentTime;
  return lastBeatTime + beatInterval;
}

// Convert AudioBuffer to MP3 Blob using lamejs
export async function audioBufferToMp3(audioBuffer, bitRate = 128) {
  // Dynamic import of lamejs
  const lamejs = await import('lamejs');
  
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const mp3encoder = new lamejs.Mp3Encoder(numChannels, sampleRate, bitRate);
  
  // Get audio data
  const left = audioBuffer.getChannelData(0);
  const right = numChannels > 1 ? audioBuffer.getChannelData(1) : left;
  
  // Convert float32 to int16
  const leftInt = new Int16Array(left.length);
  const rightInt = new Int16Array(right.length);
  
  for (let i = 0; i < left.length; i++) {
    leftInt[i] = Math.max(-32768, Math.min(32767, Math.round(left[i] * 32767)));
    rightInt[i] = Math.max(-32768, Math.min(32767, Math.round(right[i] * 32767)));
  }
  
  // Encode in chunks
  const mp3Data = [];
  const sampleBlockSize = 1152;
  
  for (let i = 0; i < leftInt.length; i += sampleBlockSize) {
    const leftChunk = leftInt.subarray(i, i + sampleBlockSize);
    const rightChunk = rightInt.subarray(i, i + sampleBlockSize);
    
    const mp3buf = numChannels === 1 
      ? mp3encoder.encodeBuffer(leftChunk)
      : mp3encoder.encodeBuffer(leftChunk, rightChunk);
    
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
  }
  
  // Flush remaining data
  const mp3buf = mp3encoder.flush();
  if (mp3buf.length > 0) {
    mp3Data.push(mp3buf);
  }
  
  // Combine all chunks
  const totalLength = mp3Data.reduce((acc, buf) => acc + buf.length, 0);
  const mp3Array = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const buf of mp3Data) {
    mp3Array.set(buf, offset);
    offset += buf.length;
  }
  
  return new Blob([mp3Array], { type: 'audio/mp3' });
}

// Extract waveform data with zoom support
export function extractWaveformDataWithZoom(audioBuffer, samples = 1000, startTime = 0, endTime = null) {
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const duration = audioBuffer.duration;
  
  const actualEndTime = endTime !== null ? Math.min(endTime, duration) : duration;
  const startSample = Math.floor(startTime * sampleRate);
  const endSample = Math.floor(actualEndTime * sampleRate);
  const totalSamples = endSample - startSample;
  
  const blockSize = Math.max(1, Math.floor(totalSamples / samples));
  const waveformData = [];
  
  for (let i = 0; i < samples && (startSample + i * blockSize) < endSample; i++) {
    const start = startSample + blockSize * i;
    const end = Math.min(start + blockSize, endSample);
    let min = 1.0;
    let max = -1.0;
    
    for (let j = start; j < end; j++) {
      const value = channelData[j] || 0;
      if (value < min) min = value;
      if (value > max) max = value;
    }
    
    waveformData.push({ min, max });
  }
  
  return waveformData;
}
