/**
 * Agrilink API — Express application factory.
 *
 * Exports the configured Express app without starting the HTTP server or
 * connecting to MongoDB, so integration tests can mount it via Supertest
 * against an isolated test database.
 *
 * Hardening (AGRILINK-UI-SECURITY-INFRA-002):
 * • `trust proxy` is enabled ONLY when TRUST_PROXY is set in server/.env —
 *   arbitrary X-Forwarded-For headers are never trusted, so clients cannot
 *   spoof their IP to evade rate limits.
 * • JSON bodies are capped (express.json limit) so oversized payloads are
 *   rejected before reaching route logic.
 * • CSRF origin verification guards state-changing cookie-authenticated
 *   requests (see server/middleware/csrf.js).
 * • Rate limiting is applied per endpoint category (auth, public reads,
 *   authenticated writes) via the limiters in server/middleware/rateLimit.js.
 *
 * Runs on port 4000 (see server/.env). In development the Vite dev server
 * proxies /api/* and /uploads/* here (see frontend/vite.config.js); in
 * production this same process serves the frontend from dist/.
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
import { rateLimit, signupLimiter, authStrictLimiter, publicReadLimiter, authenticatedWriteLimiter } from './middleware/rateLimit.js'
import { csrfProtection } from './middleware/csrf.js'
import { securityHeaders } from './middleware/securityHeaders.js'

/* load server/.env regardless of the shell's working directory */
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()

app.disable('x-powered-by')

/* --- trust proxy ----------------------------------------------------
   Honoured only when explicitly configured for a known reverse proxy /
   load balancer. Arbitrary X-Forwarded-For headers are never trusted. */
if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', true) // first X-Forwarded-For entry from the trusted proxy
} else if (process.env.TRUST_PROXY) {
  app.set('trust proxy', process.env.TRUST_PROXY) // comma-separated trusted IPs/CIDRs
}

/* --- body parsing -------------------------------------------------- */
app.use(express.json({ limit: '100kb' }))
app.use(cookieParser())
app.use(securityHeaders)

/* --- CORS (restrictive) -------------------------------------------
   Same-origin deployment needs no CORS headers (browsers don't enforce
   CORS same-origin). When VITE_API_BASE_URL points at a separate origin,
   set CORS_ORIGIN to that exact origin; wildcard is never used with
   credentials. */
const corsOrigin = process.env.CORS_ORIGIN
app.use((req, res, next) => {
  if (corsOrigin && req.headers.origin === corsOrigin) {
    res.setHeader('Access-Control-Allow-Origin', corsOrigin)
    res.setHeader('Vary', 'Origin')
  }
  /* same-origin: no header needed; cross-origin without match: no header
     → browsers block the response */
  next()
})

/* --- CSRF + rate limiting ------------------------------------------
   CSRF applies to every API request but only acts on state-changing,
   cookie-authenticated calls (POST/PUT/PATCH/DELETE with agrilink_token). */
app.use(csrfProtection)

/* Auth routes — strict, abuse-prone. */
app.use('/api/auth', authRouter)
/* Public marketplace reads — generous limit. */
app.use('/api/market', publicReadLimiter, marketRouter)
/* Role-scoped APIs — authenticated-write limit on mutating routes is
   applied inside each router where the limit presets are wired. */
app.use('/api/farmer', farmerRouter)
app.use('/api/buyer', buyerRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/inquiries', inquiriesRouter)

/* health — unauthenticated, tiny payload, suitable for readiness checks */
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'agrilink-api' }))

/* uploaded product photos (created by farmers only, readable like a CDN) */
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d' }))

export default app
