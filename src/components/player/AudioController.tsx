/**
 * Audio controller component.
 * Manages the audio element and syncs with player state.
 * 
 * Playback speed uses percentage (50-200%):
 * - 50%: Half speed, pitch down one octave
 * - 100%: Normal speed and pitch
 * - 200%: Double speed, pitch up one octave
 */

import { useEffect, useRef, useCallback } from 'react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useAudioContext } from '@/context/AudioContext';
import { setupAudioContext, resumeAudioContext } from '@/utils/audio';

export const AudioController = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    playbackSpeed,
    repeatMode,
    nextTrack,
    setTime,
    setDuration,
    setPlaying,
    setBuffering,
  } = usePlayerStore();

  const { audioRef } = useAudioContext();
  const isLoadingNewTrack = useRef(false);
  const lastTrackId = useRef<string | null>(null);

  // Initialize Web Audio API on first user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      const audio = audioRef.current;
      if (audio) {
        setupAudioContext(audio);
        resumeAudioContext();
      }
    };

    window.addEventListener('click', handleUserInteraction, { once: true });
    window.addEventListener('touchstart', handleUserInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [audioRef]);

  // Handle track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentTrack) {
      audio.src = '';
      audio.load();
      lastTrackId.current = null;
      return;
    }

    if (lastTrackId.current === currentTrack.id) return;

    const streamUrl = `/api/stream?path=${encodeURIComponent(currentTrack.path)}`;
    isLoadingNewTrack.current = true;
    lastTrackId.current = currentTrack.id;
    audio.src = streamUrl;

    if (isPlaying) audio.load();
  }, [currentTrack, audioRef, isPlaying]);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (isLoadingNewTrack.current) return;

    if (isPlaying) {
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, audioRef, currentTrack, setPlaying]);

  // Sync volume
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
  }, [volume, audioRef]);

  // Sync playback speed (convert percentage to rate: 100% = 1.0)
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = playbackSpeed / 100;
      audio.preservesPitch = false;
    }
  }, [playbackSpeed, audioRef]);

  const handleEnded = useCallback(() => {
    if (repeatMode === 'one') {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => setPlaying(false));
      }
      return;
    }
    nextTrack();
  }, [nextTrack, repeatMode, audioRef, setPlaying]);

  const handleCanPlay = useCallback(() => {
    isLoadingNewTrack.current = false;
    setBuffering(false);
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed / 100;
      audioRef.current.preservesPitch = false;
    }
    if (isPlaying) {
      audioRef.current?.play().catch(() => setPlaying(false));
    }
  }, [isPlaying, audioRef, setPlaying, playbackSpeed, setBuffering]);

  const handleWaiting = useCallback(() => {
    setBuffering(true);
  }, [setBuffering]);

  const handlePlaying = useCallback(() => {
    setBuffering(false);
  }, [setBuffering]);

  const handleError = useCallback((e: React.SyntheticEvent<HTMLAudioElement>) => {
    console.error('Audio Error:', e.currentTarget.error);
    isLoadingNewTrack.current = false;
    setBuffering(false);
  }, [setBuffering]);

  const handleSeeked = useCallback(() => {
    if (isPlaying && audioRef.current?.currentTime === 0) {
      audioRef.current.play().catch(() => {});
    }
  }, [isPlaying, audioRef]);

  return (
    <audio
      id="aki-audio-player"
      ref={audioRef}
      preload="auto"
      onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
      onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      onCanPlay={handleCanPlay}
      onEnded={handleEnded}
      onSeeked={handleSeeked}
      onError={handleError}
      onWaiting={handleWaiting}
      onPlaying={handlePlaying}
    />
  );
};
