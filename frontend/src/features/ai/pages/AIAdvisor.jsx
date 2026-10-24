/**
 * AI Market Advisor — shared page for both farmer and buyer roles.
 *
 * Provides market insights, price trends, and selling or buying guidance.
 * No AI backend is connected yet; results are honest placeholders.
 */
import { useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, LineChart, RotateCw, Search } from 'lucide-react'
import { aiMarketAdvisor } from '../../../services/ai'

const INITIAL_FORM = {
  produce: '',
  location: '',
  quantity: '',
  timePeriod: 'month',
}

export default function AIAdvisor() {
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
    if (!form.location.trim()) next.location = 'Please enter a location.'
    if (!form.quantity.trim()) next.quantity = 'Please enter a quantity.'
    else if (
      isNaN(Number(form.quantity)) ||
      Number(form.quantity) <= 0
    )
      next.quantity = 'Please enter a valid quantity greater than zero.'
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
      const response = await aiMarketAdvisor({
        produce: form.produce.trim(),
        location: form.location.trim(),
        quantity: Number(form.quantity),
        timePeriod: form.timePeriod,
      })
      if (response.ok) {
        setResult(response.data)
      } else {
        setError(response.error || 'Could not get market advice.')
      }
    } catch (err) {
      setError(err?.message || 'Could not get market advice.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!result && !error && !submitting) {
    return (
      <div className="space-y-6">
        <section className="rounded-xl border border-farmer-line bg-paper p-6 sm:p-8">
          <h2 className="font-display text-[15px] font-semibold text-farmer-ink">
            <LineChart size={16} aria-hidden="true" className="mr-2 text-farmer-brand" />
            AI Market Advisor
          </h2>
          <p className="mt-1 text-xs text-farmer-muted">
            Get AI-powered insights on price trends, demand, and timing for your
            produce. AI responses require backend integration — try submitting to
            see the current status.
          </p>
        </section>
        <form onSubmit={submit} noValidate className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-farmer-ink">
                Produce type
              </span>
              <input
                id="advisor-produce"
                type="text"
                value={form.produce}
                onChange={setField('produce')}
                placeholder="e.g. maize, tomatoes…"
                aria-label="Produce type"
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
                Location
              </span>
              <input
                id="advisor-location"
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
                Quantity
              </span>
              <input
                id="advisor-quantity"
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
                Time period
              </span>
              <select
                id="advisor-time-period"
                value={form.timePeriod}
                onChange={setField('timePeriod')}
                aria-label="Time period"
                className="w-full rounded-lg border bg-paper px-3 py-2.5 text-[13px] text-farmer-ink placeholder:text-farmer-muted/60 focus:border-farmer-brand/50 focus:outline-none focus:ring-2 focus:ring-farmer-brand/40"
              >
                <option value="week">1 week</option>
                <option value="month">1 month</option>
                <option value="quarter">3 months</option>
              </select>
            </label>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-farmer-primary text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed hover:bg-farmer-primary-hover"
          >
            <Search size={15} aria-hidden="true" />
            {submitting ? 'Analyzing…' : 'Get market advice'}
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
          {error || 'Could not get market advice.'}
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
        Market insights
      </h2>
      <div className="mt-4 space-y-3">
        <p className="text-sm text-farmer-ink leading-relaxed">
          {result.summary || 'No summary available.'}
        </p>
        {result.factors && result.factors.length > 0 && (
          <div className="mt-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-farmer-muted mb-2">
              Factors affecting prices
            </h3>
            <ul className="space-y-1">
              {result.factors.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-farmer-muted">
                  <span className="mt-0.5 shrink-0">•</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
    {result.recommendedActions && result.recommendedActions.length > 0 && (
      <section className="rounded-xl border border-farmer-line bg-paper p-6 sm:p-8">
        <h2 className="font-display text-[15px] font-semibold text-farmer-ink">
          <Search size={16} aria-hidden="true" className="mr-2 text-farmer-brand" />
          Recommended next actions
        </h2>
        <ul className="space-y-2">
          {result.recommendedActions.map((action, i) => (
            <li key={i} className="flex items-start gap-3 rounded-lg border border-farmer-line px-4 py-3">
              <span className="mt-0.5 shrink-0">•</span>
              <p className="min-w-0 text-sm text-farmer-ink">{action}</p>
            </li>
          ))}
        </ul>
      </section>
    )}
  </div>
)
}
