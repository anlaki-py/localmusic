/**
 * Speed modal component.
 * Provides a modal dialog for precise playback speed control.
 */

import { useCallback } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';
import { usePlayerStore, NORMAL_SPEED } from '@/stores/usePlayerStore';
import { SpeedSlider } from '@/components/ui/SpeedSlider';

interface SpeedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpeedModal = ({ isOpen, onClose }: SpeedModalProps) => {
  const { playbackSpeed, setPlaybackSpeed } = usePlayerStore();

  const handleReset = useCallback(() => {
    setPlaybackSpeed(NORMAL_SPEED);
  }, [setPlaybackSpeed]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  const getSpeedColor = () => {
    if (playbackSpeed === NORMAL_SPEED) return 'text-white';
    if (playbackSpeed < NORMAL_SPEED) return 'text-blue-400';
    return 'text-aki-accent';
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-aki-800 border border-aki-700 rounded-2xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <h2 className="text-lg font-semibold text-white">Playback Speed</h2>
          <button
            onClick={onClose}
            className="text-aki-muted hover:text-white transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Current speed display */}
        <div className="flex items-center justify-center py-6">
          <button
            onClick={handleReset}
            className={clsx(
              'text-5xl font-mono font-bold transition-colors',
              getSpeedColor(),
              playbackSpeed !== NORMAL_SPEED && 'hover:opacity-80'
            )}
          >
            {playbackSpeed}%
          </button>
        </div>

        {/* Speed slider */}
        <div className="px-6 pb-4">
          <SpeedSlider className="w-full" />
        </div>

        {/* Reset button */}
        <div className="px-6 pb-6">
          <button
            onClick={handleReset}
            disabled={playbackSpeed === NORMAL_SPEED}
            className={clsx(
              'w-full py-3 rounded-xl font-medium transition-all',
              playbackSpeed === NORMAL_SPEED
                ? 'bg-aki-700 text-aki-muted cursor-not-allowed'
                : 'bg-aki-accent text-black hover:bg-aki-accent/90 active:scale-[0.98]'
            )}
          >
            <span className="flex items-center justify-center gap-2">
              <RotateCcw size={18} />
              Reset to 100%
            </span>
          </button>
        </div>

        {/* Preset buttons */}
        <div className="px-6 pb-6">
          <div className="flex gap-2">
            {[50, 75, 100, 125, 150, 200].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={clsx(
                  'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                  playbackSpeed === speed
                    ? 'bg-aki-accent text-black'
                    : 'bg-aki-700 text-white hover:bg-aki-600'
                )}
              >
                {speed}%
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
