/**
 * Inquiries service. Buyer side: create an inquiry on a listing and list
 * the buyer's own inquiries. Farmer side: inquiries on the farmer's own
 * listings, with explicit status transitions Open → Replied | Closed
 * (validated server-side).
 */
import { call } from '../../../services/apiClient.js'

export const createInquiry = (body) => call('/api/inquiries', body)
export const buyerInquiries = () => call('/api/inquiries', null, 'GET')

/* Farmer side — centralized from the page's former raw fetch() calls with
   the same URLs and payload semantics (AGRILINK-FRONTEND-RESTRUCTURE-001). */
export const farmerInquiries = () => call('/api/farmer/inquiries', null, 'GET')
export const farmerRespondInquiry = (id, status, reply = '') =>
  call(`/api/farmer/inquiries/${id}`, { status, reply })
