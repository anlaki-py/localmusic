/**
 * Player state management store using Zustand.
 * Handles playback state, queue management, and player UI state.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Track } from '@/types';

/**
 * Player store state and actions interface.
 */
interface PlayerStore {
  // Playback state
  isPlaying: boolean;
  currentTrack: Track | null;
  queue: Track[];

  // Audio state
  volume: number;
  currentTime: number;
  duration: number;
  /** Playback speed as percentage (50-200, where 100 is normal) */
  playbackSpeed: number;

  // UI state
  isPlayerFullScreen: boolean;
  /** DJ Mode: Opt-in scratch mode with AudioWorklet */
  isDJMode: boolean;

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
  setDJMode: (enabled: boolean) => void;
}

/** Minimum playback speed (50%) */
export const MIN_SPEED = 50;
/** Maximum playback speed (200%) */
export const MAX_SPEED = 200;
/** Normal playback speed (100%) */
export const NORMAL_SPEED = 100;

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
  // Initial state
    isPlaying: false,
    currentTrack: null,
    queue: [],
    volume: 1,
    currentTime: 0,
    duration: 0,
    playbackSpeed: NORMAL_SPEED,
    isPlayerFullScreen: false,
    isDJMode: false,

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
        const { queue, currentTrack } = get();
        if (!currentTrack) return;

        const idx = queue.findIndex((t) => t.id === currentTrack.id);
        if (idx < queue.length - 1) {
          set({ currentTrack: queue[idx + 1], isPlaying: true });
        } else {
          set({ isPlaying: false, currentTime: 0 });
        }
      },

      prevTrack: () => {
        const { queue, currentTrack, currentTime } = get();

        if (!currentTrack) return;

        if (currentTime > 3) {
          set({ currentTime: 0 });
          return;
        }

        const idx = queue.findIndex((t) => t.id === currentTrack.id);
        if (idx > 0) {
          set({ currentTrack: queue[idx - 1], isPlaying: true });
        }
      },

setVolume: (volume) => set({ volume }),
    setTime: (currentTime) => set({ currentTime }),
    setDuration: (duration) => set({ duration }),
    toggleFullScreen: (isPlayerFullScreen) => set({ isPlayerFullScreen }),
    setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
    setDJMode: (isDJMode) => set({ isDJMode }),
    }),
    {
      name: 'akiflac-storage',
      partialize: (state) => ({
        volume: state.volume,
        playbackSpeed: state.playbackSpeed,
      }),
    }
  )
);
