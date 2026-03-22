/**
 * Lyrics panel component for desktop.
 * Shows lyrics in a right sidebar.
 */

import { usePlayerStore } from '@/stores/usePlayerStore';
import { useAudioContext } from '@/context/AudioContext';
import { LyricsDisplay } from '@/components/ui/LyricsDisplay';
import { Mic2 } from 'lucide-react';

export const LyricsPanel = () => {
  const { currentTrack, currentTime } = usePlayerStore();
  const { audioHandle } = useAudioContext();

  if (!currentTrack) return null;

  const hasLyrics = currentTrack.lyrics || currentTrack.syncedLyrics;

  if (!hasLyrics) return null;

  const handleSeek = (time: number) => {
    audioHandle.seek(time);
  };

  return (
    <div className="hidden md:flex w-80 bg-aki-900 border-l border-aki-800 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-aki-800">
        <div className="flex items-center gap-2">
          <Mic2 size={18} className="text-aki-accent" />
          <span className="text-sm font-medium text-white">Lyrics</span>
        </div>
      </div>

      {/* Lyrics content */}
      <div className="flex-1 overflow-hidden">
        <LyricsDisplay
          lyrics={currentTrack.lyrics}
          syncedLyrics={currentTrack.syncedLyrics}
          currentTime={currentTime}
          onSeek={handleSeek}
          className="h-full"
        />
      </div>
    </div>
  );
};
