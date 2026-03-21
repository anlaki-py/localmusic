/**
 * Full-screen mobile player component.
 * Displays album art, track info, controls, and speed slider.
 * Supports DJ Mode for vinyl scratching.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    ChevronDown,
    MoreVertical,
    Gauge,
    Loader2,
    Disc3,
} from 'lucide-react';
import { clsx } from 'clsx';
import { usePlayerStore, NORMAL_SPEED } from '@/stores/usePlayerStore';
import { useAudioContext } from '@/context/AudioContext';
import { useScratchEngine } from '@/hooks/useScratchEngine';
import { formatTime } from '@/utils/format';
import { CoverImage } from '@/components/ui/CoverImage';
import { VinylDisk } from '@/components/ui/VinylDisk';
import { SpeedSlider } from '@/components/ui/SpeedSlider';
import { useClickOutside } from '@/hooks/useClickOutside';

interface PlayerFullProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PlayerFull = ({ isOpen, onClose }: PlayerFullProps) => {
    const {
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        playbackSpeed,
        isDJMode,
        setPlaying,
        nextTrack,
        prevTrack,
        setDJMode,
    } = usePlayerStore();

    const { audioHandle } = useAudioContext();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScratching, setIsScratching] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useClickOutside(menuRef, () => setIsMenuOpen(false));

    // Initialize scratch engine
    const scratchEngine = useScratchEngine(isDJMode, () => {
        nextTrack();
    });

    // Load track into scratch engine when DJ mode is enabled or track changes
    useEffect(() => {
        if (isDJMode && currentTrack && !scratchEngine.isLoading) {
            scratchEngine.loadTrack(currentTrack.path);
        }
    }, [isDJMode, currentTrack, scratchEngine]);

    // Pause main audio element when DJ mode is active
    useEffect(() => {
        if (isDJMode && scratchEngine.isReady) {
            audioHandle.pause();
        }
    }, [isDJMode, scratchEngine.isReady, audioHandle]);

    // Sync play/pause to scratch engine in DJ mode
    useEffect(() => {
        if (!isDJMode || !scratchEngine.isReady) return;
        if (isPlaying) {
            scratchEngine.play();
        } else {
            scratchEngine.pause();
        }
    }, [isDJMode, isPlaying, scratchEngine]);

    // Cleanup when exiting DJ mode
    useEffect(() => {
        if (!isDJMode && scratchEngine.isReady) {
            scratchEngine.destroy();
        }
    }, [isDJMode, scratchEngine]);

    const progress = isDJMode
        ? scratchEngine.getPositionPercent()
        : duration ? (currentTime / duration) * 100 : 0;

    const displayTime = isDJMode
        ? scratchEngine.position / scratchEngine.sampleRate
        : currentTime;

    const displayDuration = isDJMode ? scratchEngine.duration : duration;

    const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const time = (parseFloat(e.target.value) / 100) * displayDuration;
        if (isDJMode && scratchEngine.isReady) {
            scratchEngine.seek(time);
        } else {
            audioHandle.seek(time);
        }
    }, [displayDuration, audioHandle, isDJMode, scratchEngine]);

    const handlePlayPause = useCallback(() => {
        if (isDJMode && scratchEngine.isReady) {
            if (isPlaying) {
                scratchEngine.pause();
            } else {
                scratchEngine.play();
            }
        }
        setPlaying(!isPlaying);
    }, [isPlaying, setPlaying, isDJMode, scratchEngine]);

    const handlePrevTrack = useCallback(() => prevTrack(), [prevTrack]);
    const handleNextTrack = useCallback(() => nextTrack(), [nextTrack]);

    const handleScratchStart = useCallback(() => {
        setIsScratching(true);
        scratchEngine.pause();
    }, [scratchEngine]);

    const handleScratchEnd = useCallback(() => {
        setIsScratching(false);
        if (isPlaying) {
            scratchEngine.play();
        }
    }, [isPlaying, scratchEngine]);

    const handleScratch = useCallback((speed: number) => {
        scratchEngine.setSpeed(speed);
    }, [scratchEngine]);

    const handleToggleDJMode = useCallback(() => {
        const newMode = !isDJMode;
        
        if (newMode) {
            audioHandle.pause();
            setPlaying(false);
        } else {
            scratchEngine.destroy();
        }
        
        setDJMode(newMode);
        setIsMenuOpen(false);
    }, [isDJMode, setDJMode, scratchEngine, audioHandle, setPlaying]);

    if (!currentTrack) return null;

    return (
        <div
            className={clsx(
                'fixed inset-0 bg-gradient-to-b from-aki-800 to-aki-900 z-[60] flex flex-col',
                'transition-transform duration-300 ease-in-out md:hidden',
                isOpen ? 'translate-y-0' : 'translate-y-[100vh]'
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pt-10 relative">
                <button onClick={onClose} className="text-white p-2 -ml-2">
                    <ChevronDown size={28} />
                </button>

                <span className="text-xs uppercase tracking-widest text-aki-muted">
                    Now Playing
                </span>

                {/* Menu toggle */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="text-white p-2 -mr-2"
                    >
                        <MoreVertical size={24} />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 top-12 w-56 bg-aki-800 border border-aki-700 rounded-lg shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-100">
                            {/* DJ Mode toggle */}
                            <button
                                onClick={handleToggleDJMode}
                                className={clsx(
                                    'w-full flex items-center gap-3 p-3 rounded-lg transition-colors',
                                    isDJMode
                                        ? 'bg-aki-accent text-black'
                                        : 'hover:bg-aki-700 text-white'
                                )}
                            >
                                <Disc3 size={18} />
                                <span className="flex-1 text-left font-medium">
                                    DJ Scratch Mode
                                </span>
                                {scratchEngine.isLoading && (
                                    <Loader2 size={16} className="animate-spin" />
                                )}
                            </button>

                            {/* Speed slider (only in non-DJ mode) */}
                            {!isDJMode && (
                                <div className="mt-4 pt-4 border-t border-aki-700">
                                    <SpeedSlider />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Album art / Vinyl */}
            <div className="flex-1 flex flex-col px-8 pb-10 relative">
                <div className="flex-1 flex flex-col items-center justify-center py-4">
                    <div className="relative w-72 h-72 sm:w-80 sm:h-80 shadow-2xl rounded-xl overflow-hidden bg-aki-800">
                        {isDJMode ? (
                            <>
                                {scratchEngine.isLoading ? (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Loader2 size={48} className="animate-spin text-aki-accent" />
                                    </div>
                                ) : scratchEngine.isReady ? (
                                    <VinylDisk
                                        cover={currentTrack.cover}
                                        isPlaying={isPlaying}
                                        isScratching={isScratching}
                                        position={scratchEngine.position}
                                        sampleRate={scratchEngine.sampleRate}
                                        duration={scratchEngine.duration}
                                        onScratch={handleScratch}
                                        onScratchStart={handleScratchStart}
                                        onScratchEnd={handleScratchEnd}
                                        className="w-full h-full"
                                    />
                                ) : (
                                    <CoverImage
                                        src={currentTrack.cover}
                                        alt={currentTrack.album}
                                        className="w-full h-full"
                                        iconSize={64}
                                    />
                                )}
                            </>
                        ) : (
                            <CoverImage
                                src={currentTrack.cover}
                                alt={currentTrack.album}
                                className="w-full h-full"
                                iconSize={64}
                            />
                        )}
                    </div>
                </div>

                {/* Track info */}
                <div className="mb-6 mt-4">
                    <h2 className="text-2xl font-bold text-white mb-2 line-clamp-1">
                        {currentTrack.title}
                    </h2>
                    <p className="text-lg text-aki-muted line-clamp-1">
                        {currentTrack.artist}
                    </p>
                </div>

                {/* Speed indicator */}
                {!isDJMode && playbackSpeed !== NORMAL_SPEED && (
                    <div className="flex items-center justify-center gap-2 mb-4 text-aki-accent text-sm">
                        <Gauge size={16} />
                        <span className="font-mono">{playbackSpeed}%</span>
                    </div>
                )}

                {/* DJ Mode indicator */}
                {isDJMode && (
                    <div className="flex items-center justify-center gap-2 mb-4 text-aki-accent text-sm">
                        <Disc3 size={16} />
                        <span className="font-mono">DJ MODE</span>
                        {isScratching && (
                            <span className="text-xs bg-aki-accent text-black px-2 py-0.5 rounded">
                                SCRATCHING
                            </span>
                        )}
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
                        disabled={isDJMode && !scratchEngine.isReady}
                    />
                    <div className="flex justify-between text-xs text-aki-muted mt-2 font-mono">
                        <span>{formatTime(displayTime)}</span>
                        <span>{formatTime(displayDuration)}</span>
                    </div>
                </div>

                {/* Playback controls */}
                <div className="flex items-center justify-between mb-8">
                    <div className="w-6" />
                    <button onClick={handlePrevTrack}>
                        <SkipBack size={32} className="text-white" />
                    </button>
                    <button
                        onClick={handlePlayPause}
                        className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                    >
                        {isPlaying ? (
                            <Pause fill="black" size={32} />
                        ) : (
                            <Play fill="black" className="ml-1" size={32} />
                        )}
                    </button>
                    <button onClick={handleNextTrack}>
                        <SkipForward size={32} className="text-white" />
                    </button>
                    <div className="w-6" />
                </div>
            </div>
        </div>
    );
};
