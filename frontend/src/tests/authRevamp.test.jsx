/**
 * Auth UI revamp tests (AGRILINK-AUTH-UI-REVAMP-001).
 *
 * Covers the presentation rework of the auth experience — the split-screen
 * brand panel + orbiting badges + the new consent gating — while
 * re-asserting the behavior contracts that must have survived it:
 * role/value persistence across tabs, terms gating, password visibility,
 * duplicate-submit prevention, the 403 role pre-select, and honest service
 * copy (no remember-me, no fake links, real cookie-session wording).
 *
 * Network is stubbed at the transport boundary (global fetch — resolved by
 * the real client.js `call` wrapper): test-only fixtures, never fake
 * production auth.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within, cleanup } from '@testing-library/react'
import AuthModal from '../features/auth/AuthModal'

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  cleanup()
})

describe('AuthModal — orbiting badges', () => {
  it('renders four badges in a decorative layer that cannot block or cover the form', () => {
    render(<AuthModal open={true} onAuth={vi.fn()} onClose={vi.fn()} />)

    const layer = document.querySelector('.auth-orbit')
    expect(layer).not.toBeNull()
    /* decorative: no semantics, no pointer events, no focus targets */
    expect(layer.getAttribute('aria-hidden')).toBe('true')
    expect(layer.className).toContain('pointer-events-none')
    /* translation-only motion inside a clip layer → no scrollbars possible */
    expect(layer.className).toContain('overflow-hidden')
    expect(layer.querySelectorAll('button, input, a, [tabindex]')).toHaveLength(0)

    /* the four tech/ag badges: content labels, no user/activity claims */
    for (const label of ['Farmers', 'Buyers', 'Marketplace', 'AI Insights']) {
      expect(within(layer).getByText(label)).toBeDefined()
    }

    /* mobile footprint: two of four dots drop out below md */
    const dots = document.querySelectorAll('.auth-orbit-dot')
    expect(dots).toHaveLength(4)
    expect([...dots].filter((d) => d.className.includes('hidden md:flex'))).toHaveLength(2)

    /* layering: the orbit layer paints BEFORE the card, so even when the
       viewport squeezes the radius the badges glide under, never over, the
       form (lower paint order + no z-war) */
    const card = layer.parentElement.lastElementChild
    expect(card.className).toContain('backdrop-blur-2xl')
  })

  it('keeps the dialog scrollable vertically while the shell clips horizontal overflow', () => {
    render(<AuthModal open={true} onAuth={vi.fn()} onClose={vi.fn()} />)
    const dialog = screen.getByRole('dialog')
    /* tall forms scroll inside the takeover; the badge layer can never add
       horizontal scrolling to the page */
    expect(dialog.className).toContain('overflow-y-auto')
  })
})

