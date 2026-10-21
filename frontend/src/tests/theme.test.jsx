/**
 * Global light/dark theme tests (AGRILINK-FAQ-GLOBAL-THEME-001).
 *
 * Renders the whole <App /> (the ThemeProvider lives at the App root, so
 * the whole tree — public navbar, AuthModal, Farmer/Buyer shells — shares
 * one state) with fetch stubbed at the transport boundary, same as the
 * authSession suite. Verified behavior:
 *   1. No saved preference + no system signal → light start.
 *   2. OS prefers-color-scheme drives the initial theme when nothing is
 *      saved — and stays un-pinned in storage until the user chooses.
 *   3. An explicit saved choice beats the OS preference.
 *   4. The public navbar toggle flips .dark on <html>, exposes
 *      aria-pressed + an action-labelled accessible name, and stores the
 *      explicit choice under the agrilink_theme key.
 *   5. The theme survives hash navigation and full remounts (refresh).
 *   6. The authenticated Farmer/Buyer layouts expose the same toggle.
 *   7. Toggling does not sign the user out and does not reset the cart.
 *   8. jsdom quirks: matchMedia does not exist — stubbed explicitly here.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within, act, cleanup } from '@testing-library/react'
import App from '../App'
import { THEME_STORAGE_KEY } from '../features/theme/theme'

/* the seeded demo buyer — an existing coded account, not an invention */
const BUYER = { name: 'Wanjiku Kamau', email: 'wanjiku@agrilink.co.ke', role: 'Buyer' }
/* farmer response shape matches the seed data layout (role from server) */
const FARMER = { name: 'Otieno Farm', email: 'otieno@agrilink.co.ke', role: 'Farmer', farmName: 'Otieno Greens' }

const MARKET_LISTING = {
  id: 1,
  name: 'Ripe Mangoes',
  category: 'Fruits & Veg',
  price: 120,
  unit: 'kg',
  stock: 200,
  imageUrl: '',
  farmer: 'Otieno Greens',
  location: 'Machakos',
}

const STUBS = {
  '/api/auth/me': { ok: false, status: 401, json: async () => ({ error: 'unauthorized' }) },
  '/api/market/listings': { ok: true, status: 200, json: async () => ({ listings: [MARKET_LISTING] }) },
  '/api/buyer/saved': { ok: true, status: 200, json: async () => ({ saved: [] }) },
  '/api/buyer/requests': { ok: true, status: 200, json: async () => ({ requests: [] }) },
  '/api/farmer/listings': { ok: true, status: 200, json: async () => ({ listings: [] }) },
  '/api/farmer/orders': { ok: true, status: 200, json: async () => ({ orders: [] }) },
  '/api/farmer/inquiries': { ok: true, status: 200, json: async () => ({ inquiries: [] }) },
  default: { ok: true, status: 200, json: async () => ({}) },
}

let fetchMock

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  fetchMock = vi.fn(async (url) => STUBS[url] ?? STUBS.default)
  vi.stubGlobal('fetch', fetchMock)
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  /* isolate each test document state */
  localStorage.clear()
  document.documentElement.classList.remove('dark')
  delete document.documentElement.style.colorScheme
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  localStorage.clear()
  document.documentElement.classList.remove('dark')
  delete document.documentElement.style.colorScheme
  cleanup()
})

function navigateHash(hash) {
  window.history.replaceState(null, '', hash)
  act(() => {
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  })
}

/* jsdom has no matchMedia — substitute the OS signal */
function stubSystemDark(matches) {
  vi.stubGlobal('matchMedia', vi.fn((q) => ({
    matches: q === '(prefers-color-scheme: dark)' ? matches : false,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  })))
}

const toggleButtons = () =>
  screen.getAllByRole('button', { name: /switch to (light|dark) mode/i })

async function loginAs(role) {
  /* stub the role the server would return for this demo login */
  fetchMock.mockImplementation(async (url) => {
    if (url === '/api/auth/login') {
      return { ok: true, status: 200, json: async () => (role === 'farmer' ? FARMER : BUYER) }
    }
    return STUBS[url] ?? STUBS.default
  })
  fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))
  const dialog = screen.getByRole('dialog')
  fireEvent.change(within(dialog).getByLabelText('Email address'), {
    target: { value: role === 'farmer' ? FARMER.email : BUYER.email },
  })
  fireEvent.change(within(dialog).getByLabelText('Password'), { target: { value: 'demo1234' } })
  fireEvent.click(within(dialog).getByRole('radio', { name: new RegExp(role, 'i') }))
  fireEvent.click(within(dialog).getByRole('button', { name: 'Sign In' }))
  await waitFor(() =>
    expect(window.location.hash).toBe(role === 'farmer' ? '#/farmer/dashboard' : '#/buyer/dashboard'),
  )
}

describe('<App /> theme system', () => {
  it('starts light when nothing is saved and the system gives no signal', () => {
    render(<App />)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    /* the derived default is not pinned in storage — it stays system-followed */
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull()
  })

  it('follows the OS dark preference on first visit without pinning storage', () => {
    stubSystemDark(true)
    render(<App />)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull()
  })

  it('an explicit saved choice overrides the OS preference', () => {
    stubSystemDark(true)
    localStorage.setItem(THEME_STORAGE_KEY, 'light')
    render(<App />)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
  })

  it('navbar toggle switches to dark, updates ARIA and stores the explicit choice', () => {
    render(<App />)
    const btn = screen.getByRole('button', { name: 'Switch to dark mode' })
    expect(btn.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(btn)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(btn.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeDefined()
    /* native controls follow the theme (colorScheme is stamped on <html>) */
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('theme survives route changes and session-aware remounts', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }))
    navigateHash('#/about')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    /* full unmount → new App: the saved choice is applied again (refresh) */
    cleanup()
    render(<App />)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    /* toggling back to light clears both the class and the stored choice */
    fireEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
  })

  it('the Buyer dashboard header exposes the same toggler', async () => {
    render(<App />)
    await loginAs('buyer')
    expect(screen.getByText('Available Produce')).toBeDefined()
    expect(toggleButtons().length).toBeGreaterThanOrEqual(2)
  })

  it('the Farmer dashboard header exposes the same toggler', async () => {
    render(<App />)
    await loginAs('farmer')
    await waitFor(() => expect(screen.getByText(/farmer overview/i)).toBeDefined())
    expect(toggleButtons().length).toBeGreaterThanOrEqual(2)
  })

  it('toggling does not sign the user out or reset the cart', async () => {
    render(<App />)
    await loginAs('buyer')
    /* public marketplace: add the stubbed listing to the cart */
    navigateHash('#/')
    const add = await screen.findByRole('button', { name: /add ripe mangoes to cart/i })
    fireEvent.click(add)
    await waitFor(() => expect(screen.getAllByText('1').length).toBeGreaterThan(0))
    /* flip both directions; session + cart badge survive */
    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(screen.getAllByRole('button', { name: /sign out/i }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('1').length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }))
    expect(screen.getAllByRole('button', { name: /sign out/i }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('1').length).toBeGreaterThan(0)
  })
})
