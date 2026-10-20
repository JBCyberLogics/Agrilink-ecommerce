/**
 * AuthModal component tests.
 * Verifies login/signup tabs, client-side validation errors, and role
 * selection — all without hitting the network.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import AuthModal from '../../src/components/AuthModal'

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
  cleanup()
})

describe('AuthModal — rendering', () => {
  it('does not render when closed', () => {
    const { queryByRole } = render(<AuthModal open={false} onAuth={vi.fn()} onClose={vi.fn()} />)
    expect(queryByRole('dialog')).toBeNull()
  })

  it('renders the login tab by default when opened', () => {
    render(<AuthModal open={true} onAuth={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('dialog')).toBeDefined()
    expect(screen.getByText('Welcome back to the farm')).toBeDefined()
    const tab = screen.getByRole('tab', { name: /login/i })
    expect(tab.getAttribute('aria-selected')).toBe('true')
  })

  it('switches to signup when the signup tab is clicked', () => {
    render(<AuthModal open={true} onAuth={vi.fn()} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('tab', { name: /sign up/i }))
    expect(screen.getByText('Join the marketplace')).toBeDefined()
    expect(screen.getByLabelText(/full name/i)).toBeDefined()
  })
})

describe('AuthModal — validation', () => {
  it('shows field errors on submit with an empty login form', async () => {
    const onAuth = vi.fn()
    render(<AuthModal open={true} onAuth={onAuth} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    expect(screen.getByText(/enter a valid email address/i)).toBeDefined()
    expect(screen.getByText(/use at least 6 characters/i)).toBeDefined()
    expect(onAuth).not.toHaveBeenCalled()
  })

  it('shows role-selection error when no role card is chosen', async () => {
    const onAuth = vi.fn()
    render(<AuthModal open={true} onAuth={onAuth} onClose={vi.fn()} />)
    fireEvent.change(screen.getByLabelText(/email address/i, { selector: 'input' }), {
      target: { value: 'a@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i, { selector: 'input' }), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    expect(screen.getByText(/choose how you use agrilink/i)).toBeDefined()
    expect(onAuth).not.toHaveBeenCalled()
  })
})

describe('AuthModal — role selection', () => {
  it('pre-selects a role when a role card is clicked', () => {
    const onAuth = vi.fn()
    render(<AuthModal open={true} initialRole="Farmer" onAuth={onAuth} onClose={vi.fn()} />)
    const radio = screen.getByRole('radio', { name: /i am a farmer/i })
    expect(radio).toBeDefined()
    expect(radio.getAttribute('aria-checked')).toBe('true')
  })
})
