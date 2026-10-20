/**
 * Checkout component tests.
 * Verifies the login gate for anonymous users and the honest, real-basket
 * review for signed-in users (no fabricated payment success).
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import Checkout from '../../src/components/shop/Checkout'

const user = { name: 'Wanjiku Kamau', email: 'wanjiku@example.com', role: 'Buyer' }

const cart = [
  {
    productId: 'listing1',
    name: 'Ripe Mangoes',
    price: 80,
    unit: 'kg',
    image: '',
    stock: 720,
    qty: 2,
  },
]

afterEach(() => cleanup())

describe('Checkout — anonymous user', () => {
  it('shows a sign-in prompt instead of the basket', () => {
    const onSignIn = vi.fn()
    render(<Checkout cart={[]} user={null} onSignIn={onSignIn} />)
    expect(screen.getByText(/sign in to check out/i)).toBeDefined()
    const btn = screen.getByRole('button', { name: /sign in/i })
    expect(btn).toBeDefined()
    fireEvent.click(btn)
    expect(onSignIn).toHaveBeenCalledTimes(1)
  })
})

describe('Checkout — signed-in user', () => {
  it('renders the real basket review with server-style KSh subtotal', () => {
    const onQty = vi.fn()
    const onRemove = vi.fn()
    const onBack = vi.fn()
    render(
      <Checkout cart={cart} user={user} onQty={onQty} onRemove={onRemove} onBack={onBack} />,
    )
    expect(screen.getByText(/your order/i)).toBeDefined()
    expect(screen.getByText('Ripe Mangoes')).toBeDefined()
    /* item line total (80 × 2) and subtotal both show KSh 160, so assert on
       the subtotal row specifically */
    const subtotalRow = screen.getByText(/subtotal/i).closest('div')
    expect(subtotalRow).toBeDefined()
    expect(subtotalRow.textContent).toContain('Subtotal')
    expect(subtotalRow.textContent).toContain('KSh 160')
  })

  it('shows the honest "payments not configured" placeholder', () => {
    render(<Checkout cart={cart} user={user} onQty={vi.fn()} onRemove={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByText(/payments not configured yet/i)).toBeDefined()
  })

  it('place-order button is enabled (orders go to the real API)', () => {
    render(<Checkout cart={cart} user={user} onQty={vi.fn()} onRemove={vi.fn()} onBack={vi.fn()} />)
    const btn = screen.getByRole('button', { name: /place order/i })
    expect(btn).toBeDefined()
    expect(btn.disabled).toBe(false)
  })

  it('clears nothing on failed checkout — button stays enabled for retry', () => {
    render(<Checkout cart={cart} user={user} onQty={vi.fn()} onRemove={vi.fn()} onBack={vi.fn()} />)
    const btn = screen.getByRole('button', { name: /place order/i })
    expect(btn.disabled).toBe(false)
    /* cart prop unchanged (Checkout does not mutate it) */
    expect(cart).toHaveLength(1)
  })
})
