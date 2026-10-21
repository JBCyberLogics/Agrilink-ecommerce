/**
 * AI Price Recommendation — farmer page.
 *
 * An interface to request a suggested selling-price range.
 * No AI backend is connected yet; results are honest placeholders.
 */
import { useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, DollarSign, RotateCw, Search } from 'lucide-react'
import { aiPriceRecommendation } from '../../../services/ai'
import { kes } from '../../../utils/format'

const INITIAL_FORM = {
  produce: '',
  quantity: '',
  qualityGrade: '',
  location: '',
  unit: 'kg',
}

const QUALITY_GRADES = ['Grade 1 (Premium)', 'Grade 2 (Standard)', 'Grade 3 (Economy)']
const UNITS = ['kg', 'litre', 'bunch', 'tray', 'crate', 'bird', 'head', 'cob', 'jar', 'loaf']

export default function AIPriceRecommendation() {
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
    if (!form.produce.trim()) next.produce = 'Please enter a produce type.'
    if (!form.quantity.trim()) next.quantity = 'Please enter a quantity.'
    else if (
      isNaN(Number(form.quantity)) ||
      Number(form.quantity) <= 0
    )
      next.quantity = 'Please enter a valid quantity greater than zero.'
    if (!form.qualityGrade.trim()) next.qualityGrade = 'Please select a quality grade.'
    if (!form.location.trim()) next.location = 'Please enter a location.'
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
      const response = await aiPriceRecommendation({
        produce: form.produce.trim(),
        quantity: Number(form.quantity),
        qualityGrade: form.qualityGrade,
        location: form.location.trim(),
        unit: form.unit,
      })
      if (response.ok) {
        setResult(response.data)
      } else {
        setError(response.error || 'Could not get price recommendation.')
      }
    } catch (err) {
      setError(err?.message || 'Could not get price recommendation.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!result && !error && !submitting) {
    return (
      <div className="space-y-6">
        <section className="rounded-xl border border-farmer-line bg-paper p-6 sm:p-8">
          <h2 className="font-display text-[15px] font-semibold text-farmer-ink">
            <DollarSign size={16} aria-hidden="true" className="mr-2 text-farmer-brand" />
            AI Price Recommendation
          </h2>
          <p className="mt-1 text-xs text-farmer-muted">
            Get a suggested selling-price range for your produce. AI responses
            require backend integration — try submitting to see the current
            status.
          </p>
        </section>
        <form onSubmit={submit} noValidate className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-farmer-ink">
                Produce
              </span>
              <input
                id="price-produce"
                type="text"
                value={form.produce}
                onChange={setField('produce')}
                placeholder="e.g. maize, tomatoes…"
                aria-label="Produce"
                aria-invalid={!!errors.produce}
                className={`w-full rounded-lg border bg-paper px-3 py-2.5 text-[13px] text-farmer-ink placeholder:text-farmer-muted/60 focus:border-farmer-brand/50 focus:outline-none focus:ring-2 focus:ring-farmer-brand/40 ${
                  errors.produce
                    ? 'border-farmer-danger'
                    : 'border-farmer-line focus:border-farmer-brand/50'
                }`}
              />
              {errors.produce && (
                <p className="mt-1 flex items-start gap-1.5 text-xs font-medium text-farmer-danger" role="alert">
                  <AlertCircle size={12} aria-hidden="true" className="mt-0.5 shrink-0" />
                  {errors.produce}
                </p>
              )}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-farmer-ink">
                Quantity
              </span>
              <input
                id="price-quantity"
                type="number"
                min="0.01"
                step="0.01"
                value={form.quantity}
                onChange={setField('quantity')}
                placeholder="e.g. 100"
                aria-label="Quantity"
                aria-invalid={!!errors.quantity}
                className={`w-full rounded-lg border bg-paper px-3 py-2.5 text-[13px] text-farmer-ink placeholder:text-farmer-muted/60 focus:border-farmer-brand/50 focus:outline-none focus:ring-2 focus:ring-farmer-brand/40 ${
                  errors.quantity
                    ? 'border-farmer-danger'
                    : 'border-farmer-line focus:border-farmer-brand/50'
                }`}
              />
              {errors.quantity && (
                <p className="mt-1 flex items-start gap-1.5 text-xs font-medium text-farmer-danger" role="alert">
                  <AlertCircle size={12} aria-hidden="true" className="mt-0.5 shrink-0" />
                  {errors.quantity}
                </p>
              )}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-farmer-ink">
                Quality grade
              </span>
              <select
                id="price-quality-grade"
                value={form.qualityGrade}
                onChange={setField('qualityGrade')}
                aria-label="Quality grade"
                className="w-full rounded-lg border bg-paper px-3 py-2.5 text-[13px] text-farmer-ink placeholder:text-farmer-muted/60 focus:border-farmer-brand/50 focus:outline-none focus:ring-2 focus:ring-farmer-brand/40"
              >
                <option value="">Select quality grade</option>
                {QUALITY_GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {errors.qualityGrade && (
                <p className="mt-1 flex items-start gap-1.5 text-xs font-medium text-farmer-danger" role="alert">
                  <AlertCircle size={12} aria-hidden="true" className="mt-0.5 shrink-0" />
                  {errors.qualityGrade}
                </p>
              )}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-farmer-ink">
                Location
              </span>
              <input
                id="price-location"
                type="text"
                value={form.location}
                onChange={setField('location')}
                placeholder="e.g. Nyeri"
                aria-label="Location"
                aria-invalid={!!errors.location}
                className={`w-full rounded-lg border bg-paper px-3 py-2.5 text-[13px] text-farmer-ink placeholder:text-farmer-muted/60 focus:border-farmer-brand/50 focus:outline-none focus:ring-2 focus:ring-farmer-brand/40 ${
                  errors.location
                    ? 'border-farmer-danger'
                    : 'border-farmer-line focus:border-farmer-brand/50'
                }`}
              />
              {errors.location && (
                <p className="mt-1 flex items-start gap-1.5 text-xs font-medium text-farmer-danger" role="alert">
                  <AlertCircle size={12} aria-hidden="true" className="mt-0.5 shrink-0" />
                  {errors.location}
                </p>
              )}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-farmer-ink">
                Unit of measurement
              </span>
              <select
                id="price-unit"
                value={form.unit}
                onChange={setField('unit')}
                aria-label="Unit"
                className="w-full rounded-lg border bg-paper px-3 py-2.5 text-[13px] text-farmer-ink placeholder:text-farmer-muted/60 focus:border-farmer-brand/50 focus:outline-none focus:ring-2 focus:ring-farmer-brand/40"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-farmer-primary text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed hover:bg-farmer-primary-hover"
          >
            <Search size={15} aria-hidden="true" />
            {submitting ? 'Calculating…' : 'Get price recommendation'}
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
          {error || 'Could not get price recommendation.'}
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
        Suggested price range
      </h2>
      <div className="mt-3 flex items-center gap-4">
        <span className="text-2xl font-bold text-farmer-ink">
          {kes(result.suggestedMinPrice)} - {kes(result.suggestedMaxPrice)}
        </span>
        <span className="text-xs text-farmer-muted">{form.unit}</span>
      </div>
      <p className="mt-2 text-xs text-farmer-muted">
        Suggested selling price range per {form.unit}. This is an AI-generated
        estimate based on your inputs — not a real market price.
      </p>
    </section>
    {result.factors && result.factors.length > 0 && (
      <section className="rounded-xl border border-farmer-line bg-paper p-6 sm:p-8">
        <h2 className="font-display text-[15px] font-semibold text-farmer-ink">
          Factors influencing the suggestion
        </h2>
        <ul className="space-y-2">
          {result.factors.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] text-farmer-muted">
              <span className="mt-0.5 shrink-0">•</span>
              {f}
            </li>
          ))}
        </ul>
      </section>
    )}
    {result.confidence && (
      <section className="rounded-xl border border-farmer-line bg-paper p-6 sm:p-8">
        <h2 className="font-display text-[15px] font-semibold text-farmer-ink">
          Confidence indicator
        </h2>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-sm font-semibold text-farmer-ink">
            {result.confidence}%
          </span>
          <p className="text-xs text-farmer-muted">
            Confidence in this suggestion depends on data availability for your
            produce, location, and market conditions.
          </p>
        </div>
      </section>
    )}
    {result.transferable !== false && (
      <section className="rounded-xl border border-farmer-line bg-paper p-6 sm:p-8">
        <button
          type="button"
          onClick={() => {
            // Integration point: transfer suggested price to listing form
            setError('Price transfer to listing form requires backend integration.')
          }}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-farmer-line bg-paper px-4 text-[13px] font-semibold text-farmer-ink transition-colors hover:border-farmer-brand/40 hover:text-farmer-brand"
        >
          <Search size={14} aria-hidden="true" />
          Apply suggested price to listing form
        </button>
      </section>
    )}
  </div>
)
}
