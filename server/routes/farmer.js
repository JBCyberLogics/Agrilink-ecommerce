/**
 * Farmer API routes — the dashboard's real data source.
 *
 * Auth: session JWT cookie (same mechanism as /api/auth/*).
 * Authorization: every route requires the authenticated user to hold the
 * Farmer role — enforced HERE on the server, never by frontend state alone.
 */
import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Listing, { CATEGORIES, UNITS } from '../models/Listing.js'

const router = express.Router()

/* ------------------------------------------------------ auth middleware */
async function requireAuth(req, res, next) {
  const token = req.cookies?.agrilink_token
  if (!token) return res.status(401).json({ error: 'Not signed in.' })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload.id)
    if (!user) return res.status(401).json({ error: 'Session expired.' })
    req.user = user
    next()
  } catch (e) {
    return res.status(401).json({ error: 'Session expired.' })
  }
}

/* Farmer-role gate — buyers/admins never reach farmer functionality. */
function farmerOnly(req, res, next) {
  if (req.user?.role !== 'Farmer')
    return res.status(403).json({ error: 'Farmer accounts only.', code: 'FARMER_ONLY' })
  next()
}

const shape = (l) => ({
  id: l._id,
  name: l.name,
  category: l.category,
  price: l.price,
  unit: l.unit,
  stock: l.stock,
  status: l.status,
  createdAt: l.createdAt,
  updatedAt: l.updatedAt,
})

router.use(requireAuth)

/* ------------------------------------------------ GET /api/farmer/profile */
router.get('/profile', farmerOnly, (req, res) => {
  const { name, email, role, createdAt } = req.user
  res.json({ user: { name, email, role, memberSince: createdAt } })
})

/* ------------------------------------------------ GET /api/farmer/listings */
router.get('/listings', farmerOnly, async (req, res) => {
  try {
    const docs = await Listing.find({ farmerId: req.user._id }).sort({ createdAt: -1 })
    res.json({ listings: docs.map(shape) })
  } catch (e) {
    res.status(500).json({ error: 'Could not load your listings. Please try again.' })
  }
})

/* ----------------------------------------------- POST /api/farmer/listings */
router.post('/listings', farmerOnly, async (req, res) => {
  try {
    const { name = '', category = '', price, unit = '', stock } = req.body || {}
    const bad = (field, error) => res.status(400).json({ error, field })

    if (String(name).trim().length < 3) return bad('name', 'Give your produce a clear name.')
    if (!CATEGORIES.includes(category)) return bad('category', 'Pick the closest category.')
    const p = Number(price)
    if (!Number.isFinite(p) || p <= 0) return bad('price', 'Price must be greater than zero.')
    if (!UNITS.includes(unit)) return bad('unit', 'Choose a unit.')
    const s = Number(stock)
    if (!Number.isFinite(s) || s < 0) return bad('stock', 'Enter the units you have.')

    const listing = await Listing.create({
      farmerId: req.user._id,
      name: String(name).trim(),
      category,
      price: p,
      unit,
      stock: s,
    })
    res.status(201).json({ listing: shape(listing) })
  } catch (e) {
    res.status(500).json({ error: 'Could not save the listing. Please try again.' })
  }
})

/* --------------------------------------------- DELETE /api/farmer/listings/:id */
router.delete('/listings/:id', farmerOnly, async (req, res) => {
  try {
    const doc = await Listing.findOneAndDelete({
      _id: req.params.id,
      farmerId: req.user._id, // ownership check — farmers can only delete their own
    })
    if (!doc) return res.status(404).json({ error: 'Listing not found.' })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: 'Could not delete the listing. Please try again.' })
  }
})

export default router
