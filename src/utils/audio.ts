/**
 * Audio utility functions for Web Audio API.
 * Handles playback speed and pitch adjustment.
 */

/** Audio context instance (singleton) */
let context: AudioContext | null = null;

/** Source node from audio element */
let source: MediaElementAudioSourceNode | null = null;

/** Currently connected audio element */
let currentAudioElement: HTMLMediaElement | null = null;

/**
 * Sets up the Web Audio API for the audio element.
 * 
 * @param audioElement - The HTML audio element
 * @returns Object containing context
 */
export const setupAudioContext = (audioElement: HTMLMediaElement) => {
  // Prevent duplicate setup for same element
  if (context && currentAudioElement === audioElement) {
    return { context };
  }

  try {
    // Create AudioContext with vendor prefix fallback
    const AudioContextClass = window.AudioContext || 
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    context = new AudioContextClass();

    // Connect audio element to context
    source = context.createMediaElementSource(audioElement);
    source.connect(context.destination);
    
    currentAudioElement = audioElement;

    console.log('Audio Context Initialized');
  } catch (error) {
    console.error('Audio Context Setup Failed:', error);
  }

  return { context };
};

/**
 * Resumes the AudioContext if it's suspended.
 */
export const resumeAudioContext = () => {
  if (context && context.state === 'suspended') {
    context.resume().catch((err) => {
      console.warn('Failed to resume AudioContext:', err);
    });
  }
};

/**
 * Gets the current AudioContext.
 */
export const getAudioContext = (): AudioContext | null => context;
