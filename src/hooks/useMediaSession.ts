/**
 * Media Session hook for lock screen controls.
 * Provides metadata and action handlers for OS media controls.
 */

import { useEffect } from 'react';
import { usePlayerStore } from '@/stores/usePlayerStore';

/**
 * Action handlers for MediaSession API.
 * Maps action names to their handler functions.
 */
const ACTION_HANDLERS = [
  ['play', 'setPlaying', true] as const,
  ['pause', 'setPlaying', false] as const,
  ['previoustrack', 'prevTrack'] as const,
  ['nexttrack', 'nextTrack'] as const,
] as const;

/**
 * Hook to register Media Session API handlers.
 * Enables lock screen controls and media notifications.
 * Should be used inside AudioProvider context.
 */
export const useMediaSession = () => {
  const { currentTrack, isPlaying, setPlaying, nextTrack, prevTrack } = usePlayerStore();

  // Update media metadata when track changes
  useEffect(() => {
    if (!currentTrack || !('mediaSession' in navigator)) return;

    // Build artwork array with absolute URLs
    const artwork = currentTrack.cover
      ? [
          { src: currentTrack.cover, sizes: '96x96', type: 'image/jpeg' },
          { src: currentTrack.cover, sizes: '128x128', type: 'image/jpeg' },
          { src: currentTrack.cover, sizes: '192x192', type: 'image/jpeg' },
          { src: currentTrack.cover, sizes: '256x256', type: 'image/jpeg' },
          { src: currentTrack.cover, sizes: '384x384', type: 'image/jpeg' },
          { src: currentTrack.cover, sizes: '512x512', type: 'image/jpeg' },
        ]
      : [];

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      album: currentTrack.album,
      artwork,
    });
  }, [currentTrack]);

  // Update playback state
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

  // Register action handlers
  // Note: These handlers only update store state - AudioController handles actual audio
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    // Register each action handler
    for (const [action, method, ...args] of ACTION_HANDLERS) {
      try {
        const handler = () => {
          // Call the appropriate store method
          switch (method) {
            case 'setPlaying':
              setPlaying(args[0] as boolean);
              break;
            case 'prevTrack':
              prevTrack();
              break;
            case 'nextTrack':
              nextTrack();
              break;
          }
        };

        navigator.mediaSession.setActionHandler(action as MediaSessionAction, handler);
      } catch {
        console.warn(`MediaSession action ${action} not supported`);
      }
    }

    // Register seek handler separately (needs special handling)
    try {
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          // Store update will trigger AudioController to seek
          setPlaying(false);
          setPlaying(true);
        }
      });
    } catch {
      console.warn('MediaSession seekto not supported');
    }
  }, [setPlaying, nextTrack, prevTrack]);
};
