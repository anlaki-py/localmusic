/**
 * Mini player component for mobile devices.
 */

import { useCallback } from 'react';
import { Play, Pause, Gauge } from 'lucide-react';
import { usePlayerStore, NORMAL_SPEED } from '@/stores/usePlayerStore';
import { CoverImage } from '@/components/ui/CoverImage';

interface PlayerMiniProps {
  onOpenFull: () => void;
}

export const PlayerMini = ({ onOpenFull }: PlayerMiniProps) => {
  const { currentTrack, isPlaying, currentTime, duration, playbackSpeed, setPlaying } =
    usePlayerStore();

  const progress = duration ? (currentTime / duration) * 100 : 0;

  const handlePlayPause = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setPlaying(!isPlaying);
  }, [isPlaying, setPlaying]);

  if (!currentTrack) return null;

  return (
    <div
      onClick={onOpenFull}
      className="md:hidden fixed bottom-16 left-2 right-2 h-14 bg-aki-800 rounded-lg flex items-center px-2 z-50 border border-aki-700 shadow-lg cursor-pointer overflow-hidden backdrop-blur-md bg-opacity-95"
    >
      <div className="w-10 h-10 rounded overflow-hidden mr-3 flex-shrink-0">
        <CoverImage src={currentTrack.cover} alt={currentTrack.album} className="w-full h-full" iconSize={16} />
      </div>

      <div className="flex-1 overflow-hidden pr-2">
        <h4 className="text-white text-sm font-medium truncate">{currentTrack.title}</h4>
        <div className="flex items-center gap-2">
          <p className="text-xs text-aki-muted truncate">{currentTrack.artist}</p>
          {playbackSpeed !== NORMAL_SPEED && (
            <span className="text-xs text-aki-accent flex items-center gap-1 font-mono">
              <Gauge size={10} />
              {playbackSpeed}%
            </span>
          )}
        </div>
      </div>

      <button onClick={handlePlayPause} className="p-2 text-white flex-shrink-0">
        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
      </button>

      <div className="absolute bottom-0 left-0 h-[2px] bg-aki-accent transition-all duration-300" style={{ width: `${progress}%` }} />
    </div>
  );
};
