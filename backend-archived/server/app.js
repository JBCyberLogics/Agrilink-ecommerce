/**
 * Agrilink API — Express application factory.
 *
 * Exports the configured Express app without starting the HTTP server or
 * connecting to MongoDB, so integration tests can mount it via Supertest
 * against an isolated test database.
 *
 * Runs on port 4000 (see server/.env). In development the Vite dev server
 * proxies /api/* here (see vite.config.js); in production this same process
 * serves the built frontend from dist/, giving one-process deployment.
 */
import express from 'express'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import authRouter from './routes/auth.js'
import farmerRouter, { UPLOADS_DIR } from './routes/farmer.js'
import marketRouter from './routes/market.js'
import buyerRouter from './routes/buyer.js'
import ordersRouter from './routes/orders.js'
import inquiriesRouter from './routes/inquiries.js'
import { rateLimit } from './middleware/rateLimit.js'
import { securityHeaders } from './middleware/securityHeaders.js'

/* load server/.env regardless of the shell's working directory */
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()

app.disable('x-powered-by')
app.use(express.json())
app.use(cookieParser())
app.use(securityHeaders)

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'agrilink-api' }))
app.use('/api/auth', authRouter)
app.use('/api/farmer', farmerRouter)
app.use('/api/market', marketRouter)
app.use('/api/buyer', buyerRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/inquiries', inquiriesRouter)
/* uploaded product photos (created by farmers only, readable like a CDN) */
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d' }))

export default app
