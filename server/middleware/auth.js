/**
 * Session middleware shared by every role-scoped API (farmer, buyer, …).
 * Verifies the httpOnly JWT cookie and loads the LIVE user document, so a
 * role can only ever come from the database — never from a form selection
 * or anything the client sends.
 */
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export async function requireAuth(req, res, next) {
  const token = req.cookies?.agrilink_token
  if (!token) return res.status(401).json({ error: 'Not signed in.' })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload.id)
    if (!user) return res.status(401).json({ error: 'Session expired.' })
    req.user = user
    next()
  } catch {
    return res.status(401).json({ error: 'Session expired.' })
  }
}
