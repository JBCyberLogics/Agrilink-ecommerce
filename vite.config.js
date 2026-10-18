import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // forward /api/* to the Express backend so the frontend and API share one
  // origin in dev (first-party cookies, no CORS configuration anywhere)
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
