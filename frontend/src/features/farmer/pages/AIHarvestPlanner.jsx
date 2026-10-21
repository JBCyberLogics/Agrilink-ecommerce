/**
 * AI Harvest and Selling Planner — farmer page.
 *
 * An interface for planning produce availability and potential selling windows.
 * No AI backend is connected yet; results are honest placeholders.
 */
import { useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, RotateCw, Search, Truck } from 'lucide-react'
import { aiHarvestPlanner } from '../../../services/ai'

const INITIAL_FORM = {
  produceType: '',
  expectedHarvestDate: '',
  expectedQuantity: '',
  location: '',
}

export default function AIHarvestPlanner() {
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
    if (!form.expectedHarvestDate) next.expectedHarvestDate = 'Please select a harvest date.'
    if (!form.expectedQuantity.trim()) next.expectedQuantity = 'Please enter a quantity.'
    else if (
      isNaN(Number(form.expectedQuantity)) ||
      Number(form.expectedQuantity) <= 0
    )
      next.expectedQuantity = 'Please enter a valid quantity greater than zero.'
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
      const response = await aiHarvestPlanner({
        produceType: form.produceType.trim(),
        expectedHarvestDate: form.expectedHarvestDate,
        expectedQuantity: Number(form.expectedQuantity),
        location: form.location.trim(),
      })
      if (response.ok) {
        setResult(response.data)
      } else {
        setError(response.error || 'Could not get planning insights.')
      }
    } catch (err) {
      setError(err?.message || 'Could not get planning insights.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!result && !error && !submitting) {
    return (
      <div className="space-y-6">
        <section className="rounded-xl border border-farmer-line bg-white p-6 sm:p-8">
          <h2 className="font-display text-[15px] font-semibold text-farmer-ink">
            <Truck size={16} aria-hidden="true" className="mr-2 text-farmer-primary" />
            AI Harvest and Selling Planner
          </h2>
          <p className="mt-1 text-xs text-farmer-muted">
            Plan your produce availability and potential selling windows. AI
            responses require backend integration — try submitting to see the
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
                id="planner-produce-type"
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
                Expected harvest date
              </span>
              <input
                id="planner-harvest-date"
                type="date"
                value={form.expectedHarvestDate}
                onChange={setField('expectedHarvestDate')}
                aria-label="Expected harvest date"
                className="w-full rounded-lg border bg-white px-3 py-2.5 text-[13px] text-farmer-ink placeholder:text-farmer-muted/60 focus:border-farmer-primary/50 focus:outline-none focus:ring-2 focus:ring-farmer-primary/40"
              />
              {errors.expectedHarvestDate && (
                <p className="mt-1 flex items-start gap-1.5 text-xs font-medium text-farmer-danger" role="alert">
                  <AlertCircle size={12} aria-hidden="true" className="mt-0.5 shrink-0" />
                  {errors.expectedHarvestDate}
                </p>
              )}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-farmer-ink">
                Expected quantity
              </span>
              <input
                id="planner-quantity"
                type="number"
                min="0.01"
                step="0.01"
                value={form.expectedQuantity}
                onChange={setField('expectedQuantity')}
                placeholder="e.g. 1000"
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
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-farmer-ink">
                Location
              </span>
              <input
                id="planner-location"
                type="text"
                value={form.location}
                onChange={setField('location')}
                placeholder="e.g. Nakuru"
                aria-label="Location"
                className="w-full rounded-lg border bg-white px-3 py-2.5 text-[13px] text-farmer-ink placeholder:text-farmer-muted/60 focus:border-farmer-primary/50 focus:outline-none focus:ring-2 focus:ring-farmer-primary/40"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-farmer-primary text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed hover:bg-farmer-primary-hover"
          >
            <Search size={15} aria-hidden="true" />
            {submitting ? 'Planning…' : 'Plan harvest & selling'}
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
          {error || 'Could not get planning insights.'}
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
        Planning timeline
      </h2>
      <p className="mt-2 text-sm text-farmer-ink leading-relaxed">
        {result.timeline || 'No timeline available.'}
      </p>
    </section>
    {result.checklist && result.checklist.length > 0 && (
      <section className="rounded-xl border border-farmer-line bg-white p-6 sm:p-8">
        <h2 className="font-display text-[15px] font-semibold text-farmer-ink">
          Preparation checklist
        </h2>
        <ul className="space-y-2">
          {result.checklist.map((item, i) => (
            <li key={i} className="flex items-start gap-3 rounded-lg border border-farmer-line px-4 py-3">
              <span className="mt-0.5 shrink-0">☐</span>
              <p className="min-w-0 text-sm text-farmer-ink">{item}</p>
            </li>
          ))}
        </ul>
      </section>
    )}
    {result.sellingWindow && (
      <section className="rounded-xl border border-farmer-line bg-white p-6 sm:p-8">
        <h2 className="font-display text-[15px] font-semibold text-farmer-ink">
          <Truck size={16} aria-hidden="true" className="mr-2 text-farmer-primary" />
          Selling window
        </h2>
        <p className="text-sm text-farmer-ink leading-relaxed">
          {result.sellingWindow}
        </p>
      </section>
    )}
    <p className="rounded-xl border border-farmer-line bg-white px-4 py-3 text-xs leading-relaxed text-farmer-muted">
      Planning insights require backend integration. This planner helps you
      organize harvest timing based on your inputs — AI suggestions will appear
      once a service is connected.
    </p>
  </div>
)
}
