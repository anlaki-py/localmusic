/**
 * Shared sorting logic for track collections.
 * Provides a single source of truth for sorting behavior across the application.
 */

import { Track, SortOption } from '@/types';

/**
 * Sort key mapping from user-facing sort options to track properties.
 * Maps 'dateAdded' and 'dateModified' to their actual field names.
 */
type SortKey = 'title' | 'artist' | 'album' | 'createdAt' | 'modifiedAt';

/**
 * Maps SortOption to the actual Track property used for sorting.
 */
const getSortKey = (option: SortOption): SortKey => {
  const keyMap: Record<SortOption, SortKey> = {
    dateAdded: 'createdAt',
    dateModified: 'modifiedAt',
    title: 'title',
    artist: 'artist',
    album: 'album',
  };
  return keyMap[option];
};

/**
 * Sorts an array of tracks based on the given criteria and order.
 * Handles both string (case-insensitive) and numeric comparisons.
 * 
 * @param tracks - Array of tracks to sort (not mutated)
 * @param sortBy - Property to sort by
 * @param sortOrder - 'asc' for ascending, 'desc' for descending
 * @returns New sorted array
 */
export const sortTracks = (
  tracks: Track[],
  sortBy: SortOption,
  sortOrder: 'asc' | 'desc'
): Track[] => {
  const key = getSortKey(sortBy);
  
  return [...tracks].sort((a, b) => {
    // Get values for comparison
    let valA = a[key];
    let valB = b[key];

    // Normalize strings to lowercase for case-insensitive comparison
    if (typeof valA === 'string' && typeof valB === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    // Compare and apply sort order
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};
