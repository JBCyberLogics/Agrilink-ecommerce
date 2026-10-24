/**
 * InquiryDialog — send an inquiry about a REAL listing to its farmer.
 * Accessible dialog; validation errors are mapped from the server's
 * { error, field } response. Success is shown ONLY after the backend's 201.
 */
import { useEffect, useRef, useState } from 'react'
import { X, AlertCircle, CheckCircle2, MessageSquarePlus } from 'lucide-react'
import { createInquiry } from '../../../api/endpoints'

export default function InquiryDialog({ listing, onClose, onSent }) {
  const [form, setForm] = useState({ message: '' })
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
    setErrors((er) => (er[k] ? { ...er, [k]: null } : er))
  }

  const submit = async (e) => {
    e.preventDefault()
    const text = form.message.trim()
    if (text.length === 0)
      return setErrors({ message: 'Please write a message.' })
    if (text.length > 1000)
      return setErrors({ message: 'Keep your message to 1000 characters.' })

    setSaving(true)
    setErrors({})
    try {
      const d = await createInquiry({ listingId: listing.id, message: text })
      setDone(d?.inquiry ?? { status: 'Open' })
      setForm({ message: '' })
      onSent?.()
    } catch (err) {
      setErrors({ [err?.field ?? 'form']: err?.error || 'Could not send your inquiry. Please try again.' })
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
        aria-labelledby="inquiry-dialog-title"
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-paper shadow-lift"
      >
        <div className="flex items-start justify-between gap-3 border-b border-farmer-line px-5 py-4">
          <div>
            <h2 id="inquiry-dialog-title" className="font-display text-[15px] font-bold text-farmer-ink">
              Send an inquiry
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
                <span className="font-semibold">Inquiry sent.</span> It is saved under{' '}
                <span className="font-semibold text-farmer-ink">Purchase Requests</span> and waits for the
                farmer to respond.
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
            <p className="rounded-lg bg-farmer-page px-3 py-2.5 text-[13px] text-farmer-muted">
              Message the farmer about{' '}
              <span className="font-semibold text-farmer-ink">{listing.name}</span>
            </p>

            <div>
              <label htmlFor="inquiry-message" className="mb-1.5 block text-[13px] font-medium text-farmer-ink">
                Your message
              </label>
              <textarea
                id="inquiry-message"
                ref={first}
                rows={4}
                maxLength={1000}
                value={form.message}
                onChange={set('message')}
                placeholder="e.g. Is this available for delivery to Nyeri? What is the collection day?"
                className="w-full rounded-lg border border-farmer-line bg-paper px-3 py-2.5 text-[13px] text-farmer-ink placeholder:text-farmer-muted/60 focus:outline-none focus:ring-2 focus:ring-farmer-brand/40"
              />
              {errors.message && (
                <p className="mt-1 flex items-start gap-1.5 text-xs font-medium text-farmer-danger" role="alert">
                  <AlertCircle size={12} aria-hidden="true" className="mt-0.5 shrink-0" />
                  {errors.message}
                </p>
              )}
            </div>

            {errors.form && (
              <p className="flex items-start gap-1.5 text-[13px] text-farmer-danger" role="alert">
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
              {saving ? 'Sending…' : 'Send inquiry'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
