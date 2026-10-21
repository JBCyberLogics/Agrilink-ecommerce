/**
 * AI Purchase Planning — buyer page.
 *
 * An interface for helping buyers organize produce purchasing requirements.
 * No AI backend is connected yet; results are honest placeholders.
 */
import { useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, RotateCw, Search, Truck } from 'lucide-react'
import { aiPurchasePlanning } from '../../../services/ai'
import { kes } from '../../../utils/format'

const INITIAL_FORM = {
  produceRequirements: '',
  requiredQuantities: '',
  budget: '',
  purchaseDeadline: '',
  deliveryArea: '',
}

export default function AIPurchasePlanning() {
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
    if (!form.produceRequirements.trim()) next.produceRequirements = 'Please enter produce requirements.'
    if (!form.requiredQuantities.trim()) next.requiredQuantities = 'Please enter required quantities.'
    else if (
      isNaN(Number(form.requiredQuantities)) ||
      Number(form.requiredQuantities) <= 0
    )
      next.requiredQuantities = 'Please enter a valid quantity greater than zero.'
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
      const response = await aiPurchasePlanning({
        produceRequirements: form.produceRequirements.trim(),
        requiredQuantities: Number(form.requiredQuantities),
        budget: form.budget ? Number(form.budget) : undefined,
        purchaseDeadline: form.purchaseDeadline,
        deliveryArea: form.deliveryArea.trim(),
      })
      if (response.ok) {
        setResult(response.data)
      } else {
        setError(response.error || 'Could not create purchase plan.')
      }
    } catch (err) {
      setError(err?.message || 'Could not create purchase plan.')
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
            AI Purchase Planning
          </h2>
          <p className="mt-1 text-xs text-farmer-muted">
            Organize your produce purchasing requirements. AI responses require
            backend integration — try submitting to see the current status.
          </p>
        </section>
        <form onSubmit={submit} noValidate className="space-y-5">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-farmer-ink">
              Produce requirements
            </span>
            <textarea
              id="planning-produce-requirements"
              rows={4}
              value={form.produceRequirements}
              onChange={setField('produceRequirements')}
              placeholder="e.g. 500 kg of Grade A maize, 200 liters of fresh milk"
              aria-label="Produce requirements"
              aria-invalid={!!errors.produceRequirements}
              className={`w-full rounded-lg border bg-white px-3 py-2.5 text-[13px] text-farmer-ink placeholder:text-farmer-muted/60 focus:border-farmer-primary/50 focus:outline-none focus:ring-2 focus:ring-farmer-primary/40 ${
                errors.produceRequirements
                  ? 'border-farmer-danger'
                  : 'border-farmer-line focus:border-farmer-primary/50'
              }`}
            />
            {errors.produceRequirements && (
              <p className="mt-1 flex items-start gap-1.5 text-xs font-medium text-farmer-danger" role="alert">
                <AlertCircle size={12} aria-hidden="true" className="mt-0.5 shrink-0" />
                {errors.produceRequirements}
              </p>
            )}
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-farmer-ink">
              Required quantities
            </span>
            <input
              id="planning-quantities"
              type="number"
              min="0.01"
              step="0.01"
              value={form.requiredQuantities}
              onChange={setField('requiredQuantities')}
              placeholder="e.g. 1000"
              aria-label="Required quantities"
              aria-invalid={!!errors.requiredQuantities}
              className={`w-full rounded-lg border bg-white px-3 py-2.5 text-[13px] text-farmer-ink placeholder:text-farmer-muted/60 focus:border-farmer-primary/50 focus:outline-none focus:ring-2 focus:ring-farmer-primary/40 ${
                errors.requiredQuantities
                  ? 'border-farmer-danger'
                  : 'border-farmer-line focus:border-farmer-primary/50'
                }`}
              />
              {errors.requiredQuantities && (
                <p className="mt-1 flex items-start gap-1.5 text-xs font-medium text-farmer-danger" role="alert">
                  <AlertCircle size={12} aria-hidden="true" className="mt-0.5 shrink-0" />
                  {errors.requiredQuantities}
                </p>
              )}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-farmer-ink">
                Budget (KSh)
              </span>
              <input
                id="planning-budget"
                type="number"
                min="0"
                step="0.01"
                value={form.budget}
                onChange={setField('budget')}
                placeholder="e.g. 50000"
                aria-label="Budget"
                className="w-full rounded-lg border bg-white px-3 py-2.5 text-[13px] text-farmer-ink placeholder:text-farmer-muted/60 focus:border-farmer-primary/50 focus:outline-none focus:ring-2 focus:ring-farmer-primary/40"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-farmer-ink">
                Purchase deadline
              </span>
              <input
                id="planning-deadline"
                type="date"
                value={form.purchaseDeadline}
                onChange={setField('purchaseDeadline')}
                aria-label="Purchase deadline"
                className="w-full rounded-lg border bg-white px-3 py-2.5 text-[13px] text-farmer-ink placeholder:text-farmer-muted/60 focus:border-farmer-primary/50 focus:outline-none focus:ring-2 focus:ring-farmer-primary/40"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-farmer-ink">
                Delivery area
              </span>
              <input
                id="planning-delivery-area"
                type="text"
                value={form.deliveryArea}
                onChange={setField('deliveryArea')}
                placeholder="e.g. Thika, Kiambu County"
                aria-label="Delivery area"
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
            {submitting ? 'Planning…' : 'Create purchase plan'}
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
          {error || 'Could not create purchase plan.'}
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
        Purchase plan summary
      </h2>
      <p className="mt-2 text-sm text-farmer-ink leading-relaxed">
        {result.summary || 'No summary available.'}
      </p>
    </section>
    {result.checklist && result.checklist.length > 0 && (
      <section className="rounded-xl border border-farmer-line bg-white p-6 sm:p-8">
        <h2 className="font-display text-[15px] font-semibold text-farmer-ink">
          Requirement checklist
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
    {result.shortlist && result.shortlist.length > 0 && (
      <section className="rounded-xl border border-farmer-line bg-white p-6 sm:p-8">
        <h2 className="font-display text-[15px] font-semibold text-farmer-ink">
          <Truck size={16} aria-hidden="true" className="mr-2 text-farmer-primary" />
          Shortlist
        </h2>
        <ul className="space-y-3">
          {result.shortlist.map((item, i) => (
            <li key={i} className="flex items-start gap-3 rounded-lg border border-farmer-line px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-farmer-ink">
                  {item.item || 'Produce item'}
                </p>
                <p className="mt-0.5 text-xs text-farmer-muted">
                  {item.quantity ? item.quantity + ' ' + form.unit : 'Quantity not specified'}
                  {item.quality ? ' · ' + item.quality : ''}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-end sm:items-start gap-2">
                <p className="text-sm font-semibold text-farmer-ink tabular-nums">
                  {item.price ? kes(item.price) : 'Price not specified'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    )}
    {result.costBreakdown && (
      <section className="rounded-xl border border-farmer-line bg-white p-6 sm:p-8">
        <h2 className="font-display text-[15px] font-semibold text-farmer-ink">
          Potential cost breakdown
        </h2>
        <p className="text-sm text-farmer-ink leading-relaxed">
          {result.costBreakdown}
        </p>
      </section>
    )}
    <p className="rounded-xl border border-farmer-line bg-white px-4 py-3 text-xs leading-relaxed text-farmer-muted">
      Planning insights require backend integration. This planner helps you
      organize purchase requirements based on your inputs — AI suggestions will
      appear once a service is connected.
    </p>
  </div>
)
}
