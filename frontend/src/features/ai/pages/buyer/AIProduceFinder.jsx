/**
 * AI Produce Finder — buyer page.
 *
 * An interface that helps buyers find produce matching their purchasing needs.
 * No AI backend is connected yet; results are honest placeholders.
 */
import { useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, MapPin, RotateCw, Search, Truck } from 'lucide-react'
import { aiProduceFinder } from '../../../../services/ai'
import { kes } from '../../../../utils/format'

const INITIAL_FORM = {
  produceType: '',
  requiredQuantity: '',
  location: '',
  qualityRequirements: '',
  budgetRange: '',
  requiredAvailabilityDate: '',
}

export default function AIProduceFinder() {
  const [form, setForm] = useState({ ...INITIAL_FORM })
  const [errors, setErrors] = useState({})
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const panelRef = useRef(null)

  const setField = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const validate = () => {
    const next = {}
    if (!form.produceType.trim()) next.produceType = 'Please enter a produce type.'
    if (!form.requiredQuantity.trim()) next.requiredQuantity = 'Please enter a quantity.'
    else if (
      !new RegExp('^\\d+(\\.\\d+)?$').test(form.requiredQuantity) ||
      Number(form.requiredQuantity) <= 0
    )
      next.requiredQuantity = 'Please enter a valid quantity greater than zero.'
    return next
  }

  const submit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      panelRef.current?.querySelector('[aria-invalid="true"]')?.focus()
      return
    }
    setSubmitting(true)
    setError('')
    setResult(null)
    try {
      const response = await aiProduceFinder({
        produceType: form.produceType.trim(),
        requiredQuantity: Number(form.requiredQuantity),
        location: form.location.trim(),
        qualityRequirements: form.qualityRequirements.trim(),
        budgetRange: form.budgetRange.trim(),
        requiredAvailabilityDate: form.requiredAvailabilityDate,
      })
      if (response.ok) {
        setResult(response.data)
      } else {
        setError(response.error || 'Could not find matching produce.')
      }
    } catch (err) {
      setError(err?.message || 'Could not find matching produce.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!result && !error && !submitting) {
    return (
      <div className="space-y-6">
        <section className="rounded-xl border border-farmer-line bg-paper p-6 sm:p-8">
          <h2 className="font-display text-[15px] font-semibold text-farmer-ink">
            <Search size={16} aria-hidden="true" className="mr-2 text-farmer-brand" />
            AI Produce Finder
          </h2>
          <p className="mt-1 text-xs text-farmer-muted">
            Find produce matching your purchasing needs. AI responses require
            backend integration — try submitting to see the current status.
          </p>
        </section>
        <form onSubmit={submit} noValidate className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-farmer-ink">
                Produce type
              </span>
              <input
                id="finder-produce-type"
                type="text"
                value={form.produceType}
                onChange={setField('produceType')}
                placeholder="e.g. maize, spinach…"
                aria-label="Produce type"
                aria-invalid={!!errors.produceType}
                className={`w-full rounded-lg border bg-paper px-3 py-2.5 text-[13px] text-farmer-ink placeholder:text-farmer-muted/60 focus:border-farmer-brand/50 focus:outline-none focus:ring-2 focus:ring-farmer-brand/40 ${
                  errors.produceType
                    ? 'border-farmer-danger'
                    : 'border-farmer-line focus:border-farmer-brand/50'
                }`}
              />
              {errors.produceType && (
                <p className="mt-1 flex items-start gap-1.5 text-xs font-medium text-farmer-danger" role="alert">
                  <AlertCircle size={12} aria-hidden="true" className="mt-0.5 shrink-0" />
                  {errors.produceType}
                </p>
              )}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-farmer-ink">
                Required quantity
              </span>
              <input
                id="finder-quantity"
                type="number"
                min="0.01"
                step="0.01"
                value={form.requiredQuantity}
                onChange={setField('requiredQuantity')}
                placeholder="e.g. 200"
                aria-label="Required quantity"
                aria-invalid={!!errors.requiredQuantity}
                className={`w-full rounded-lg border bg-paper px-3 py-2.5 text-[13px] text-farmer-ink placeholder:text-farmer-muted/60 focus:border-farmer-brand/50 focus:outline-none focus:ring-2 focus:ring-farmer-brand/40 ${
                  errors.requiredQuantity
                    ? 'border-farmer-danger'
                    : 'border-farmer-line focus:border-farmer-brand/50'
                }`}
              />
              {errors.requiredQuantity && (
                <p className="mt-1 flex items-start gap-1.5 text-xs font-medium text-farmer-danger" role="alert">
                  <AlertCircle size={12} aria-hidden="true" className="mt-0.5 shrink-0" />
                  {errors.requiredQuantity}
                </p>
              )}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-farmer-ink">
                Location / delivery area
              </span>
              <input
                id="finder-location"
                type="text"
                value={form.location}
                onChange={setField('location')}
                placeholder="e.g. Thika"
                aria-label="Location"
                className="w-full rounded-lg border bg-paper px-3 py-2.5 text-[13px] text-farmer-ink placeholder:text-farmer-muted/60 focus:border-farmer-brand/50 focus:outline-none focus:ring-2 focus:ring-farmer-brand/40"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-farmer-ink">
                Quality requirements
              </span>
              <input
                id="finder-quality"
                type="text"
                value={form.qualityRequirements}
                onChange={setField('qualityRequirements')}
                placeholder="e.g. Grade A, organic"
                aria-label="Quality requirements"
                className="w-full rounded-lg border bg-paper px-3 py-2.5 text-[13px] text-farmer-ink placeholder:text-farmer-muted/60 focus:border-farmer-brand/50 focus:outline-none focus:ring-2 focus:ring-farmer-brand/40"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-farmer-ink">
              Budget range (KSh)
            </span>
            <input
              id="finder-budget"
              type="text"
              value={form.budgetRange}
              onChange={setField('budgetRange')}
              placeholder="e.g. 5000-10000"
              aria-label="Budget range"
              className="w-full rounded-lg border bg-paper px-3 py-2.5 text-[13px] text-farmer-ink placeholder:text-farmer-muted/60 focus:border-farmer-brand/50 focus:outline-none focus:ring-2 focus:ring-farmer-brand/40"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-farmer-ink">
              Required availability date
            </span>
            <input
              id="finder-availability-date"
              type="date"
              value={form.requiredAvailabilityDate}
              onChange={setField('requiredAvailabilityDate')}
              aria-label="Required availability date"
              className="w-full rounded-lg border bg-paper px-3 py-2.5 text-[13px] text-farmer-ink placeholder:text-farmer-muted/60 focus:border-farmer-brand/50 focus:outline-none focus:ring-2 focus:ring-farmer-brand/40"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-farmer-primary text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed hover:bg-farmer-primary-hover"
          >
            <Search size={15} aria-hidden="true" />
            {submitting ? 'Finding produce…' : 'Find matching produce'}
          </button>
        </form>
      </div>
  )
}


if (error) {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-farmer-line bg-paper p-6 text-center">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-danger-wash text-farmer-danger">
          <AlertCircle size={20} aria-hidden="true" />
        </span>
        <p className="mt-3 text-sm font-semibold text-farmer-ink">
          {error || 'Could not find matching produce.'}
        </p>
        <button
          type="button"
          onClick={() => setError('')}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-farmer-primary px-4 text-[13px] font-semibold text-white hover:bg-farmer-primary-hover"
        >
          <RotateCw size={14} aria-hidden="true" /> Try again
        </button>
      </section>
    </div>
  )
}

