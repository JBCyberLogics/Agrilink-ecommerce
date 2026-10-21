/**
 * AI Crop and Produce Insights — farmer page.
 *
 * An interface for exploring produce-related market opportunities.
 * No AI backend is connected yet; results are honest placeholders.
 */
import { useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, RotateCw, Search, ShoppingBag, Sprout, Truck } from 'lucide-react'
import { aiCropInsights } from '../../../services/ai'

const INITIAL_FORM = {
  produceType: '',
  growingStage: '',
  location: '',
  expectedQuantity: '',
  expectedHarvestDate: '',
}

export default function AICropInsights() {
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
    if (!form.growingStage.trim()) next.growingStage = 'Please enter a growing stage.'
    if (!form.location.trim()) next.location = 'Please enter a location.'
    if (!form.expectedQuantity.trim()) next.expectedQuantity = 'Please enter a quantity.'
    else if (
      isNaN(Number(form.expectedQuantity)) ||
      Number(form.expectedQuantity) <= 0
    )
      next.expectedQuantity = 'Please enter a valid quantity greater than zero.'
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
      const response = await aiCropInsights({
        produceType: form.produceType.trim(),
        growingStage: form.growingStage.trim(),
        location: form.location.trim(),
        expectedQuantity: Number(form.expectedQuantity),
        expectedHarvestDate: form.expectedHarvestDate,
      })
      if (response.ok) {
        setResult(response.data)
      } else {
        setError(response.error || 'Could not get crop insights.')
      }
    } catch (err) {
      setError(err?.message || 'Could not get crop insights.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!result && !error && !submitting) {
    return (
      <div className="space-y-6">
        <section className="rounded-xl border border-farmer-line bg-white p-6 sm:p-8">
          <h2 className="font-display text-[15px] font-semibold text-farmer-ink">
            <Sprout size={16} aria-hidden="true" className="mr-2 text-farmer-primary" />
            AI Crop and Produce Insights
          </h2>
          <p className="mt-1 text-xs text-farmer-muted">
            Get AI-powered insights on market opportunities for your produce.
            AI responses require backend integration — try submitting to see the
            current status.
          </p>
        </section>
        <form onSubmit={submit} noValidate className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-farmer-ink">
                Produce type
              </span>
              <input
                id="crop-produce-type"
                type="text"
                value={form.produceType}
                onChange={setField('produceType')}
                placeholder="e.g. maize, tomatoes…"
                aria-label="Produce type"
                aria-invalid={!!errors.produceType}
                className={`w-full rounded-lg border bg-white px-3 py-2.5 text-[13px] text-farmer-ink placeholder:text-farmer-muted/60 focus:border-farmer-primary/50 focus:outline-none focus:ring-2 focus:ring-farmer-primary/40 ${
                  errors.produceType
                    ? 'border-farmer-danger'
                    : 'border-farmer-line focus:border-farmer-primary/50'
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
                Growing stage
              </span>
              <input
                id="crop-growing-stage"
                type="text"
                value={form.growingStage}
                onChange={setField('growingStage')}
                placeholder="e.g. flowering, fruiting, harvest-ready"
                aria-label="Growing stage"
                aria-invalid={!!errors.growingStage}
                className={`w-full rounded-lg border bg-white px-3 py-2.5 text-[13px] text-farmer-ink placeholder:text-farmer-muted/60 focus:border-farmer-primary/50 focus:outline-none focus:ring-2 focus:ring-farmer-primary/40 ${
                  errors.growingStage
                    ? 'border-farmer-danger'
                    : 'border-farmer-line focus:border-farmer-primary/50'
                }`}
              />
              {errors.growingStage && (
                <p className="mt-1 flex items-start gap-1.5 text-xs font-medium text-farmer-danger" role="alert">
                  <AlertCircle size={12} aria-hidden="true" className="mt-0.5 shrink-0" />
                  {errors.growingStage}
                </p>
              )}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-farmer-ink">
                Location
              </span>
              <input
                id="crop-location"
                type="text"
                value={form.location}
                onChange={setField('location')}
                placeholder="e.g. Nyeri"
                aria-label="Location"
                aria-invalid={!!errors.location}
                className={`w-full rounded-lg border bg-white px-3 py-2.5 text-[13px] text-farmer-ink placeholder:text-farmer-muted/60 focus:border-farmer-primary/50 focus:outline-none focus:ring-2 focus:ring-farmer-primary/40 ${
                  errors.location
                    ? 'border-farmer-danger'
                    : 'border-farmer-line focus:border-farmer-primary/50'
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
                Expected quantity
              </span>
              <input
                id="crop-expected-quantity"
                type="number"
                min="0.01"
                step="0.01"
                value={form.expectedQuantity}
                onChange={setField('expectedQuantity')}
                placeholder="e.g. 500"
                aria-label="Expected quantity"
                aria-invalid={!!errors.expectedQuantity}
                className={`w-full rounded-lg border bg-white px-3 py-2.5 text-[13px] text-farmer-ink placeholder:text-farmer-muted/60 focus:border-farmer-primary/50 focus:outline-none focus:ring-2 focus:ring-farmer-primary/40 ${
                  errors.expectedQuantity
                    ? 'border-farmer-danger'
                    : 'border-farmer-line focus:border-farmer-primary/50'
                }`}
              />
              {errors.expectedQuantity && (
                <p className="mt-1 flex items-start gap-1.5 text-xs font-medium text-farmer-danger" role="alert">
                  <AlertCircle size={12} aria-hidden="true" className="mt-0.5 shrink-0" />
                  {errors.expectedQuantity}
                </p>
              )}
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-farmer-ink">
              Expected harvest date
            </span>
            <input
              id="crop-harvest-date"
              type="date"
              value={form.expectedHarvestDate}
              onChange={setField('expectedHarvestDate')}
              aria-label="Expected harvest date"
              className="w-full rounded-lg border bg-white px-3 py-2.5 text-[13px] text-farmer-ink placeholder:text-farmer-muted/60 focus:border-farmer-primary/50 focus:outline-none focus:ring-2 focus:ring-farmer-primary/40"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-farmer-primary text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed hover:bg-farmer-primary-hover"
          >
            <Search size={15} aria-hidden="true" />
            {submitting ? 'Analyzing…' : 'Get crop insights'}
          </button>
        </form>
      </div>
  )
}


if (error) {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-farmer-line bg-white p-6 text-center">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-farmer-danger">
          <AlertCircle size={20} aria-hidden="true" />
        </span>
        <p className="mt-3 text-sm font-semibold text-farmer-ink">
          {error || 'Could not get crop insights.'}
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
      <section className="rounded-xl border border-farmer-line bg-white p-6">
        <div className="flex items-center gap-3">
          <span
            className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-farmer-primary/30 border-t-farmer-primary"
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
    <section className="rounded-xl border border-farmer-line bg-white p-6 sm:p-8">
      <h2 className="font-display text-[15px] font-semibold text-farmer-ink">
        <CheckCircle2 size={16} aria-hidden="true" className="mr-2 text-farmer-success" />
        Opportunity summary
      </h2>
      <p className="mt-2 text-sm text-farmer-ink leading-relaxed">
        {result.summary || 'No summary available.'}
      </p>
    </section>
    {result.marketDemand && (
      <section className="rounded-xl border border-farmer-line bg-white p-6 sm:p-8">
        <h2 className="font-display text-[15px] font-semibold text-farmer-ink">
          <Truck size={16} aria-hidden="true" className="mr-2 text-farmer-primary" />
          Market demand
        </h2>
        <p className="text-sm text-farmer-ink leading-relaxed">
          {result.marketDemand}
        </p>
      </section>
    )}
    {result.buyerInterest && (
      <section className="rounded-xl border border-farmer-line bg-white p-6 sm:p-8">
        <h2 className="font-display text-[15px] font-semibold text-farmer-ink">
          <ShoppingBag size={16} aria-hidden="true" className="mr-2 text-farmer-primary" />
          Buyer interest
        </h2>
        <p className="text-sm text-farmer-ink leading-relaxed">
          {result.buyerInterest}
        </p>
      </section>
    )}
    {result.nextSteps && result.nextSteps.length > 0 && (
      <section className="rounded-xl border border-farmer-line bg-white p-6 sm:p-8">
        <h2 className="font-display text-[15px] font-semibold text-farmer-ink">
          Suggested next steps
        </h2>
        <ul className="space-y-2">
          {result.nextSteps.map((step, i) => (
            <li key={i} className="flex items-start gap-3 rounded-lg border border-farmer-line px-4 py-3">
              <span className="mt-0.5 shrink-0">•</span>
              <p className="min-w-0 text-sm text-farmer-ink">{step}</p>
            </li>
          ))}
        </ul>
      </section>
    )}
  </div>
)
}
