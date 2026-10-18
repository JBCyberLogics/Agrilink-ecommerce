/**
 * PurchaseRequest — a buyer's offer on a farmer's listing ("Request quote").
 * The unit is snapshotted from the listing at request time; `status` uses
 * the backend's documented values and nothing is invented client-side.
 * Farmers accepting/declining requests is a later stage — until then every
 * request starts (and honestly stays) 'Pending', and the buyer may
 * withdraw a pending one.
 */
import mongoose from 'mongoose'

export const REQUEST_STATUSES = ['Pending', 'Accepted', 'Declined']

const purchaseRequestSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    quantity: { type: Number, required: true, min: 0.01 },
    /* snapshot of the listing's unit when the request was created */
    unit: { type: String, required: true },
    /* optional buyer counter-offer, KES per unit */
    proposedPrice: { type: Number, min: 1 },
    note: { type: String, default: '', trim: true, maxlength: 400 },
    status: { type: String, enum: REQUEST_STATUSES, default: 'Pending' },
  },
  { timestamps: true },
)

export default mongoose.models.PurchaseRequest || mongoose.model('PurchaseRequest', purchaseRequestSchema)
