/**
 * Farmer service — profile, produce listing management and photo upload.
 * Role + auth are enforced server-side; these only work with a
 * Farmer-session cookie. Market prices have no source yet — the UI shows
 * honest "not configured" states instead of fabricated data.
 * Multipart upload lives here (fetch sets the FormData boundary); the
 * server stores the file under /uploads/ and returns its URL.
 */
import { call } from '../../../services/apiClient.js'

export const farmerProfile = () => call('/api/farmer/profile', null, 'GET')
export const farmerListings = () => call('/api/farmer/listings', null, 'GET')
export const farmerCreateListing = (body) => call('/api/farmer/listings', body)
export const farmerDeleteListing = (id) => call(`/api/farmer/listings/${id}`, null, 'DELETE')

export async function farmerUploadImage(file) {
  try {
    const fd = new FormData()
    fd.append('image', file)
    const res = await fetch(`${import.meta.env?.VITE_API_BASE_URL ?? ''}/api/farmer/uploads`, { method: 'POST', body: fd })
    const data = await res.json().catch(() => null)
    if (!res.ok)
      throw { ...data, status: res.status, error: data?.error || `Upload failed (${res.status})`, field: data?.field }
    return data
  } catch (e) {
    if (e?.status) throw e
    throw { status: 0, error: 'Could not reach the Agrilink server.', field: 'image' }
  }
}
