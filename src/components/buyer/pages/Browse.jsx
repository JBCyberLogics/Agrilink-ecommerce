/**
 * Browse Produce (spec phase 5) — real /api/market/listings rows only.
 * Search/filter/sort run on the ACTUAL listing fields (name, category,
 * location county, price, stock); matching counts are computed from the
 * filtered results. Sold-out listings cannot be requested. Loading, empty,
 * error and network states are explicit. Availability text is never
 * color-only, and a photo-less listing gets a category-icon placeholder.
 */
import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, RotateCw, SlidersHorizontal, SearchX, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import { buyerSave, buyerUnsave } from '../../../utils/api'
import { createInquiry } from '../../../utils/api'
import { CATEGORIES } from '../../../data/mockData'
import { useMarketFeed, useBuyerSaved } from '../parts/useBuyerData'
import ProduceCard from '../parts/ProduceCard'
import RequestDialog from '../parts/RequestDialog'
import InquiryDialog from '../parts/InquiryDialog'
import EmptyState from '../parts/EmptyState'

const SORTS = [
  { id: 'newest', label: 'Newest first' },
  { id: 'price-asc', label: 'Price: low → high' },
  { id: 'price-desc', label: 'Price: high → low' },
  { id: 'qty-desc', label: 'Available quantity: high → low' },
]

export const EMPTY_FILTERS = {
  q: '',
  category: 'All',
  location: '',
  min: '',
  max: '',
  minQty: '',
  sort: 'newest',
}

const num = (v) => {
  const n = Number(v)
  return v !== '' && Number.isFinite(n) ? n : null
}

