/**
 * Library state management store using Zustand.
 * Handles track collection, loading state, and sorting.
 * All sorting state lives here (not in usePlayerStore).
 */

import { create } from 'zustand';
import { Track, SortOption, SortOrder } from '@/types';
import { sortTracks } from '@/libs/sort';

/**
 * Library store state and actions interface.
 */
interface LibraryStore {
  /** Array of all tracks in the library */
  tracks: Track[];
  /** Whether library is currently loading/scanning */
  isLoading: boolean;
  /** Current sort criteria */
  sortBy: SortOption;
  /** Current sort direction */
  sortOrder: SortOrder;

  /** Fetch library from server, optionally force refresh */
  fetchLibrary: (forceRefresh?: boolean) => Promise<void>;
  /** Change sort criteria and re-sort tracks */
  setSortBy: (option: SortOption) => void;
  /** Change sort direction and re-sort tracks */
  setSortOrder: (order: SortOrder) => void;
}

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  // Initial state
  tracks: [],
  isLoading: false,
  sortBy: 'dateAdded',
  sortOrder: 'desc', // Default: newest first

  /**
   * Fetch tracks from the server.
   * @param forceRefresh - If true, force server to rescan files
   */
  fetchLibrary: async (forceRefresh = false) => {
    set({ isLoading: true });
    
    try {
      // Build URL with cache-busting query params
      const url = `/api/library?refresh=${forceRefresh}&t=${Date.now()}`;
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch library: ${res.status}`);
      }
      
      const data: Track[] = await res.json();
      
      // Apply current sort settings to new data
      const { sortBy, sortOrder } = get();
      const sorted = sortTracks(data, sortBy, sortOrder);
      
      set({ tracks: sorted, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch library:', error);
      set({ isLoading: false });
    }
  },

  /**
   * Change the sort criteria and re-sort the track list.
   * @param option - New sort criteria
   */
  setSortBy: (option: SortOption) => {
    const { tracks, sortOrder } = get();
    const sorted = sortTracks(tracks, option, sortOrder);
    set({ tracks: sorted, sortBy: option });
  },

  /**
   * Change the sort direction and re-sort the track list.
   * @param order - New sort direction
   */
  setSortOrder: (order: SortOrder) => {
    const { tracks, sortBy } = get();
    const sorted = sortTracks(tracks, sortBy, order);
    set({ tracks: sorted, sortOrder: order });
  },
}));
