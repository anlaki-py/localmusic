/**
 * Main player bar component that orchestrates mobile and desktop players.
 * Renders appropriate player based on screen size.
 */

import { useCallback } from 'react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { PlayerFull } from './PlayerFull';
import { PlayerMini } from './PlayerMini';
import { PlayerDesktop } from './PlayerDesktop';

/**
 * Main player component that coordinates all player variants.
 * - Mobile: Shows mini player that expands to full-screen
 * - Desktop: Shows fixed bottom bar with full controls
 */
export const PlayerBar = () => {
  const { currentTrack, isPlayerFullScreen, toggleFullScreen } = usePlayerStore();

  // Memoize handlers to prevent unnecessary re-renders
  const handleOpenFull = useCallback(() => {
    toggleFullScreen(true);
  }, [toggleFullScreen]);

  const handleCloseFull = useCallback(() => {
    toggleFullScreen(false);
  }, [toggleFullScreen]);

  // Don't render if no track is loaded
  if (!currentTrack) return null;

  return (
    <>
      {/* Mobile full-screen player */}
      <PlayerFull
        isOpen={isPlayerFullScreen}
        onClose={handleCloseFull}
      />

      {/* Mobile mini player */}
      <PlayerMini onOpenFull={handleOpenFull} />

      {/* Desktop player bar */}
      <PlayerDesktop />
    </>
  );
};
