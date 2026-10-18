/**
 * Agrilink API — Express entry point.
 *
 * Runs on port 4000 (see server/.env). In development the Vite dev server
 * proxies /api/* here (see vite.config.js); in production this same process
 * serves the built frontend from dist/, giving one-process deployment.
 */
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import express from 'express'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'

import { connectDb } from './db.js'
import { seedDemoUser, seedDemoFarmers, seedDemoListings, seedDemoBuyer } from './seed.js'
import authRouter from './routes/auth.js'
import farmerRouter, { UPLOADS_DIR } from './routes/farmer.js'
import marketRouter from './routes/market.js'
import buyerRouter from './routes/buyer.js'

/* load server/.env regardless of the shell's working directory */
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const PORT = process.env.PORT || 4000
const app = express()

app.disable('x-powered-by')
app.use(express.json())
app.use(cookieParser())

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'agrilink-api' }))
app.use('/api/auth', authRouter)
app.use('/api/farmer', farmerRouter)
app.use('/api/market', marketRouter)
app.use('/api/buyer', buyerRouter)
/* uploaded product photos (created by farmers only, readable like a CDN) */
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d' }))

/* production mode: serve the built SPA alongside the API */
const dist = path.join(__dirname, '..', 'dist')
if (fs.existsSync(dist)) {
  app.use(express.static(dist))
  app.use((_req, res) => res.sendFile(path.join(dist, 'index.html')))
}

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
