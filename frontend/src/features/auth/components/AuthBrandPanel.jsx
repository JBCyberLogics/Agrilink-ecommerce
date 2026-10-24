/**
 * AuthBrandPanel — the left, brand-storytelling half of the split-screen
 * authentication experience (AGRILINK-AUTH-UI-REVAMP-001). Desktop only
 * (lg+); on phones the shell collapses to a slim brand strip inside the
 * auth panel, keeping the form as the focus.
 *
 * Design: constant deep-green surface (the same emerald-950 family the
 * Hero and Footer already use) — intentional in BOTH themes, so the
 * marketing storytelling stays anchored while the auth card flips with
 * the global theme. Copy is descriptive product truth, never metrics or
 * claims the app cannot back.
 */
import { Sprout, Store, Users, ShieldCheck } from 'lucide-react'
import { IMAGES } from '../../../constants/index.js'

const BENEFITS = [
  {
    icon: Store,
    title: 'Discover Produce',
    desc: 'Browse live listings across grains, fruits, vegetables and livestock.',
  },
  {
    icon: Users,
    title: 'Connect with Buyers',
    desc: 'Answer inquiries and purchase requests straight from your dashboard.',
  },
  {
    icon: ShieldCheck,
    title: 'Simplify Market Access',
    desc: 'Price insights, saved produce and orders — one session, no middlemen.',
  },
]

export default function AuthBrandPanel({ className = '' }) {
  return (
    <aside
      className={`relative flex-col overflow-hidden bg-gradient-to-b from-emerald-950 via-[#0d2f1d] to-emerald-950 text-emerald-50 ${className}`}
    >
      {/* ambient brand glows over the deep green */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-64 rounded-full bg-emerald-700/30 blur-3xl"
      />

      <div className="relative flex h-full flex-col justify-between gap-8 p-8 xl:p-10">
        {/* brand identity */}
        <div>
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-lift">
            <Sprout size={21} aria-hidden="true" />
          </span>
          <p className="mt-3.5 font-display text-lg font-bold text-white">AgriLink</p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-200/55">
            Farm-fresh marketplace
          </p>
        </div>

        {/* headline + restrained brand visual */}
        <div className="-mt-6">
          <h2 className="font-display text-[26px] font-bold leading-tight text-white">
            Connecting Farms to&nbsp;Opportunity
          </h2>
          <p className="mt-3 max-w-[32ch] text-[13px] leading-relaxed text-emerald-100/75">
            One marketplace where farmers list what they have grown and buyers discover it —
            fair prices, honest listings, harvest fresh.
          </p>
          <div className="relative mt-6 overflow-hidden rounded-2xl border border-white/15 shadow-glass">
            <img
              src={IMAGES.heroCover}
              alt="Rolling green farm fields at golden hour"
              loading="lazy"
              className="h-36 w-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-emerald-950/75 via-transparent to-transparent"
            />
            <p className="absolute bottom-2.5 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-100 backdrop-blur">
              <Sprout size={11} aria-hidden="true" /> Live marketplace feed
            </p>
          </div>
        </div>

        {/* compact benefit points */}
        <ul className="space-y-4">
          {BENEFITS.map((b) => (
            <li key={b.title} className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 backdrop-blur">
                <b.icon size={16} aria-hidden="true" className="text-emerald-200" />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-bold text-white">{b.title}</span>
                <span className="mt-0.5 block text-[11.5px] leading-relaxed text-emerald-100/65">
                  {b.desc}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
