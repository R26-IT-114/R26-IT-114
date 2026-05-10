import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    global: 'globalThis',
    'crypto.getRandomValues': 'crypto.randomBytes',
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setupTests.js',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('/firebase/auth')) {
            return 'firebase-auth';
          }

          if (id.includes('/firebase/firestore')) {
            return 'firebase-firestore';
          }

          if (id.includes('/firebase/app')) {
            return 'firebase-app';
          }

          if (id.includes('/firebase/')) {
            return 'firebase-core';
          }

          if (id.includes('react-router-dom')) {
            return 'router-vendor';
          }

          if (id.includes('react')) {
            return 'react-vendor';
          }

          if (id.includes('axios')) {
            return 'axios-vendor';
          }

          return 'vendor';
        },
      },
    },
  },
});
