/* Security headers — no extra dependency.
   Applied to every API response so browsers enforce safer defaults:
   • X-Content-Type-Options: nosniff   — stop MIME sniffing
   • X-Frame-Options: DENY             — clickjacking protection
   • Referrer-Policy                   — don't leak URLs to third parties
   • Content-Security-Policy           — only allow same-origin + trusted
                                           font/asset hosts we actually use
   The frontend SPA is served from the same origin in production, so this
   is safe and does not break the app. */
export function securityHeaders(_req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline'; " + // Vite dev HMR + inline; tighten in prod build
      "style-src 'self' 'unsafe-inline'; " + // Tailwind inline styles
      "img-src 'self' data: https:; " + // listing photos + placeholder art
      "font-src 'self' https://fonts.gstatic.com; " +
      "connect-src 'self' https://fonts.googleapis.com; " +
      "frame-ancestors 'none';",
  )
  next()
}
