import { Sprout, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react'

const LINK_GROUPS = [
  { title: 'Marketplace', links: ['Grains', 'Fruits & Veg', 'Livestock', 'Seasonal offers'] },
  { title: 'For Farmers', links: ['Start selling', 'Farmer dashboard', 'Logistics', 'Fair pricing'] },
  { title: 'Company', links: ['About us', 'How it works', 'Support', 'Contact'] },
]

export default function Footer() {
  return (
    <footer className="mt-14 bg-emerald-950 text-emerald-100/80">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* brand */}
          <div>
            <a href="#" className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary-light to-primary text-white">
                <Sprout size={22} aria-hidden="true" />
              </span>
              <span className="font-display text-lg font-bold text-white">
                Agri<span className="text-secondary">link</span>
              </span>
            </a>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-emerald-100/60">
              Directly connecting farmers and buyers — fair prices for growers, fresher food for
              everyone. Zero middlemen, 100% traceable.
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-[11px] font-medium text-emerald-100/70 ring-1 ring-white/10">
              <ShieldCheck size={13} aria-hidden="true" className="text-primary-light" />
              Escrow-secured payments
            </p>
          </div>

          {/* link columns */}
          {LINK_GROUPS.map((g) => (
            <nav key={g.title} aria-label={g.title}>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-100/40">
                {g.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {g.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-[13px] font-medium transition-colors hover:text-white">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* contact strip */}
        <div className="mt-12 flex flex-wrap gap-x-8 gap-y-2 border-t border-white/10 pt-6 text-xs text-emerald-100/50">
          <span className="inline-flex items-center gap-1.5">
            <Mail size={13} aria-hidden="true" /> hello@agrilink.co.ke
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Phone size={13} aria-hidden="true" /> +254 700 123 456
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={13} aria-hidden="true" /> Nairobi · Nakuru · Meru · Kisumu · Mombasa
          </span>
        </div>

        {/* bottom bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-[11px] text-emerald-100/40">
          <p>© 2026 Agrilink Ltd. All rights reserved.</p>
          <p>
            <a href="#" className="hover:text-emerald-100/70">Privacy</a>
            <span className="mx-2">·</span>
            <a href="#" className="hover:text-emerald-100/70">Terms</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
