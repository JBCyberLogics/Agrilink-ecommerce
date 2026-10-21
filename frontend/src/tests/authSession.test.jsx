/**
 * Auth session regression tests (AGRILINK-AUTH-SESSION-AND-FOOTER-FIX-001).
 *
 * Renders the whole <App /> with global fetch stubbed at the transport
 * boundary (the same pattern the AuthModal/Checkout suites use). The
 * stubbed login response is the SEEDED demo buyer account that already
 * exists in the codebase (wanjiku@agrilink.co.ke via ?demo=buyer) — a
 * mocked fetch here is test-only and never fakes a production login.
 *
 * Regression targets (confirmed from the code, not guesswork):
 *   1. Buyer login lands on the Buyer dashboard (was: stayed on the shop).
 *   2. A protected route shows the boot "Checking your session…" state
 *      while the cookie-restore check is in flight, then the honest
 *      signed-out gate — the dashboard never renders before auth resolves.
 *   3. Role gates: a signed-in Buyer on #/farmer/* sees the buyer gate,
 *      never farmer content.
 *   4. Hash navigation (the Back/Forward mechanism of hash routing) never
 *      clears the authenticated state — auth lives at App level.
 *   5. The marketing footer stays on public pages and stays off the
 *      authenticated (and gated) farmer/buyer routes.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within, act, cleanup } from '@testing-library/react'
import App from '../App'

/* the seeded demo buyer — an existing coded account, not an invention */
const BUYER = { name: 'Wanjiku Kamau', email: 'wanjiku@agrilink.co.ke', role: 'Buyer' }

/* Real empty-collection shapes the endpoints return — the buyer dashboard
   mounts useBuyerData (market feed + saved + requests) which expects these. */
const STUBS = {
  '/api/auth/me': { ok: false, status: 401, json: async () => ({ error: 'unauthorized' }) },
  '/api/auth/login': { ok: true, status: 200, json: async () => BUYER },
  '/api/market/listings': { ok: true, status: 200, json: async () => ({ listings: [] }) },
  '/api/buyer/saved': { ok: true, status: 200, json: async () => ({ saved: [] }) },
  '/api/buyer/requests': { ok: true, status: 200, json: async () => ({ requests: [] }) },
  default: { ok: true, status: 200, json: async () => ({}) },
}

let fetchMock

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  fetchMock = vi.fn(async (url) => STUBS[url] ?? STUBS.default)
  vi.stubGlobal('fetch', fetchMock)
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  cleanup()
})

function navigateHash(hash) {
  window.history.replaceState(null, '', hash)
  act(() => {
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  })
}

/* Drive the real flow: Navbar "Sign In" → AuthModal → POST /api/auth/login
   (stubbed) → handleAuth. Mirrors what a user does; nothing fakes the
   session at the state level. */
async function loginAsBuyer() {
  fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))
  const dialog = screen.getByRole('dialog')
  fireEvent.change(within(dialog).getByLabelText('Email address'), {
    target: { value: BUYER.email },
  })
  fireEvent.change(within(dialog).getByLabelText('Password'), {
    target: { value: 'demo1234' },
  })
  /* the shared AuthModal requires the role card even on the login tab */
  fireEvent.click(within(dialog).getByRole('radio', { name: /buyer/i }))
  fireEvent.click(within(dialog).getByRole('button', { name: 'Sign In' }))
  await waitFor(() => expect(window.location.hash).toBe('#/buyer/dashboard'))
  await waitFor(() => expect(screen.getByText('Available Produce')).toBeDefined())
}

describe('<App /> — buyer login and session behavior', () => {
  it('buyer login opens the Buyer dashboard with the modal closed', async () => {
    render(<App />)
    await loginAsBuyer()
    /* deep link + role routing: the seeded Buyer lands on their dashboard,
       not on the shop and definitely not on a farmer route */
    expect(window.location.hash).toBe('#/buyer/dashboard')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByText('Available Produce')).toBeDefined()
  })
  it('protected route while booting: session-check state, then the signed-out gate', async () => {
    window.history.replaceState(null, '', '#/buyer/dashboard')
    render(<App />)
    /* the cookie-restore check is in flight → loading state, not the
       dashboard and not a flashed access gate */
    expect(screen.getByText(/checking your session/i)).toBeDefined()
    expect(screen.queryByText('Available Produce')).toBeNull()
    /* the check settles without a session → honest gate */
    await waitFor(() => {
      expect(screen.getByText(/sign in as a buyer/i)).toBeDefined()
    })
    expect(screen.queryByText('Available Produce')).toBeNull()
    expect(screen.queryByRole('contentinfo')).toBeNull()
  })

  it('a signed-in Buyer hitting a farmer route meets the buyer gate, not farmer content', async () => {
    render(<App />)
    await loginAsBuyer()
    navigateHash('#/farmer/dashboard')
    expect(await screen.findByText(/you're browsing as a buyer/i)).toBeDefined()
    expect(screen.queryByText(/sign in as a farmer/i)).toBeNull()
  })

  it('hash navigation (Back/Forward equivalent) never clears the session', async () => {
    render(<App />)
    await loginAsBuyer()
    /* Back to the public landing — session state is app-level, so auth
       survives; the public chrome (footer) returns on public pages */
    navigateHash('#/')
    await waitFor(() => expect(screen.getByRole('contentinfo')).toBeDefined())
    expect(screen.queryByText('Available Produce')).toBeNull()
    /* Forward again to the buyer hub — still signed in, dashboard renders */
    navigateHash('#/buyer/dashboard')
    await waitFor(() => expect(screen.getByText('Available Produce')).toBeDefined())
    /* and the farmer gate proves the buyer identity is still alive */
    navigateHash('#/farmer/dashboard')
    expect(await screen.findByText(/you're browsing as a buyer/i)).toBeDefined()
  })

  it('public pages keep the footer; buyer routes never render it', async () => {
    window.history.replaceState(null, '', '#/contact')
    render(<App />)
    await waitFor(() => expect(screen.getByRole('contentinfo')).toBeDefined())
    /* a signed-out buyer route replaces gate + footer pairing */
    navigateHash('#/buyer/settings')
    expect(screen.queryByRole('contentinfo')).toBeNull()
    await waitFor(() => {
      expect(screen.getByText(/sign in as a buyer/i)).toBeDefined()
    })
    expect(screen.queryByRole('contentinfo')).toBeNull()
  })
})
