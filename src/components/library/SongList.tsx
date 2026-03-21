/**
 * Song list component.
 * Displays tracks in a table-like layout with playback on click.
 */

import { useCallback } from 'react';
import { Play, MoreVertical } from 'lucide-react';
import { Track } from '@/types';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { formatTime } from '@/utils/format';
import { CoverImage } from '@/components/ui/CoverImage';

interface SongListProps {
  /** Array of tracks to display */
  tracks: Track[];
}

/**
 * Displays a list of tracks in a table-like layout.
 * Clicking a track starts playback with the full list as queue.
 */
export const SongList = ({ tracks }: SongListProps) => {
  const { playTrack, currentTrack, isPlaying } = usePlayerStore();

  // Handle track click - start playback with queue
  const handleTrackClick = useCallback(
    (track: Track, queue: Track[]) => {
      // Determine if we should open full-screen on mobile
      const isMobile = window.innerWidth < 768;
      // Play the track with the full list as queue
      playTrack(track, queue, isMobile && !isPlaying);
    },
    [playTrack, isPlaying]
  );

  // Handle empty state
  if (tracks.length === 0) {
    return (
      <div className="p-4 text-aki-muted text-center">
        No tracks found.
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col pb-40 md:pb-32">
      {/* Desktop header row */}
      <div className="hidden md:grid grid-cols-[50px_2fr_1fr_80px] text-aki-muted text-sm border-b border-aki-800 px-4 py-2 mb-2">
        <span>#</span>
        <span>Title</span>
        <span>Album</span>
        <span className="text-right">Time</span>
      </div>

      {/* Track list */}
      {tracks.map((track, index) => {
        const isCurrent = currentTrack?.id === track.id;

        return (
          <div
            key={track.id}
            onClick={() => handleTrackClick(track, tracks)}
            className={`
              group relative flex items-center md:grid md:grid-cols-[50px_2fr_1fr_80px]
              gap-4 p-3 md:px-4 md:py-2 rounded-lg cursor-pointer transition-colors
              ${isCurrent ? 'bg-aki-800/50' : 'hover:bg-aki-800'}
            `}
          >
            {/* Index / Album art (mobile) / Play icon on hover */}
            <div className="flex-shrink-0 w-12 h-12 md:w-10 md:h-10 relative flex items-center justify-center">
              {/* Mobile: Show album art */}
              <div className="md:hidden w-full h-full">
                <CoverImage
                  src={track.cover}
                  alt={track.album}
                  className="w-full h-full rounded"
                  iconSize={20}
                />
              </div>

              {/* Desktop: Show index, play icon on hover */}
              <span className="hidden md:block group-hover:hidden text-aki-muted text-sm">
                {index + 1}
              </span>
              <Play
                size={16}
                className="hidden md:group-hover:block text-white absolute"
                fill="currentColor"
              />
            </div>

            {/* Title and artist */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div
                className={`font-medium truncate ${
                  isCurrent ? 'text-aki-accent' : 'text-white'
                }`}
              >
                {track.title}
              </div>
              <div className="text-sm text-aki-muted truncate">
                {track.artist}
              </div>
            </div>

            {/* Album (desktop only) */}
            <div className="hidden md:flex items-center text-sm text-aki-muted truncate">
              {track.album}
            </div>

            {/* Duration and menu button */}
            <div className="flex items-center justify-end gap-2">
              <span className="hidden md:block text-sm text-aki-muted font-mono">
                {formatTime(track.duration)}
              </span>
              <button
                className="md:hidden p-2 text-aki-muted"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical size={20} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
