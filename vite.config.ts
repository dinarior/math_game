import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
      base: '/math_game/',
      server: {
        port: 5173,
        host: 'localhost',
      },
      plugins: [react()],
      css: {
        postcss: './postcss.config.js',
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
