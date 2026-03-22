/**
* CLI entry point for the server.
* Parses command-line arguments before starting the server.
* Supports --path or -p to specify custom music root directory.
*
* IMPORTANT: Uses dynamic import to ensure CLI args are processed
* before the server loads. Static imports are hoisted and would
* execute before any runtime code.
*/

import minimist from 'minimist';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables from .env file first
dotenv.config();

// Parse CLI arguments (skip first two: node and script path)
const args = minimist(process.argv.slice(2), {
  string: ['path', 'p'],
  alias: { p: 'path' },
  default: {}
});

// Set MUSIC_DIR env var if --path or -p is provided
// Use path.resolve() for cross-platform path normalization
// This overrides the .env value
if (args.path) {
  const resolvedPath = path.resolve(args.path);
  
  // Validate that the directory exists
  if (!fs.existsSync(resolvedPath)) {
    console.error(`❌ Error: Directory not found: ${resolvedPath}`);
    process.exit(1);
  }
  
  process.env.MUSIC_DIR = resolvedPath;
  console.log(`📁 Music directory: ${resolvedPath}`);
}

// Dynamic import ensures this runs AFTER CLI args are processed
// Static imports are hoisted and would run BEFORE dotenv.config()
await import('./index');
