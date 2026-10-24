/**
 * Orders service — order creation (buyer checkout) + buyer order history
 * and farmer order management. Status transitions are validated and
 * enforced server-side (Pending → Confirmed | Cancelled only).
 */
import { call } from '../../../services/apiClient.js'

export const createOrder = (body) => call('/api/orders', body)
export const buyerOrders = () => call('/api/orders', null, 'GET')

/* Farmer side — centralized here from the page's former raw fetch() calls
   (AGRILINK-FRONTEND-RESTRUCTURE-001): same URLs, same semantics. */
export const farmerOrders = () => call('/api/farmer/orders', null, 'GET')
export const farmerUpdateOrderStatus = (id, status) =>
  call(`/api/farmer/orders/${id}/status`, { status })
