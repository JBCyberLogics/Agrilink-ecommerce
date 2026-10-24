/**
 * Checkout page — real basket review connected to the orders API.
 *
 * With no payment provider configured, placing an order creates a
 * Pending / Unpaid record and honestly presents it as not-yet-paid.
 * The cart is only cleared after the server confirms order creation.
 */
import { useState } from 'react'
import { ArrowLeft, ArrowRight, ShoppingBag, Truck, ShieldAlert, AlertCircle, CheckCircle2 } from 'lucide-react'
import { kes } from '../../../utils/format'
import { createOrder } from '../../orders/services/orderService'

export default function Checkout({ cart, user, onQty, onRemove, onBack, onSignIn, onOrderPlaced }) {
  const subtotal = cart.reduce((sum, it) => sum + it.price * it.qty, 0)
  const [orderStatus, setOrderStatus] = useState(null) // null | 'submitting' | 'success' | 'error'
  const [orderError, setOrderError] = useState('')
  const [placedOrder, setPlacedOrder] = useState(null)

  const lineTotal = (it) => it.price * it.qty

  /* Anonymous user — login gate, cart is kept while they sign in */
  if (!user) {
    return (
      <main className="max-w-md mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
        <AlertCircle size={40} className="mx-auto text-muted-2" aria-hidden="true" />
        <h2 className="mt-6 font-display text-lg font-bold text-ink">Sign in to check out</h2>
        <p className="mt-2 text-sm text-muted">
          Create an account or sign in to place your order. Your basket is kept while you sign in.
        </p>
        <div className="mt-8">
          <button
            type="button"
            onClick={onSignIn}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-lift transition-all hover:bg-primary-dark active:scale-[0.98]"
          >
            Sign In <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </main>
    )
  }

  const placeOrder = async (e) => {
    e.preventDefault()
    if (cart.length === 0) return
    setOrderStatus('submitting')
    setOrderError('')
    try {
      const res = await createOrder({
        listingId: cart[0].productId,
        quantity: cart[0].qty,
      })
      if (res.ok === false || !res.order) throw new Error(res.error || 'Order could not be placed.')
      setPlacedOrder(res.order)
      setOrderStatus('success')
      /* Only clear the cart after the server confirms order creation. */
      if (onOrderPlaced) onOrderPlaced(res.order)
    } catch (err) {
      setOrderStatus('error')
      setOrderError(err?.error || 'Could not place your order. Please try again.')
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex items-center gap-2 mb-8">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to marketplace"
          className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink-4 transition-colors hover:bg-soft"
        >
          <ArrowLeft size={16} aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2">
          <ShoppingBag size={20} aria-hidden="true" className="text-brand" />
          <h1 className="font-display text-lg font-bold text-ink">Checkout</h1>
        </div>
      </header>

      {/* ----------------------------- basket review ----------------------------- */}
      <section className="mb-8">
        <h2 className="mb-4 text-[15px] font-semibold text-ink">Your order</h2>
        {cart.length === 0 ? (
          <p className="text-sm text-muted">Your basket is empty.</p>
        ) : (
          <>
            <ul className="divide-y divide-line/60">
              {cart.map((it) => (
                <li key={it.productId} className="flex items-center gap-3 px-3 py-4">
                  <img
                    src={it.image}
                    alt=""
                    loading="lazy"
                    className="h-12 w-12 shrink-0 rounded-lg bg-soft object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{it.name}</p>
                    <p className="text-xs text-muted">{it.unit} &middot; {kes(it.price)} each</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onQty(it.productId, -1)}
                      disabled={it.qty <= 1}
                      aria-label={`Decrease ${it.name} quantity`}
                      className="grid h-7 w-7 place-items-center rounded-md border border-line text-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-danger-wash hover:text-danger"
                    >
                      <Truck size={12} aria-hidden="true" />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold tabular-nums">{it.qty}</span>
                    <button
                      type="button"
                      onClick={() => onQty(it.productId, +1)}
                      aria-label={`Increase ${it.name} quantity`}
                      className="grid h-7 w-7 place-items-center rounded-md border border-line text-muted transition-colors hover:bg-primary-soft hover:text-brand"
                    >
                      <Truck size={12} aria-hidden="true" />
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-ink tabular-nums">{kes(lineTotal(it))}</p>
                  <button
                    type="button"
                    onClick={() => onRemove(it.productId)}
                    aria-label={`Remove ${it.name}`}
                    className="rounded-lg p-1 text-muted-2 transition-colors hover:bg-soft hover:text-danger"
                    title="Remove"
                  >
                    <Truck size={14} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-center justify-between border-t pt-4 text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="font-display text-lg font-bold text-ink tabular-nums">{kes(subtotal)}</span>
            </div>
          </>
        )}
      </section>

      {/* ----------------------------- payment (honest placeholder) ----------------------------- */}
      <section className="rounded-2xl border border-line bg-paper p-6 shadow-soft">
        <h2 className="mb-4 text-[15px] font-semibold text-ink">Payment</h2>
        <div className="flex gap-3 rounded-xl border border-line bg-paper-soft p-4">
          <ShieldAlert size={20} className="shrink-0 text-muted-2" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-ink">Payments not configured yet</p>
            <p className="mt-1 text-xs text-muted">
              Orders will be available in a later stage. Placing an order now creates a <strong>pending,
              unpaid</strong> record — nothing is charged and nothing is confirmed until checkout and payment
              go live.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <form onSubmit={placeOrder}>
            <button
              type="submit"
              disabled={orderStatus === 'submitting'}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-lift transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:!bg-primary-dark active:scale-[0.98]"
            >
              {orderStatus === 'submitting' ? (
                <>
                  <Truck size={16} className="animate-spin" aria-hidden="true" />
                  Placing order…
                </>
              ) : (
                <>
                  <Truck size={16} aria-hidden="true" />
                  Place order
                </>
              )}
            </button>
          </form>
          <p className="mt-2 text-xs text-muted">
            You're signed in as <strong>{user.name}</strong> ({user.role}).
          </p>
        </div>

        {orderStatus === 'error' && (
          <p
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-lg border border-danger-line bg-danger-wash p-3 text-xs font-medium text-danger"
          >
            <AlertCircle size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
            {orderError}
          </p>
        )}

        {orderStatus === 'success' && placedOrder && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-ok-line bg-ok-wash p-3 text-xs font-medium text-ok">
            <CheckCircle2 size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-ok-strong">Order placed — pending &amp; unpaid</p>
              <p className="mt-1 text-xs text-ink-4">
                Order <strong>#{placedOrder.id.slice(-6)}</strong> for{' '}
                <strong>{placedOrder.quantity} {placedOrder.unit} of {placedOrder.name}</strong> at{' '}
                <strong>{kes(placedOrder.totalAmount)}</strong>. It will remain pending until checkout and
                payment go live in a later stage.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
