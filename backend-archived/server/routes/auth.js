/**
 * Auth routes — signup, login, logout, me.
 *
 * Sessions ride a signed JWT in an httpOnly, sameSite cookie, so the browser
 * never touches the token and refreshes keep users signed in. Responses are
 * { user: { name, email, role } } and errors carry a `field` when the UI can
 * highlight the offending input inline.
 */
import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import rateLimit, { signupLimiter, authStrictLimiter } from '../middleware/rateLimit.js'

const router = express.Router()

const COOKIE = 'agrilink_token'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000
const cookieOpts = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  maxAge: SEVEN_DAYS,
  /* Secure flag only over HTTPS (production). Dev runs on plain localhost,
     so Secure would block the cookie there. */
  ...(process.env.NODE_ENV === 'production' ? { secure: true } : {}),
}

const signToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
const shape = ({ name, email, role }) => ({ name, email, role })
const fail = (res) => res.status(500).json({ error: 'Server error — please try again.' })

/* ------------------------------------------------ POST /api/auth/signup */
router.post('/signup', signupLimiter, async (req, res) => {
  try {
    const { name = '', email = '', password = '', role = '' } = req.body || {}
    const bad = (field, error) => res.status(400).json({ error, field })

    if (String(name).trim().length < 2) return bad('name', 'Please tell us your full name.')
    const em = String(email).trim().toLowerCase()
    if (!EMAIL_RE.test(em)) return bad('email', 'Enter a valid email address.')
    if (String(password).length < 6) return bad('password', 'Use at least 6 characters.')
    if (!['Buyer', 'Farmer'].includes(role)) return bad('role', 'Choose how you use Agrilink.')

    if (await User.findOne({ email: em }))
      return res
        .status(409)
        .json({ error: 'An account with this email already exists.', field: 'email' })

    const user = await User.create({
      name: String(name).trim(),
      email: em,
      passwordHash: await bcrypt.hash(String(password), 10),
      role,
    })

    res.cookie(COOKIE, signToken(user), cookieOpts)
    res.status(201).json({ user: shape(user) })
  } catch (e) {
    fail(res)
  }
})

/* ------------------------------------------------ POST /api/auth/login */
router.post('/login', authStrictLimiter, async (req, res) => {
  try {
    const { email = '', password = '', role = '' } = req.body || {}
    const em = String(email).trim().toLowerCase()

    const user = await User.findOne({ email: em })
    if (!user || !(await bcrypt.compare(String(password), user.passwordHash)))
      return res.status(401).json({ error: 'Invalid email or password.' })

    /* Strict role gate — a Buyer account cannot enter as a Farmer and vice
       versa. accountRole lets the UI pre-select the correct role card. */
    if ((role === 'Buyer' || role === 'Farmer') && role !== user.role)
      return res.status(403).json({
        error: `This email is registered as ${
          user.role === 'Buyer' ? 'a Buyer' : 'a Farmer'
        } — pick "${user.role}" to continue.`,
        field: 'role',
        accountRole: user.role,
      })

    res.cookie(COOKIE, signToken(user), cookieOpts)
    res.json({ user: shape(user) })
  } catch (e) {
    fail(res)
  }
})

/* ------------------------------------------------ POST /api/auth/logout */
router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE, { ...cookieOpts, maxAge: undefined })
  res.json({ ok: true })
})

/* ------------------------------------------------ GET /api/auth/me */
router.get('/me', async (req, res) => {
  const token = req.cookies?.[COOKIE]
  /* anonymous visitors get a clean 200 { user: null } — the browser would
     otherwise log a console error for the expected 401 boot probe */
  if (!token) return res.json({ user: null })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload.id)
    if (!user) return res.status(401).json({ error: 'Session expired.' })
    res.json({ user: shape(user) })
  } catch (e) {
    res.status(401).json({ error: 'Session expired.' })
  }
})

export default router
