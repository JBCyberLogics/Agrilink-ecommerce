/**
 * Endpoint definitions for the Agrilink API — one thin wrapper per route,
 * all riding on the shared `call` transport in ./client.js. Payloads and
 * response shapes are exactly what they were before the frontend was
 * restructured; nothing here talks to the transport directly elsewhere.
 */
import { call } from './client.js'

export const signup = (body) => call('/api/auth/signup', body)
export const login = (body) => call('/api/auth/login', body)
export const me = () => call('/api/auth/me').then((d) => (d?.name ? d : null))
export const logout = () => call('/api/auth/logout', {})

/* ------------------------------------------------ farmer dashboard (real) */
/* Role + auth are enforced server-side; these only work with a
   Farmer-session cookie. Market prices have no source yet — the UI shows
   honest "not configured" states instead of fabricated data. */
export const farmerProfile = () => call('/api/farmer/profile', null, 'GET')
export const farmerListings = () => call('/api/farmer/listings', null, 'GET')
export const farmerCreateListing = (body) => call('/api/farmer/listings', body)
export const farmerDeleteListing = (id) => call(`/api/farmer/listings/${id}`, null, 'DELETE')

/* ------------------------------------------------------ public marketplace */
/* What farmers post is what buyers see — the shop feed is real MongoDB
   data (active listings of every farmer, newest first), not a mock list. */
export const marketListings = () => call('/api/market/listings', null, 'GET')

/* ------------------------------------------------------ buyer dashboard */
/* Buyer-only API — the server rejects anonymous calls (401) and farmers
   (403 BUYER_ONLY). Saved produce and purchase requests are real MongoDB
   records owned by the signed-in buyer; no order endpoint exists yet. */
export const buyerProfile = () => call('/api/buyer/profile', null, 'GET')
export const buyerSaved = () => call('/api/buyer/saved', null, 'GET')
export const buyerSave = (id) => call(`/api/buyer/saved/${id}`, {})
export const buyerUnsave = (id) => call(`/api/buyer/saved/${id}`, null, 'DELETE')
export const buyerRequests = () => call('/api/buyer/requests', null, 'GET')
export const buyerCreateRequest = (body) => call('/api/buyer/requests', body)
export const buyerCancelRequest = (id) => call(`/api/buyer/requests/${id}`, null, 'DELETE')

/* ------------------------------------------------------------- orders */
export const createOrder = (body) => call('/api/orders', body)
export const buyerOrders = () => call('/api/orders', null, 'GET')

/* ------------------------------------------------------------- inquiries */
export const createInquiry = (body) => call('/api/inquiries', body)
export const buyerInquiries = () => call('/api/inquiries', null, 'GET')
