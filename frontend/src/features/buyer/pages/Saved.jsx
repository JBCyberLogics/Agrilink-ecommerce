/**
 * Saved Produce (spec phase 8) — the buyer's REAL bookmarks from
 * /api/buyer/saved, rendered with the same card as Browse; unsaving goes
 * through the backend and refreshes the true state. Listings the farmer
 * deleted are pruned server-side (the stored reference is removed too),
 * so they never render as ghosts. Nothing lives in browser storage —
 * saved produce is account-level persistence by design.
 */
import { useState } from 'react'
import { Heart, HeartOff, AlertCircle, RotateCw } from 'lucide-react'
import { buyerSave, buyerUnsave } from '../../../api/endpoints'
import { useBuyerSaved } from '../parts/useBuyerData'
import ProduceCard from '../parts/ProduceCard'
import EmptyState from '../parts/EmptyState'

export default function Saved({ onBrowse }) {
  const { status, saved, error, refresh } = useBuyerSaved()
  const [busySave, setBusySave] = useState(null)
  const [banner, setBanner] = useState('')

  if (status === 'loading')
    return (
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading saved produce">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i} className="h-72 animate-pulse rounded-xl border border-farmer-line bg-paper/70" />
        ))}
      </ul>
    )

  if (status === 'error')
    return (
      <div className="rounded-xl border border-farmer-line bg-paper p-6 text-center">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-danger-wash text-farmer-danger">
          <AlertCircle size={20} aria-hidden="true" />
        </span>
        <p className="mt-3 text-sm font-semibold text-farmer-ink">{error || 'Could not load your saved produce.'}</p>
        <button
          type="button"
          onClick={refresh}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-farmer-primary px-4 text-[13px] font-semibold text-white hover:bg-farmer-primary-hover"
        >
          <RotateCw size={14} aria-hidden="true" /> Try again
        </button>
      </div>
    )

  const unsave = async (listing) => {
    if (busySave) return
    setBusySave(listing.id)
    try {
      await buyerUnsave(listing.id)
      refresh()
    } catch (e) {
      setBanner(e?.error || 'Could not remove this saved item.')
    } finally {
      setBusySave(null)
      setTimeout(() => setBanner(''), 3500)
    }
  }

  return (
    <div className="space-y-5">
      {banner && (
        <p className="flex items-center gap-2 rounded-lg bg-danger-wash px-3 py-2 text-[13px] text-farmer-danger" role="alert">
          <AlertCircle size={14} aria-hidden="true" /> {banner}
        </p>
      )}

      {saved.length === 0 ? (
        <EmptyState icon={Heart} title="You have not saved any produce yet.">
          Bookmark listings from Browse Produce and they stay attached to your account across devices and sessions.
        </EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {saved.map((l) => (
            <li key={l.id}>
              <ProduceCard
                listing={l}
                saved
                saveBusy={busySave === l.id}
                /* saved view has no "save" toggle — the only action is
                   removing, so the heart here un-books the item */
                onToggleSave={unsave}
              />
            </li>
          ))}
        </ul>
      )}

      {saved.length > 0 && (
        <button
          type="button"
          onClick={onBrowse}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-farmer-line bg-paper px-4 text-[13px] font-semibold text-farmer-ink transition-colors hover:border-farmer-brand/40 hover:text-farmer-brand"
        >
          <HeartOff size={14} aria-hidden="true" /> More sourcing ideas in Browse Produce
        </button>
      )}
    </div>
  )
}
