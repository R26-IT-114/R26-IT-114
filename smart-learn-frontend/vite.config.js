import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [basicSsl(), react(), tailwindcss()],
  assetsInclude: ['**/*.mpeg', '**/*.mp3', '**/*.mp4', '**/*.wav'],
  define: {
    global: 'globalThis',
    'crypto.getRandomValues': 'crypto.randomBytes',
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      // Route /ml-api/* to the standalone Flask ML service.
      '/ml-api': {
        target: 'http://localhost:4002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ml-api/, ''),
      },
      '/api/workingMemory': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/api/dysgraphia': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/api/dyslexia': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
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
