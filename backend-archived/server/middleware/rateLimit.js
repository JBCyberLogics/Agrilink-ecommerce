/**
 * Request rate limiter for the Agrilink API (AGRILINK-UI-SECURITY-INFRA-002).
 *
 * One bucket per (client IP, route) so an IP hammering /api/auth/login does
 * not starve an IP browsing /api/market/listings.
 *
 * Limits are environment-driven with safe single-node defaults; no extra
 * dependency is required. Multi-instance deployments MUST share a rate-limit
 * store — see docs/LOAD_BALANCING_DEPLOYMENT.md (Redis-backed store wired via
 * REDIS_URL when multi-node). In-memory counters are consistent only on a
 * single node and that is the supported deployment today.
 *
 * `trust proxy` is honoured ONLY when TRUST_PROXY is set in server/.env —
 * arbitrary X-Forwarded-For headers are never trusted, so a client cannot
 * spoof its IP to evade limits.
 *
 * Responses return HTTP 429 with Retry-After and a generic, non-sensitive
 * error body; no account-existence information leaks.
 *
 * Test hooks: `resetRateLimitBuckets()` clears all buckets between tests
 * (used by server/tests/setup.server.js). Not part of the HTTP surface.
 */

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000) // 15 min

/* Endpoint categories — stricter for abuse-prone auth/recovery, looser for
   ordinary browsing. Route files apply the right one per route. */
const MAX_AUTH = Number(process.env.RATE_LIMIT_MAX_AUTH ?? 20)     // login — strict
const MAX_SIGNUP = Number(process.env.RATE_LIMIT_MAX_SIGNUP ?? 10) // signup — stricter
const MAX_RECOVERY = Number(process.env.RATE_LIMIT_MAX_RECOVERY ?? 5) // password recovery — strictest
const MAX_READ = Number(process.env.RATE_LIMIT_MAX_READ ?? 120)    // public reads — generous
const MAX_WRITE = Number(process.env.RATE_LIMIT_MAX_WRITE ?? 60)   // authenticated writes

const buckets = new Map() // key: `${ip}:${route}` → { count, resetAt }

function clientIp(req) {
  /* req.ip already reflects X-Forwarded-For when `trust proxy` is configured
     in app.js; never read the raw header here — that would let a client
     spoof its address. */
  return (req.ip || req.socket?.remoteAddress || 'unknown').toString()
}

function prune() {
  const now = Date.now()
  for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k)
}
setInterval(prune, WINDOW_MS)

function limiter({ windowMs = WINDOW_MS, max = MAX_WRITE } = {}) {
  return (req, res, next) => {
    const ip = clientIp(req)
    const key = `${ip}:${req.route?.path || req.path}`
    const now = Date.now()
    let b = buckets.get(key)
    if (!b || now > b.resetAt) {
      b = { count: 0, resetAt: now + windowMs }
      buckets.set(key, b)
    }
    b.count++
    const remaining = Math.max(0, max - b.count)
    const retryAfter = Math.ceil((b.resetAt - now) / 1000)
    res.setHeader('Retry-After', String(retryAfter))
    res.setHeader('X-RateLimit-Limit', String(max))
    res.setHeader('X-RateLimit-Remaining', String(remaining))
    if (b.count > max) {
      return res.status(429).json({
        error: 'Too many requests — please wait a moment and try again.',
        retryAfter,
      })
    }
    next()
  }
}

/* Presets — route files pick the one matching the endpoint's abuse risk. */
export const authStrictLimiter = limiter({ max: MAX_AUTH, windowMs: WINDOW_MS })      // login
export const signupLimiter = limiter({ max: MAX_SIGNUP, windowMs: WINDOW_MS })        // signup
export const recoveryLimiter = limiter({ max: MAX_RECOVERY, windowMs: WINDOW_MS })    // password recovery
export const publicReadLimiter = limiter({ max: MAX_READ, windowMs: WINDOW_MS })      // marketplace browsing
export const authenticatedWriteLimiter = limiter({ max: MAX_WRITE, windowMs: WINDOW_MS }) // orders, inquiries, …

/* Default export keeps the old `rateLimit({ max })` call shape working. */
export default limiter
export const rateLimit = limiter

/* Test-only helper: clears all rate-limit buckets so tests are isolated from
   each other's request counts. Not used by the production server entry point. */
export function resetRateLimitBuckets() {
  buckets.clear()
}

if (typeof process !== 'undefined' && process.on) {
  process.on('exit', () => buckets.clear())
}
