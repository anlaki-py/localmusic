/**
 * Player state management store using Zustand.
 * Handles playback state, queue management, and player UI state.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Track } from '@/types';

/** Minimum playback speed (50%) */
export const MIN_SPEED = 50;
/** Maximum playback speed (200%) */
export const MAX_SPEED = 200;
/** Normal playback speed (100%) */
export const NORMAL_SPEED = 100;

/** Repeat mode enum */
export type RepeatMode = 'off' | 'all' | 'one';

interface PlayerStore {
  // Playback state
  isPlaying: boolean;
  currentTrack: Track | null;
  queue: Track[];
  repeatMode: RepeatMode;
  isShuffled: boolean;
  isBuffering: boolean;
  showLyrics: boolean;

  // Audio state
  volume: number;
  currentTime: number;
  duration: number;
  playbackSpeed: number;

  // UI state
  isPlayerFullScreen: boolean;

  // Actions
  setPlaying: (playing: boolean) => void;
  playTrack: (track: Track, queue?: Track[], openFullScreen?: boolean) => void;
  addToQueue: (track: Track) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (vol: number) => void;
  setTime: (time: number) => void;
  setDuration: (duration: number) => void;
  toggleFullScreen: (isOpen: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  toggleRepeatMode: () => void;
  toggleShuffle: () => void;
  setBuffering: (buffering: boolean) => void;
  toggleLyrics: () => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isPlaying: false,
      currentTrack: null,
      queue: [],
      repeatMode: 'off',
      isShuffled: false,
      isBuffering: false,
      showLyrics: false,
      volume: 1,
      currentTime: 0,
      duration: 0,
      playbackSpeed: NORMAL_SPEED,
      isPlayerFullScreen: false,

      // Actions
      setPlaying: (isPlaying) => set({ isPlaying }),

      playTrack: (track, newQueue, openFullScreen = false) => {
        set({
          currentTrack: track,
          queue: newQueue || [track],
          isPlaying: true,
          isPlayerFullScreen: openFullScreen,
        });
      },

      addToQueue: (track) => set((state) => ({
        queue: [...state.queue, track]
      })),

      nextTrack: () => {
        const { queue, currentTrack, isShuffled } = get();
        if (!currentTrack || queue.length === 0) return;

        // Shuffle picks a random track
        if (isShuffled) {
          const nextIdx = Math.floor(Math.random() * queue.length);
          set({ currentTrack: queue[nextIdx], currentTime: 0, isPlaying: true });
          return;
        }

        // Always loop: wrap to start when at the end
        const idx = queue.findIndex((t) => t.id === currentTrack.id);
        const nextIdx = (idx + 1) % queue.length;
        set({ currentTrack: queue[nextIdx], currentTime: 0, isPlaying: true });
      },

      prevTrack: () => {
        const { queue, currentTrack, currentTime, isShuffled } = get();
        if (!currentTrack || queue.length === 0) return;

        // If past 3 seconds, restart current track instead of going back
        if (currentTime > 3) {
          set({ currentTime: 0 });
          return;
        }

        // Shuffle picks a random track
        if (isShuffled) {
          const prevIdx = Math.floor(Math.random() * queue.length);
          set({ currentTrack: queue[prevIdx], currentTime: 0, isPlaying: true });
          return;
        }

        // Always loop: wrap to end when at the start
        const idx = queue.findIndex((t) => t.id === currentTrack.id);
        const prevIdx = (idx - 1 + queue.length) % queue.length;
        set({ currentTrack: queue[prevIdx], currentTime: 0, isPlaying: true });
      },

      setVolume: (volume) => set({ volume }),
      setTime: (currentTime) => set({ currentTime }),
      setDuration: (duration) => set({ duration }),
      toggleFullScreen: (isPlayerFullScreen) => set({ isPlayerFullScreen }),
      setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),

      toggleRepeatMode: () => {
        const { repeatMode } = get();
        const modes: RepeatMode[] = ['off', 'all', 'one'];
        const nextIdx = (modes.indexOf(repeatMode) + 1) % modes.length;
        set({ repeatMode: modes[nextIdx] });
      },

      toggleShuffle: () => {
        set((state) => ({ isShuffled: !state.isShuffled }));
      },

      setBuffering: (isBuffering) => set({ isBuffering }),

      toggleLyrics: () => set((state) => ({ showLyrics: !state.showLyrics })),
    }),
    {
      name: 'akiflac-storage',
      partialize: (state) => ({
        volume: state.volume,
        playbackSpeed: state.playbackSpeed,
        repeatMode: state.repeatMode,
        isShuffled: state.isShuffled,
      }),
    }
  )
);
