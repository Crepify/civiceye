import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: true,
    open: false,
    // Allow sandboxed preview hosts (e.g. *.e2b.app) during development.
    allowedHosts: ['.e2b.app', 'localhost', '127.0.0.1'],
    proxy: {
      // Dev-only: mimic the /api/roboflow serverless function so
      // `npm run dev` works without the Vercel runtime. Forwards to
      // the real Roboflow workflow endpoint (server-side -> no CORS).
      '/api/roboflow': {
        target: 'https://serverless.roboflow.com',
        changeOrigin: true,
        secure: true,
        rewrite: (p) =>
          p.replace(
            /^\/api\/roboflow/,
            '/aswathram-kumar/workflows/civiceye-pothole-reporting-starter-1786336062967',
          ),
      },
    },
  },
  preview: {
    port: 4173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          // Keep the heavy map / animation vendors in separate chunks for faster first paint.
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-maps': ['@googlemaps/js-api-loader', '@googlemaps/markerclusterer'],
        },
      },
    },
  },
});
