/**
 * Orders & History — the buyer's real order records from /api/orders.
 * With no payment provider configured, every order starts as
 * Pending / Unpaid and is honestly presented as not-yet-paid.
 * Nothing is simulated: every row is a server-backed record.
 */
import { useEffect, useState } from 'react'
import { Receipt, AlertCircle, RotateCw, Truck } from 'lucide-react'
import EmptyState from '../parts/EmptyState'
import { buyerOrders } from '../../../utils/api'
import { kes, fmtDate } from '../../../utils/format'

export default function Orders() {
  const [status, setStatus] = useState('loading') // loading | ok | error
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    buyerOrders()
      .then((d) => alive && setOrders(d.orders ?? []))
      .then(() => alive && setStatus('ok'))
      .catch(() => alive && setStatus('error'))
      .finally(() => alive && setStatus((s) => (s === 'loading' ? 'ok' : s)))
    return () => {
      alive = false
    }
  }, [])

  const refresh = () => {
    setStatus('loading')
    buyerOrders()
      .then((d) => setOrders(d.orders ?? []))
      .then(() => setStatus('ok'))
      .catch(() => setStatus('error'))
  }

  if (status === 'loading')
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading orders">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl border border-farmer-line bg-white/70" />
        ))}
      </div>
    )

  if (status === 'error')
    return (
      <div className="rounded-xl border border-farmer-line bg-white p-6 text-center">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-farmer-danger">
          <AlertCircle size={20} aria-hidden="true" />
        </span>
        <p className="mt-3 text-sm font-semibold text-farmer-ink">{error || 'Could not load your orders.'}</p>
        <button
          type="button"
          onClick={refresh}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-farmer-primary px-4 text-[13px] font-semibold text-white hover:bg-farmer-primary-hover"
        >
          <RotateCw size={14} aria-hidden="true" /> Try again
        </button>
      </div>
    )

  if (orders.length === 0)
    return (
      <div className="space-y-4">
        <section className="rounded-xl border border-farmer-line bg-white p-6 sm:p-8">
          <EmptyState icon={Receipt} title="No orders yet.">
            Place an order from Browse Produce and it will appear here as a pending, unpaid record until checkout
            and payment go live in a later stage.
          </EmptyState>
        </section>
        <p className="rounded-xl border border-farmer-line bg-white px-4 py-3 text-xs leading-relaxed text-farmer-muted">
          In the meantime you can track the offers you have sent to farmers under{' '}
          <span className="font-semibold text-farmer-ink">Purchase Requests</span> — those records are live in the
          database today.
        </p>
      </div>
    )

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-farmer-line bg-white p-6 sm:p-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-[15px] font-semibold text-farmer-ink">
            <Truck size={16} aria-hidden="true" className="mr-2 text-farmer-primary" />
            Your orders
          </h2>
          <button
            type="button"
            onClick={refresh}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-farmer-line bg-white px-4 text-[13px] font-semibold text-farmer-ink hover:border-farmer-primary/40 hover:text-farmer-primary"
          >
            <RotateCw size={14} aria-hidden="true" /> Refresh
          </button>
        </div>
        <ul className="divide-y divide-farmer-line">
          {orders.map((o) => (
            <li key={o.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-farmer-ink">{o.name}</p>
                  <p className="mt-0.5 text-xs text-farmer-muted">
                    {o.quantity.toLocaleString('en-KE')} {o.unit} &middot; {kes(o.unitPrice)} each
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-start gap-2">
                  <p className="text-sm font-semibold text-farmer-ink tabular-nums">{kes(o.totalAmount)}</p>
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold">
                    {o.status === 'Pending'
                      ? 'Pending · unpaid'
                      : o.status === 'Confirmed'
                        ? 'Confirmed'
                        : 'Cancelled'}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-xs text-farmer-muted">Placed {fmtDate(o.createdAt)}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
