/**
 * Lyrics display component.
 * Shows synced or unsynced lyrics with auto-scroll.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { SyncedLyric } from '@/types';

interface LyricsDisplayProps {
  /** Plain text lyrics */
  lyrics?: string;
  /** Time-synced lyrics */
  syncedLyrics?: SyncedLyric[];
  /** Current playback time in seconds */
  currentTime: number;
  /** Seek function to jump to time */
  onSeek?: (time: number) => void;
  /** Additional CSS classes */
  className?: string;
}

export const LyricsDisplay = ({
  lyrics,
  syncedLyrics,
  currentTime,
  onSeek,
  className,
}: LyricsDisplayProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentLineRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isSynced = syncedLyrics && syncedLyrics.length > 0;

  const getCurrentLineIndex = useCallback((): number => {
    if (!isSynced || !syncedLyrics) return -1;

    for (let i = syncedLyrics.length - 1; i >= 0; i--) {
      if (currentTime >= syncedLyrics[i].time) {
        return i;
      }
    }
    return -1;
  }, [currentTime, isSynced, syncedLyrics]);

  // Handle user scrolling - pause auto-scroll for a bit
  const handleScroll = useCallback(() => {
    setIsUserScrolling(true);
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 3000);
  }, []);

  // Auto-scroll to current line (only if user isn't scrolling)
  useEffect(() => {
    if (isUserScrolling) return;
    
    if (currentLineRef.current && containerRef.current) {
      currentLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [getCurrentLineIndex, isUserScrolling]);

  const handleLineClick = useCallback(
    (time: number) => {
      if (onSeek) {
        onSeek(time);
        setIsUserScrolling(false);
      }
    },
    [onSeek]
  );

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  if (!lyrics && !syncedLyrics) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <p className="text-aki-muted text-center px-8 text-lg">
          No lyrics available for this track
        </p>
      </div>
    );
  }

  if (isSynced && syncedLyrics) {
    const currentLineIndex = getCurrentLineIndex();

    return (
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={`overflow-y-auto h-full ${className}`}
        style={{ 
          userSelect: 'none', 
          WebkitUserSelect: 'none',
          touchAction: 'pan-y',
          overscrollBehavior: 'contain'
        }}
      >
        <div className="py-16 px-6 space-y-6">
          {syncedLyrics.map((line, index) => (
            <div
              key={`${line.time}-${index}`}
              ref={index === currentLineIndex ? currentLineRef : undefined}
              onClick={() => handleLineClick(line.time)}
              className={`text-center transition-all duration-300 cursor-pointer ${
                index === currentLineIndex
                  ? 'text-white text-2xl font-bold scale-105 opacity-100'
                  : 'text-aki-400 text-xl opacity-30'
              }`}
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            >
              {line.text}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      onScroll={handleScroll}
      className={`overflow-y-auto h-full ${className}`}
      style={{ 
        userSelect: 'none', 
        WebkitUserSelect: 'none',
        touchAction: 'pan-y',
        overscrollBehavior: 'contain'
      }}
    >
      <div className="py-16 px-6">
        <p 
          className="text-white text-center whitespace-pre-wrap text-xl leading-relaxed"
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        >
          {lyrics}
        </p>
      </div>
    </div>
  );
};
