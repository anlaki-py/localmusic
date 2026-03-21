/**
 * Library header component with title and sort controls.
 * Displays track count and provides sorting dropdown menu.
 */

import { useState } from 'react';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { SortMenu } from '@/components/library/SortMenu';

/**
 * Header component for the library page.
 * Shows title, track count, and sort controls.
 */
export const LibraryHeader = () => {
  const { tracks, isLoading, sortBy, sortOrder, setSortBy, setSortOrder, fetchLibrary } =
    useLibraryStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="mb-6 md:mb-8 bg-gradient-to-br from-aki-800 to-aki-900 p-6 md:p-8 rounded-2xl shadow-lg border border-aki-800/50 flex justify-between items-start relative">
      <div>
        <h1 className="text-2xl md:text-4xl font-bold mb-2">Library</h1>
        <p className="text-aki-muted text-sm md:text-base">
          {isLoading ? 'Updating library...' : `${tracks.length} tracks available locally`}
        </p>
      </div>

      {/* Sort menu */}
      <SortMenu
        isOpen={isMenuOpen}
        onToggle={() => setIsMenuOpen(!isMenuOpen)}
        sortBy={sortBy}
        sortOrder={sortOrder}
        isLoading={isLoading}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
        onRefresh={() => fetchLibrary(true)}
      />
    </div>
  );
};
