/**
 * Vitest config for frontend (React/jsdom) unit tests.
 */
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    name: 'client',
    include: ['frontend/src/tests/**/*.test.jsx'],
    environment: 'jsdom',
    setupFiles: ['./frontend/src/tests/setup.client.js'],
    testTimeout: 20000,
    hookTimeout: 20000,
  },
})
