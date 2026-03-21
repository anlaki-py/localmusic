/**
 * Time formatting utility for displaying track duration.
 */

/**
 * Converts seconds to a human-readable time string.
 * 
 * @param seconds - Duration in seconds
 * @returns Formatted string in "m:ss" format
 * 
 * @example
 * formatTime(125) // "2:05"
 * formatTime(0) // "0:00"
 */
export const formatTime = (seconds: number): string => {
  // Handle invalid input
  if (!seconds || isNaN(seconds)) return '0:00';

  // Calculate minutes and remaining seconds
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  // Pad seconds with leading zero if needed
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
