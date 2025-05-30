import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'base64-js', 
      'unicode-trie', 
      'brotli',
      'pako',
      'tiny-inflate'
    ],
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      'unicode-trie': 'unicode-trie/index.js'
    }
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
      defaultIsModuleExports: 'auto'
    },
  },
});