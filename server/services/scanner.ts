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
 * Synced lyric line with timestamp.
 */
interface SyncedLyric {
  time: number;
  text: string;
}

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
  /** Plain text lyrics (unsynchronized) */
  lyrics?: string;
  /** Time-synced lyrics */
  syncedLyrics?: SyncedLyric[];
  /** Timestamp when file was created (milliseconds) */
  createdAt: number;
  /** Timestamp when file was last modified (milliseconds) */
  modifiedAt: number;
}

/**
 * Parses LRC format lyrics into synced lyrics array.
 * Format: [mm:ss.xx]lyrics text
 * Also handles metadata tags like [ar:Artist], [al:Album], etc.
 */
function parseLrcLyrics(lrcContent: string): SyncedLyric[] {
  const lines: SyncedLyric[] = [];
  const lrcLines = lrcContent.split('\n');

  for (const line of lrcLines) {
    // Skip metadata lines like [ar:Artist], [al:Album], [ti:Title], [length:...]
    if (/^\[[a-z]+:/i.test(line)) continue;

    // Match timestamp lines: [mm:ss.xx] or [mm:ss.xxx]
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const centiseconds = parseInt(match[3].padEnd(3, '0'), 10);
      const time = minutes * 60 + seconds + centiseconds / 1000;
      const text = match[4].trim();
      if (text) {
        lines.push({ time, text });
      }
    }
  }

  return lines.sort((a, b) => a.time - b.time);
}

/**
 * Checks if content is LRC format (has timestamp tags).
 */
function isLrcFormat(content: string): boolean {
  return /\[\d{2}:\d{2}\.\d{2,3}\]/.test(content);
}

/**
 * Extracts lyrics from audio metadata.
 * Supports both synced (LRC) and unsynced lyrics.
 */
function extractLyrics(metadata: IAudioMetadata): { lyrics?: string; syncedLyrics?: SyncedLyric[] } {
  const result: { lyrics?: string; syncedLyrics?: SyncedLyric[] } = {};

  const nativeTags = metadata.native;

  // Helper to check if value has lyrics
  const processLyricsTag = (value: unknown): { lyrics?: string; syncedLyrics?: SyncedLyric[] } => {
    const content = typeof value === 'string' ? value : (value as { lyrics?: string }).lyrics;
    if (!content) return {};

    if (isLrcFormat(content)) {
      const parsed = parseLrcLyrics(content);
      return parsed.length > 0 ? { syncedLyrics: parsed, lyrics: content } : { lyrics: content };
    }
    return { lyrics: content };
  };

  // Try ID3v2 tags (MP3)
  if (nativeTags['ID3v2.3'] || nativeTags['ID3v2.4']) {
    const tags = nativeTags['ID3v2.3'] || nativeTags['ID3v2.4'];

    // SYLT - Synchronized lyrics (binary format, skip)
    // USLT - Unsynchronized lyrics
    const uslt = tags.find((t: { id: string }) => t.id === 'USLT');
    if (uslt && 'value' in uslt) {
      const processed = processLyricsTag(uslt.value);
      Object.assign(result, processed);
    }

    // TXXX - Custom tags (sometimes lyrics are stored here)
    const txxx = tags.filter((t: { id: string }) => t.id === 'TXXX');
    for (const tag of txxx) {
      if ('value' in tag) {
        const val = tag.value as { description: string; value: string };
        if (val.description?.toLowerCase().includes('lyrics')) {
          const processed = processLyricsTag(val.value);
          Object.assign(result, processed);
          break;
        }
      }
    }
  }

  // Try Vorbis/FLAC tags
  if (nativeTags['vorbis']) {
    const vorbisTags = nativeTags['vorbis'];

    // Check all possible lyrics tag names
    const lyricsTagNames = ['LYRICS', 'LYRIC', 'SYNCEDLYRICS', 'SYNCED_LYRICS', 'UNSYNCEDLYRICS'];
    
    for (const tagName of lyricsTagNames) {
      const tag = vorbisTags.find((t: { id: string }) => t.id.toUpperCase() === tagName);
      if (tag && 'value' in tag) {
        const processed = processLyricsTag(tag.value);
        if (processed.lyrics || processed.syncedLyrics) {
          Object.assign(result, processed);
          break;
        }
      }
    }
  }

  // Try iTunes-specific tags
  if (nativeTags['iTunes']) {
    const itunesTags = nativeTags['iTunes'];
    const lyricsTag = itunesTags.find((t: { id: string }) => t.id === '©lyr');
    if (lyricsTag && 'value' in lyricsTag) {
      const processed = processLyricsTag(lyricsTag.value);
      Object.assign(result, processed);
    }
  }

  return result;
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

            // Extract lyrics from metadata
            const { lyrics, syncedLyrics } = extractLyrics(metadata);

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
              lyrics,
              syncedLyrics,
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
