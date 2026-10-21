import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// This config lives at frontend/ and the frontend project root is frontend/:
// index.html, public/ and src/ all resolve relative to it. The production
// build keeps landing at <repo>/dist — exactly where server/index.js has
// always served the frontend from (path.join(__dirname, '..', 'dist')).
const root = fileURLToPath(new URL('.', import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  root,
  plugins: [react()],
  // forward /api/* AND /uploads/* (product photos) to the Express backend so
  // the frontend and API share one origin in dev (first-party cookies, no CORS)
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
      '/uploads': 'http://localhost:4000',
    },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
})
