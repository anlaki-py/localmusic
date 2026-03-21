/** @type {import('tailwindcss').Config} */

/**
 * Tailwind CSS configuration for AkiFlac music player.
 * Extends default theme with custom colors and includes animation plugins.
 */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aki: {
          900: '#121212',
          800: '#181818',
          700: '#282828',
          accent: '#1db954',
          text: '#ffffff',
          muted: '#b3b3b3'
        }
      },
      safeArea: {
        inset: 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}
