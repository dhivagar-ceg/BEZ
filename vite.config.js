// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // ✅ ensures correct relative paths for Netlify
  build: {
    outDir: 'dist' // optional, default is 'dist'
  }
});
