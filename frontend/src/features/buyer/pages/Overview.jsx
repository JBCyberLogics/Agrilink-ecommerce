/**
 * Buyer Overview (spec phase 4). Data honesty rules in force:
 *  • Available Produce — REAL count from the live market feed
 *  • My Requests / Saved Produce — REAL counts from the buyer's own
 *    MongoDB records; Active Orders — "—" because no order backend exists
 *  • Find Produce — filters feed the real Browse page
 *  • Produce You May Need — TRANSPARENT rule: categories the buyer
 *    saved/requested, matched to current active listings. No AI claims.
 *  • Recently Listed — newest real listings by listing timestamp
 *  • Recent Purchase Activity — the buyer's real request events
 */
import { useEffect, useState } from 'react'
import { ArrowRight, Search, Package, CheckCircle2, Clock3, AlertCircle, CalendarPlus, RotateCw } from 'lucide-react'
import StatCard from '../../farmer/parts/StatCard'
import EmptyState from '../parts/EmptyState'
import StatusChip from '../parts/StatusChip'
import { useBuyerData } from '../parts/useBuyerData'
import { CATEGORIES, CATEGORY_FILTERS } from '../../../utils/constants'
import { kes, fmtDate } from '../../../utils/format'

function Card({ title, children, action }) {
  return (
    <section className="rounded-xl border border-farmer-line bg-paper p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-[15px] font-semibold text-farmer-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export default function Overview({ onJumpToBrowse }) {
  const { status, listings, saved, requests, error, refresh } = useBuyerData()

  if (status === 'loading')
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true" aria-label="Loading overview">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[118px] animate-pulse rounded-xl border border-farmer-line bg-paper/70" />
        ))}
      </div>
    )

  if (status === 'error')
    return (
      <div className="rounded-xl border border-farmer-line bg-paper p-6 text-center">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-danger-wash text-farmer-danger">
          <AlertCircle size={20} aria-hidden="true" />
        </span>
        <p className="mt-3 text-sm font-semibold text-farmer-ink">{error || 'Something went wrong.'}</p>
        <button
          type="button"
          onClick={refresh}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-farmer-primary px-4 text-[13px] font-semibold text-white transition-colors hover:bg-farmer-primary-hover"
        >
          <RotateCw size={14} aria-hidden="true" /> Try again
        </button>
      </div>
    )

  /* ---------------- transparent recommendation rule ---------------- */
  /* count the categories across the buyer's saved items + requests */
  const myRows = [
    ...saved.saved.map((s) => s.category),
    ...requests.requests.filter((r) => r.listing).map((r) => r.listing.category),
  ]
  const topCategory = myRows
    .map((c) => [c, myRows.filter((x) => x === c).length])
    .sort((a, b) => b[1] - a[1])[0]?.[0]
  const recommended = topCategory
    ? listings.filter((l) => l.category === topCategory && l.stock > 0).slice(0, 4)
    : []

  const activity = requests.requests.slice(0, 4)

  return (
    <div className="space-y-6">
      {/* ------------------------- summary cards ------------------------- */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Package}
          label="Available Produce"
          value={listings.length}
          hint={`${CATEGORIES.filter((c) => listings.some((l) => l.category === c)).length} active categories right now`}
        />
        <StatCard
          icon={Clock3}
          label="My Requests"
          value={requests.requests.length}
          hint={
            requests.requests.length
              ? `${requests.requests.filter((r) => r.status === 'Pending').length} waiting for the farmer`
              : 'You have not submitted any purchase requests yet.'
          }
        />
        <StatCard
          icon={ArrowRight}
          label="Saved Produce"
          value={saved.saved.length}
          hint={saved.saved.length ? undefined : 'You have not saved any produce yet.'}
        />
        <StatCard
          icon={CalendarPlus}
          label="Active Orders"
          value="—"
          hint="Orders are not available yet — check back after checkout ships."
        />
      </div>

      {/* --------------------------- find produce --------------------------- */}
      <FindProduceForm onJumpToBrowse={onJumpToBrowse} listings={listings} />

      <div className="grid gap-6 xl:grid-cols-2">
        {/* -------------------- produce you may need -------------------- */}
        <Card
          title="Produce You May Need"
          action={
            topCategory && (
              <button
                type="button"
                onClick={() => onJumpToBrowse({ category: topCategory })}
                className="text-[13px] font-semibold text-farmer-brand hover:text-farmer-primary-hover"
              >
                More {topCategory} <ArrowRight size={13} aria-hidden="true" className="inline" />
              </button>
            )
          }
        >
          {recommended.length > 0 ? (
            <>
              <p className="mb-3 text-xs text-farmer-muted" aria-live="polite">
                rule: active listings in <span className="font-semibold text-farmer-ink">{topCategory}</span> —
                the category across your saved items and requests ({myRows.length} {myRows.length === 1 ? 'item' : 'items'})
              </p>
              <ul className="space-y-2.5">
                {recommended.map((l) => (
                  <li key={l.id} className="flex items-center gap-3 rounded-lg border border-farmer-line px-3 py-2.5">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-farmer-ink">{l.name}</span>
                      <span className="block truncate text-xs text-farmer-muted">
                        {l.farmer}
                        {l.location ? ` · ${l.location}` : ''}
                      </span>
                    </span>
                    <span className="text-[13px] font-bold text-farmer-brand">{kes(l.price)}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <EmptyState icon={Package} title="No recommendations yet">
              Save produce or send a purchase request and current listings in those categories appear here.
            </EmptyState>
          )}
        </Card>

        {/* -------------------- recently listed -------------------- -------------------- */}
        <Card
          title="Recently Listed Produce"
          action={
            <button
              type="button"
              onClick={() => onJumpToBrowse({ sort: 'newest' })}
              className="text-[13px] font-semibold text-farmer-brand hover:text-farmer-primary-hover"
            >
              View all <ArrowRight size={13} aria-hidden="true" className="inline" />
            </button>
          }
        >
          {listings.length > 0 ? (
            <ul className="space-y-2.5">
              {listings.slice(0, 5).map((l) => (
                <li key={l.id} className="flex items-center gap-3 rounded-lg border border-farmer-line px-3 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-farmer-ink">{l.name}</span>
                    <span className="block truncate text-xs text-farmer-muted">
                      Listed {fmtDate(l.createdAt)} · {l.farmer}
                    </span>
                  </span>
                  <span className="text-[13px] font-bold text-farmer-brand">{kes(l.price)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Package} title="No available produce listings were found.">
              The market feed is empty right now — listings appear the moment farmers post them.
            </EmptyState>
          )}
        </Card>
      </div>

      {/* ------------- recent purchase activity (real events) ------------- */}
      <Card title="Recent Purchase Activity">
        {activity.length > 0 ? (
          <ul className="space-y-2.5">
            {activity.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-farmer-line px-3 py-2.5">
                <span className="min-w-0 flex-1 text-[13px] font-medium text-farmer-ink">
                  {r.listing ? r.listing.name : 'Listing removed by the farmer'} · {r.quantity} {r.unit}
                </span>
                <StatusChip status={r.status} />
                <span className="text-xs text-farmer-muted">{fmtDate(r.createdAt)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={Clock3} title="You have not submitted any purchase requests yet.">
            Requests you send to farmers show here with their real status the moment the backend confirms them.
          </EmptyState>
        )}
      </Card>
    </div>
  )
}

/* status text — the backend's documented values, never color-only */

/* ------------------------- Find Produce (→ Browse) ------------------------- */
function FindProduceForm({ onJumpToBrowse, listings }) {
  const [f, setF] = useState({ q: '', category: 'All', location: '', min: '', max: '', minQty: '' })
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  const jump = (e) => {
    e.preventDefault()
    const min = num(f.min)
    const max = num(f.max)
    if (min !== null && max !== null && min > max)
      return setErr('Minimum price cannot be greater than the maximum.')
    setErr('')
    const clean = Object.fromEntries(
      Object.entries(f).filter(([, v]) => v !== '' && !(f.category === 'All' && v === 'All')),
    )
    onJumpToBrowse(clean)
  }

  return (
    <section aria-labelledby="find-produce-title" className="rounded-xl border border-farmer-line bg-paper p-5 sm:p-6">
      <h2 id="find-produce-title" className="flex items-center gap-2 font-display text-[15px] font-semibold text-farmer-ink">
        <Search size={15} aria-hidden="true" /> Find Produce
      </h2>
      <form onSubmit={jump} noValidate className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <label className="block lg:col-span-2">
          <span className="mb-1.5 block text-xs font-medium text-farmer-ink">Search term</span>
          <input type="search" value={f.q} onChange={set('q')} placeholder="e.g. tomatoes" aria-label="Search produce by name" className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-farmer-ink">Category</span>
          <select value={f.category} onChange={set('category')} aria-label="Category" className={inputCls}>
            {CATEGORY_FILTERS.map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All categories' : c}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-farmer-ink">County</span>
          <input type="text" value={f.location} onChange={set('location')} placeholder="e.g. Meru" aria-label="County or region" className={inputCls} />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-farmer-ink">Min (KSh)</span>
            <input type="number" min="0" value={f.min} onChange={set('min')} placeholder="0" aria-label="Minimum price" className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-farmer-ink">Max (KSh)</span>
            <input type="number" min="0" value={f.max} onChange={set('max')} placeholder="Any" aria-label="Maximum price" className={inputCls} />
          </label>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-farmer-ink">Min quantity</span>
          <input type="number" min="1" value={f.minQty} onChange={set('minQty')} placeholder="Any" aria-label="Minimum quantity" className={inputCls} />
        </label>
        <div className="sm:col-span-2 lg:col-span-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-farmer-muted" aria-live="polite">
            <span className="font-bold text-farmer-ink">{listings.length}</span> live listings from real farmers
            — the filters below search those exact records
          </p>
          <div className="flex gap-2">
            <button
              type="reset"
              onClick={() => {
                setF({ q: '', category: 'All', location: '', min: '', max: '', minQty: '' })
                setErr('')
              }}
              className="inline-flex h-10 items-center rounded-lg border border-farmer-line px-4 text-[13px] font-semibold text-farmer-muted transition-colors hover:border-farmer-brand/40 hover:text-farmer-brand"
            >
              Clear
            </button>
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-farmer-primary px-4 text-[13px] font-semibold text-white transition-colors hover:bg-farmer-primary-hover"
            >
              Search <ArrowRight size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
        {err && (
          <p className="sm:col-span-2 lg:col-span-6 flex items-center gap-2 text-[13px] text-farmer-danger" role="alert">
            <AlertCircle size={14} aria-hidden="true" /> {err}
          </p>
        )}
      </form>
    </section>
  )
}

const num = (v) => {
  const n = Number(v)
  return v !== '' && Number.isFinite(n) ? n : null
}

const inputCls =
  'w-full rounded-lg border border-farmer-line bg-paper px-3 py-2.5 text-[13px] text-farmer-ink placeholder:text-farmer-muted/60 focus:border-farmer-brand/50 focus:outline-none focus:ring-2 focus:ring-farmer-brand/40'
