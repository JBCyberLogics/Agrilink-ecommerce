/**
 * StartSelling (AGRILINK-PUBLIC-PAGES-001) — route #/start-selling.
 * Conversion flow reuses the EXISTING authentication modal: "Get Started"
 * opens signup with the Farmer role preselected — the exact same openAuth
 * preset the marketplace hero uses. Role-aware behavior:
 *   • anonymous → open signup (Farmer preselected)
 *   • logged in as Farmer → go straight to the farmer dashboard
 *   • logged in as Buyer → explain that accounts are role-separate and
 *     offer creating a farmer account — a user's role is never changed
 *     silently.
 * No promises of sales, income, guaranteed buyers or prices.
 */
import { useState } from 'react'
import { Sprout, ArrowRight, ListPlus, Eye, MessagesSquare, Info, UserPlus } from 'lucide-react'
import { IMAGES } from '../../utils/constants'
import CtaBand from '../../components/common/CtaBand'

const BENEFITS = [
  {
    icon: ListPlus,
    title: 'List your harvest',
    desc: 'Create produce listings with a name, category, price, unit, current stock and an optional photo.',
  },
  {
    icon: Eye,
    title: 'Be discoverable',
    desc: 'Active listings appear in the public marketplace feed that every buyer can browse and search.',
  },
  {
    icon: MessagesSquare,
    title: 'Hear from buyers',
    desc: 'Enquiries and purchase requests arrive in your dashboard — you stay in control of the conversation.',
  },
]

const STEPS = [
  {
    title: 'Create your account',
    desc: 'Sign up through the existing form and choose the Farmer role.',
  },
  {
    title: 'Set up your profile',
    desc: 'Your name and email are verified at signup — the profile page is your account baseline.',
  },
  {
    title: 'Post your first listing',
    desc: 'Add produce details and a photo; manage stock and listings from your dashboard.',
  },
]

export default function StartSelling({ user, onOpenAuth = () => {}, onNavigate = () => {} }) {
  /* anonymous context reveals the inline conversion panel after the first
     Get Started click — the button always opens the real signup modal */
  const [shown, setShown] = useState(false)
  const authOpenSignup = () => onOpenAuth({ tab: 'signup', role: 'Farmer' })

  return (
    <div className="mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 lg:px-8">
      {/* ------------------------------ hero ------------------------------ */}
      <section className="grid items-center gap-8 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">For farmers</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
            Start Selling with AgriLink
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-4">
            List your produce, show the details buyers care about, and let buyers come to you
            through the marketplace.
          </p>

          {user && user.role === 'Farmer' ? (
            <button
              type="button"
              onClick={() => onNavigate('farmer/dashboard')}
              className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-white shadow-lift transition-all hover:bg-primary-dark active:scale-[0.98]"
            >
              Go to your farmer dashboard <ArrowRight size={16} aria-hidden="true" />
            </button>
          ) : (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  authOpenSignup()
                  setShown(true)
                }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-white shadow-lift transition-all hover:bg-primary-dark active:scale-[0.98]"
              >
                Get Started <ArrowRight size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth({ tab: 'login' })}
                className="inline-flex h-12 items-center justify-center rounded-xl border border-line px-6 text-sm font-semibold text-ink-3 transition-colors hover:bg-soft"
              >
                I already have an account — Log in
              </button>
            </div>
          )}
        </div>
        <img
          src={IMAGES.heroCover}
          alt="Farmland rows at golden hour"
          loading="lazy"
          className="h-44 w-full rounded-3xl object-cover ring-1 ring-line/70 sm:h-52 lg:h-56"
        />
      </section>

      {/* ------------------------- role-aware notice ------------------------ */}
      {user && user.role === 'Buyer' && (
        <div
          role="note"
          className="mt-6 flex items-start gap-3 rounded-2xl border border-brand/20 bg-primary-soft px-5 py-4"
        >
          <Info size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-brand-deep" />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-brand-deep">You're browsing as a buyer.</p>
            <p className="mt-1 text-[13px] leading-relaxed text-brand-deep/90">
              Buyer and Farmer accounts are separate on AgriLink — your current account stays a
              buyer account. To sell, create a farmer account with a different email; your role is
              never changed silently.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={authOpenSignup}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                <UserPlus size={14} aria-hidden="true" /> Create a farmer account
              </button>
              <button
                type="button"
                onClick={() => onNavigate('buyer/dashboard')}
                className="inline-flex h-9 items-center rounded-lg border border-brand/25 px-3.5 text-[13px] font-semibold text-brand-deep transition-colors hover:bg-paper/60"
              >
                Go to Buyer Hub
              </button>
            </div>
          </div>
        </div>
      )}
      {/* anonymous users get the same explanation surfaced after clicking Get
          Started — the signup modal itself is open at that point */}
      {!user && shown && (
        <div
          role="note"
          className="mt-6 flex items-start gap-3 rounded-2xl border border-line/80 bg-paper-soft px-5 py-4"
        >
          <Sprout size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-brand" />
          <p className="text-[13px] leading-relaxed text-ink-4">
            The signup form is open with the Farmer role preselected — fill in your details there.
            Accounts are role-specific, so you can always add a farmer later with a different
            email.
          </p>
        </div>
      )}

      {/* ----------------------------- benefits ----------------------------- */}
      <section aria-labelledby="sell-benefits" className="mt-10">
        <h2 id="sell-benefits" className="font-display text-xl font-bold text-ink">
          What your farmer account gives you
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {BENEFITS.map((b) => (
            <article key={b.title} className="rounded-2xl border border-line/80 bg-paper p-5 shadow-sm">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-brand-deep">
                <b.icon size={18} aria-hidden="true" />
              </span>
              <h3 className="mt-3 text-[15px] font-semibold text-ink">{b.title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">{b.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* --------------------------- getting started ------------------------- */}
      <section aria-labelledby="sell-steps" className="mt-10">
        <h2 id="sell-steps" className="font-display text-xl font-bold text-ink">
          Getting started
        </h2>
        <ol className="mt-4 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-line/80 bg-paper p-5 shadow-sm">
              <span
                aria-hidden="true"
                className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-[13px] font-bold text-neutral-900"
              >
                {i + 1}
              </span>
              <h3 className="mt-2.5 text-[15px] font-semibold text-ink">{s.title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">{s.desc}</p>
            </li>
          ))}
        </ol>
        <a
          href="#/how-it-works"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-deep"
        >
          More detail in How AgriLink Works <ArrowRight size={15} aria-hidden="true" />
        </a>
      </section>

      {/* ----------------------------- CTAs -------------------------------- */}
      <div className="mt-12">
        <CtaBand
          title="Need a hand getting started?"
          subtitle="The team can answer questions about selling — and existing users can sign in at any time."
          actions={[
            { label: 'Contact Us', href: '#/contact' },
            {
              label: user ? 'Back to the marketplace' : 'Log in',
              variant: 'outline',
              href: user ? '#/' : undefined,
              onClick: user ? undefined : () => onOpenAuth({ tab: 'login' }),
            },
          ]}
        />
      </div>
    </div>
  )
}
