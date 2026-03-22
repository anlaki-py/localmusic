/**
 * Main player bar component that orchestrates mobile and desktop players.
 * Renders appropriate player based on screen size.
 */

import { useState, useCallback } from 'react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { PlayerFull } from './PlayerFull';
import { PlayerMini } from './PlayerMini';
import { PlayerDesktop } from './PlayerDesktop';
import { SpeedModal } from '@/components/ui/SpeedModal';

export const PlayerBar = () => {
  const { currentTrack, isPlayerFullScreen, toggleFullScreen } = usePlayerStore();
  const [isSpeedModalOpen, setIsSpeedModalOpen] = useState(false);

  // Memoize handlers to prevent unnecessary re-renders
  const handleOpenFull = useCallback(() => {
    toggleFullScreen(true);
  }, [toggleFullScreen]);

  const handleCloseFull = useCallback(() => {
    toggleFullScreen(false);
  }, [toggleFullScreen]);

  const handleOpenSpeedModal = useCallback(() => {
    setIsSpeedModalOpen(true);
  }, []);

  const handleCloseSpeedModal = useCallback(() => {
    setIsSpeedModalOpen(false);
  }, []);

  // Don't render if no track is loaded
  if (!currentTrack) return null;

  return (
    <>
      {/* Mobile full-screen player */}
      <PlayerFull
        isOpen={isPlayerFullScreen}
        onClose={handleCloseFull}
        onOpenSpeedModal={handleOpenSpeedModal}
      />

      {/* Mobile mini player */}
      <PlayerMini onOpenFull={handleOpenFull} />

      {/* Desktop player bar */}
      <PlayerDesktop onOpenSpeedModal={handleOpenSpeedModal} />

      {/* Speed modal - rendered at root level for proper z-index */}
      <SpeedModal isOpen={isSpeedModalOpen} onClose={handleCloseSpeedModal} />
    </>
  );
};
