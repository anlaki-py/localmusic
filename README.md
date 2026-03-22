# Local Music Server

A self-hosted music server that scans your local library and streams it to any device on your network through a browser.

## How it works

The server scans a directory for audio files, caches the track metadata, and exposes it through a REST API. A React frontend lets you browse and play your library from any device on the same network.

Supported formats: MP3, FLAC, WAV, OGG, M4A, AAC

## Setup

Install dependencies:

```bash
npm install
```

Configure your music directory (optional):

```bash
cp .env.example .env
# Set MUSIC_DIR and PORT in .env
```

Defaults to `~/Music` on port `3001` if no environment variables are set.

## Usage

Start the server:

```bash
npm run server
# or pass a custom music directory
npm run server -- --path /path/to/music
```

Start the client:

```bash
npm run client
```

Then open `http://<your-machine-ip>:5173` on any device on your network.
    
## Cache

Track metadata and cover art are cached in `.tmp/` at the project root for faster library loading and access. Delete this directory to clear the cache.
