/**
 * Isolated test database connection.
 *
 * Tests run against `AGRILINK_TEST_DB` (default `agrilink_test`), a database
 * name distinct from the development/production `agrilink` database. Setup and
 * teardown can therefore never drop or clear real user or business data.
 */
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const DEV_DB_NAME = 'agrilink'

export async function connectTestDb() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is required for tests')
  const dbName = process.env.AGRILINK_TEST_DB || 'agrilink_test'
  if (dbName === DEV_DB_NAME) {
    throw new Error(`AGRILINK_TEST_DB must not equal the dev database name "${DEV_DB_NAME}"`)
  }
  let lastErr
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await mongoose.connect(uri, { dbName, serverSelectionTimeoutMS: 25_000 })
      return
    } catch (e) {
      lastErr = e
      if (attempt < 2) await new Promise((r) => setTimeout(r, 2000))
    }
  }
  throw lastErr
}

export async function disconnectTestDb() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close()
  }
}

export async function clearTestDb() {
  const dbName = mongoose.connection.name
  if (dbName === DEV_DB_NAME) {
    throw new Error(`Refusing to clear the dev database "${DEV_DB_NAME}"`)
  }
  const collections = mongoose.connection.collections
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({})
  }
}
