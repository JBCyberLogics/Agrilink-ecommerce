/**
 * AI Recommendations Center — shared page for both farmer and buyer roles.
 *
 * A central page for AI-powered recommendations relevant to the signed-in
 * user's role. No AI backend is connected yet; results are honest
 * placeholders.
 */
import { useState } from 'react'
import { AlertCircle, CheckCircle2, RefreshCw, Scale } from 'lucide-react'
import { aiRecommendations } from '../../services/ai'

const INITIAL_FORM = {
  role: '',
  produceType: '',
  location: '',
  budget: '',
}

export default function AIRecommendations({ userRole }) {
  const [form, setForm] = useState({
    role: userRole || '',
    produceType: '',
    location: '',
    budget: '',
  })
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
      const response = await aiRecommendations({
        role: form.role,
        produceType: form.produceType.trim(),
        location: form.location.trim(),
        budget: form.budget ? Number(form.budget) : undefined,
      })
      if (response.ok) {
        setResult(response.data)
      } else {
        setError(response.error || 'Could not get recommendations.')
      }
    } catch (err) {
      setError(err?.message || 'Could not get recommendations.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!result && !error && !submitting) {
    return (
      <div className="space-y-6">
        <section className="rounded-xl border border-farmer-line bg-white p-6 sm:p-8">
          <h2 className="font-display text-[15px] font-semibold text-farmer-ink">
            <Scale size={16} aria-hidden="true" className="mr-2 text-farmer-primary" />
            AI Recommendations Center
          </h2>
          <p className="mt-1 text-xs text-farmer-muted">
            Get AI-powered recommendations relevant to your role ({form.role ||
              'Buyer'}). AI responses require backend integration — try submitting
            to see the current status.
          </p>
        </section>
        <form onSubmit={submit} noValidate className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-farmer-ink">
                Produce type
              </span>
              <input
                id="rec-produce-type"
                type="text"
                value={form.produceType}
                onChange={setField('produceType')}
                placeholder="e.g. maize, spinach…"
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
                Location
              </span>
              <input
                id="rec-location"
                type="text"
                value={form.location}
                onChange={setField('location')}
                placeholder="e.g. Meru"
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
                Budget (KSh)
              </span>
              <input
                id="rec-budget"
                type="number"
                min="0"
                step="0.01"
                value={form.budget}
                onChange={setField('budget')}
                placeholder="e.g. 5000"
                aria-label="Budget"
                className="w-full rounded-lg border bg-white px-3 py-2.5 text-[13px] text-farmer-ink placeholder:text-farmer-muted/60 focus:border-farmer-primary/50 focus:outline-none focus:ring-2 focus:ring-farmer-primary/40"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-farmer-primary text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed hover:bg-farmer-primary-hover"
          >
            <RefreshCw size={15} aria-hidden="true" />
            {submitting ? 'Getting recommendations…' : 'Get recommendations'}
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
          {error || 'Could not get recommendations.'}
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
        Recommendations for {form.role}
      </h2>
      <p className="mt-2 text-sm text-farmer-muted leading-relaxed">
        {result.summary || 'No summary available.'}
      </p>
      {result.categories && result.categories.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-farmer-muted mb-2">
            Recommendation categories
          </h3>
          <ul className="space-y-2">
            {result.categories.map((cat, i) => (
              <li key={i} className="flex items-start gap-3 rounded-lg border border-farmer-line px-4 py-3">
                <span className="mt-0.5 shrink-0 font-semibold text-farmer-ink">
                  {cat.name}
                </span>
                <p className="min-w-0 text-sm text-farmer-muted">{cat.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
    {result.items && result.items.length > 0 && (
      <section className="rounded-xl border border-farmer-line bg-white p-6 sm:p-8">
        <h2 className="font-display text-[15px] font-semibold text-farmer-ink">
          Recommended items
        </h2>
        <ul className="space-y-3">
          {result.items.map((item, i) => (
            <li key={i} className="rounded-lg border border-farmer-line p-4">
              <p className="text-sm font-semibold text-farmer-ink">{item.title}</p>
              {item.description && (
                <p className="mt-0.5 text-xs text-farmer-muted">{item.description}</p>
              )}
              {item.factors && item.factors.length > 0 && (
                <p className="mt-1 text-[11px] text-farmer-muted">
                  <span className="font-medium">Factors: </span>
                  {item.factors.join(', ')}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>
    )}
  </div>
)
}
