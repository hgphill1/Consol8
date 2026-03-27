import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { ArrowLineDown, CheckCircle } from '@phosphor-icons/react';

export function BounceDialog({ tracks, onBounce }) {
  const [open, setOpen] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [targetTrack, setTargetTrack] = useState(0);
  
  const handleTrackSelect = (trackIndex) => {
    setSelectedTracks(prev => {
      if (prev.includes(trackIndex)) {
        return prev.filter(i => i !== trackIndex);
      }
      return [...prev, trackIndex];
    });
  };
  
  const handleBounce = () => {
    if (selectedTracks.length > 0) {
      onBounce(selectedTracks, targetTrack);
      setOpen(false);
      setSelectedTracks([]);
    }
  };
  
  const availableTargets = tracks
    .map((t, i) => ({ track: t, index: i }))
    .filter(({ track }) => !track.audioBuffer);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-[var(--hardware-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--accent-pink)] hover:border-[var(--accent-pink)] transition-all"
          data-testid="bounce-dialog-trigger"
        >
          <ArrowLineDown className="w-4 h-4 mr-2" />
          Bounce
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[var(--hardware-panel)] border-[var(--border-subtle)] text-[var(--text-primary)]">
        <DialogHeader>
          <DialogTitle className="font-brand text-xl text-[var(--accent-cyan)]">
            Bounce Tracks
          </DialogTitle>
          <DialogDescription className="text-[var(--text-secondary)]">
            Select tracks to bounce down to a single track. Source tracks will be cleared.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {/* Source Tracks */}
          <div>
            <h4 className="font-lcd text-xs tracking-wider text-[var(--text-secondary)] mb-2">
              SELECT SOURCE TRACKS
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {tracks.map((track, index) => (
                <label
                  key={index}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-all ${
                    track.audioBuffer 
                      ? selectedTracks.includes(index)
                        ? 'bg-[var(--accent-pink)] bg-opacity-20 border border-[var(--accent-pink)]'
                        : 'bg-[var(--hardware-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent-pink)]'
                      : 'bg-[var(--hardware-surface)] opacity-40 cursor-not-allowed border border-transparent'
                  }`}
                >
                  <Checkbox
                    checked={selectedTracks.includes(index)}
                    onCheckedChange={() => track.audioBuffer && handleTrackSelect(index)}
                    disabled={!track.audioBuffer}
                    data-testid={`bounce-source-${index + 1}`}
                  />
                  <span className="font-lcd text-sm">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Target Track */}
          <div>
            <h4 className="font-lcd text-xs tracking-wider text-[var(--text-secondary)] mb-2">
              SELECT TARGET TRACK
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {tracks.map((track, index) => {
                const isSelected = targetTrack === index;
                const isSource = selectedTracks.includes(index);
                const isEmpty = !track.audioBuffer || isSource;
                
                return (
                  <button
                    key={index}
                    onClick={() => isEmpty && setTargetTrack(index)}
                    disabled={!isEmpty}
                    className={`p-2 rounded transition-all flex items-center justify-center gap-1 ${
                      isEmpty
                        ? isSelected
                          ? 'bg-[var(--accent-cyan)] bg-opacity-20 border border-[var(--accent-cyan)]'
                          : 'bg-[var(--hardware-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent-cyan)]'
                        : 'bg-[var(--hardware-surface)] opacity-40 cursor-not-allowed border border-transparent'
                    }`}
                    data-testid={`bounce-target-${index + 1}`}
                  >
                    {isSelected && <CheckCircle weight="fill" className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />}
                    <span className="font-lcd text-sm">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="bg-transparent border-[var(--border-subtle)] text-[var(--text-secondary)]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleBounce}
            disabled={selectedTracks.length === 0}
            className="bg-[var(--accent-pink)] text-white hover:bg-[var(--accent-pink)] hover:opacity-80"
            data-testid="bounce-confirm"
          >
            <ArrowLineDown className="w-4 h-4 mr-2" />
            Bounce {selectedTracks.length} Track{selectedTracks.length !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
