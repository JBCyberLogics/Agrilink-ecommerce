/**
 * Server test setup — connects to the isolated test database before tests,
 * clears it between tests, and disconnects after.
 */
import { afterAll, afterEach, beforeAll } from 'vitest'
import { connectTestDb, disconnectTestDb, clearTestDb } from '../lib/testDb.js'
import { resetRateLimitBuckets } from '../middleware/rateLimit.js'

beforeAll(async () => {
  await connectTestDb()
})

afterEach(async () => {
  await clearTestDb()
  resetRateLimitBuckets()
})

afterAll(async () => {
  await disconnectTestDb()
})
