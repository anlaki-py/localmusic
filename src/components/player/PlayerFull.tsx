/**
 * Full-screen mobile player component.
 * Displays album art, track info, controls, and speed modal.
 * Supports swipe gestures: horizontal for track change, vertical to close.
 */

import { useCallback, useRef } from 'react';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronDown,
  Gauge,
  Settings,
  Repeat,
  Repeat1,
  Shuffle,
  Loader2,
  Mic2,
} from 'lucide-react';
import { clsx } from 'clsx';
import { usePlayerStore, NORMAL_SPEED } from '@/stores/usePlayerStore';
import { useAudioContext } from '@/context/AudioContext';
import { formatTime } from '@/utils/format';
import { CoverImage } from '@/components/ui/CoverImage';
import { LyricsDisplay } from '@/components/ui/LyricsDisplay';

interface PlayerFullProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSpeedModal: () => void;
}



export const PlayerFull = ({ isOpen, onClose, onOpenSpeedModal }: PlayerFullProps) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    playbackSpeed,
    repeatMode,
    isShuffled,
    isBuffering,
    showLyrics,
    setPlaying,
    nextTrack,
    prevTrack,
    toggleRepeatMode,
    toggleShuffle,
    toggleLyrics,
  } = usePlayerStore();

  const { audioHandle } = useAudioContext();
  const progress = duration ? (currentTime / duration) * 100 : 0;
  const coverRef = useRef<HTMLDivElement>(null);

  // Swipe gestures — disabled when lyrics are visible to allow lyrics scrolling
  const { handlers: swipeHandlers, style: swipeStyle } = useSwipeGesture({
    enabled: !showLyrics,
    onSwipeLeft: () => nextTrack(),
    onSwipeRight: () => prevTrack(),
    onSwipeDown: onClose,
    dragRef: coverRef,
  });

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = (parseFloat(e.target.value) / 100) * duration;
      audioHandle.seek(time);
    },
    [duration, audioHandle]
  );

  const handlePlayPause = useCallback(() => {
    setPlaying(!isPlaying);
  }, [isPlaying, setPlaying]);

  const handlePrevTrack = useCallback(() => prevTrack(), [prevTrack]);
  const handleNextTrack = useCallback(() => nextTrack(), [nextTrack]);

  if (!currentTrack) return null;

  return (
    <div
      className={clsx(
        'fixed inset-0 bg-gradient-to-b from-aki-800 to-aki-900 z-[60] flex flex-col',
        'transition-transform duration-300 ease-in-out md:hidden',
        isOpen ? 'translate-y-0' : 'translate-y-[100vh]'
      )}
      style={swipeStyle}
      {...swipeHandlers}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 pt-10 relative">
        <button onClick={onClose} className="text-white p-2 -ml-2">
          <ChevronDown size={28} />
        </button>

        <span className="text-xs uppercase tracking-widest text-aki-muted">
          Now Playing
        </span>

        <button
          onClick={onOpenSpeedModal}
          className="text-white p-2 hover:text-aki-accent transition-colors"
        >
          <Settings size={24} />
        </button>

        {(currentTrack.lyrics || currentTrack.syncedLyrics) && (
          <button
            onClick={toggleLyrics}
            className={clsx(
              'p-2 transition-colors',
              showLyrics ? 'text-aki-accent' : 'text-white hover:text-aki-accent'
            )}
          >
            <Mic2 size={24} />
          </button>
        )}
      </div>

      {/* Album art / Lyrics */}
      <div className="flex-1 flex flex-col px-8 pb-4 relative min-h-0">
        {showLyrics && (currentTrack.lyrics || currentTrack.syncedLyrics) ? (
          <div className="flex-1 -mx-8 -mt-6 mb-4 overflow-hidden min-h-0">
            <LyricsDisplay
              lyrics={currentTrack.lyrics}
              syncedLyrics={currentTrack.syncedLyrics}
              currentTime={currentTime}
              onSeek={(time) => audioHandle.seek(time)}
              className="w-full h-full bg-aki-800/50"
            />
          </div>
        ) : (
          <div
            ref={coverRef}
            className="flex-1 flex flex-col items-center justify-center py-4 transition-transform"
          >
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 shadow-2xl rounded-xl overflow-hidden bg-aki-800">
              <CoverImage
                src={currentTrack.cover}
                alt={currentTrack.album}
                className="w-full h-full"
                iconSize={64}
              />
            </div>
          </div>
        )}

        {/* Track info */}
        {!showLyrics && (
          <div className="mb-6 mt-4">
            <h2 
              className="text-2xl font-bold text-white mb-2 line-clamp-1"
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
              onDoubleClick={() => {
                if (currentTrack) {
                  navigator.clipboard.writeText(currentTrack.title);
                }
              }}
            >
              {currentTrack.title}
            </h2>
            <p 
              className="text-lg text-aki-muted line-clamp-1"
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
              onDoubleClick={() => {
                if (currentTrack) {
                  navigator.clipboard.writeText(currentTrack.artist);
                }
              }}
            >
              {currentTrack.artist}
            </p>
          </div>
        )}

        {showLyrics && (
          <div className="mb-4 mt-2">
            <h2 
              className="text-xl font-bold text-white mb-1 line-clamp-1"
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
              onDoubleClick={() => {
                if (currentTrack) {
                  navigator.clipboard.writeText(currentTrack.title);
                }
              }}
            >
              {currentTrack.title}
            </h2>
            <p 
              className="text-base text-aki-muted line-clamp-1"
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
              onDoubleClick={() => {
                if (currentTrack) {
                  navigator.clipboard.writeText(currentTrack.artist);
                }
              }}
            >
              {currentTrack.artist}
            </p>
          </div>
        )}

        {/* Speed indicator */}
        {playbackSpeed !== NORMAL_SPEED && (
          <div className="flex items-center justify-center gap-2 mb-4 text-aki-accent text-sm">
            <Gauge size={16} />
            <button
              onClick={onOpenSpeedModal}
              className="font-mono hover:underline"
            >
              {playbackSpeed}%
            </button>
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-8">
          <input
            type="range"
            min="0"
            max="100"
            value={progress || 0}
            onChange={handleSeek}
            className="w-full h-1 bg-aki-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-aki-muted mt-2 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={toggleShuffle}
            className={`p-2 ${isShuffled ? 'text-aki-accent' : 'text-aki-muted'}`}
          >
            <Shuffle size={24} />
          </button>
          <button onClick={handlePrevTrack}>
            <SkipBack size={32} className="text-white" />
          </button>
          <button
            onClick={handlePlayPause}
            className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            {isBuffering ? (
              <Loader2 size={32} className="text-black animate-spin" />
            ) : isPlaying ? (
              <Pause fill="black" size={32} />
            ) : (
              <Play fill="black" className="ml-1" size={32} />
            )}
          </button>
          <button onClick={handleNextTrack}>
            <SkipForward size={32} className="text-white" />
          </button>
          <button
            onClick={toggleRepeatMode}
            className={`p-2 ${repeatMode !== 'off' ? 'text-aki-accent' : 'text-aki-muted'}`}
          >
            {repeatMode === 'one' ? <Repeat1 size={24} /> : <Repeat size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
};
