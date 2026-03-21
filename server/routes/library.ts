/**
 * Library route handler.
 * Provides track metadata from the music library.
 */

import { Router, Request, Response } from 'express';
import { getLibrary } from '../services/scanner';
import { MUSIC_DIR } from '../constants/config';

export const libraryRouter = Router();

/**
 * Get all tracks in the library.
 * Supports force refresh via query parameter.
 */
libraryRouter.get('/library', async (req: Request, res: Response) => {
  try {
    // Check if force refresh is requested
    const forceRefresh = req.query.refresh === 'true';

    // Get library (from cache or scan)
    const tracks = await getLibrary(MUSIC_DIR, forceRefresh);

    res.json(tracks);
  } catch (error) {
    console.error('Library error:', error);
    res.status(500).json({ error: 'Failed to scan library' });
  }
});
