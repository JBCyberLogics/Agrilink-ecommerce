import { Leaf, ArrowRight, Tractor, ShieldCheck, Star } from 'lucide-react'
import { IMAGES } from '../../utils/constants'

const GLASS =
  'rounded-2xl border border-white/20 bg-paper/10 shadow-glass backdrop-blur-md'

export default function Hero({ onJoin }) {
  return (
    <section className="relative pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-emerald-950 shadow-soft">
          {/* photo layer */}
          <img
            src={IMAGES.heroCover}
            alt="Rolling green farm fields at golden hour"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/75 to-emerald-950/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-transparent to-transparent" />

          {/* floating leaf accents */}
          <Leaf
            size={180}
            aria-hidden="true"
            className="absolute -right-10 -top-10 rotate-[30deg] text-primary-light/15"
          />

          {/* content grid */}
          <div className="relative grid items-center gap-12 p-8 sm:p-12 lg:grid-cols-[1.05fr_0.95fr] lg:p-16">
            {/* left copy */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-paper/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-100 backdrop-blur">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-secondary text-neutral-900">
                  <Star size={10} fill="currentColor" aria-hidden="true" />
                </span>
                Kenya&apos;s #1 farm-to-table marketplace
              </span>

              <h1 className="mt-5 font-display text-4xl font-bold leading-[1.12] tracking-tight text-white sm:text-5xl">
                From the farm gate,
                <br />
                <span className="text-brand-amber">straight to your table.</span>
              </h1>

              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-emerald-100/85">
                Buy fresh produce directly from verified farmers — no middlemen, fair prices,
                harvest-to-order delivery across every county.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href="#marketplace"
                  className="group flex h-12 items-center gap-2 rounded-full bg-secondary px-6 text-sm font-bold text-neutral-900 shadow-lift transition-all hover:bg-secondary-dark active:scale-[0.98]"
                >
                  Explore the Marketplace
                  <ArrowRight
                    size={17}
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1"
                  />
                </a>
                <button
                  type="button"
                  onClick={onJoin}
                  className="flex h-12 items-center gap-2 rounded-full border border-white/25 bg-paper/10 px-6 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-paper/20"
                >
                  <Tractor size={17} aria-hidden="true" />
                  Join as a Farmer
                </button>
              </div>

              {/* stat strip */}
              <dl className="mt-9 grid max-w-md grid-cols-3 divide-x divide-white/10">
                {[
                  ['2,300+', 'Verified farmers'],
                  ['48k+', 'Orders delivered'],
                  ['4.9★', 'Buyer rating'],
                ].map(([num, label]) => (
                  <div key={label} className="px-4 first:pl-0">
                    <dt className="sr-only">{label}</dt>
                    <dd className="font-display text-xl font-bold text-white">{num}</dd>
                    <dd className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-emerald-100/60">
                      {label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* right: floating glass cards */}
            <div className="relative hidden h-[380px] lg:block">
              <div className={`${GLASS} absolute right-0 top-2 w-64 p-4 motion-safe:animate-float`}>
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-neutral-900">
                    <Tractor size={19} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">Harvest-to-order</p>
                    <p className="text-[11px] text-emerald-100/70">Picked the day it ships</p>
                  </div>
                </div>
                <div className="mt-3 flex items-end gap-1">
                  {[38, 52, 44, 60, 55, 72, 68].map((h, i) => (
                    <span
                      key={i}
                      style={{ height: `${h * 0.45}px` }}
                      className="w-4 rounded-t-sm bg-gradient-to-t from-primary-light to-secondary/80"
                    />
                  ))}
                </div>
                <p className="mt-2 text-[11px] font-medium text-emerald-100/70">
                  Fresh listings this week
                </p>
              </div>

              <div
                className={`${GLASS} absolute left-4 top-40 w-60 p-4 motion-safe:animate-float [animation-delay:-3.5s]`}
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-light text-white">
                  <ShieldCheck size={19} aria-hidden="true" />
                </span>
                <p className="mt-2.5 text-sm font-bold text-white">Escrow-secured payments</p>
                <p className="mt-1 text-[11px] leading-relaxed text-emerald-100/70">
                  Funds are released to the farmer only when your produce arrives fresh.
                </p>
              </div>

              <div
                className={`${GLASS} absolute bottom-3 right-8 w-56 p-4 motion-safe:animate-float [animation-delay:-1.8s]`}
              >
                <div className="flex items-center gap-1 text-brand-amber">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} fill="currentColor" aria-hidden="true" />
                  ))}
                </div>
                <p className="mt-2 text-[13px] font-semibold leading-snug text-white">
                  “My tomatoes never leave the farm twice.”
                </p>
                <p className="mt-1 text-[11px] text-emerald-100/70">— Farmer Amina, Nakuru</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
