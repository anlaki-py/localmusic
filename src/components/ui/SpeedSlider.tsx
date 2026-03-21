/**
 * Speed slider component for precise playback speed control.
 */

import { useCallback } from 'react';
import { clsx } from 'clsx';
import { usePlayerStore, MIN_SPEED, MAX_SPEED, NORMAL_SPEED } from '@/stores/usePlayerStore';

interface SpeedSliderProps {
  /** Additional CSS classes */
  className?: string;
  /** Whether to show in compact mode */
  compact?: boolean;
}

/**
 * Slider for adjusting playback speed (50% - 200%).
 * Shows current percentage and provides a range input.
 */
export const SpeedSlider = ({ className, compact = false }: SpeedSliderProps) => {
  const { playbackSpeed, setPlaybackSpeed } = usePlayerStore();

  const handleSpeedChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPlaybackSpeed(parseInt(e.target.value, 10));
    },
    [setPlaybackSpeed]
  );

  const handleReset = useCallback(() => {
    setPlaybackSpeed(NORMAL_SPEED);
  }, [setPlaybackSpeed]);

  // Calculate color based on speed
  const getSpeedColor = () => {
    if (playbackSpeed === NORMAL_SPEED) return 'text-white';
    if (playbackSpeed < NORMAL_SPEED) return 'text-blue-400';
    return 'text-aki-accent';
  };

  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      {/* Header with current value */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-aki-muted uppercase tracking-wider">
          Speed
        </span>
        <button
          onClick={handleReset}
          className={clsx(
            'text-sm font-mono font-medium transition-colors',
            getSpeedColor(),
            playbackSpeed !== NORMAL_SPEED && 'hover:text-white'
          )}
        >
          {playbackSpeed}%
        </button>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min={MIN_SPEED}
          max={MAX_SPEED}
          value={playbackSpeed}
          onChange={handleSpeedChange}
          className={clsx(
            'w-full h-2 rounded-lg appearance-none cursor-pointer',
            'bg-aki-700',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-4',
            '[&::-webkit-slider-thumb]:h-4',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-white',
            '[&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-webkit-slider-thumb]:shadow-md',
            '[&::-webkit-slider-thumb]:hover:scale-110',
            '[&::-webkit-slider-thumb]:transition-transform'
          )}
        />

        {/* Tick marks (optional, for visual reference) */}
        {!compact && (
          <div className="flex justify-between mt-1 text-[10px] text-aki-muted">
            <span>{MIN_SPEED}%</span>
            <button
              onClick={handleReset}
              className="hover:text-white transition-colors"
            >
              100%
            </button>
            <span>{MAX_SPEED}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
