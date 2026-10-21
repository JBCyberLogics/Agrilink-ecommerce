/**
 * HowItWorks (AGRILINK-PUBLIC-PAGES-001) — route #/how-it-works.
 * Steps describe only what the app actually does today; the trust section
 * states what's real and avoids promising unimplemented capabilities
 * (no verified sellers, guaranteed prices, payment or delivery claims).
 */
import { UserPlus, UserRound, Package, MessageSquare, Search, Scale, Sprout, ShoppingBag } from 'lucide-react'
import CtaBand from '../../components/common/CtaBand'

const FARMER_STEPS = [
  {
    icon: UserPlus,
    title: 'Create an account and choose the Farmer role',
    desc: 'The role unlocks your farmer dashboard at #/farmer.',
  },
  {
    icon: UserRound,
    title: 'Set up your farmer profile',
    desc: 'Your name and email are verified at signup; the profile page keeps your account details at a glance.',
  },
  {
    icon: Package,
    title: 'Create and manage produce listings',
    desc: 'Add produce with a name, category, price, unit, stock and an optional photo — then update stock or remove listings anytime.',
  },
  {
    icon: MessageSquare,
    title: 'Review buyer enquiries',
    desc: 'Enquiries and purchase requests from buyers land in your dashboard as real records.',
  },
]

const BUYER_STEPS = [
  {
    icon: UserPlus,
    title: 'Create an account and choose the Buyer role',
    desc: 'The role unlocks saved listings, requests and your buyer dashboard at #/buyer.',
  },
  {
    icon: Search,
    title: 'Browse or search available produce',
    desc: 'The marketplace feed is built from the live listings farmers have posted — not sample data.',
  },
  {
    icon: Scale,
    title: 'Compare available listing information',
    desc: 'Listings show price, unit and stock so you can weigh your options before reaching out.',
  },
  {
    icon: MessageSquare,
    title: 'Contact sellers directly',
    desc: 'Send an enquiry or a purchase request on a listing; sellers see them in their dashboard.',
  },
]

const TRUST_CARDS = [
  {
    title: 'Real produce from real farms',
    desc: 'The public feed is database-backed: what a farmer posts is what you browse. We show an honest empty state when nothing matches.',
  },
  {
    title: 'Clear listing information',
    desc: 'Every listing states its produce, price, unit and stock up front, so decisions are made on comparable facts.',
  },
  {
    title: 'Transparency over promises',
    desc: 'Where a capability or data source doesn\u2019t exist yet — like market-price benchmarks — the app says so instead of faking it.',
  },
]

function StepCard({ index, icon: Icon, title, desc }) {
  return (
    <li className="flex items-start gap-4 rounded-2xl border border-line/80 bg-paper p-5 shadow-sm">
      <span className="relative shrink-0">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-brand-deep">
          <Icon size={19} aria-hidden="true" />
        </span>
        <span
          aria-hidden="true"
          className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-secondary text-[11px] font-bold text-neutral-900 ring-2 ring-white"
        >
          {index}
        </span>
      </span>
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-[13px] leading-relaxed text-muted">{desc}</p>
      </div>
    </li>
  )
}

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 lg:px-8">
      {/* ------------------------------ hero ------------------------------ */}
      <section className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">The process</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">How AgriLink Works</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-4">
          AgriLink is a direct marketplace: farmers list their produce, buyers browse and reach
          them — no middlemen between the farm and the enquiry.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#/start-selling"
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-lift transition-all hover:bg-primary-dark active:scale-[0.98]"
          >
            Start Selling
          </a>
          <a
            href="#/"
            className="inline-flex h-11 items-center justify-center rounded-full border border-line px-6 text-sm font-semibold text-ink-3 transition-colors hover:bg-soft"
          >
            Find Produce
          </a>
        </div>
      </section>

      {/* --------------------------- for farmers --------------------------- */}
      <section aria-labelledby="how-farmers" className="mt-12">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-brand-deep">
            <Sprout size={17} aria-hidden="true" />
          </span>
          <h2 id="how-farmers" className="font-display text-xl font-bold text-ink">
            For Farmers
          </h2>
        </div>
        <ol className="mt-4 grid gap-4 md:grid-cols-2">
          {FARMER_STEPS.map((s, i) => (
            <StepCard key={s.title} index={i + 1} icon={s.icon} title={s.title} desc={s.desc} />
          ))}
        </ol>
      </section>

      {/* --------------------------- for buyers ---------------------------- */}
      <section aria-labelledby="how-buyers" className="mt-10">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-secondary/40 text-ink-2">
            <ShoppingBag size={17} aria-hidden="true" />
          </span>
          <h2 id="how-buyers" className="font-display text-xl font-bold text-ink">
            For Buyers
          </h2>
        </div>
        <ol className="mt-4 grid gap-4 md:grid-cols-2">
          {BUYER_STEPS.map((s, i) => (
            <StepCard key={s.title} index={i + 1} icon={s.icon} title={s.title} desc={s.desc} />
          ))}
        </ol>
      </section>

      {/* ---------------------- trust & transparency ----------------------- */}
      <section aria-labelledby="how-trust" className="mt-12">
        <h2 id="how-trust" className="font-display text-xl font-bold text-ink">
          Trust and transparency
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
          What AgriLink commits to today — and where it honestly stops.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {TRUST_CARDS.map((c) => (
            <article key={c.title} className="rounded-2xl border border-line/80 bg-paper p-5 shadow-sm">
              <h3 className="text-[15px] font-semibold text-ink">{c.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{c.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ----------------------------- CTAs ------------------------------- */}
      <div className="mt-12">
        <CtaBand
          title="Ready to get involved?"
          subtitle="Everything above runs today in the app — the next step is yours."
          actions={[
            { label: 'Start Selling', href: '#/start-selling' },
            { label: 'Find Produce', href: '#/', variant: 'outline' },
            { label: 'Contact Us', href: '#/contact', variant: 'outline' },
          ]}
        />
      </div>
    </div>
  )
}
