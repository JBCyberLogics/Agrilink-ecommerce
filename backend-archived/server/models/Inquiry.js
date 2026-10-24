/**
 * Inquiry — a buyer's message to a farmer about a specific listing.
 *
 * Identities are derived from the authenticated session and the listing
 * record — never trusted from untrusted request fields.
 */
import mongoose from 'mongoose'

export const INQUIRY_STATUSES = ['Open', 'Replied', 'Closed']

const inquirySchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true, index: true },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    status: { type: String, enum: INQUIRY_STATUSES, default: 'Open' },
    reply: { type: String, default: '', trim: true, maxlength: 1000 },
  },
  { timestamps: true }
)

export default mongoose.models.Inquiry || mongoose.model('Inquiry', inquirySchema)
