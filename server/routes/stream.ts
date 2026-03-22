/**
 * Stream route handler for audio files.
 * Supports range requests for seeking functionality.
 */

import { Router, Request, Response } from 'express';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { getMusicDir } from '../constants/config';
import { getMimeType } from '../constants/mimeTypes';

export const streamRouter = Router();

/**
 * Stream audio files with Range request support.
 * Handles partial content (206) for seeking.
 */
streamRouter.get('/stream', async (req: Request, res: Response) => {
  const filePath = req.query.path as string;

  // Validate required parameter
  if (!filePath) {
    return res.status(400).send('No file path provided');
  }

  // Security: Ensure path is within MUSIC_DIR
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(getMusicDir())) {
    return res.status(403).send('Access denied');
  }

  // Check if file exists (async)
  try {
    await fsPromises.access(resolvedPath);
  } catch {
    return res.status(404).send('File not found');
  }

  // Get file stats (async)
  const stats = await fsPromises.stat(resolvedPath);
  const fileSize = stats.size;
  const mimeType = getMimeType(path.extname(resolvedPath));

  // Handle Range request for seeking
  const range = req.headers.range;

  if (range) {
    // Parse range header: bytes=start-end
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    // Create read stream for the requested range
    const fileStream = fs.createReadStream(resolvedPath, { start, end });

    // Send partial content response
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': mimeType,
    });

    fileStream.pipe(res);
  } else {
    // No range requested, send entire file
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': mimeType,
    });

    fs.createReadStream(resolvedPath).pipe(res);
  }
});
