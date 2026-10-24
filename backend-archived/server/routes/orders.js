/**
 * Buyer order routes — real purchase orders against the marketplace.
 *
 * Auth: session JWT cookie (requireAuth), Buyer role only.
 * Authorization: every route enforces that the order belongs to the
 * authenticated buyer.
 *
 * With no payment provider configured, orders are created as
 * status 'Pending' + paymentStatus 'Unpaid' and honestly presented as
 * not-yet-paid — nothing is simulated or charged.
 */
import express from 'express'
import mongoose from 'mongoose'
import { requireAuth } from '../middleware/auth.js'
import User from '../models/User.js'
import Listing from '../models/Listing.js'
import Order from '../models/Order.js'
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../models/Order.js'

const router = express.Router()

router.use(requireAuth)

const notFound = (res, msg) => res.status(404).json({ error: msg })
const bad = (res, msg, field) => res.status(400).json({ error: msg, field })
const fail = (res) => res.status(500).json({ error: 'Something went wrong on our side. Please try again.' })

const isValidId = (id) => typeof id === 'string' && /^[0-9a-f]{24}$/i.test(id)

const shape = (o) => ({
  id: o._id,
  listingId: o.listingId,
  farmerId: o.farmerId,
  name: o.name,
  unit: o.unit,
  quantity: o.quantity,
  unitPrice: o.unitPrice,
  totalAmount: o.totalAmount,
  status: o.status,
  paymentStatus: o.paymentStatus,
  createdAt: o.createdAt,
  updatedAt: o.updatedAt,
})

/* ------------------------------------------------ POST /api/orders
   Buyer creates an order for a real active listing.
   Stock is reserved atomically: only one buyer can reserve the available
   quantity, preventing overselling under concurrency. */
router.post('/', async (req, res) => {
  try {
    const { listingId, quantity } = req.body ?? {}

    if (!isValidId(listingId ?? '')) return bad(res, 'That produce listing id is not valid.', 'listingId')
    const qty = Number(quantity)
    if (!Number.isFinite(qty) || qty <= 0)
      return bad(res, 'Enter a valid quantity.', 'quantity')

    const listing = await Listing.findById(listingId)
    if (!listing) return notFound(res, 'That produce listing no longer exists.')
    if (listing.status !== 'Active')
      return bad(res, 'This listing is not accepting orders right now.', 'listingId')
    if (listing.stock < qty)
      return bad(
        res,
        `Only ${listing.stock.toLocaleString('en-KE')} ${listing.unit} are available.`,
        'quantity',
      )

    /* Atomic stock reservation: only succeeds if the listing is still
       Active and has enough stock. Under concurrency, only one request wins. */
    const reserved = await Listing.findOneAndUpdate(
      { _id: listingId, status: 'Active', stock: { $gte: qty } },
      { $inc: { stock: -qty } },
      { new: false },
    )
    if (!reserved)
      return bad(res, 'This listing no longer has enough stock.', 'quantity')

    const farmer = await User.findById(listing.farmerId).select('_id')
    if (!farmer) {
      /* roll back the stock reservation if the farmer account is gone */
      await Listing.findByIdAndUpdate(listingId, { $inc: { stock: qty } })
      return notFound(res, 'That produce listing no longer exists.')
    }

    const totalAmount = qty * listing.price
    const order = await Order.create({
      buyerId: req.user._id,
      farmerId: farmer._id,
      listingId,
      name: listing.name,
      unit: listing.unit,
      quantity: qty,
      unitPrice: listing.price,
      totalAmount,
      status: 'Pending',
      paymentStatus: 'Unpaid',
    })

    res.status(201).json({ order: shape(order) })
  } catch {
    fail(res)
  }
})

/* ------------------------------------------------- GET /api/orders
   The authenticated buyer's own orders, newest first. */
router.get('/', async (req, res) => {
  try {
    const docs = await Order.find({ buyerId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100)
    res.json({ orders: docs.map(shape) })
  } catch {
    fail(res)
  }
})

/* ------------------------------------------------ GET /api/orders/:id
   The buyer's own order. Cross-owner access → 404 (no existence leak). */
router.get('/:id', async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return notFound(res, 'Order not found.')
    const order = await Order.findOne({ _id: req.params.id, buyerId: req.user._id })
    if (!order) return notFound(res, 'Order not found.')
    res.json({ order: shape(order) })
  } catch {
    fail(res)
  }
})

export default router
