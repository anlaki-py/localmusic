/**
 * Type definitions for the AkiFlac music player application.
 */

/**
 * Represents a single audio track in the library.
 */
export interface Track {
  /** Unique identifier (MD5 hash of file path) */
  id: string;
  /** Track title from metadata or filename */
  title: string;
  /** Artist name from metadata */
  artist: string;
  /** Album name from metadata */
  album: string;
  /** Duration in seconds */
  duration: number;
  /** Absolute filesystem path to the file */
  path: string;
  /** File format (mp3, flac, etc.) */
  format: string;
  /** URL to cached cover art, if available */
  cover?: string;
  /** Timestamp when file was created (milliseconds) */
  createdAt: number;
  /** Timestamp when file was last modified (milliseconds) */
  modifiedAt: number;
}

/**
 * Available sort options for the track library.
 */
export type SortOption = 'title' | 'artist' | 'album' | 'dateAdded' | 'dateModified';

/**
 * Sort order direction.
 */
export type SortOrder = 'asc' | 'desc';
