/**
 * FAQ page tests (AGRILINK-FAQ-GLOBAL-THEME-001).
 *
 * Two layers:
 *   • unit — renders the FAQ page directly (search, category chips,
 *     accordion semantics + keyboard activation, empty state, help links).
 *   • integration — renders the whole <App /> at #/faq and proves the
 *     route, the public chrome and the nav links resolve through the
 *     existing hash router with no backend involved (fetch stubbed).
 *
 * Selector note: chips use exact-name getByRole matching; accordion
 * triggers carry “<category> <question>” as their accessible name, so a
 * loose regex could match both — strings keep them disambiguated.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react'
import FAQ from '../features/faq/FAQ'
import { FAQ_CATEGORIES, FAQ_ITEMS } from '../features/faq/faqContent'
import App from '../App'

const STUBS = {
  '/api/auth/me': { ok: false, status: 401, json: async () => ({ error: 'unauthorized' }) },
  '/api/market/listings': { ok: true, status: 200, json: async () => ({ listings: [] }) },
  default: { ok: true, status: 200, json: async () => ({}) },
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.stubGlobal('fetch', vi.fn(async (url) => STUBS[url] ?? STUBS.default))
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  document.documentElement.classList.remove('dark')
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  cleanup()
})

const questionTrigger = (text) =>
  screen.getByRole('button', { name: new RegExp(text, 'i') })

describe('FAQ page — content and layout', () => {
  it('renders the heading, intro and a labeled search field', () => {
    render(<FAQ />)
    expect(screen.getByRole('heading', { name: /frequently asked questions/i })).toBeDefined()
    expect(screen.getByText(/farmers and buyers/i)).toBeDefined()
    expect(screen.getByLabelText('Search the FAQ')).toBeDefined()
  })

  it('shows every defined question by default', () => {
    render(<FAQ />)
    expect(screen.getAllByText(FAQ_ITEMS[0].question).length).toBeGreaterThan(0)
    expect(screen.getAllByText(FAQ_ITEMS[FAQ_ITEMS.length - 1].question).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'All Questions' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('exposes all defined categories as chips', () => {
    render(<FAQ />)
    for (const cat of FAQ_CATEGORIES) {
      expect(screen.getByRole('button', { name: cat })).toBeDefined()
    }
  })
})

describe('FAQ page — search and category filters', () => {
  it('search matches questions live', () => {
    render(<FAQ />)
    fireEvent.change(screen.getByLabelText('Search the FAQ'), { target: { value: 'cart' } })
    expect(screen.getAllByText(/add produce to my cart/i).length).toBeGreaterThan(0)
    expect(screen.queryByText(/what is agrilink/i)).toBeNull()
    expect(screen.getByText(/1 question matching your filters/i)).toBeDefined()
  })

  it('search also hits answer text, not just titles', () => {
    render(<FAQ />)
    /* "cookie" only appears inside the account answer */
    fireEvent.change(screen.getByLabelText('Search the FAQ'), { target: { value: 'cookie' } })
    expect(screen.getAllByText(/access my account/i).length).toBeGreaterThan(0)
    expect(screen.queryByText(/what is agrilink/i)).toBeNull()
  })

  it('category chips filter the list independently', () => {
    render(<FAQ />)
    fireEvent.click(screen.getByRole('button', { name: 'Farmer Accounts' }))
    expect(screen.getAllByText(/start selling produce/i).length).toBeGreaterThan(0)
    expect(screen.queryByText(/what is agrilink/i)).toBeNull()
    expect(screen.getByRole('button', { name: 'Farmer Accounts' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('search combines with the selected category', () => {
    render(<FAQ />)
    fireEvent.click(screen.getByRole('button', { name: 'Account and Security' }))
    fireEvent.change(screen.getByLabelText('Search the FAQ'), { target: { value: 'appearance' } })
    expect(screen.getAllByText(/change the appearance/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/1 question matching your filters/i)).toBeDefined()
  })

  it('shows an honest empty state and the Clear action restores everything', () => {
    render(<FAQ />)
    fireEvent.click(screen.getByRole('button', { name: 'Getting Started' }))
    fireEvent.change(screen.getByLabelText('Search the FAQ'), { target: { value: 'appearance cookie' } })
    expect(screen.getByText(/no matching questions/i)).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: /clear search and filters/i }))
    expect(screen.getAllByText(/what is agrilink/i).length).toBeGreaterThan(0)
    expect(screen.getByLabelText('Search the FAQ').value).toBe('')
  })
})

describe('FAQ page — accessible accordion', () => {
  it('click expands answers with proper ARIA wiring; multiple may stay open', () => {
    render(<FAQ />)
    const trigger = questionTrigger('what is agrilink\\?')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    const panelId = trigger.getAttribute('aria-controls')
    expect(panelId).toMatch(/^faq-panel-/)
    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    const panel = document.getElementById(panelId)
    expect(panel.getAttribute('role')).toBe('region')
    expect(panel.getAttribute('aria-labelledby')).toBe(trigger.id)
    expect(panel.getAttribute('aria-hidden')).toBe('false')
    expect(screen.getByText(/digital marketplace/i)).toBeDefined()
    /* several answers may stay open */
    const other = questionTrigger('manage a produce listing')
    fireEvent.click(other)
    expect(other.getAttribute('aria-expanded')).toBe('true')
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    /* clicking again closes it */
    fireEvent.click(other)
    expect(other.getAttribute('aria-expanded')).toBe('false')
  })

  it('Enter and Space keys activate a question', () => {
    render(<FAQ />)
    const trigger = questionTrigger('who can use agrilink')
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    fireEvent.keyDown(trigger, { key: ' ' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })
})

describe('FAQ page — support links', () => {
  it('links to real destinations through the hash router', () => {
    render(<FAQ />)
    expect(screen.getByRole('link', { name: /contact us/i }).getAttribute('href')).toBe('#/contact')
    expect(screen.getByRole('link', { name: /start selling/i }).getAttribute('href')).toBe('#/start-selling')
    expect(screen.getByRole('link', { name: /how it works/i }).getAttribute('href')).toBe('#/how-it-works')
  })
})

describe('FAQ — integration with the app shell', () => {
  it('#/faq renders the page with the public chrome, and routes through the hash router', async () => {
    window.history.replaceState(null, '', '#/faq')
    render(<App />)
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /frequently asked questions/i })).toBeDefined(),
    )
    expect(screen.getByRole('contentinfo')).toBeDefined()
    /* away and back — the same route machinery as every public page */
    window.history.replaceState(null, '', '#/how-it-works')
    act(() => {
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
    expect(screen.queryByRole('heading', { name: /frequently asked questions/i })).toBeNull()
    window.history.replaceState(null, '', '#/faq')
    act(() => {
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
    expect(screen.getByRole('heading', { name: /frequently asked questions/i })).toBeDefined()
  })
})