export default function Browse({ filters, onFiltersChange }) {
  const feed = useMarketFeed()
  const savedQ = useBuyerSaved()
  const [page, setPage] = useState(1)
  const [busySave, setBusySave] = useState(null)
  const [dialog, setDialog] = useState(null) // listing open in the request dialog
  const [inquiryDialog, setInquiryDialog] = useState(null) // listing open in the inquiry dialog
  const [banner, setBanner] = useState('')

  const setF = (k) => (e) => {
    onFiltersChange({ ...filters, [k]: e.target.value })
    setPage(1)
  }

  /* ------------------------- actual filtering + sorting ------------------------- */
  const filtered = useMemo(() => {
    const rows = feed.listings ?? []
    const q = filters.q.trim().toLowerCase()
    const loc = filters.location.trim().toLowerCase()
    const min = num(filters.min)
    const max = num(filters.max)
    const minQty = num(filters.minQty)

    const out = rows.filter((l) => {
      if (q && !l.name.toLowerCase().includes(q)) return false
      if (filters.category !== 'All' && l.category !== filters.category) return false
      if (loc && !String(l.location || '').toLowerCase().includes(loc)) return false
      if (min !== null && l.price < min) return false
      if (max !== null && l.price > max) return false
      if (minQty !== null && l.stock < minQty) return false
      return true
    })

    if (filters.sort === 'price-asc') out.sort((a, b) => a.price - b.price)
    else if (filters.sort === 'price-desc') out.sort((a, b) => b.price - a.price)
    else if (filters.sort === 'qty-desc') out.sort((a, b) => b.stock - a.stock)
    else out.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return out
  }, [feed.listings, filters])

  /* pagination over genuine result rows (12 per page) */
  const pages = Math.max(1, Math.ceil(filtered.length / 12))
  useEffect(() => setPage(1), [filters])
  const pageRows = filtered.slice((Math.min(page, pages) - 1) * 12, Math.min(page, pages) * 12)

  const savedIds = useMemo(() => new Set((savedQ.saved ?? []).map((s) => s.id)), [savedQ.saved])

  /* save / unsave — persisted to the buyer's real account record; failures
     show the server's message and refresh the true state */
  const toggleSave = async (listing) => {
    if (busySave) return
    setBusySave(listing.id)
    const had = savedIds.has(listing.id)
    try {
      await (had ? buyerUnsave(listing.id) : buyerSave(listing.id))
    } catch (e) {
      setBanner(e?.error || 'Could not update your saved produce.')
    } finally {
      setBusySave(null)
      savedQ.refresh()
      setTimeout(() => setBanner(''), 3500)
    }
  }

  /* send an inquiry to the farmer about this listing */
  const toggleInquiry = (listing) => {
    if (listing.stock <= 0) return
    setInquiryDialog(listing)
  }

  const activeFilterCount = ['q', 'category', 'location', 'min', 'max', 'minQty', 'sort'].filter(
    (k) => String(filters[k]) !== '' && (k !== 'category' || filters[k] !== 'All') && (k !== 'sort' || filters[k] !== 'newest'),
  ).length

  /* ----------------------------- states ----------------------------- */
  if (feed.status === 'loading' || savedQ.status === 'loading')
    return (
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading produce">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="h-72 animate-pulse rounded-xl border border-farmer-line bg-white/70" />
        ))}
      </ul>
    )

  if (feed.status === 'error')
    return (
      <div className="rounded-xl border border-farmer-line bg-white p-6 text-center">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-farmer-danger">
          <AlertCircle size={20} aria-hidden="true" />
        </span>
        <p className="mt-3 text-sm font-semibold text-farmer-ink">{feed.error || 'The market feed is unreachable right now.'}</p>
        <button
          type="button"
          onClick={feed.refresh}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-farmer-primary px-4 text-[13px] font-semibold text-white hover:bg-farmer-primary-hover"
        >
          <RotateCw size={14} aria-hidden="true" /> Try again
        </button>
      </div>
    )

  return (
    <div className="space-y-5">
      {/* ----------------------------- filter bar ----------------------------- */}
      <section aria-labelledby="browse-filters-title" className="rounded-xl border border-farmer-line bg-white p-4 sm:p-5">
        <h2 id="browse-filters-title" className="mb-3 flex items-center gap-2 font-display text-[15px] font-semibold text-farmer-ink">
          <SlidersHorizontal size={15} aria-hidden="true" /> Find produce
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-farmer-ink">Search produce</span>
            <input
              type="search"
              value={filters.q}
              onChange={setF('q')}
              placeholder="e.g. maize, spinach…"
              aria-label="Search produce by name"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-farmer-ink">Category</span>
            <select value={filters.category} onChange={setF('category')} aria-label="Filter by category" className={inputCls}>
              {['All', ...CATEGORIES].map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All categories' : c}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-farmer-ink">County / region</span>
            <input
              type="text"
              value={filters.location}
              onChange={setF('location')}
              placeholder="e.g. Nyeri"
              aria-label="Filter by county or region"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-farmer-ink">Sort</span>
            <select value={filters.sort} onChange={setF('sort')} aria-label="Sort listings" className={inputCls}>
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-farmer-ink">Min price (KSh)</span>
            <input
              type="number"
              min="0"
              value={filters.min}
              onChange={setF('min')}
              placeholder="0"
              aria-label="Minimum price in Kenyan Shillings"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-farmer-ink">Max price (KSh)</span>
            <input
              type="number"
              min="0"
              value={filters.max}
              onChange={setF('max')}
              placeholder="Any"
              aria-label="Maximum price in Kenyan Shillings"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-farmer-ink">Min quantity available</span>
            <input
              type="number"
              min="1"
              value={filters.minQty}
              onChange={setF('minQty')}
              placeholder="Any"
              aria-label="Minimum available quantity"
              className={inputCls}
            />
          </label>
          <div className="flex items-end justify-between gap-2">
            <p className="text-xs text-farmer-muted" aria-live="polite">
              <span className="font-bold text-farmer-ink">{filtered.length}</span> of {feed.listings.length} listings
            </p>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  onFiltersChange(EMPTY_FILTERS)
                  setPage(1)
                }}
                className="inline-flex h-9 items-center rounded-lg border border-farmer-line px-3 text-xs font-semibold text-farmer-muted transition-colors hover:border-farmer-primary/40 hover:text-farmer-primary"
              >
                Clear filters ({activeFilterCount})
              </button>
            )}
          </div>
        </div>
        {banner && (
          <p className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-farmer-danger" role="alert">
            <AlertCircle size={14} aria-hidden="true" /> {banner}
          </p>
        )}
      </section>

      {/* --------------------------- results grid --------------------------- */}
      {filtered.length === 0 ? (
        feed.listings.length === 0 ? (
          <EmptyState icon={SearchX} title="No produce listed yet">
            Farmers are still resting their harvests — everything they post appears here the moment it is listed.
          </EmptyState>
        ) : (
          <EmptyState icon={SearchX} title="No produce matches these filters">
            Try another search term, widen the price range or clear the filters — new harvests are listed every day.
          </EmptyState>
        )
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {pageRows.map((l) => (
            <li key={l.id}>
              <ProduceCard
                listing={l}
                saved={savedIds.has(l.id)}
                saveBusy={busySave === l.id}
                onToggleSave={toggleSave}
                onRequest={setDialog}
                onInquire={toggleInquiry}
              />
            </li>
          ))}
        </ul>
      )}

      {/* ----------------------------- pagination ----------------------------- */}
      {filtered.length > 12 && (
        <nav aria-label="Produce pages" className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={Math.min(page, pages) <= 1}
            aria-label="Previous page"
            className="grid h-9 w-9 place-items-center rounded-lg border border-farmer-line text-farmer-muted transition-colors hover:border-farmer-primary/40 hover:text-farmer-primary disabled:opacity-40"
          >
            <ChevronLeft size={15} aria-hidden="true" />
          </button>
          <p className="text-[13px] font-medium text-farmer-ink">
            Page <span className="font-bold">{Math.min(page, pages)}</span> of {pages}
          </p>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={Math.min(page, pages) >= pages}
            aria-label="Next page"
            className="grid h-9 w-9 place-items-center rounded-lg border border-farmer-line text-farmer-muted transition-colors hover:border-farmer-primary/40 hover:text-farmer-primary disabled:opacity-40"
          >
            <ChevronRight size={15} aria-hidden="true" />
          </button>
        </nav>
      )}

      {/* success note after a request is confirmed by the backend */}
      {banner === 'requested' && (
        <p className="flex items-center gap-2 rounded-lg bg-farmer-surface px-4 py-3 text-[13px] text-farmer-ink" role="status">
          <CheckCircle2 size={15} aria-hidden="true" className="text-farmer-success" />
          Request sent — it is saved under Purchase Requests and waits for the farmer&apos;s response.
        </p>
      )}

      {banner === 'inquired' && (
        <p className="flex items-center gap-2 rounded-lg bg-farmer-surface px-4 py-3 text-[13px] text-farmer-ink" role="status">
          <CheckCircle2 size={15} aria-hidden="true" className="text-farmer-success" />
          Inquiry sent — the farmer will see it under their buyer inquiries.
        </p>
      )}

      {dialog && (
        <RequestDialog
          listing={dialog}
          onClose={() => setDialog(null)}
          onSent={() => setBanner('requested')}
        />
      )}

      {inquiryDialog && (
        <InquiryDialog
          listing={inquiryDialog}
          onClose={() => setInquiryDialog(null)}
          onSent={() => setBanner('inquired')}
        />
      )}
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border border-farmer-line bg-white px-3 py-2.5 text-[13px] text-farmer-ink placeholder:text-farmer-muted/60 focus:border-farmer-primary/50 focus:outline-none focus:ring-2 focus:ring-farmer-primary/40'
