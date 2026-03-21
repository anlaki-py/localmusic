/**
 * Cover image component with fallback handling.
 * Displays album artwork or a placeholder icon.
 */

import { useState } from 'react';
import { Disc } from 'lucide-react';
import { clsx } from 'clsx';

interface CoverImageProps {
  /** URL to cover image */
  src?: string;
  /** Alt text for accessibility */
  alt: string;
  /** Additional CSS classes */
  className?: string;
  /** Size of fallback icon in pixels */
  iconSize?: number;
}

/**
 * Displays an album cover image with fallback.
 * Shows a disc icon when image is missing or fails to load.
 * 
 * @param props - Component props
 */
export const CoverImage = ({
  src,
  alt,
  className,
  iconSize = 24,
}: CoverImageProps) => {
  const [error, setError] = useState(false);

  // Show fallback if no src or image failed to load
  if (!src || error) {
    return (
      <div
        className={clsx(
          'bg-aki-700 flex items-center justify-center text-aki-muted',
          className
        )}
        role="img"
        aria-label={alt}
      >
        <Disc size={iconSize} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={clsx('object-cover', className)}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
};
