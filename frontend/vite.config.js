import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// This config lives at frontend/ and the frontend project root is frontend/:
// index.html, public/ and src/ all resolve relative to it. The production
// build lands at <repo>/dist.
// Agrilink is frontend-only: there is no backend process to proxy to. API
// calls go same-origin via services/apiClient.js and, until a real backend
// is connected (VITE_API_BASE_URL), they surface an honest
// "backend not configured" state instead of fabricating data.
const root = fileURLToPath(new URL('.', import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  root,
  plugins: [react()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
})
