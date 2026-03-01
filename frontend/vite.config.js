import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/health': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        clients: resolve(__dirname, 'clients.html'),
        reports: resolve(__dirname, 'reports.html'),
        history: resolve(__dirname, 'history.html'),
        migration: resolve(__dirname, 'migration.html'),
        generic: resolve(__dirname, 'generic.html')
      }
    }
  }
});
