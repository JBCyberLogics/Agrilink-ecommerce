/**
 * Marketplace service — the public produce feed.
 * What farmers post is what buyers see: the shop feed is real MongoDB
 * data (active listings of every farmer, newest first), not a mock list.
 */
import { call } from '../../../services/apiClient.js'

export const marketListings = () => call('/api/market/listings', null, 'GET')
