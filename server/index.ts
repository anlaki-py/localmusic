/**
 * Express server entry point.
 * Sets up middleware, routes, and starts the server.
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { PORT, COVERS_DIR } from './constants/config';
import { streamRouter } from './routes/stream';
import { libraryRouter } from './routes/library';

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve cached cover art
app.use('/api/cover', express.static(COVERS_DIR));

// API routes
app.use('/api', streamRouter);
app.use('/api', libraryRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server running at http://0.0.0.0:${PORT}`);
  console.log(`📁 Music directory: ${process.env.MUSIC_DIR || '/sdcard/Music'}`);
});