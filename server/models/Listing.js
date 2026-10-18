/**
 * Listing — a farmer's produce listing, persisted in MongoDB.
 * Prices are Kenyan Shillings per unit (KES confirmed by the data entry).
 */
import mongoose from 'mongoose'

export const CATEGORIES = ['Grains', 'Fruits & Veg', 'Livestock']
export const UNITS = ['kg', 'litre', 'bunch', 'tray', 'crate', 'bird', 'head', 'cob', 'jar']

const listingSchema = new mongoose.Schema(
  {
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, minlength: 3 },
    category: { type: String, required: true, enum: CATEGORIES },
    price: { type: Number, required: true, min: 1 }, // KES per unit
    unit: { type: String, required: true, enum: UNITS },
    stock: { type: Number, required: true, min: 0 },
    /* photo of the actual produce — either a file we stored under /uploads
       (via POST /api/farmer/uploads) or empty; no fabricated remote photos */
    imageUrl: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Paused', 'Sold out'], default: 'Active' },
  },
  { timestamps: true },
)

export default mongoose.models.Listing || mongoose.model('Listing', listingSchema)
