/**
 * Tiny fetch wrapper for the Agrilink API — the ONE transport for every
 * frontend feature (AGRILINK-FRONTEND-RESTRUCTURE-001: all former direct
 * fetch() calls ride through this module).
 *
 * Base URL is environment-driven: same-origin by default (Vite's proxy
 * forwards `/api/*` and `/uploads/*` to the Express backend in dev, and in
 * production Express serves the built frontend from the same origin —
 * first-party cookies, zero CORS). Point a deployed frontend at a separate
 * API origin with VITE_API_BASE_URL — no code changes needed.
 */
const API_BASE = (import.meta.env?.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

export async function call(url, body = null, method) {
  /* method defaults to POST when there's a JSON body, otherwise GET */
  const verb = method ?? (body ? 'POST' : 'GET')
  let res
  try {
    res = await fetch(
      `${API_BASE}${url}`,
      {
        method: verb,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // session cookie rides every request (same-origin or configured API origin)
        ...(body ? { body: JSON.stringify(body) } : {}),
      },
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
