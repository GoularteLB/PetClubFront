import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/pets': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/tutores': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/vacinas': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/login': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    },
    cors: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.{png,jpg,jpeg,gif,svg,webp}'],
  build: {
    assetsInlineLimit: 0,
  },
});
