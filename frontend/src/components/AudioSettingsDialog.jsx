import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Microphone, SpeakerHigh, CircleNotch } from '@phosphor-icons/react';

export function AudioSettingsDialog({ open, onOpenChange }) {
  const [inputDevices, setInputDevices] = useState([]);
  const [outputDevices, setOutputDevices] = useState([]);
  const [selectedInput, setSelectedInput] = useState('');
  const [selectedOutput, setSelectedOutput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sampleRate, setSampleRate] = useState('48000');
  const [bufferSize, setBufferSize] = useState('512');

  useEffect(() => {
    if (open) {
      loadAudioDevices();
    }
  }, [open]);

  const loadAudioDevices = async () => {
    setIsLoading(true);
    try {
      // Request permission first if in Electron
      if (window.electronAPI) {
        await window.electronAPI.requestMicrophonePermission();
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const inputs = devices.filter(d => d.kind === 'audioinput');
      const outputs = devices.filter(d => d.kind === 'audiooutput');
      
      setInputDevices(inputs);
      setOutputDevices(outputs);
      
      // Set defaults
      if (inputs.length > 0 && !selectedInput) {
        setSelectedInput(inputs[0].deviceId);
      }
      if (outputs.length > 0 && !selectedOutput) {
        setSelectedOutput(outputs[0].deviceId);
      }
    } catch (err) {
      console.error('Failed to enumerate audio devices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // Save settings
    if (window.electronAPI) {
      await window.electronAPI.storeSet('audioSettings', {
        inputDevice: selectedInput,
        outputDevice: selectedOutput,
        sampleRate,
        bufferSize
      });
    } else {
      localStorage.setItem('audioSettings', JSON.stringify({
        inputDevice: selectedInput,
        outputDevice: selectedOutput,
        sampleRate,
        bufferSize
      }));
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[var(--hardware-panel)] border-[var(--border-subtle)] text-[var(--text-primary)] max-w-md">
        <DialogHeader>
          <DialogTitle className="font-brand text-xl text-[var(--accent-cyan)]">
            Audio Device Settings
          </DialogTitle>
          <DialogDescription className="text-[var(--text-secondary)]">
            Configure your audio input and output devices.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <CircleNotch className="w-8 h-8 text-[var(--accent-cyan)] animate-spin" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Input Device */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-lcd text-xs tracking-wider text-[var(--text-secondary)]">
                <Microphone className="w-4 h-4" />
                INPUT DEVICE
              </label>
              <Select value={selectedInput} onValueChange={setSelectedInput}>
                <SelectTrigger 
                  className="bg-[var(--hardware-surface)] border-[var(--border-subtle)] text-[var(--text-primary)]"
                  data-testid="input-device-select"
                >
                  <SelectValue placeholder="Select input device" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--hardware-panel)] border-[var(--border-subtle)]">
                  {inputDevices.map((device) => (
                    <SelectItem 
                      key={device.deviceId} 
                      value={device.deviceId}
                      className="text-[var(--text-primary)] focus:bg-[var(--hardware-surface)]"
                    >
                      {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Output Device */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-lcd text-xs tracking-wider text-[var(--text-secondary)]">
                <SpeakerHigh className="w-4 h-4" />
                OUTPUT DEVICE
              </label>
              <Select value={selectedOutput} onValueChange={setSelectedOutput}>
                <SelectTrigger 
                  className="bg-[var(--hardware-surface)] border-[var(--border-subtle)] text-[var(--text-primary)]"
                  data-testid="output-device-select"
                >
                  <SelectValue placeholder="Select output device" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--hardware-panel)] border-[var(--border-subtle)]">
                  {outputDevices.map((device) => (
                    <SelectItem 
                      key={device.deviceId} 
                      value={device.deviceId}
                      className="text-[var(--text-primary)] focus:bg-[var(--hardware-surface)]"
                    >
                      {device.label || `Speaker ${device.deviceId.slice(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sample Rate */}
            <div className="space-y-2">
              <label className="font-lcd text-xs tracking-wider text-[var(--text-secondary)]">
                SAMPLE RATE
              </label>
              <Select value={sampleRate} onValueChange={setSampleRate}>
                <SelectTrigger 
                  className="bg-[var(--hardware-surface)] border-[var(--border-subtle)] text-[var(--text-primary)]"
                  data-testid="sample-rate-select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[var(--hardware-panel)] border-[var(--border-subtle)]">
                  <SelectItem value="44100" className="text-[var(--text-primary)]">44.1 kHz (CD Quality)</SelectItem>
                  <SelectItem value="48000" className="text-[var(--text-primary)]">48 kHz (Standard)</SelectItem>
                  <SelectItem value="96000" className="text-[var(--text-primary)]">96 kHz (High Resolution)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Buffer Size */}
            <div className="space-y-2">
              <label className="font-lcd text-xs tracking-wider text-[var(--text-secondary)]">
                BUFFER SIZE
              </label>
              <Select value={bufferSize} onValueChange={setBufferSize}>
                <SelectTrigger 
                  className="bg-[var(--hardware-surface)] border-[var(--border-subtle)] text-[var(--text-primary)]"
                  data-testid="buffer-size-select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[var(--hardware-panel)] border-[var(--border-subtle)]">
                  <SelectItem value="128" className="text-[var(--text-primary)]">128 samples (Low latency)</SelectItem>
                  <SelectItem value="256" className="text-[var(--text-primary)]">256 samples</SelectItem>
                  <SelectItem value="512" className="text-[var(--text-primary)]">512 samples (Balanced)</SelectItem>
                  <SelectItem value="1024" className="text-[var(--text-primary)]">1024 samples (Stable)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-[var(--text-secondary)]">
                Lower buffer = less latency but more CPU usage
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-transparent border-[var(--border-subtle)] text-[var(--text-secondary)]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-[var(--accent-cyan)] text-black hover:bg-[var(--accent-cyan)] hover:opacity-80"
            data-testid="audio-settings-save"
          >
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
