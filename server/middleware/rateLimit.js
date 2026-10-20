/* In-memory request rate limiter — no extra dependency.
   Applied to auth mutation routes (signup/login) so brute-force and
   credential-stuffing attempts are slowed per IP+route. Not a substitute
   for a distributed store behind multiple nodes; single-node here. */
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX = 20 // requests per window per (ip, route)

const buckets = new Map() // key: `${ip}:${route}` → { count, resetAt }

function prune() {
  const now = Date.now()
  for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k)
}
setInterval(prune, WINDOW_MS)

export function rateLimit({ windowMs = WINDOW_MS, max = MAX } = {}) {
  return (req, res, next) => {
    const ip = (req.ip || req.socket?.remoteAddress || 'unknown').toString()
    const key = `${ip}:${req.route?.path || req.path}`
    const now = Date.now()
    let b = buckets.get(key)
    if (!b || now > b.resetAt) {
      b = { count: 0, resetAt: now + windowMs }
      buckets.set(key, b)
    }
    b.count++
    const remaining = Math.max(0, max - b.count)
    res.setHeader('Retry-After', Math.ceil((b.resetAt - now) / 1000))
    if (b.count > max) {
      res.setHeader('X-RateLimit-Limit', String(max))
      res.setHeader('X-RateLimit-Remaining', '0')
      return res.status(429).json({
        error: 'Too many requests — please wait a moment and try again.',
        retryAfter: Math.ceil((b.resetAt - now) / 1000),
      })
    }
    res.setHeader('X-RateLimit-Limit', String(max))
    res.setHeader('X-RateLimit-Remaining', String(remaining))
    next()
  }
}

/* Cleanup on process exit so long-running dev watches don't leak memory. */
if (typeof process !== 'undefined' && process.on) {
  process.on('exit', () => buckets.clear())
}
