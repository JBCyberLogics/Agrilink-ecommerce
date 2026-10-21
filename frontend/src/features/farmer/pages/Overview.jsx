/**
 * Overview — "Farmer Overview" (spec AGRILINK-FE-FARMER-001 phase 5).
 *
 * Data honesty rules in force:
 *  • Active Listings — REAL count from /api/farmer/listings
 *  • Recent Activity — REAL events derived from those listings + the profile
 *  • Market prices, inquiries, sales — no data source exists yet, so they
 *    render their specified empty/not-configured states. No fabricated
 *    metrics, prices, charts or percentage changes anywhere.
 */
import { useEffect, useState } from 'react'
import { LineChart, Package, MessageSquare, Receipt, ArrowRight, ListChecks, CalendarPlus, Target, AlertCircle, RotateCw } from 'lucide-react'
import { farmerProfile } from '../../../api/endpoints'
import { fmtDate } from '../../../utils/format'
import StatCard from '../parts/StatCard'
import EmptyState from '../parts/EmptyState'
import useFarmerListings from '../parts/useFarmerListings'

function quickAction(onNavigate, page, label) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(`farmer/${page}`)}
      className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-farmer-line bg-white px-4 text-[13px] font-semibold text-farmer-ink transition-colors hover:border-farmer-primary/40 hover:text-farmer-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-farmer-primary/40"
    >
      {label}
      <ArrowRight size={14} aria-hidden="true" />
    </button>
  )
}

function Card({ title, children, action }) {
  return (
    <section className="rounded-xl border border-farmer-line bg-white p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-[15px] font-semibold text-farmer-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export default function Overview({ onNavigate }) {
  const { status, listings, error, refresh } = useFarmerListings()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    let alive = true
    farmerProfile()
      .then((d) => alive && setProfile(d?.user ?? d))
      .catch(() => {}) /* memberSince is optional decoration */
    return () => {
      alive = false
    }
  }, [])

  if (status === 'loading')
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true" aria-label="Loading overview">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[118px] animate-pulse rounded-xl border border-farmer-line bg-white/70" />
        ))}
      </div>
    )

  if (status === 'error')
    return (
      <div className="rounded-xl border border-farmer-line bg-white p-6 text-center">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-farmer-danger">
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

  /* Real activity events, newest first */
  const activity = [
    ...listings.map((l) => ({ id: `l-${l.id}`, icon: Package, text: `Listed ${l.name}`, date: l.createdAt })),
    ...(profile?.memberSince
      ? [{ id: 'joined', icon: CalendarPlus, text: 'Joined Agrilink', date: profile.memberSince }]
      : []),
  ].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="space-y-6">
      {/* quick actions */}
      <div className="flex flex-wrap gap-2.5">
        {quickAction(onNavigate, 'market-intelligence', 'Market Intelligence')}
        {quickAction(onNavigate, 'produce', 'My Produce')}
        {quickAction(onNavigate, 'profile', 'Farm Profile')}
      </div>

      {/* summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={LineChart} label="Market Prices" value={null} hint="Market price data is not available yet." />
        <StatCard
          icon={Package}
          label="Active Listings"
          value={listings.length}
          hint={listings.length ? 'Real count from your produce listings' : 'You have no active produce listings yet.'}
        />
        <StatCard icon={MessageSquare} label="Buyer Inquiries" value={null} hint="No buyer inquiries are available." />
        <StatCard
          icon={Receipt}
          label="Recorded Sales"
          value={null}
          hint="Sales information will appear when recorded transactions are available."
        />
      </div>

      {/* market price trends */}
      <Card title="Market Price Trends">
        <EmptyState icon={LineChart} title="No price history is available yet.">
          Trend charts appear here once a market price source is connected — built from actual dated
          observations, never invented values.
        </EmptyState>
      </Card>

      {/* recent market prices */}
      <Card title="Recent Market Prices">
        <EmptyState icon={LineChart} title="Market price data is not available yet.">
          Verified price observations (produce, market, KES price, unit, observation date, source) will
          be listed here.
        </EmptyState>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* opportunities */}
        <Card title="Market Opportunities">
          <EmptyState icon={Target} title="No market opportunities to show yet.">
            Relevant market opportunities will appear when data becomes available.
          </EmptyState>
        </Card>

        {/* real recent activity */}
        <Card title="Recent Activity">
          {activity.length === 0 ? (
            <EmptyState icon={ListChecks} title="Your recent activity will appear here." />
          ) : (
            <ul className="divide-y divide-farmer-line">
              {activity.slice(0, 6).map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-farmer-surface text-farmer-primary">
                    <a.icon size={15} aria-hidden="true" />
                  </span>
                  <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-farmer-ink">{a.text}</p>
                  <p className="shrink-0 text-xs text-farmer-muted">{fmtDate(a.date)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
