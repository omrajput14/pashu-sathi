/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'https://api.vetra.co.in',
        changeOrigin: true,
        secure: true,
      },
      '/actuator': {
        target: 'https://api.vetra.co.in',
        changeOrigin: true,
        secure: true,
      },
      '/maptiler-tiles': {
        target: 'https://api.maptiler.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/maptiler-tiles/, ''),
        headers: {
          Referer: 'http://localhost:3000/',
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});
