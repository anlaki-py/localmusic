/**
 * MIME type mappings for audio file formats.
 * Used to set correct Content-Type headers in streaming responses.
 */

/**
 * Maps file extensions to their MIME types.
 * Covers all audio formats supported by the browser's native audio element.
 */
export const AUDIO_MIME_TYPES: Record<string, string> = {
  '.mp3': 'audio/mpeg',
  '.flac': 'audio/flac',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
};

/**
 * Supported audio file extensions.
 * Used by the scanner to identify playable files.
 */
export const AUDIO_EXTENSIONS = Object.keys(AUDIO_MIME_TYPES);

/**
 * Returns the MIME type for a given file extension.
 * Falls back to 'audio/mpeg' for unknown extensions.
 * 
 * @param ext - File extension (with or without leading dot)
 * @returns MIME type string
 */
export const getMimeType = (ext: string): string => {
  const normalized = ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`;
  return AUDIO_MIME_TYPES[normalized] || 'audio/mpeg';
};
