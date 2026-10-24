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
import express from 'express'

import app from './app.js'
import { connectDb } from './db.js'
import { seedDemoUser, seedDemoFarmers, seedDemoListings, seedDemoBuyer } from './seed.js'
import mongoose from 'mongoose'

/* load server/.env regardless of the shell's working directory */
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const PORT = process.env.PORT || 4000

let server

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

  /* Production: serve the built SPA alongside the API */
  const dist = path.join(__dirname, '..', 'dist')
  if (fs.existsSync(dist)) {
    app.use(express.static(dist))
    app.use((_req, res) => res.sendFile(path.join(dist, 'index.html')))
  }

  /* Catch-all 404 for unmatched routes — placed after the static/SPA
     handlers so GET / serves the built frontend instead of 404ing. */
  app.use((_req, res) => res.status(404).json({ error: 'Not found.' }))

  server = app.listen(PORT, () => {
    console.log(`✓ Agrilink API  →  http://localhost:${PORT}`)
    console.log(
      `   routes: /api/auth/* · /api/farmer/{profile,listings,uploads} · /api/market/listings · /api/buyer/{profile,saved,requests} · /uploads · /api/health`,
    )
  })
}

/* Graceful shutdown — stop accepting new requests, let in-flight requests
   finish, then close MongoDB and exit. Safe under a load balancer that
   drains connections before sending SIGTERM. */
async function shutdown(signal) {
  console.log(`\n✓ Received ${signal} — shutting down gracefully…`)
  if (server) server.close(() => console.log('   HTTP server closed.'))
  try {
    await mongoose.connection.close(false)
    console.log('   MongoDB connection closed.')
  } catch (e) {
    console.log('   MongoDB close error:', e.message)
  }
  process.exit(0)
}

/* Force-exit if graceful shutdown hangs (active request stuck). */
const FORCE_EXIT_MS = 10_000

process.on('SIGTERM', () => {
  shutdown('SIGTERM')
  setTimeout(() => process.exit(1), FORCE_EXIT_MS).unref()
})
process.on('SIGINT', () => {
  shutdown('SIGINT')
  setTimeout(() => process.exit(1), FORCE_EXIT_MS).unref()
})

main().catch((err) => {
  console.error('✗ Failed to start API:', err.message)
  process.exit(1)
})
