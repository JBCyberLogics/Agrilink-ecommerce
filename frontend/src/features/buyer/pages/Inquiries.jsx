/**
 * Buyer inquiries — the buyer's own inquiry records from /api/inquiries.
 * Each row is a real server-backed record: message, status and any farmer
 * reply. Nothing is simulated.
 */
import { useEffect, useState } from 'react'
import { MessageSquare, AlertCircle, RotateCw } from 'lucide-react'
import EmptyState from '../parts/EmptyState'
import { buyerInquiries } from '../../../api/endpoints'
import { kes } from '../../../utils/format'
import { fmtDate } from '../../../utils/format'

export default function Inquiries() {
  const [status, setStatus] = useState('loading') // loading | ok | error
  const [inquiries, setInquiries] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    buyerInquiries()
      .then((d) => alive && setInquiries(d.inquiries ?? []))
      .then(() => alive && setStatus('ok'))
      .catch(() => alive && setStatus('error'))
    return () => {
      alive = false
    }
  }, [])

  const refresh = () => {
    setStatus('loading')
    buyerInquiries()
      .then((d) => setInquiries(d.inquiries ?? []))
      .then(() => setStatus('ok'))
      .catch(() => setStatus('error'))
  }

  if (status === 'loading')
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading inquiries">
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
        <p className="mt-3 text-sm font-semibold text-farmer-ink">{error || 'Could not load your inquiries.'}</p>
        <button
          type="button"
          onClick={refresh}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-farmer-primary px-4 text-[13px] font-semibold text-white hover:bg-farmer-primary-hover"
        >
          <RotateCw size={14} aria-hidden="true" /> Try again
        </button>
      </div>
    )

  if (inquiries.length === 0)
    return (
      <div className="space-y-4">
        <section className="rounded-xl border border-farmer-line bg-white p-6 sm:p-8">
          <EmptyState icon={MessageSquare} title="No inquiries yet.">
            Send an inquiry from Browse Produce and it will appear here with its status and any reply from the
            farmer.
          </EmptyState>
        </section>
      </div>
    )

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-farmer-line bg-white p-6 sm:p-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-[15px] font-semibold text-farmer-ink">
            <MessageSquare size={16} aria-hidden="true" className="mr-2 text-farmer-primary" />
            Your inquiries
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
          {inquiries.map((i) => (
            <li key={i.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-farmer-ink">
                    About <span className="font-medium">{i.listingName}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-farmer-muted">{i.message}</p>
                  {i.reply && (
                    <p className="mt-1.5 text-xs text-farmer-muted">
                      <span className="font-medium text-farmer-ink">Farmer&rsquo;s reply:</span> {i.reply}
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-start gap-2">
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold">
                    {i.status === 'Open' ? 'Open' : i.status === 'Replied' ? 'Replied' : 'Closed'}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-xs text-farmer-muted">Sent {fmtDate(i.createdAt)}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
