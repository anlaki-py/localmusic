/**
 * Application route definitions.
 * Centralizes all route paths for easy maintenance and type safety.
 */

export const ROUTES = {
  // Main pages
  HOME: '/',
  ARTISTS: '/artists',
  ALBUMS: '/albums',
  FILES: '/files',
  
  // Playlists
  FAVORITES: '/playlist/fav',
  
  // API routes (for reference)
  API: {
    STREAM: '/api/stream',
    LIBRARY: '/api/library',
    COVER: '/api/cover',
  },
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];
