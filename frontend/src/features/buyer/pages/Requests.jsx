/**
 * Purchase Requests (spec phase 7) — the buyer's real request records from
 * /api/buyer/requests: listing facts, quantity, optional offer, note,
 * backend status and submit date. Pending requests can be withdrawn
 * (two-step confirm); accepted/declined ones are read-only history until
 * the farmer-management stage ships. Success states come only from the
 * backend — nothing is invented here.
 */
import { useEffect, useState } from 'react'
import { MessageSquare, CheckCircle2, AlertCircle, RotateCw, PackageSearch } from 'lucide-react'
import ConfirmDelete from '../parts/ConfirmDelete'
import StatusChip from '../parts/StatusChip'
import EmptyState from '../parts/EmptyState'
import { useBuyerRequests } from '../parts/useBuyerData'
import { buyerCancelRequest } from '../../../api/endpoints'
import { kes, fmtDate } from '../../../utils/format'

export default function Requests() {
  const { status, requests, error, refresh } = useBuyerRequests()
  const [cancelErr, setCancelErr] = useState('')

  /* real backend error feedback, auto-cleared */
  useEffect(() => {
    if (!cancelErr) return
    const t = setTimeout(() => setCancelErr(''), 4000)
    return () => clearTimeout(t)
  }, [cancelErr])

  if (status === 'loading')
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading requests">
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
        <p className="mt-3 text-sm font-semibold text-farmer-ink">{error || 'Could not load your purchase requests.'}</p>
        <button
          type="button"
          onClick={refresh}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-farmer-primary px-4 text-[13px] font-semibold text-white hover:bg-farmer-primary-hover"
        >
          <RotateCw size={14} aria-hidden="true" /> Try again
        </button>
      </div>
    )

  if (requests.length === 0)
    return (
      <EmptyState icon={MessageSquare} title="You have not submitted any purchase requests yet.">
        Browse produce, open Request on a listing and your offer goes straight to the farmer — it shows here with its
        real status once the backend confirms it.
      </EmptyState>
    )

  const withdraw = async (r) => {
    try {
      await buyerCancelRequest(r.id)
      refresh()
    } catch (e) {
      setCancelErr(e?.error || 'Could not withdraw this request — please try again.')
    }
  }

  return (
    <div className="space-y-3">
      {cancelErr && (
        <p className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-farmer-danger" role="alert">
          <AlertCircle size={14} aria-hidden="true" /> {cancelErr}
        </p>
      )}

      {requests.map((r) => (
        <article key={r.id} className="flex flex-wrap items-start gap-4 rounded-xl border border-farmer-line bg-white p-4 sm:p-5">
          {/* listing thumbnail or honest placeholder */}
          <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-farmer-surface/70 text-farmer-primary/50">
            {r.listing?.imageUrl ? (
              <img src={r.listing.imageUrl} alt={r.listing.name} className="h-full w-full object-cover" />
            ) : (
              <PackageSearch size={24} aria-hidden="true" />
            )}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2 className="font-display text-[15px] font-bold text-farmer-ink">
                {r.listing ? r.listing.name : 'Listing no longer available'}
              </h2>
              <StatusChip status={r.status} />
            </div>
            <p className="mt-1 text-xs text-farmer-muted">
              {r.listing?.farmer ? `Farmer: ${r.listing.farmer}` : 'The listing was removed from the marketplace.'}
              {r.listing?.price ? ` · listed at ${kes(r.listing.price)} / ${r.listing.unit}` : ''}
              {r.listing?.location ? ` · ${r.listing.location}` : ''}
            </p>
            <p className="mt-2 text-[13px] text-farmer-ink">
              <span className="font-semibold">{r.quantity.toLocaleString('en-KE')} {r.unit}</span>
              {r.proposedPrice && (
                <> · your offer <span className="font-semibold">{kes(r.proposedPrice)} / {r.unit}</span></>
              )}
            </p>
            {r.note && <p className="mt-1 max-w-xl text-[13px] italic text-farmer-muted">“{r.note}”</p>}
            <p className="mt-1 text-xs text-farmer-muted">Submitted {fmtDate(r.createdAt)}</p>
          </div>

          <div className="flex shrink-0 items-center gap-2 pt-1">
            {r.status === 'Pending' && <ConfirmDelete label={`Withdraw request for ${r.listing?.name ?? 'listing'}`} onConfirm={() => withdraw(r)} />}
          </div>
        </article>
      ))}

      <p className="flex items-start gap-2 rounded-xl border border-farmer-line bg-white px-4 py-3 text-xs leading-relaxed text-farmer-muted">
        <CheckCircle2 size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-farmer-success" />
        <span>
          Statuses come straight from the backend. Farmers accepting or declining requests is a future stage — until
          then pending requests stay marked{' '}
          <span className="font-semibold text-farmer-ink">Pending · waiting</span>, and you can withdraw them at any
          time.
        </span>
      </p>
    </div>
  )
}
