/**
 * Tiny fetch wrapper for the Agrilink API.
 *
 * In dev every call goes to the same origin ("/api/...") and Vite's proxy
 * forwards it to the Express backend — first-party cookies, zero CORS.
 * Auth routes resolve to { name, email, role } and reject with a plain
 * { status, error, field? } object so forms can map failures inline.
 */
async function call(url, body = null, method) {
  /* method defaults to POST when there's a JSON body, otherwise GET */
  const verb = method ?? (body ? 'POST' : 'GET')
  let res
  try {
    res = await fetch(
      url,
      body
        ? {
            method: verb,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          }
        : verb === 'GET'
          ? undefined
          : { method: verb },
    )
  } catch {
    throw { status: 0, error: 'Could not reach the Agrilink server.' }
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    /* non-JSON response — fall through */
  }
  if (!res.ok)
    /* spread the full error payload so fields like `accountRole` reach the form */
    throw { ...data, status: res.status, error: data?.error || `Request failed (${res.status})`, field: data?.field }

  return data?.user ?? data
}

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

/* Multipart photo upload — FormData (fetch sets the boundary itself), the
   server stores the file under /uploads/ and returns its URL. */
export async function farmerUploadImage(file) {
  try {
    const fd = new FormData()
    fd.append('image', file)
    const res = await fetch('/api/farmer/uploads', { method: 'POST', body: fd })
    const data = await res.json().catch(() => null)
    if (!res.ok)
      throw { ...data, status: res.status, error: data?.error || `Upload failed (${res.status})`, field: data?.field }
    return data
  } catch (e) {
    if (e?.status) throw e
    throw { status: 0, error: 'Could not reach the Agrilink server.', field: 'image' }
  }
}
