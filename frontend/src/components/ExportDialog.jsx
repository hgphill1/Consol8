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
import { Export, FileAudio, MusicNote, CircleNotch } from '@phosphor-icons/react';

export function ExportDialog({ onExport }) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState('wav');
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await onExport(format);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mixdown.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setOpen(false);
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-[var(--hardware-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)] transition-all"
          data-testid="export-dialog-trigger"
        >
          <Export className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[var(--hardware-panel)] border-[var(--border-subtle)] text-[var(--text-primary)]">
        <DialogHeader>
          <DialogTitle className="font-brand text-xl text-[var(--accent-cyan)]">
            Export Mixdown
          </DialogTitle>
          <DialogDescription className="text-[var(--text-secondary)]">
            Export all unmuted tracks as a single audio file.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <h4 className="font-lcd text-xs tracking-wider text-[var(--text-secondary)] mb-3">
            SELECT FORMAT
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormat('wav')}
              className={`p-4 rounded-lg flex flex-col items-center gap-2 transition-all ${
                format === 'wav'
                  ? 'bg-[var(--accent-cyan)] bg-opacity-20 border-2 border-[var(--accent-cyan)]'
                  : 'bg-[var(--hardware-surface)] border-2 border-[var(--border-subtle)] hover:border-[var(--accent-cyan)]'
              }`}
              data-testid="export-format-wav"
            >
              <FileAudio weight="duotone" className="w-10 h-10 text-[var(--accent-cyan)]" />
              <span className="font-lcd text-sm">WAV</span>
              <span className="text-[10px] text-[var(--text-secondary)]">Uncompressed • Lossless</span>
            </button>
            
            <button
              onClick={() => setFormat('mp3')}
              className={`p-4 rounded-lg flex flex-col items-center gap-2 transition-all ${
                format === 'mp3'
                  ? 'bg-[var(--accent-pink)] bg-opacity-20 border-2 border-[var(--accent-pink)]'
                  : 'bg-[var(--hardware-surface)] border-2 border-[var(--border-subtle)] hover:border-[var(--accent-pink)]'
              }`}
              data-testid="export-format-mp3"
            >
              <MusicNote weight="duotone" className="w-10 h-10 text-[var(--accent-pink)]" />
              <span className="font-lcd text-sm">MP3</span>
              <span className="text-[10px] text-[var(--text-secondary)]">Compressed • Smaller</span>
            </button>
          </div>
          
          {format === 'mp3' && (
            <p className="mt-3 text-xs text-[var(--accent-yellow)] font-lcd">
              Note: MP3 export currently outputs WAV format. Full MP3 encoding coming soon.
            </p>
          )}
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
            onClick={handleExport}
            disabled={isExporting}
            className="bg-[var(--accent-cyan)] text-black hover:bg-[var(--accent-cyan)] hover:opacity-80"
            data-testid="export-confirm"
          >
            {isExporting ? (
              <>
                <CircleNotch className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Export className="w-4 h-4 mr-2" />
                Export {format.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