if (submitting) {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-farmer-line bg-paper p-6">
        <div className="flex items-center gap-3">
          <span
            className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-farmer-brand/30 border-t-farmer-primary"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-semibold text-farmer-ink">Analyzing your request…</p>
            <p className="mt-0.5 text-xs text-farmer-muted">
              This uses the AI service — responses depend on backend integration.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

return (
  <div className="space-y-6">
    <section className="rounded-xl border border-farmer-line bg-paper p-6 sm:p-8">
      <h2 className="font-display text-[15px] font-semibold text-farmer-ink">
        <CheckCircle2 size={16} aria-hidden="true" className="mr-2 text-farmer-success" />
        Matching produce
      </h2>
      <p className="mt-2 text-sm text-farmer-ink">
        {result.matches && result.matches.length > 0
          ? result.matches.length + ' matching listing(s) found'
          : 'No matching listings found.'}
      </p>
    </section>
    {result.matches && result.matches.length > 0 && (
      <section className="rounded-xl border border-farmer-line bg-paper p-6 sm:p-8">
        <ul className="divide-y divide-farmer-line">
          {result.matches.map((match, i) => (
            <li key={i} className="py-4 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-farmer-ink">
                    {match.produceName || form.produceType}
                  </p>
                  <p className="mt-0.5 text-xs text-farmer-muted">
                    {match.farmerName || 'Farmer'}
                    {match.location ? ' · ' + match.location : ''}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-start gap-2">
                  <p className="text-sm font-semibold text-farmer-ink tabular-nums">
                    {match.price ? kes(match.price) : 'Price on request'}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-xs text-farmer-muted">
                {match.quantity ? match.quantity + ' ' + form.unit : 'Quantity not specified'}
                {match.quality ? ' · ' + match.quality : ''}
                {match.availability ? ' · ' + match.availability : ''}
              </p>
              <p className="mt-2 text-xs text-farmer-muted">
                {match.explanation || 'Match based on your produce type, quantity, and location.'}
              </p>
            </li>
          ))}
        </ul>
      </section>
    )}
    <p className="rounded-xl border border-farmer-line bg-paper px-4 py-3 text-xs leading-relaxed text-farmer-muted">
      Match factors include produce type, quantity, quality, location, and
      availability. Units are never converted — matches are shown for the same
      unit you specified.
    </p>
  </div>
)
}
