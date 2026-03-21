import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Server port (should match server config)
const PORT = parseInt(process.env.PORT || '3001', 10);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:${PORT}`,
        changeOrigin: true,
      },
      '/stream': {
        target: `http://localhost:${PORT}`,
        changeOrigin: true,
      },
    },
  },
});
