/**
 * Public marketplace feed — no auth needed: the shop is browseable by
 * anyone. Only ACTIVE listings of existing farmer accounts are served,
 * newest first. Paused/Sold-out status rows and orphaned rows (farmer
 * account deleted) are never exposed.
 */
import express from 'express'
import Listing from '../models/Listing.js'

const router = express.Router()

/* ------------------------------------------------ GET /api/market/listings */
router.get('/listings', async (_req, res) => {
  try {
    const docs = await Listing.find({ status: 'Active' })
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('farmerId', 'name role')

    const listings = docs
      .filter((l) => l.farmerId) // farmer account was deleted → drop quietly
      .map((l) => ({
        id: l._id,
        name: l.name,
        category: l.category,
        price: l.price,
        unit: l.unit,
        stock: l.stock,
        imageUrl: l.imageUrl,
        farmer: l.farmerId.name || 'Agrilink farmer', // display name from the DB, never fabricated
        location: l.location || '',
        createdAt: l.createdAt,
      }))

    res.json({ listings })
  } catch {
    res.status(500).json({ error: 'Could not load the marketplace right now. Please try again.' })
  }
})

export default router
