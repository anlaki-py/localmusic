/**
 * Custom hook to detect clicks outside a referenced element.
 * Useful for closing dropdowns, modals, and menus when clicking elsewhere.
 */

import { useEffect, RefObject } from 'react';

/**
 * Triggers a callback when a click occurs outside the referenced element.
 * 
 * @param ref - React ref to the element to watch
 * @param handler - Callback function to execute on outside click
 */
export const useClickOutside = (
  ref: RefObject<HTMLElement | null>,
  handler: () => void
): void => {
  useEffect(() => {
    // Event listener that checks if click is outside the ref element
    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      
      // Do nothing if clicking inside the element or if ref is null
      if (!ref.current || ref.current.contains(target)) {
        return;
      }
      
      handler();
    };

    // Use both mousedown and touchstart for mobile compatibility
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};
