/**
 * Server configuration constants.
 * Loads from environment variables with sensible defaults.
 * Note: dotenv.config() is called in cli.ts before this module loads
 */

import path from 'path';
import os from 'os';

/**
 * Server port number.
 * Can be configured via PORT environment variable.
 */
export const PORT = parseInt(process.env.PORT || '3001', 10);

/**
 * Returns the music library directory path.
 * Priority: process.env.MUSIC_DIR (from CLI or .env) > ~/Music
 * 
 * Uses a function instead of a static export to ensure CLI arguments
 * are processed before the value is resolved (static exports are hoisted).
 * 
 * @returns Absolute path to the music directory
 */
export function getMusicDir(): string {
  if (process.env.MUSIC_DIR) {
    return process.env.MUSIC_DIR;
  }
  return path.join(os.homedir(), 'Music');
}

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
