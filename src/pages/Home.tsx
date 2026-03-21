/**
 * Home page component displaying the music library.
 * Shows library header, track list, and loading states.
 */

import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { SongList } from '@/components/library/SongList';
import { LibraryHeader } from '@/components/library/LibraryHeader';
import { useLibraryStore } from '@/stores/useLibraryStore';

/**
 * Home page showing the music library.
 * Fetches library on mount and displays track list.
 */
export const Home = () => {
  const { tracks, isLoading, fetchLibrary } = useLibraryStore();

  // Fetch library on mount
  useEffect(() => {
    fetchLibrary(false);
  }, [fetchLibrary]);

  return (
    <div className="p-4 md:p-8">
      {/* Library header with sort controls */}
      <LibraryHeader />

      {/* Loading state with no tracks */}
      {isLoading && tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-aki-muted">
          <RefreshCw className="animate-spin mb-4" size={32} />
          <div>Scanning local files...</div>
        </div>
      ) : (
        <SongList tracks={tracks} />
      )}
    </div>
  );
};
