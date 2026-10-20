/**
 * Vitest config for frontend (React/jsdom) unit tests.
 */
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    name: 'client',
    include: ['frontend/tests/**/*.test.jsx'],
    environment: 'jsdom',
    setupFiles: ['./frontend/tests/setup.client.js'],
    testTimeout: 20000,
    hookTimeout: 20000,
  },
})