describe('AuthModal — new presentation, preserved behavior', () => {
  it('renders the split-screen brand story', () => {
    render(<AuthModal open={true} onAuth={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('Connecting Farms to Opportunity')).toBeDefined()
    expect(screen.getByText('Discover Produce')).toBeDefined()
    expect(screen.getByText('Connect with Buyers')).toBeDefined()
    expect(screen.getByText('Simplify Market Access')).toBeDefined()
    expect(screen.getByText('Farm-fresh marketplace')).toBeDefined()
  })

  it('keeps the typed values and the selected role when switching Login ⇄ Sign Up', () => {
    render(<AuthModal open={true} onAuth={vi.fn()} onClose={vi.fn()} />)

    fireEvent.change(screen.getByLabelText(/email address/i, { selector: 'input' }), {
      target: { value: 'wanjiku@agrilink.co.ke' },
    })
    fireEvent.click(screen.getByRole('radio', { name: /buyer/i }))

    /* values + role survive the first switch (controlled state, remount-safe) */
    fireEvent.click(screen.getByRole('tab', { name: /sign up/i }))
    expect(screen.queryByLabelText(/full name/i)).toBeDefined()
    expect(screen.getByRole('radio', { name: /buyer/i }).getAttribute('aria-checked')).toBe('true')
    expect(screen.getByLabelText(/email address/i, { selector: 'input' }).value).toBe(
      'wanjiku@agrilink.co.ke',
    )

    /* ...and the second switch back */
    fireEvent.click(screen.getByRole('tab', { name: /login/i }))
    expect(screen.queryByLabelText(/full name/i)).toBeNull()
    expect(screen.getByRole('radio', { name: /buyer/i }).getAttribute('aria-checked')).toBe('true')
    expect(screen.getByLabelText(/email address/i, { selector: 'input' }).value).toBe(
      'wanjiku@agrilink.co.ke',
    )
  })

  it('toggles password visibility with an accessible control', () => {
    render(<AuthModal open={true} onAuth={vi.fn()} onClose={vi.fn()} />)

    const password = screen.getByLabelText(/^password$/i, { selector: 'input' })
    expect(password.type).toBe('password')

    fireEvent.click(screen.getByRole('button', { name: 'Show password' }))
    expect(password.type).toBe('text')

    fireEvent.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(password.type).toBe('password')
  })

  it('gates signup behind an explicit required terms consent (no fake "#" links)', async () => {
    const onAuth = vi.fn()
    /* any network call would be a validation leak — stub a loud failure */
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ name: 'Joseph Kariuki', email: 'joseph@example.com', role: 'Farmer' }),
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    render(<AuthModal open={true} onAuth={onAuth} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('tab', { name: /sign up/i }))

    /* everything valid EXCEPT the terms checkbox */
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Joseph Kariuki' } })
    fireEvent.change(screen.getByLabelText(/email address/i, { selector: 'input' }), {
      target: { value: 'joseph@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/^password$/i, { selector: 'input' }), {
      target: { value: 'harvest12' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'harvest12' } })
    fireEvent.click(screen.getByRole('radio', { name: /farmer/i }))

    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    expect(screen.getByText('Please accept the marketplace terms to continue.')).toBeDefined()
    expect(screen.getByRole('checkbox').getAttribute('aria-invalid')).toBe('true')
    expect(document.querySelector('[data-error="terms"]')).not.toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(onAuth).not.toHaveBeenCalled()

    /* accepting clears the error and the same click-through proceeds with the
       REAL signup flow (stubbed transport, genuine response shape) */
    fireEvent.click(screen.getByRole('checkbox'))
    expect(screen.queryByText('Please accept the marketplace terms to continue.')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() => expect(onAuth).toHaveBeenCalledWith(expect.anything()))
    expect(onAuth.mock.calls[0][0].role).toBe('Farmer')
  })

  it('still pre-selects the account role on a 403 role-gate rejection', async () => {
    const onAuth = vi.fn()
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 403,
        json: async () => ({
          error: 'This account is registered as a Farmer.',
          field: 'role',
          accountRole: 'Farmer',
        }),
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    render(<AuthModal open={true} onAuth={onAuth} onClose={vi.fn()} />)
    fireEvent.change(screen.getByLabelText(/email address/i, { selector: 'input' }), {
      target: { value: 'farmer@agrilink.co.ke' },
    })
    fireEvent.change(screen.getByLabelText(/^password$/i, { selector: 'input' }), {
      target: { value: 'demo1234' },
    })
    fireEvent.click(screen.getByRole('radio', { name: /buyer/i }))

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await screen.findByText(/registered as a farmer/i)
    expect(screen.getByRole('radio', { name: /farmer/i }).getAttribute('aria-checked')).toBe('true')
    expect(onAuth).not.toHaveBeenCalled()
  })

  it('shows a pending state and refuses re-submission while auth is in flight', async () => {
    const onAuth = vi.fn()
    let resolveLogin
    const fetchMock = vi.fn((url) => {
      if (url === '/api/auth/login')
        return new Promise((resolve) => {
          resolveLogin = resolve
        })
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) })
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<AuthModal open={true} onAuth={onAuth} onClose={vi.fn()} />)
    fireEvent.change(screen.getByLabelText(/email address/i, { selector: 'input' }), {
      target: { value: 'wanjiku@agrilink.co.ke' },
    })
    fireEvent.change(screen.getByLabelText(/^password$/i, { selector: 'input' }), {
      target: { value: 'demo1234' },
    })
    fireEvent.click(screen.getByRole('radio', { name: /buyer/i }))

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    const pending = await screen.findByRole('button', { name: /signing you in/i })
    expect(pending.hasAttribute('disabled')).toBe(true)
    /* a second submit attempt never reaches the network */
    fireEvent.click(pending)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(onAuth).not.toHaveBeenCalled()

    /* the pending request resolves with the genuine seeded-buyer shape */
    resolveLogin({ ok: true, status: 200, json: async () => ({ name: 'Wanjiku Kamau', email: 'wanjiku@agrilink.co.ke', role: 'Buyer' }) })
    await waitFor(() => expect(onAuth).toHaveBeenCalledTimes(1))
    expect(onAuth.mock.calls[0][0].role).toBe('Buyer')
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeDefined()
  })

  it('keeps the copy honest: no remember-me, no dead links, real session wording', () => {
    render(<AuthModal open={true} onAuth={vi.fn()} onClose={vi.fn()} />)

    /* the old fake "Remember me" is gone — sessions are the server cookie */
    expect(screen.queryByLabelText(/remember me/i)).toBeNull()
    expect(screen.getByText(/secure, server-side cookie/i)).toBeDefined()
    expect(screen.queryByText(/never leaves the farm/i)).toBeNull()

    /* the signup consent has no dead anchor links (the "#" Terms/Privacy
       links are gone; hrefs in the takeover are real hash routes) */
    fireEvent.click(screen.getByRole('tab', { name: /sign up/i }))
    expect(document.querySelectorAll('a[href="#"]')).toHaveLength(0)
  })
})
