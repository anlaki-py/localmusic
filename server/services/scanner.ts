/**
 * Music library scanner service.
 * Scans directories for audio files and extracts metadata.
 */

import fsPromises from 'fs/promises';
import path from 'path';
import { parseFile, IAudioMetadata } from 'music-metadata';
import crypto from 'crypto';
import { COVERS_DIR, LIBRARY_CACHE_FILE } from '../constants/config';
import { AUDIO_EXTENSIONS } from '../constants/mimeTypes';

/**
 * Track metadata extracted from audio files.
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
 * Initializes the cache directories asynchronously.
 * Should be called before scanning.
 */
async function initCacheDirs(): Promise<void> {
  try {
    await fsPromises.mkdir(COVERS_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists, ignore error
  }
}

/**
 * Extracts and caches album artwork from audio metadata.
 * 
 * @param metadata - Audio metadata from music-metadata
 * @param uniqueId - Fallback identifier for cover naming
 * @returns URL to cached cover or undefined if no artwork
 */
async function extractCover(
  metadata: IAudioMetadata,
  uniqueId: string
): Promise<string | undefined> {
  const picture = metadata.common.picture?.[0];
  if (!picture) return undefined;

  // Use artist-album as identifier for deduplication
  const identifier =
    metadata.common.album && metadata.common.artist
      ? `${metadata.common.artist}-${metadata.common.album}`
      : uniqueId;

  // Create stable hash for filename
  const hash = crypto.createHash('md5').update(identifier).digest('hex');
  const ext = picture.format === 'image/png' ? 'png' : 'jpg';
  const filename = `${hash}.${ext}`;
  const filePath = path.join(COVERS_DIR, filename);
  const publicUrl = `/api/cover/${filename}`;

  // Check if cover already cached
  try {
    await fsPromises.access(filePath);
    return publicUrl;
  } catch {
    // Not cached, write it
  }

  // Write cover to cache
  try {
    await fsPromises.writeFile(filePath, picture.data);
    return publicUrl;
  } catch (error) {
    console.error('Failed to write cover:', error);
    return undefined;
  }
}

/**
 * Recursively scans a directory for audio files.
 * Extracts metadata and artwork from each file.
 * 
 * @param dir - Directory to scan
 * @returns Array of Track objects
 */
async function scanRecursively(dir: string): Promise<Track[]> {
  const tracks: Track[] = [];
  const entries = await fsPromises.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recurse into subdirectories
      const subTracks = await scanRecursively(fullPath);
      tracks.push(...subTracks);
    } else {
      // Check if file is a supported audio format
      const ext = path.extname(entry.name).toLowerCase();
      if (!AUDIO_EXTENSIONS.includes(ext)) continue;

      try {
        // Get file stats and metadata
        const stats = await fsPromises.stat(fullPath);
        const metadata = await parseFile(fullPath);

        // Create stable ID from file path hash
        const id = crypto.createHash('md5').update(fullPath).digest('hex');

        // Extract and cache cover art
        const coverUrl = await extractCover(metadata, id);

        // Handle birthtime (file creation time)
        // Some filesystems return 0 or epoch for birthtime
        const birthtime = stats.birthtimeMs > 0 ? stats.birthtimeMs : stats.mtimeMs;

        tracks.push({
          id,
          title: metadata.common.title || path.basename(entry.name, ext),
          artist: metadata.common.artist || 'Unknown Artist',
          album: metadata.common.album || 'Unknown Album',
          duration: metadata.format.duration || 0,
          path: fullPath,
          format: ext.replace('.', ''),
          cover: coverUrl,
          createdAt: birthtime,
          modifiedAt: stats.mtimeMs,
        });
      } catch (error) {
        console.error(`Error parsing ${entry.name}:`, error);
      }
    }
  }

  return tracks;
}

/**
 * Gets the music library, optionally refreshing from disk.
 * 
 * @param musicDir - Root directory to scan
 * @param forceRefresh - If true, rescan even if cache exists
 * @returns Array of Track objects
 */
export async function getLibrary(
  musicDir: string,
  forceRefresh = false
): Promise<Track[]> {
  // Initialize cache directories on first run
  await initCacheDirs();

  // Try to load from cache
  if (!forceRefresh) {
    try {
      const cacheData = await fsPromises.readFile(LIBRARY_CACHE_FILE, 'utf-8');
      return JSON.parse(cacheData) as Track[];
    } catch {
      console.log('Cache not found or corrupted, scanning...');
    }
  }

  // Scan directory
  const tracks = await scanRecursively(musicDir);

  // Save to cache
  try {
    await fsPromises.writeFile(
      LIBRARY_CACHE_FILE,
      JSON.stringify(tracks, null, 2)
    );
  } catch (error) {
    console.error('Failed to save cache:', error);
  }

  return tracks;
}
