/**
 * Agrilink API — process entry point.
 *
 * Connects to MongoDB, seeds demo data, and starts the Express app from
 * server/app.js. The app itself is exported by server/app.js so tests can
 * mount it without starting the HTTP server or touching the dev database.
 */
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

import app from './app.js'
import { connectDb } from './db.js'
import { seedDemoUser, seedDemoFarmers, seedDemoListings, seedDemoBuyer } from './seed.js'

/* load server/.env regardless of the shell's working directory */
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const PORT = process.env.PORT || 4000

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('✗ Missing MONGODB_URI — copy server/.env.example to server/.env')
    process.exit(1)
  }
  if (!process.env.JWT_SECRET) {
    console.error('✗ Missing JWT_SECRET — set one in server/.env')
    process.exit(1)
  }

  await connectDb()
  await seedDemoUser()
  await seedDemoFarmers()
  await seedDemoListings()
  await seedDemoBuyer()

  app.listen(PORT, () => {
    console.log(`✓ Agrilink API  →  http://localhost:${PORT}`)
    console.log(
      `   routes: /api/auth/* · /api/farmer/{profile,listings,uploads} · /api/market/listings · /api/buyer/{profile,saved,requests} · /uploads · /api/health`,
    )
  })
}

main().catch((err) => {
  console.error('✗ Failed to start API:', err.message)
  process.exit(1)
})
