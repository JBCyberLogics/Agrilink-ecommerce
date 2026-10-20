/**
 * Vitest config for server (Node) integration tests.
 * Runs Express route handlers via Supertest against an isolated test DB.
 */
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'server',
    include: ['server/tests/**/*.test.js'],
    environment: 'node',
    setupFiles: ['./server/tests/setup.server.js'],
    testTimeout: 20000,
    hookTimeout: 20000,
    /* run server test files serially: they share the in-memory rate-limiter
       singleton and the isolated test database, so parallel execution causes
       spurious rate-limit 429s and session failures */
    maxWorkers: 1,
  },
})
