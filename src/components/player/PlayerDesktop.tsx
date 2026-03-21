/**
 * Desktop player bar component.
 */

import { useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Gauge } from 'lucide-react';
import { clsx } from 'clsx';
import { usePlayerStore, NORMAL_SPEED } from '@/stores/usePlayerStore';
import { useAudioContext } from '@/context/AudioContext';
import { formatTime } from '@/utils/format';
import { CoverImage } from '@/components/ui/CoverImage';
import { SpeedSlider } from '@/components/ui/SpeedSlider';

export const PlayerDesktop = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackSpeed,
    setPlaying,
    nextTrack,
    prevTrack,
    setVolume,
  } = usePlayerStore();

  const { audioHandle } = useAudioContext();
  const progress = duration ? (currentTime / duration) * 100 : 0;

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    audioHandle.seek((parseFloat(e.target.value) / 100) * duration);
  }, [duration, audioHandle]);

  const handlePlayPause = useCallback(() => setPlaying(!isPlaying), [isPlaying, setPlaying]);
  const handlePrevTrack = useCallback(() => prevTrack(), [prevTrack]);
  const handleNextTrack = useCallback(() => nextTrack(), [nextTrack]);
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  }, [setVolume]);

  if (!currentTrack) return null;

  return (
    <div className="hidden md:flex h-28 bg-aki-900 border-t border-aki-800 px-4 items-center justify-between fixed bottom-0 left-0 right-0 z-50">
      {/* Left: Album art and track info */}
      <div className="flex items-center gap-4 w-1/5">
        <div className="w-14 h-14 bg-aki-800 rounded overflow-hidden">
          <CoverImage src={currentTrack.cover} alt={currentTrack.album} className="w-full h-full" iconSize={24} />
        </div>
        <div className="overflow-hidden">
          <h4 className="text-white font-medium truncate">{currentTrack.title}</h4>
          <p className="text-xs text-aki-muted truncate">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Center: Controls and progress */}
      <div className="flex flex-col items-center w-2/5 max-w-xl">
        {/* Controls */}
        <div className="flex items-center gap-5 mb-2">
          <button onClick={handlePrevTrack} className="text-aki-muted hover:text-white">
            <SkipBack size={20} />
          </button>
          <button
            onClick={handlePlayPause}
            className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause fill="black" size={18} /> : <Play fill="black" className="ml-0.5" size={18} />}
          </button>
          <button onClick={handleNextTrack} className="text-aki-muted hover:text-white">
            <SkipForward size={20} />
          </button>
        </div>

        {/* Progress */}
        <div className="w-full flex items-center gap-2 text-xs text-aki-muted font-mono">
          <span className="w-10 text-right">{formatTime(currentTime)}</span>
          <input type="range" min="0" max="100" value={progress || 0} onChange={handleSeek}
            className="flex-1 h-1 bg-aki-700 rounded-lg appearance-none cursor-pointer" />
          <span className="w-10">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Speed and Volume */}
      <div className="flex items-center gap-6 w-1/4 justify-end">
        {/* Speed control */}
        <div className="flex items-center gap-3 w-40">
          <Gauge size={18} className={clsx(
            playbackSpeed !== NORMAL_SPEED ? 'text-aki-accent' : 'text-aki-muted'
          )} />
          <SpeedSlider compact className="flex-1" />
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <Volume2 size={18} className="text-aki-muted" />
          <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange}
            className="w-20 h-1 bg-aki-700 rounded-lg appearance-none cursor-pointer" />
        </div>
      </div>
    </div>
  );
};
