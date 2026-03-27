import { useState, useEffect, useRef, useCallback } from 'react';
import { createReverbImpulse, extractWaveformData, measureBeatToTime, timeToMeasureBeat } from '../utils/audioUtils';

const DEFAULT_TRACK = {
  id: null,
  name: '',
  audioBuffer: null,
  waveformData: null,
  volume: 0.75,
  pan: 0,
  muted: false,
  solo: false,
  armed: false,
  // Effects
  eqHigh: 0,
  eqMid: 0,
  eqLow: 0,
  reverbSend: 0,
  delaySend: 0,
  delayTime: 0.3,
  delayFeedback: 0.3,
};

export function useAudioEngine() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const [tracks, setTracks] = useState(
    Array(8).fill(null).map((_, i) => ({
      ...DEFAULT_TRACK,
      id: i,
      name: `Track ${i + 1}`,
    }))
  );
  
  // Punch in/out
  const [punchInEnabled, setPunchInEnabled] = useState(false);
  const [punchInMeasure, setPunchInMeasure] = useState(1);
  const [punchInBeat, setPunchInBeat] = useState(1);
  const [punchOutMeasure, setPunchOutMeasure] = useState(2);
  const [punchOutBeat, setPunchOutBeat] = useState(1);
  const [isPunchRecording, setIsPunchRecording] = useState(false);
  
  // Zoom state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Audio context refs
  const audioContextRef = useRef(null);
  const masterGainRef = useRef(null);
  const trackNodesRef = useRef([]);
  const sourceNodesRef = useRef([]);
  const reverbRef = useRef(null);
  const delayRef = useRef(null);
  const metronomeGainRef = useRef(null);
  
  // Playback refs
  const playbackStartTimeRef = useRef(0);
  const playbackOffsetRef = useRef(0);
  const animationFrameRef = useRef(null);
  const metronomeIntervalRef = useRef(null);
  const lastBeatTimeRef = useRef(null);
  const nextBeatTimeRef = useRef(0);
  
  // Recording refs
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingTrackRef = useRef(null);
  const punchInTimeRef = useRef(null);
  const punchOutTimeRef = useRef(null);
  const punchRecordingStartedRef = useRef(false);
  const mediaStreamRef = useRef(null);
  
  // Initialize audio context
  const initAudio = useCallback(async () => {
    if (audioContextRef.current) return;
    
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = ctx;
    
    // Master gain
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.8;
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;
    
    // Create reverb (convolver)
    const reverb = ctx.createConvolver();
    reverb.buffer = createReverbImpulse(ctx, 2.5, 1.5);
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.5;
    reverb.connect(reverbGain);
    reverbGain.connect(masterGain);
    reverbRef.current = { convolver: reverb, gain: reverbGain };
    
    // Create delay
    const delay = ctx.createDelay(2);
    delay.delayTime.value = 0.3;
    const delayFeedback = ctx.createGain();
    delayFeedback.gain.value = 0.3;
    const delayGain = ctx.createGain();
    delayGain.gain.value = 0.5;
    delay.connect(delayFeedback);
    delayFeedback.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(masterGain);
    delayRef.current = { delay, feedback: delayFeedback, gain: delayGain };
    
    // Metronome gain
    const metGain = ctx.createGain();
    metGain.gain.value = 0.3;
    metGain.connect(masterGain);
    metronomeGainRef.current = metGain;
    
    // Initialize track nodes
    trackNodesRef.current = Array(8).fill(null).map(() => {
      const gain = ctx.createGain();
      const pan = ctx.createStereoPanner();
      const eqHigh = ctx.createBiquadFilter();
      const eqMid = ctx.createBiquadFilter();
      const eqLow = ctx.createBiquadFilter();
      const reverbSend = ctx.createGain();
      const delaySend = ctx.createGain();
      
      // EQ setup
      eqHigh.type = 'highshelf';
      eqHigh.frequency.value = 4000;
      eqMid.type = 'peaking';
      eqMid.frequency.value = 1000;
      eqMid.Q.value = 1;
      eqLow.type = 'lowshelf';
      eqLow.frequency.value = 250;
      
      // Connect chain
      gain.connect(pan);
      pan.connect(eqLow);
      eqLow.connect(eqMid);
      eqMid.connect(eqHigh);
      eqHigh.connect(masterGain);
      
      // Effect sends
      reverbSend.gain.value = 0;
      delaySend.gain.value = 0;
      eqHigh.connect(reverbSend);
      eqHigh.connect(delaySend);
      reverbSend.connect(reverb);
      delaySend.connect(delay);
      
      return { gain, pan, eqHigh, eqMid, eqLow, reverbSend, delaySend };
    });
    
    sourceNodesRef.current = Array(8).fill(null);
    
    setIsInitialized(true);
  }, []);
  
  // Play metronome click
  const playMetronomeClick = useCallback((time, isDownbeat) => {
    if (!audioContextRef.current || !metronomeGainRef.current) return;
    
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.frequency.value = isDownbeat ? 1200 : 800;
    osc.connect(gain);
    gain.connect(metronomeGainRef.current);
    
    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
    
    osc.start(time);
    osc.stop(time + 0.05);
  }, []);
  
  // Schedule metronome
  const scheduleMetronome = useCallback(() => {
    if (!audioContextRef.current || !metronomeEnabled || !isPlaying) return;
    
    const ctx = audioContextRef.current;
    const beatInterval = 60 / bpm;
    const lookahead = 0.1;
    
    while (nextBeatTimeRef.current < ctx.currentTime + lookahead) {
      const elapsedTime = nextBeatTimeRef.current - playbackStartTimeRef.current + playbackOffsetRef.current;
      const beatNumber = Math.floor(elapsedTime / beatInterval);
      const isDownbeat = beatNumber % 4 === 0;
      
      playMetronomeClick(nextBeatTimeRef.current, isDownbeat);
      nextBeatTimeRef.current += beatInterval;
    }
  }, [bpm, metronomeEnabled, isPlaying, playMetronomeClick]);
  
  // Update playback time
  const updatePlaybackTime = useCallback(() => {
    if (!audioContextRef.current || !isPlaying) return;
    
    const ctx = audioContextRef.current;
    const elapsed = ctx.currentTime - playbackStartTimeRef.current + playbackOffsetRef.current;
    setCurrentTime(elapsed);
    
    scheduleMetronome();
    
    // Handle punch-in recording
    if (punchInEnabled && !isPunchRecording && !punchRecordingStartedRef.current) {
      const punchInTime = measureBeatToTime(punchInMeasure, punchInBeat, bpm);
      if (elapsed >= punchInTime) {
        // Find armed track and start recording
        const armedTrackIndex = tracks.findIndex(t => t.armed);
        if (armedTrackIndex >= 0) {
          punchRecordingStartedRef.current = true;
          startPunchRecording(armedTrackIndex);
        }
      }
    }
    
    // Handle punch-out
    if (isPunchRecording && punchRecordingStartedRef.current) {
      const punchOutTime = measureBeatToTime(punchOutMeasure, punchOutBeat, bpm);
      if (elapsed >= punchOutTime) {
        stopPunchRecording();
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(updatePlaybackTime);
  }, [isPlaying, scheduleMetronome, punchInEnabled, isPunchRecording, punchInMeasure, punchInBeat, punchOutMeasure, punchOutBeat, bpm, tracks]);
  
  // Start punch-in recording (internal)
  const startPunchRecording = useCallback(async (trackIndex) => {
    if (!audioContextRef.current || isPunchRecording) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      
      recordedChunksRef.current = [];
      recordingTrackRef.current = trackIndex;
      punchInTimeRef.current = currentTime;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        if (recordedChunksRef.current.length === 0) return;
        
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
        
        // Update track with recorded audio
        setTracks(prev => {
          const newTracks = [...prev];
          newTracks[recordingTrackRef.current] = {
            ...newTracks[recordingTrackRef.current],
            audioBuffer,
            waveformData: extractWaveformData(audioBuffer),
          };
          return newTracks;
        });
        
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100);
      setIsPunchRecording(true);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start punch recording:', err);
    }
  }, [isPunchRecording, currentTime]);
  
  // Stop punch-in recording (internal)
  const stopPunchRecording = useCallback(() => {
    if (mediaRecorderRef.current && isPunchRecording) {
      mediaRecorderRef.current.stop();
      setIsPunchRecording(false);
      setIsRecording(false);
      punchRecordingStartedRef.current = false;
    }
  }, [isPunchRecording]);
  
  // Play
  const play = useCallback(() => {
    if (!audioContextRef.current || isPlaying) return;
    
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    playbackStartTimeRef.current = ctx.currentTime;
    nextBeatTimeRef.current = ctx.currentTime;
    
    // Start all tracks with audio
    tracks.forEach((track, index) => {
      if (track.audioBuffer && !track.muted) {
        const hasSolo = tracks.some(t => t.solo);
        if (hasSolo && !track.solo) return;
        
        const source = ctx.createBufferSource();
        source.buffer = track.audioBuffer;
        source.connect(trackNodesRef.current[index].gain);
        source.start(0, playbackOffsetRef.current);
        sourceNodesRef.current[index] = source;
      }
    });
    
    setIsPlaying(true);
    animationFrameRef.current = requestAnimationFrame(updatePlaybackTime);
  }, [isPlaying, tracks, updatePlaybackTime]);
  
  // Pause
  const pause = useCallback(() => {
    if (!isPlaying) return;
    
    playbackOffsetRef.current = currentTime;
    
    sourceNodesRef.current.forEach((source, index) => {
      if (source) {
        try {
          source.stop();
        } catch (e) {}
        sourceNodesRef.current[index] = null;
      }
    });
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setIsPlaying(false);
  }, [isPlaying, currentTime]);
  
  // Stop
  const stop = useCallback(() => {
    pause();
    playbackOffsetRef.current = 0;
    setCurrentTime(0);
    
    if (isRecording) {
      stopRecording();
    }
    if (isPunchRecording) {
      stopPunchRecording();
    }
    punchRecordingStartedRef.current = false;
  }, [pause, isRecording, isPunchRecording]);
  
  // Seek to time
  const seekTo = useCallback((time) => {
    const wasPlaying = isPlaying;
    if (wasPlaying) {
      pause();
    }
    
    playbackOffsetRef.current = Math.max(0, time);
    setCurrentTime(playbackOffsetRef.current);
    
    if (wasPlaying) {
      setTimeout(() => play(), 50);
    }
  }, [isPlaying, pause, play]);
  
  // Start recording
  const startRecording = useCallback(async (trackIndex) => {
    if (!audioContextRef.current || isRecording) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      recordedChunksRef.current = [];
      recordingTrackRef.current = trackIndex;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
        
        // Update track with recorded audio
        setTracks(prev => {
          const newTracks = [...prev];
          newTracks[recordingTrackRef.current] = {
            ...newTracks[recordingTrackRef.current],
            audioBuffer,
            waveformData: extractWaveformData(audioBuffer),
          };
          return newTracks;
        });
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100);
      setIsRecording(true);
      
      if (!isPlaying) {
        play();
      }
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  }, [isRecording, isPlaying, play]);
  
  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);
  
  // Update track parameter
  const updateTrack = useCallback((trackIndex, updates) => {
    setTracks(prev => {
      const newTracks = [...prev];
      newTracks[trackIndex] = { ...newTracks[trackIndex], ...updates };
      return newTracks;
    });
    
    // Update audio nodes
    const nodes = trackNodesRef.current[trackIndex];
    if (nodes) {
      if (updates.volume !== undefined) {
        nodes.gain.gain.value = updates.volume;
      }
      if (updates.pan !== undefined) {
        nodes.pan.pan.value = updates.pan;
      }
      if (updates.eqHigh !== undefined) {
        nodes.eqHigh.gain.value = updates.eqHigh;
      }
      if (updates.eqMid !== undefined) {
        nodes.eqMid.gain.value = updates.eqMid;
      }
      if (updates.eqLow !== undefined) {
        nodes.eqLow.gain.value = updates.eqLow;
      }
      if (updates.reverbSend !== undefined) {
        nodes.reverbSend.gain.value = updates.reverbSend;
      }
      if (updates.delaySend !== undefined) {
        nodes.delaySend.gain.value = updates.delaySend;
      }
    }
  }, []);
  
  // Load audio file to track
  const loadAudioToTrack = useCallback(async (trackIndex, file) => {
    if (!audioContextRef.current) return;
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      const waveformData = extractWaveformData(audioBuffer);
      
      setTracks(prev => {
        const newTracks = [...prev];
        newTracks[trackIndex] = {
          ...newTracks[trackIndex],
          audioBuffer,
          waveformData,
          name: file.name.replace(/\.[^/.]+$/, '').slice(0, 20),
        };
        return newTracks;
      });
    } catch (err) {
      console.error('Failed to load audio file:', err);
    }
  }, []);
  
  // Clear track
  const clearTrack = useCallback((trackIndex) => {
    setTracks(prev => {
      const newTracks = [...prev];
      newTracks[trackIndex] = {
        ...DEFAULT_TRACK,
        id: trackIndex,
        name: `Track ${trackIndex + 1}`,
      };
      return newTracks;
    });
  }, []);
  
  // Bounce tracks
  const bounceTracks = useCallback(async (trackIndices, targetTrackIndex) => {
    if (!audioContextRef.current || trackIndices.length === 0) return;
    
    const ctx = audioContextRef.current;
    const buffersToMerge = trackIndices
      .map(i => tracks[i].audioBuffer)
      .filter(Boolean);
    
    if (buffersToMerge.length === 0) return;
    
    const volumes = trackIndices.map(i => tracks[i].volume);
    const maxLength = Math.max(...buffersToMerge.map(b => b.length));
    const outputBuffer = ctx.createBuffer(2, maxLength, ctx.sampleRate);
    
    // Mix buffers
    for (let channel = 0; channel < 2; channel++) {
      const outputData = outputBuffer.getChannelData(channel);
      
      buffersToMerge.forEach((buffer, idx) => {
        const inputChannel = buffer.numberOfChannels > channel ? channel : 0;
        const inputData = buffer.getChannelData(inputChannel);
        const vol = volumes[idx];
        
        for (let i = 0; i < inputData.length; i++) {
          outputData[i] += inputData[i] * vol;
        }
      });
    }
    
    // Update target track
    setTracks(prev => {
      const newTracks = [...prev];
      
      // Clear source tracks
      trackIndices.forEach(i => {
        if (i !== targetTrackIndex) {
          newTracks[i] = {
            ...DEFAULT_TRACK,
            id: i,
            name: `Track ${i + 1}`,
          };
        }
      });
      
      // Set bounced audio to target
      newTracks[targetTrackIndex] = {
        ...newTracks[targetTrackIndex],
        audioBuffer: outputBuffer,
        waveformData: extractWaveformData(outputBuffer),
        name: 'Bounced',
      };
      
      return newTracks;
    });
  }, [tracks]);
  
  // Export project
  const exportProject = useCallback(async (format = 'wav') => {
    if (!audioContextRef.current) return null;
    
    const ctx = audioContextRef.current;
    const activeTracks = tracks.filter(t => t.audioBuffer && !t.muted);
    
    if (activeTracks.length === 0) return null;
    
    const maxLength = Math.max(...activeTracks.map(t => t.audioBuffer.length));
    const outputBuffer = ctx.createBuffer(2, maxLength, ctx.sampleRate);
    
    // Mix all tracks
    for (let channel = 0; channel < 2; channel++) {
      const outputData = outputBuffer.getChannelData(channel);
      
      activeTracks.forEach(track => {
        const inputChannel = track.audioBuffer.numberOfChannels > channel ? channel : 0;
        const inputData = track.audioBuffer.getChannelData(inputChannel);
        
        for (let i = 0; i < inputData.length; i++) {
          outputData[i] += inputData[i] * track.volume;
        }
      });
    }
    
    if (format === 'mp3') {
      // Use MP3 encoder
      const { audioBufferToMp3 } = await import('../utils/audioUtils');
      return await audioBufferToMp3(outputBuffer, 192);
    }
    
    // Default to WAV
    const { audioBufferToWav } = await import('../utils/audioUtils');
    return audioBufferToWav(outputBuffer);
  }, [tracks]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);
  
  return {
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
  };
}
