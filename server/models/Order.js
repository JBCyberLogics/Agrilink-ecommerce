/**
 * Order — a buyer's purchase of a farmer's listing.
 *
 * Honesty rules in force:
 *  • totals are calculated on the server (quantity × unit price), never
 *    trusted from the client
 *  • stock is reserved atomically at creation time so concurrent buyers
 *    cannot oversell the same listing
 *  • with no payment provider configured, every order starts as
 *    status 'Pending' + paymentStatus 'Unpaid' — it is honestly NOT paid
 *    and NOT confirmed until a later stage adds payments + farmer acceptance
 */
import mongoose from 'mongoose'

export const ORDER_STATUSES = ['Pending', 'Confirmed', 'Cancelled']
export const PAYMENT_STATUSES = ['Unpaid', 'Paid']

const orderSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    /* derived from the listing at creation time — never trusted from the client */
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true, index: true },
    /* snapshots of the listing facts at order time */
    name: { type: String, required: true, trim: true },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0.01 },
    unitPrice: { type: Number, required: true, min: 1 }, /* KES per unit */
    totalAmount: { type: Number, required: true, min: 0 }, /* KES, server-calculated */
    status: { type: String, enum: ORDER_STATUSES, default: 'Pending' },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'Unpaid' },
  },
  { timestamps: true }
)

export default mongoose.models.Order || mongoose.model('Order', orderSchema)
