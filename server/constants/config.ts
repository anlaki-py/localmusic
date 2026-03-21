/**
 * Server configuration constants.
 * Loads from environment variables with sensible defaults.
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

/**
 * Server port number.
 * Can be configured via PORT environment variable.
 */
export const PORT = parseInt(process.env.PORT || '3001', 10);

/**
 * Music library directory path.
 * Must be an absolute path to the music files.
 */
export const MUSIC_DIR = process.env.MUSIC_DIR || '/sdcard/Music';

/**
 * Cache directory for cover art and library data.
 * Located in the project root under .tmp/
 */
export const CACHE_DIR = path.join(process.cwd(), '.tmp');

/**
 * Cover art cache directory.
 * Stores extracted album artwork as image files.
 */
export const COVERS_DIR = path.join(CACHE_DIR, 'covers');

/**
 * Library cache file path.
 * Stores scanned track metadata as JSON.
 */
export const LIBRARY_CACHE_FILE = path.join(CACHE_DIR, 'library_cache.json');
