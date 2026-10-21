import { Sprout, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react'

/* Every link points at a real hash destination — public pages, the
   marketplace, or the role dashboards. Stubs with no destination
   (Logistics, Fair pricing, Seasonal offers, Privacy, Terms) are omitted
   rather than left dead, per the public-pages spec. */
const LINK_GROUPS = [
  {
    title: 'Marketplace',
    links: [
      { label: 'Find produce', href: '#/' },
      { label: 'How it works', href: '#/how-it-works' },
    ],
  },
  {
    title: 'For Farmers',
    links: [
      { label: 'Start selling', href: '#/start-selling' },
      { label: 'Farmer dashboard', href: '#/farmer' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About AgriLink', href: '#/about' },
      { label: 'FAQ', href: '#/faq' },
      { label: 'Contact us', href: '#/contact' },
    ],
  },
]

/**
 * Shared footer — compact variant. Same branding, contact details and
 * bottom bar as before; group links now navigate to real destinations,
 * and "Log in" reopens the existing auth modal (provided by App via
 * onLogin).
 */
export default function Footer({ onLogin }) {
  return (
    <footer className="mt-10 bg-emerald-950 text-emerald-100/80">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="#/" aria-label="Agrilink home — back to the marketplace" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary-light to-primary text-white">
                <Sprout size={17} aria-hidden="true" />
              </span>
              <span className="font-display text-[15px] font-bold text-white">
                Agri<span className="text-brand-amber">link</span>
              </span>
            </a>
            <p className="mt-2 max-w-xs text-xs leading-relaxed text-emerald-100/60">
              Directly connecting farmers and buyers — fair prices for growers, fresher food for
              everyone. Zero middlemen, 100% traceable.
            </p>
            <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-paper/5 px-2.5 py-1 text-[11px] font-medium text-emerald-100/70 ring-1 ring-white/10">
              <ShieldCheck size={12} aria-hidden="true" className="text-primary-light" />
              Escrow-secured payments
            </p>
          </div>

          {/* link columns */}
          {LINK_GROUPS.map((g) => (
            <nav key={g.title} aria-label={g.title}>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-100/40">
                {g.title}
              </h3>
              <ul className="mt-2 space-y-1.5">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-xs font-medium transition-colors hover:text-white">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* contact strip */}
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-4 text-xs text-emerald-100/50">
          <span className="inline-flex items-center gap-1.5">
            <Mail size={12} aria-hidden="true" /> hello@agrilink.co.ke
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Phone size={12} aria-hidden="true" /> +254 700 123 456
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={12} aria-hidden="true" /> Nairobi · Nakuru · Meru · Kisumu · Mombasa
          </span>
        </div>

        {/* bottom bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-[11px] text-emerald-100/40">
          <p>© 2026 Agrilink Ltd. All rights reserved.</p>
          {onLogin && (
            <button
              type="button"
              onClick={onLogin}
              className="font-semibold text-emerald-100/70 transition-colors hover:text-white"
            >
              Log in
            </button>
          )}
        </div>
      </div>
    </footer>
  )
}
