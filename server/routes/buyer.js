/**
 * Buyer API routes — the buyer dashboard's real data source.
 *
 * Auth: session JWT cookie (same mechanism as /api/auth/*, shared in
 * server/middleware/auth.js). Authorization: every route requires the
 * authenticated user to hold the Buyer role — enforced HERE, never by
 * frontend state alone (401 anonymous · 403 farmers, code BUYER_ONLY).
 *
 * Everything below reads/writes real MongoDB documents. There is no
 * order backend yet, so none exists here — the UI shows honest
 * unavailable states instead of simulated orders.
 */
import express from 'express'
import mongoose from 'mongoose'
import User from '../models/User.js'
import Listing from '../models/Listing.js'
import PurchaseRequest from '../models/PurchaseRequest.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.use(requireAuth)

/* Buyer-role gate — farmers/admins never reach buyer-owned functionality. */
function buyerOnly(req, res, next) {
  if (req.user?.role !== 'Buyer')
    return res.status(403).json({ error: 'Buyer accounts only.', code: 'BUYER_ONLY' })
  next()
}

router.use(buyerOnly)

const notFound = (res, msg) => res.status(404).json({ error: msg })
const bad = (res, msg, field) => res.status(400).json({ error: msg, field })
const fail = (res) => res.status(500).json({ error: 'Something went wrong on our side. Please try again.' })

const isValidId = (id) => typeof id === 'string' && /^[0-9a-f]{24}$/i.test(id)

/* ------------------------------------------------------------ /profile */
router.get('/profile', (req, res) => {
  res.json({
    user: {
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      memberSince: req.user.createdAt,
    },
  })
})

/* --------------------------------------------------------- /saved */
const savedShape = (l) => ({
  id: l._id,
  name: l.name,
  category: l.category,
  price: l.price,
  unit: l.unit,
  stock: l.stock,
  imageUrl: l.imageUrl,
  location: l.location || '',
  farmer: l.farmerId?.name || '',
  createdAt: l.createdAt,
})

router.get('/saved', async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('savedListings')
      .populate({ path: 'savedListings', populate: { path: 'farmerId', select: 'name' } })

    const rows = user?.savedListings ?? []
    /* listings deleted after being saved arrive as null — drop them and
       prune the stored references so the account never keeps ghosts */
    const live = rows.filter(Boolean)
    if (live.length !== rows.length)
      await User.updateOne({ _id: req.user._id }, { savedListings: live.map((l) => l._id) })

    res.json({ saved: live.filter((l) => l.status === 'Active').map(savedShape) })
  } catch {
    fail(res)
  }
})

/* bookmark a listing — $addToSet keeps the array duplicate-free */
router.post('/saved/:listingId', async (req, res) => {
  try {
    const { listingId } = req.params
    if (!isValidId(listingId)) return bad(res, 'That produce listing id is not valid.', 'listingId')
    const listing = await Listing.findById(listingId).select('_id')
    if (!listing) return notFound(res, 'That produce listing no longer exists.')
    await User.updateOne(
      { _id: req.user._id },
      { $addToSet: { savedListings: listing._id } },
    )
    res.status(201).json({ saved: true })
  } catch {
    fail(res)
  }
})

router.delete('/saved/:listingId', async (req, res) => {
  try {
    const { listingId } = req.params
    if (!isValidId(listingId)) return bad(res, 'That produce listing id is not valid.', 'listingId')
    await User.updateOne(
      { _id: req.user._id },
      { $pull: { savedListings: listingId } },
    )
    res.json({ saved: false })
  } catch {
    fail(res)
  }
})

/* ------------------------------------------------------ /requests */
const requestShape = (r) => ({
  id: r._id,
  listing: r.listingId
    ? {
        id: r.listingId._id,
        name: r.listingId.name,
        price: r.listingId.price,
        unit: r.listingId.unit,
        stock: r.listingId.stock,
        imageUrl: r.listingId.imageUrl,
        location: r.listingId.location || '',
        status: r.listingId.status,
        farmer: r.listingId.farmerId?.name || '',
      }
    : null,
  quantity: r.quantity,
  unit: r.unit,
  proposedPrice: r.proposedPrice ?? null,
  note: r.note,
  status: r.status,
  createdAt: r.createdAt,
})

router.get('/requests', async (req, res) => {
  try {
    const docs = await PurchaseRequest.find({ buyerId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate({ path: 'listingId', select: 'name price unit stock imageUrl location status farmerId', populate: { path: 'farmerId', select: 'name' } })
    /* a request whose listing was deleted by the farmer carries no live
       listing payload — it is still the buyer's real history, so it is
       returned with what we know (listing: null) instead of being hidden */
    res.json({ requests: docs.map(requestShape) })
  } catch {
    fail(res)
  }
})

/* send a purchase request for a REAL active listing */
router.post('/requests', async (req, res) => {
  try {
    const { listingId, quantity, proposedPrice, note } = req.body ?? {}

    if (!isValidId(listingId ?? '')) return bad(res, 'That produce listing id is not valid.', 'listingId')
    const listing = await Listing.findById(listingId)
    if (!listing) return notFound(res, 'That produce listing no longer exists.')
    if (listing.status !== 'Active')
      return bad(res, 'This listing is not accepting purchase requests right now.', 'listingId')
    if (listing.stock <= 0)
      return bad(res, 'This listing has no stock left — it cannot be requested.', 'quantity')

    const qty = Number(quantity)
    if (!Number.isFinite(qty) || qty <= 0) return bad(res, 'Enter the quantity you need.', 'quantity')
    if (qty > listing.stock)
      return bad(res, `Only ${listing.stock.toLocaleString('en-KE')} ${listing.unit} are available.`, 'quantity')

    let offer = proposedPrice
    if (offer !== undefined && offer !== null && offer !== '') {
      offer = Number(offer)
      if (!Number.isFinite(offer) || offer < 1)
        return bad(res, 'Your offer must be at least KSh 1 per unit.', 'proposedPrice')
    } else {
      offer = null
    }

    const text = typeof note === 'string' ? note.trim() : ''
    if (text.length > 400) return bad(res, 'Keep your note to 400 characters.', 'note')

    const doc = await PurchaseRequest.create({
      buyerId: req.user._id,
      listingId: listing._id,
      quantity: qty,
      unit: listing.unit,
      proposedPrice: offer ?? undefined,
      note: text,
    })

    await doc.populate({ path: 'listingId', select: 'name price unit stock imageUrl location status farmerId', populate: { path: 'farmerId', select: 'name' } })
    res.status(201).json({ request: requestShape(doc) })
  } catch {
    fail(res)
  }
})

/* withdraw one of MY OWN pending requests */
router.delete('/requests/:id', async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidId(id)) return notFound(res, 'Purchase request not found.')
    const doc = await PurchaseRequest.findOne({ _id: id, buyerId: req.user._id })
    if (!doc) return notFound(res, 'Purchase request not found.')
    if (doc.status !== 'Pending')
      return res.status(409).json({ error: 'Only pending requests can be withdrawn.' })
    await doc.deleteOne()
    res.json({ deleted: true })
  } catch {
    fail(res)
  }
})

export default router
