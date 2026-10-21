/**
 * Price Comparison (spec phase 6) — side-by-side REAL seller offers.
 *
 * Honesty rules enforced here:
 *  • rows are live /api/market/listings records (seller listing prices),
 *    labelled as such — NEVER presented as official market averages
 *  • offers are grouped by produce NAME and matched unit; different units
 *    are shown in separate sections instead of silently converted
 *  • the lowest price is highlighted factually ("Lowest listed price");
 *    no invented savings, averages or trends
 *  • a produce with a single active offer still shows, with an explicit
 *    "nothing to compare yet" note
 */
import { useEffect, useMemo, useState } from 'react'
import { Scale, AlertCircle, MapPin, Check, RotateCw } from 'lucide-react'
import { useMarketFeed } from '../parts/useBuyerData'
import { kes, fmtDate } from '../../../utils/format'

export default function PriceCompare() {
  const feed = useMarketFeed()
  const [pick, setPick] = useState('')

  /* group real listings by produce name, preserving offer counts */
  const groups = useMemo(() => {
    const map = new Map()
    for (const l of feed.listings ?? []) {
      if (!map.has(l.name)) map.set(l.name, [])
      map.get(l.name).push(l)
    }
    return [...map.entries()]
      .map(([name, offers]) => ({
        name,
        offers: offers.slice().sort((a, b) => a.price - b.price),
      }))
      .sort((a, b) => b.offers.length - a.offers.length || a.name.localeCompare(b.name))
  }, [feed.listings])

  /* default to the produce with the most real offers */
  useEffect(() => {
    if (feed.status === 'ok' && !pick && groups.length) setPick(groups[0].name)
  }, [feed.status, groups, pick])

  if (feed.status === 'loading')
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading comparison">
        <div className="h-12 animate-pulse rounded-xl border border-farmer-line bg-white/70" />
        <div className="h-64 animate-pulse rounded-xl border border-farmer-line bg-white/70" />
      </div>
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

  if (groups.length === 0)
    return (
      <div className="rounded-xl border border-farmer-line bg-white p-6 text-center">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-farmer-surface text-farmer-primary">
          <Scale size={20} aria-hidden="true" />
        </span>
        <p className="mt-3 text-sm font-semibold text-farmer-ink">Nothing to compare yet</p>
        <p className="mt-1 text-[13px] text-farmer-muted">
          No produce is listed on the marketplace right now — offers appear here as soon as farmers post them.
        </p>
      </div>
    )

  const group = groups.find((g) => g.name === pick) ?? groups[0]
  const label = (o) => `${o.farmer}${o.location ? ` · ${o.location}` : ''}`

  /* offers split per unit — never compared across units */
  const byUnit = new Map()
  for (const o of group.offers) {
    if (!byUnit.has(o.unit)) byUnit.set(o.unit, [])
    byUnit.get(o.unit).push(o)
  }

  return (
    <div className="space-y-4">
      {/* produce picker — offer counts computed from the real feed */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-farmer-line bg-white p-4">
        <label className="min-w-[260px] flex-1">
          <span className="mb-1.5 block text-xs font-medium text-farmer-ink">Compare offers for</span>
          <select
            value={group.name}
            onChange={(e) => setPick(e.target.value)}
            aria-label="Choose produce to compare"
            className={inputCls}
          >
            {groups.map((g) => (
              <option key={g.name} value={g.name}>
                {g.name} — {g.offers.length} {g.offers.length === 1 ? 'offer' : 'offers'}
              </option>
            ))}
          </select>
        </label>
        <p className="flex-0 text-xs text-farmer-muted">
          <span className="font-bold text-farmer-ink">{group.offers.length}</span> live{' '}
          {group.offers.length === 1 ? 'offer' : 'offers'} on the marketplace
        </p>
      </div>

      {[...byUnit.entries()].map(([unit, offers]) => (
        <section key={unit} className="overflow-hidden rounded-xl border border-farmer-line bg-white">
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-farmer-line px-4 py-3 sm:px-5">
            <h2 className="font-display text-[15px] font-semibold text-farmer-ink">
              {group.name} <span className="font-normal text-farmer-muted">· per {unit}</span>
            </h2>
            {offers.length > 1 ? (
              <p className="text-xs text-farmer-muted">Lowest listed price is marked — every figure is a seller&apos;s own listing.</p>
            ) : (
              <p className="text-xs text-farmer-warning">Single offer — nothing to compare yet</p>
            )}
          </header>
          {/* desktop table */}
          <table className="hidden w-full text-left text-[13px] sm:table">
            <caption className="sr-only">
              {group.name} offers from farmers, prices per {unit}, cheapest first
            </caption>
            <thead>
              <tr className="border-b border-farmer-line text-xs uppercase tracking-wide text-farmer-muted">
                <th scope="col" className="px-4 py-2.5 font-semibold sm:px-5">Farmer</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Seller listing price</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Available</th>
                <th scope="col" className="hidden px-4 py-2.5 font-semibold sm:table-cell">County</th>
                <th scope="col" className="hidden px-4 py-2.5 font-semibold md:table-cell">Listed</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o, i) => (
                <tr key={o.id} className="border-b border-farmer-line/60 last:border-0">
                  <td className="px-4 py-3 font-semibold text-farmer-ink sm:px-5">
                    {o.farmer}
                    {i === 0 && offers.length > 1 && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-farmer-surface px-2 py-0.5 text-[10px] font-bold text-farmer-success">
                        <Check size={10} aria-hidden="true" /> Lowest listed price
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-bold text-farmer-primary">
                    {kes(o.price)} <span className="text-xs font-medium text-farmer-muted">/ {unit}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-farmer-muted">
                    {o.stock > 0 ? `${o.stock.toLocaleString('en-KE')} ${unit}` : 'Sold out'}
                  </td>
                  <td className="hidden px-4 py-3 text-farmer-muted sm:table-cell">
                    {o.location ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={11} aria-hidden="true" /> {o.location}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-farmer-muted md:table-cell">{fmtDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* mobile cards */}
          <ul className="divide-y divide-farmer-line/60 sm:hidden">
            {offers.map((o, i) => (
              <li key={o.id} className="px-4 py-3">
                <p className="text-[13px] font-semibold text-farmer-ink">
                  {o.farmer}
                  {i === 0 && offers.length > 1 && (
                    <span className="ml-2 rounded-full bg-farmer-surface px-2 py-0.5 text-[10px] font-bold text-farmer-success">
                      Lowest listed price
                    </span>
                  )}
                </p>
                <p className="mt-1 text-[13px] font-bold text-farmer-primary">
                  {kes(o.price)} <span className="text-xs font-medium text-farmer-muted">/ {unit}</span>
                </p>
                <p className="mt-0.5 text-xs text-farmer-muted">
                  {o.location ? `${label(o)} · ` : ''}
                  {o.stock > 0 ? `${o.stock.toLocaleString('en-KE')} ${unit} available` : 'Sold out'} · {fmtDate(o.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p className="rounded-xl border border-farmer-line bg-white px-4 py-3 text-xs leading-relaxed text-farmer-muted">
        These are individual farmers&apos; listing prices on Agrilink — not official market averages. Only offers of the
        same produce and the same unit appear together; units are never converted for you.
      </p>
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border border-farmer-line bg-white px-3 py-2.5 text-[13px] text-farmer-ink placeholder:text-farmer-muted/60 focus:border-farmer-primary/50 focus:outline-none focus:ring-2 focus:ring-farmer-primary/40'
