/**
 * Farmer API routes — the dashboard's real data source.
 *
 * Auth: session JWT cookie (same mechanism as /api/auth/*).
 * Authorization: every route requires the authenticated user to hold the
 * Farmer role — enforced HERE on the server, never by frontend state alone.
 */
import express from 'express'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import multer from 'multer'
import User from '../models/User.js'
import Listing, { CATEGORIES, UNITS } from '../models/Listing.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

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
  imageUrl: l.imageUrl,
  status: l.status,
  createdAt: l.createdAt,
  updatedAt: l.updatedAt,
})

router.use(requireAuth)

/* ------------------------------------------------------- photo uploads
   Real product photos live on this server's disk (server/uploads), never
   as data-URL blobs inside Mongo. Filenames are randomised on purpose —
   client filenames are never trusted — and only images pass the filter.
   Buyers of this endpoint never see another farmer's uploads validated
   here: /uploads/* is served publicly (like a CDN), but files can only
   be CREATED by farmers. */
const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const UPLOADS_DIR = path.join(__dirname, '..', 'uploads')
fs.mkdirSync(UPLOADS_DIR, { recursive: true })

const IMAGE_EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) =>
      cb(null, `${Date.now().toString(36)}${crypto.randomBytes(7).toString('hex')}${IMAGE_EXT[file.mimetype]}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) =>
    IMAGE_EXT[file.mimetype]
      ? cb(null, true)
      : cb(new Error('Only JPG, PNG or WebP photos are accepted.')),
})

/* Multer rejects the whole request on unsupported types → carry `field`
   so the form can highlight the photo slot instead of a generic error.
   (Fallback error handler is registered at the end of this router.) */

/* ---------------------------------------------- POST /api/farmer/uploads */
router.post('/uploads', farmerOnly, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err?.code === 'LIMIT_FILE_SIZE')
      return res.status(400).json({ error: 'Photos must be 5 MB or smaller.', field: 'image' })
    if (err) return res.status(400).json({ error: err.message || 'Photo could not be uploaded.', field: 'image' })
    if (!req.file) return res.status(400).json({ error: 'Choose a photo to upload.', field: 'image' })
    res.status(201).json({ url: `/uploads/${req.file.filename}`, size: req.file.size, type: path.extname(req.file.filename).slice(1) })
  })
})

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
    const { name = '', category = '', price, unit = '', stock, imageUrl } = req.body || {}
    const bad = (field, error) => res.status(400).json({ error, field })

    if (String(name).trim().length < 3) return bad('name', 'Give your produce a clear name.')
    if (!CATEGORIES.includes(category)) return bad('category', 'Pick the closest category.')
    const p = Number(price)
    if (!Number.isFinite(p) || p <= 0) return bad('price', 'Price must be greater than zero.')
    if (!UNITS.includes(unit)) return bad('unit', 'Choose a unit.')
    const s = Number(stock)
    if (!Number.isFinite(s) || s < 0) return bad('stock', 'Enter the units you have.')
    /* optional photo — must be a file this server actually stored, so the
       grid can never render a dead external link */
    let photo = ''
    if (imageUrl) {
      if (typeof imageUrl !== 'string' || !/^\/uploads\/[A-Za-z0-9._-]+$/.test(imageUrl))
        return bad('image', 'Photo path is not valid.')
      else if (!fs.existsSync(path.join(UPLOADS_DIR, imageUrl.slice('/uploads/'.length))))
        return bad('image', 'Photo could not be found — try uploading it again.')
      photo = imageUrl
    }

    const listing = await Listing.create({
      farmerId: req.user._id,
      name: String(name).trim(),
      category,
      price: p,
      unit,
      stock: s,
      imageUrl: photo,
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
    /* each uploaded photo name is unique — remove the orphaned file, best effort */
    if (doc.imageUrl?.startsWith('/uploads/')) {
      fs.unlink(path.join(UPLOADS_DIR, doc.imageUrl.slice('/uploads/'.length)), () => {})
    }
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: 'Could not delete the listing. Please try again.' })
  }
})

/* Fallback error handler for this router (multer 400s etc.) — carries
   `field` when the caller knows the offending form input. */
router.use((err, _req, res, _next) => {
  if (err?.code === 'LIMIT_FILE_SIZE')
    return res.status(400).json({ error: 'Photos must be 5 MB or smaller.', field: 'image' })
  if (err instanceof multer.MulterError)
    return res.status(400).json({ error: 'Photo upload failed — try again.', field: 'image' })
  res.status(400).json({ error: err?.message || 'That photo could not be uploaded.', field: 'image' })
})

export default router
