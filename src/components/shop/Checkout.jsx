import { useState } from 'react'
import { ArrowLeft, ArrowRight, ShoppingBag, Truck, ShieldAlert, AlertCircle, Trash2 } from 'lucide-react'
import { kes } from '../../utils/format'

/* Honest checkout page: real basket review, but no payment backend exists yet.
   Nothing is simulated and nothing is charged — a clear placeholder states that. */
export default function Checkout({ cart, user, onQty, onRemove, onBack, onSignIn }) {
  const subtotal = cart.reduce((sum, it) => sum + it.price * it.qty, 0)
  const [orderStatus, setOrderStatus] = useState(null) // null | 'unavailable'

  const lineTotal = (it) => it.price * it.qty

  if (!user) {
    return (
      <main className="max-w-md mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
        <AlertCircle size={40} className="mx-auto text-neutral-400" aria-hidden="true" />
        <h2 className="mt-6 font-display text-lg font-bold text-neutral-900">
          Sign in to check out
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
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

  const placeOrder = () => {
    /* No order endpoint exists yet — honest placeholder, never fabricated. */
    setOrderStatus('unavailable')
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex items-center gap-2 mb-8">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to marketplace"
          className="grid h-9 w-9 place-items-center rounded-lg border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100"
        >
          <ArrowLeft size={16} aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2">
          <ShoppingBag size={20} aria-hidden="true" className="text-primary" />
          <h1 className="font-display text-lg font-bold text-neutral-900">Checkout</h1>
        </div>
      </header>

      {/* ----------------------------- basket review ----------------------------- */}
      <section className="mb-8">
        <h2 className="mb-4 text-[15px] font-semibold text-neutral-900">Your order</h2>
        <ul className="divide-y divide-neutral-200/60">
          {cart.map((it) => (
            <li key={it.productId} className="flex items-center gap-3 px-3 py-4">
              <img
                src={it.image}
                alt=""
                loading="lazy"
                className="h-12 w-12 shrink-0 rounded-lg bg-neutral-100 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-neutral-900">{it.name}</p>
                <p className="text-xs text-neutral-500">{it.unit} &middot; {kes(it.price)} each</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onQty(it.productId, -1)}
                  disabled={it.qty <= 1}
                  aria-label={`Decrease ${it.name} quantity`}
                  className="grid h-7 w-7 place-items-center rounded-md border border-neutral-200 text-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 size={12} aria-hidden="true" />
                </button>
                <span className="w-5 text-center text-sm font-semibold tabular-nums">{it.qty}</span>
                <button
                  type="button"
                  onClick={() => onQty(it.productId, +1)}
                  aria-label={`Increase ${it.name} quantity`}
                  className="grid h-7 w-7 place-items-center rounded-md border border-neutral-200 text-neutral-500 transition-colors hover:bg-primary-soft hover:text-primary"
                >
                  <Truck size={12} aria-hidden="true" />
                </button>
              </div>
              <p className="text-sm font-semibold text-neutral-900 tabular-nums">{kes(lineTotal(it))}</p>
              <button
                type="button"
                onClick={() => onRemove(it.productId)}
                aria-label={`Remove ${it.name}`}
                className="rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-red-500"
                title="Remove"
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex items-center justify-between border-t pt-4 text-sm">
          <span className="text-neutral-500">Subtotal</span>
          <span className="font-display text-lg font-bold text-neutral-900 tabular-nums">{kes(subtotal)}</span>
        </div>
      </section>

      {/* ----------------------------- payment (honest placeholder) ----------------------------- */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-[15px] font-semibold text-neutral-900">Payment</h2>
        <div className="flex gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <ShieldAlert size={20} className="shrink-0 text-neutral-400" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-neutral-900">Payments not configured yet</p>
            <p className="mt-1 text-xs text-neutral-500">
              Orders will be available in a later stage — nothing is simulated and nothing is
              charged. Your basket is kept here, ready when checkout goes live.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={placeOrder}
            disabled
            aria-disabled="true"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-neutral-200 text-sm font-semibold text-neutral-400 cursor-not-allowed"
          >
            Place order <Truck size={16} aria-hidden="true" />
          </button>
          <p className="mt-2 text-xs text-neutral-500">
            You're signed in as <strong>{user.name}</strong> ({user.role}).
          </p>
        </div>

        {orderStatus === 'unavailable' && (
          <p
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
          >
            <AlertCircle size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
            Orders aren't available yet — your basket is kept and nothing was charged.
          </p>
        )}
      </section>
    </main>
  )
}
