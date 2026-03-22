/**
 * Mini player component for mobile devices.
 * Supports swipe gestures to change tracks and swipe up to expand.
 */

import { useCallback, useRef } from 'react';
import { Play, Pause, Gauge, Loader2 } from 'lucide-react';
import { usePlayerStore, NORMAL_SPEED } from '@/stores/usePlayerStore';
import { CoverImage } from '@/components/ui/CoverImage';

interface PlayerMiniProps {
  onOpenFull: () => void;
}

const SWIPE_THRESHOLD = 50;

export const PlayerMini = ({ onOpenFull }: PlayerMiniProps) => {
  const { currentTrack, isPlaying, currentTime, duration, playbackSpeed, isBuffering, setPlaying, nextTrack, prevTrack } =
    usePlayerStore();

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePlayPause = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setPlaying(!isPlaying);
  }, [isPlaying, setPlaying]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!contentRef.current) return;
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      contentRef.current.style.transform = `translateX(${deltaX * 0.3}px)`;
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (contentRef.current) {
        contentRef.current.style.transform = '';
      }

      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;

      if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY < -SWIPE_THRESHOLD) {
        onOpenFull();
        return;
      }

      if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          prevTrack();
        } else {
          nextTrack();
        }
      }
    },
    [prevTrack, nextTrack, onOpenFull]
  );

  if (!currentTrack) return null;

  const handleClick = useCallback(() => {
    onOpenFull();
  }, [onOpenFull]);

  return (
    <div
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-aki-800 flex items-center px-3 z-50 border-t border-aki-700 shadow-lg cursor-pointer overflow-hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div ref={contentRef} className="flex items-center flex-1 transition-transform">
        <div className="w-10 h-10 rounded overflow-hidden mr-3 flex-shrink-0">
          <CoverImage src={currentTrack.cover} alt={currentTrack.album} className="w-full h-full" iconSize={16} />
        </div>

        <div className="flex-1 overflow-hidden pr-2">
          <h4 
            className="text-white text-sm font-medium truncate"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(currentTrack.title);
            }}
          >
            {currentTrack.title}
          </h4>
          <div className="flex items-center gap-2">
            <p 
              className="text-xs text-aki-muted truncate"
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(currentTrack.artist);
              }}
            >
              {currentTrack.artist}
            </p>
            {playbackSpeed !== NORMAL_SPEED && (
              <span className="text-xs text-aki-accent flex items-center gap-1 font-mono">
                <Gauge size={10} />
                {playbackSpeed}%
              </span>
            )}
          </div>
        </div>

        <button onClick={handlePlayPause} className="p-2 text-white flex-shrink-0">
          {isBuffering ? (
            <Loader2 size={24} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={24} />
          ) : (
            <Play size={24} />
          )}
        </button>
      </div>

      <div className="absolute bottom-0 left-0 h-[2px] bg-aki-accent transition-all duration-300" style={{ width: `${progress}%` }} />
    </div>
  );
};
