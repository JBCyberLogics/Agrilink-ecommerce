/**
 * Buyer service — profile, saved produce and purchase requests.
 * Buyer-only API — the server rejects anonymous calls (401) and farmers
 * (403 BUYER_ONLY). Saved produce and purchase requests are real MongoDB
 * records owned by the signed-in buyer; no order endpoint exists yet.
 */
import { call } from '../../../services/apiClient.js'

export const buyerProfile = () => call('/api/buyer/profile', null, 'GET')
export const buyerSaved = () => call('/api/buyer/saved', null, 'GET')
export const buyerSave = (id) => call(`/api/buyer/saved/${id}`, {})
export const buyerUnsave = (id) => call(`/api/buyer/saved/${id}`, null, 'DELETE')
export const buyerRequests = () => call('/api/buyer/requests', null, 'GET')
export const buyerCreateRequest = (body) => call('/api/buyer/requests', body)
export const buyerCancelRequest = (id) => call(`/api/buyer/requests/${id}`, null, 'DELETE')
