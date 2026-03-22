/**
 * Custom hook for managing swipe gestures on touch devices.
 * Provides touch-action CSS to prevent browser gesture interference,
 * optional visual drag feedback, and configurable swipe callbacks.
 */

import { useCallback, useRef } from 'react';

/** Configuration for the swipe gesture hook */
interface SwipeGestureConfig {
  /** Minimum distance in px to trigger a swipe (default: 50) */
  threshold?: number;
  /** Called on left swipe (e.g., next track) */
  onSwipeLeft?: () => void;
  /** Called on right swipe (e.g., previous track) */
  onSwipeRight?: () => void;
  /** Called on downward swipe (e.g., close panel) */
  onSwipeDown?: () => void;
  /** Whether gestures are active — when false, all handlers are no-ops */
  enabled?: boolean;
  /** Ref to element for visual horizontal drag feedback */
  dragRef?: React.RefObject<HTMLDivElement | null>;
  /** Horizontal drag damping (0–1), lower = more resistance (default: 0.3) */
  dragDamping?: number;
}

/** Touch handlers + inline style returned from the hook */
interface SwipeGestureResult {
  /** Spread these onto the swipeable container element */
  handlers: {
    onTouchStart: ((e: React.TouchEvent) => void) | undefined;
    onTouchMove: ((e: React.TouchEvent) => void) | undefined;
    onTouchEnd: ((e: React.TouchEvent) => void) | undefined;
  };
  /** Apply to the container's style prop — sets touch-action when enabled */
  style: React.CSSProperties;
}

const DEFAULT_THRESHOLD = 50;
const DEFAULT_DAMPING = 0.3;

/**
 * Manages swipe gestures with proper browser touch-action handling.
 * When `enabled` is false, returns undefined handlers and no touch-action
 * override, allowing default browser scroll/gesture behavior.
 *
 * @param config - Swipe gesture configuration
 * @returns Touch handlers and style object for the swipeable container
 */
export const useSwipeGesture = (config: SwipeGestureConfig): SwipeGestureResult => {
  const {
    threshold = DEFAULT_THRESHOLD,
    onSwipeLeft,
    onSwipeRight,
    onSwipeDown,
    enabled = true,
    dragRef,
    dragDamping = DEFAULT_DAMPING,
  } = config;

  // Track touch origin for delta calculations
  const startX = useRef(0);
  const startY = useRef(0);

  /** Record initial touch position */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  }, []);

  /** Apply visual drag feedback on horizontal movement */
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragRef?.current) return;

    const deltaX = e.touches[0].clientX - startX.current;
    const deltaY = e.touches[0].clientY - startY.current;

    // Only drag horizontally when gesture is primarily horizontal
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      dragRef.current.style.transform = `translateX(${deltaX * dragDamping}px)`;
    }
  }, [dragRef, dragDamping]);

  /** Detect swipe direction and fire the appropriate callback */
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // Reset visual drag
    if (dragRef?.current) {
      dragRef.current.style.transform = '';
    }

    const deltaX = e.changedTouches[0].clientX - startX.current;
    const deltaY = e.changedTouches[0].clientY - startY.current;

    // Check vertical swipe down first (e.g., close)
    if (onSwipeDown && Math.abs(deltaY) > Math.abs(deltaX) && deltaY > threshold) {
      onSwipeDown();
      return;
    }

    // Horizontal swipe for left/right actions
    if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeDown, threshold, dragRef]);

  // When disabled, return no handlers and no touch-action override
  // so the browser handles all touch natively (e.g., lyrics scrolling)
  if (!enabled) {
    return {
      handlers: {
        onTouchStart: undefined,
        onTouchMove: undefined,
        onTouchEnd: undefined,
      },
      style: {},
    };
  }

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    // Prevent browser from claiming touch events for its own gestures
    style: { touchAction: 'none' },
  };
};
