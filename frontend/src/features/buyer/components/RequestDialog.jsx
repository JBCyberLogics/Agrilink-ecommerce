/**
 * RequestDialog — send a purchase request for a REAL listing. Accessible
 * dialog (role, label, Esc + backdrop close, focus ring). Validation is
 * client-fatal only for obviously empty input; every rule the backend
 * enforces (stock cap, unknown listing, sold out) is mapped from the
 * server's { error, field } response onto the right field. Success is
 * shown ONLY after the backend's 201 (spec phase 7).
 */
import { useEffect, useRef, useState } from 'react'
import { X, AlertCircle, CheckCircle2, MessageSquarePlus } from 'lucide-react'
import { buyerCreateRequest } from '../services/buyerService'
import { kes } from '../../../utils/format'

export default function RequestDialog({ listing, onClose, onSent }) {
  const [form, setForm] = useState({ quantity: '', proposedPrice: '', note: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(null)
  const panel = useRef(null)
  const first = useRef(null)

  useEffect(() => {
    first.current?.focus()
    const onKey = (e) => e.key === 'Escape' && !saving && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!listing) return null

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    /* re-picking a field clears its stale error, like the farmer forms */
    setErrors((er) => (er[k] ? { ...er, [k]: null } : er))
  }

  const submit = async (e) => {
    e.preventDefault()
    /* local sanity: quantity is the only hard-required field; everything
       else is validated by the backend and mapped below */
    const q = Number(form.quantity)
    if (!form.quantity.trim() || !Number.isFinite(q) || q <= 0)
      return setErrors({ quantity: 'Enter the quantity you need.' })

    setSaving(true)
    setErrors({})
    try {
      const payload = {
        listingId: listing.id,
        quantity: q,
        note: form.note,
      }
      if (form.proposedPrice.trim() !== '') payload.proposedPrice = Number(form.proposedPrice)
      const d = await buyerCreateRequest(payload)
      setDone(d?.request ?? { status: 'Pending' })
      setForm({ quantity: '', proposedPrice: '', note: '' })
      onSent?.()
    } catch (err) {
      setErrors({ [err?.field ?? 'form']: err?.error || 'Could not send your request. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={() => !saving && onClose()} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-dialog-title"
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-paper shadow-lift"
      >
        <div className="flex items-start justify-between gap-3 border-b border-farmer-line px-5 py-4">
          <div>
            <h2 id="request-dialog-title" className="font-display text-[15px] font-bold text-farmer-ink">
              Purchase request
            </h2>
            <p className="mt-0.5 text-[13px] text-farmer-muted">
              {listing.name}
              {listing.farmer ? ` · ${listing.farmer}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => !saving && onClose()}
            aria-label="Close dialog"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-farmer-muted hover:bg-farmer-page"
          >
            <X size={17} aria-hidden="true" />
          </button>
        </div>

        {done ? (
          <div className="space-y-4 px-5 py-6">
            <div className="flex items-start gap-2.5 rounded-lg bg-farmer-surface p-4">
              <CheckCircle2 size={18} aria-hidden="true" className="shrink-0 text-farmer-success" />
              <p className="text-[13px] leading-relaxed text-farmer-ink">
                <span className="font-semibold">Request sent.</span> Status:{' '}
                <span className="font-semibold text-farmer-warning">{done.status}</span> — it is saved
                under Purchase Requests and waits for the farmer to respond.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-11 w-full rounded-lg bg-farmer-primary text-sm font-semibold text-white transition-colors hover:bg-farmer-primary-hover"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-4 px-5 py-5">
            {/* listing facts — real values, no negotiation theater */}
            <p className="rounded-lg bg-farmer-page px-3 py-2.5 text-[13px] text-farmer-muted">
              Buyer price: <span className="font-semibold text-farmer-ink">{kes(listing.price)} / {listing.unit}</span>
              {listing.stock > 0 && (
                <> · Up to <span className="font-semibold text-farmer-ink">{listing.stock.toLocaleString('en-KE')} {listing.unit}</span> available</>
              )}
            </p>

            <Field
              id="request-quantity"
              label={`Quantity needed (${listing.unit})`}
              error={errors.quantity}
              input={
                <input
                  id="request-quantity"
                  ref={first}
                  type="number"
                  inputMode="decimal"
                  min="0.5"
                  step="0.5"
                  max={listing.stock || undefined}
                  value={form.quantity}
                  onChange={set('quantity')}
                  placeholder="e.g. 40"
                  className={inputCls(!!errors.quantity)}
                />
              }
            />

            <Field
              id="request-price"
              label={`Your offer per unit (optional, KSh)`}
              error={errors.proposedPrice}
              hint={`Seller currently lists at ${kes(listing.price)} / ${listing.unit}.`}
              input={
                <input
                  id="request-price"
                  type="number"
                  min="1"
                  value={form.proposedPrice}
                  onChange={set('proposedPrice')}
                  placeholder={`${listing.price}`}
                  className={inputCls(!!errors.proposedPrice)}
                />
              }
            />

            <Field
              id="request-note"
              label="Message to the farmer (optional)"
              error={errors.note}
              input={
                <textarea
                  id="request-note"
                  rows={3}
                  maxLength={400}
                  value={form.note}
                  onChange={set('note')}
                  placeholder="Delivery point, collection day, quality notes…"
                  className={inputCls(!!errors.note)}
                />
              }
            />

            {errors.form && (
              <p className="flex items-start gap-2 text-[13px] text-farmer-danger" role="alert">
                <AlertCircle size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
                {errors.form}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-farmer-primary text-sm font-semibold text-white transition-colors hover:bg-farmer-primary-hover disabled:opacity-60"
            >
              <MessageSquarePlus size={15} aria-hidden="true" />
              {saving ? 'Sending…' : 'Send request'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

const inputCls = (bad) =>
  `w-full rounded-lg border bg-paper px-3 py-2.5 text-[13px] text-farmer-ink placeholder:text-farmer-muted/60 focus:outline-none focus:ring-2 focus:ring-farmer-brand/40 ${
    bad ? 'border-farmer-danger' : 'border-farmer-line focus:border-farmer-brand/50'
  }`

function Field({ id, label, hint, error, input }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-farmer-ink">
        {label}
      </label>
      {hint && <p className="mb-1.5 text-xs text-farmer-muted">{hint}</p>}
      {input}
      {error && (
        <p className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-farmer-danger" role="alert">
          <AlertCircle size={12} aria-hidden="true" className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
