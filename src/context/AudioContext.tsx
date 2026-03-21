/**
 * Audio Context Provider for the AkiFlac music player.
 * Provides controlled access to the audio element across the component tree.
 * Eliminates the need for direct DOM queries (document.querySelector('audio')).
 */

import {
  createContext,
  useContext,
  useRef,
  useCallback,
  ReactNode,
} from 'react';

/**
 * Imperative handle for audio element control.
 * Exposes methods for playback control without exposing the raw element.
 */
export interface AudioHandle {
  /** Seek to a specific time in seconds */
  seek: (time: number) => void;
  /** Start playback */
  play: () => void;
  /** Pause playback */
  pause: () => void;
  /** Get the current playback time in seconds */
  getCurrentTime: () => number;
  /** Get the audio element for Web Audio API connection */
  getElement: () => HTMLAudioElement | null;
}

/** Context value type */
interface AudioContextValue {
  /** Ref to the audio element */
  audioRef: React.RefObject<HTMLAudioElement>;
  /** Imperative handle for audio control */
  audioHandle: AudioHandle;
}

const AudioContext = createContext<AudioContextValue | null>(null);

/**
 * Hook to access the audio context.
 * Throws if used outside AudioProvider.
 * 
 * @returns Audio context value with ref and handle
 */
export const useAudioContext = (): AudioContextValue => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
};

interface AudioProviderProps {
  children: ReactNode;
}

/**
 * Provider component that creates and manages the audio element.
 * Wrap the application with this to enable audio control across components.
 * 
 * @param props.children - Child components
 */
export const AudioProvider = ({ children }: AudioProviderProps): ReactNode => {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Create imperative handle methods
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const play = useCallback(() => {
    audioRef.current?.play().catch((err) => {
      console.warn('Audio play prevented:', err);
    });
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const getCurrentTime = useCallback((): number => {
    return audioRef.current?.currentTime ?? 0;
  }, []);

  const getElement = useCallback((): HTMLAudioElement | null => {
    return audioRef.current;
  }, []);

  const audioHandle: AudioHandle = {
    seek,
    play,
    pause,
    getCurrentTime,
    getElement,
  };

  return (
    <AudioContext.Provider value={{ audioRef, audioHandle }}>
      {children}
    </AudioContext.Provider>
  );
};
