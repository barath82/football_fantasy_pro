import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Never let the service worker's offline/SPA fallback swallow a real
        // navigation to the API (e.g. the Google/X OAuth redirect links) —
        // without this, Workbox's default behavior serves the cached SPA
        // shell for any unrecognized navigation, including /api/*, which
        // silently broke login (see MEMORY.md, 2026-08-20).
        navigateFallbackDenylist: [/^\/api\//],
      },
      manifest: {
        name: 'Fantasy Analytics',
        short_name: 'FPL Analytics',
        description: 'EPL Fantasy Premier League intelligence dashboard',
        theme_color: '#1a1b1e',
        background_color: '#1a1b1e',
        display: 'standalone',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // NOTE: matches PORT in .env (moved off 3001 — see .env comment).
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
});
