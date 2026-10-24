/**
 * Buyer inquiry routes — buyers contact farmers about a specific listing.
 *
 * Auth: session JWT cookie (requireAuth), Buyer role only.
 * Authorization: every route enforces that the inquiry belongs to the
 * authenticated buyer. Buyer and farmer identities come from the session
 * and listing record — never from untrusted request fields.
 */
import express from 'express'
import mongoose from 'mongoose'
import { requireAuth } from '../middleware/auth.js'
import { authenticatedWriteLimiter } from '../middleware/rateLimit.js'
import Listing from '../models/Listing.js'
import Inquiry from '../models/Inquiry.js'

const router = express.Router()

router.use(requireAuth)
router.use(authenticatedWriteLimiter)

const notFound = (res, msg) => res.status(404).json({ error: msg })
const bad = (res, msg, field) => res.status(400).json({ error: msg, field })
const fail = (res) => res.status(500).json({ error: 'Something went wrong on our side. Please try again.' })

const isValidId = (id) => typeof id === 'string' && /^[0-9a-f]{24}$/i.test(id)

const shape = (i) => ({
  id: i._id,
  listingId: i.listingId,
  farmerId: i.farmerId,
  message: i.message,
  status: i.status,
  reply: i.reply,
  createdAt: i.createdAt,
  updatedAt: i.updatedAt,
})

/* ------------------------------------------------ POST /api/inquiries
   Buyer creates an inquiry for a real active listing. */
router.post('/', async (req, res) => {
  try {
    const { listingId, message } = req.body ?? {}

    if (!isValidId(listingId ?? '')) return bad(res, 'That produce listing id is not valid.', 'listingId')
    const text = typeof message === 'string' ? message.trim() : ''
    if (text.length === 0) return bad(res, 'Please write a message.', 'message')
    if (text.length > 1000) return bad(res, 'Keep your message to 1000 characters.', 'message')

    const listing = await Listing.findById(listingId)
    if (!listing) return notFound(res, 'That produce listing no longer exists.')
    if (listing.status !== 'Active')
      return bad(res, 'This listing is not accepting inquiries right now.', 'listingId')

    const inquiry = await Inquiry.create({
      buyerId: req.user._id,
      farmerId: listing.farmerId,
      listingId,
      message: text,
      status: 'Open',
    })

    res.status(201).json({ inquiry: shape(inquiry) })
  } catch {
    fail(res)
  }
})

/* ------------------------------------------------- GET /api/inquiries
   The authenticated buyer's own inquiries, newest first. */
router.get('/', async (req, res) => {
  try {
    const docs = await Inquiry.find({ buyerId: req.user._id })
      .populate({ path: 'listingId', select: 'name status' })
      .sort({ createdAt: -1 })
      .limit(100)
    res.json({ inquiries: docs.map(shape) })
  } catch {
    fail(res)
  }
})

export default router
