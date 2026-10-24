/**
 * Lightweight CSRF protection for cookie-authenticated state-changing
 * requests (AGRILINK-UI-SECURITY-INFRA-002).
 *
 * Strategy — Origin verification (appropriate for this same-origin
 * architecture):
 * • The frontend lives on the same origin as the API (Vite proxy in dev,
 *   same host in production) and every state-changing fetch is cross-origin
 *   only when a third party initiates it.
 * • For POST/PUT/PATCH/DELETE, when the request carries a session cookie
 *   AND an `Origin` header that does not match the server's own origin, the
 *   request is rejected with 403. A cross-site form/fetch cannot forge a
 *   matching Origin header, so cookie-based replay is blocked.
 * • Same-origin SPA requests include a matching Origin and pass through.
 * • Requests without an Origin header (non-browser clients, same-origin
 *   navigations) are not blocked — this keeps the API usable for the
 *   documented same-origin clients while still stopping cross-site forgery.
 *
 * This is defence-in-depth on top of the httpOnly SameSite=Lax session
 * cookie, which browsers already withhold from cross-site POSTs.
 */

export function csrfProtection(req, res, next) {
  const stateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)
  if (!stateChanging) return next()

  /* Only relevant when the request is cookie-authenticated. Public routes
     (signup/login) do not have a session yet and are protected by rate
     limiting instead. */
  const hasSession = Boolean(req.cookies?.agrilink_token)
  if (!hasSession) return next()

  const origin = req.headers.origin
  if (!origin) return next() // no Origin to compare — allow (non-browser client)

  const expected = `${req.protocol}://${req.get('host')}`
  if (origin !== expected) {
    return res.status(403).json({ error: 'Request rejected — invalid origin.' })
  }

  next()
}
