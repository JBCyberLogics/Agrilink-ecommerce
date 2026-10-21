/**
 * Tiny fetch wrapper for the Agrilink API.
 *
 * In dev every call goes to the same origin ("/api/...") and Vite's proxy
 * forwards it to the Express backend — first-party cookies, zero CORS.
 * Auth routes resolve to { name, email, role } and reject with a plain
 * { status, error, field? } object so forms can map failures inline.
 */
export async function call(url, body = null, method) {
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
