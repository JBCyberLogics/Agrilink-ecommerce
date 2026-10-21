/**
 * About (AGRILINK-PUBLIC-PAGES-001) — route #/about.
 * Mission, purpose and the two groups AgriLink serves. No invented
 * history, founders, statistics, awards, partnerships or testimonials —
 * only the product's actual intent.
 */
import { Sprout, ShoppingBag, ListPlus, Eye, MessagesSquare } from 'lucide-react'
import CtaBand from '../../components/common/CtaBand'

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 lg:px-8">
      {/* ------------------------------ intro ------------------------------ */}
      <section className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Our story in progress</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-neutral-900 sm:text-4xl">About AgriLink</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
          AgriLink is a digital marketplace built to connect small-scale farmers with produce
          buyers — a place where a harvest can be listed, found and discussed without layers of
          middlemen in between.
        </p>
      </section>

      {/* ------------------------- problem & purpose ------------------------ */}
      <section className="mt-10 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-[15px] font-semibold text-neutral-900">The problem we work on</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">
            For small-scale farmers, reaching buyers beyond their immediate area can be difficult,
            and for buyers, discovering who is actually selling what is equally hard. The market
            connection — not the produce itself — is often the missing piece.
          </p>
        </article>
        <article className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-[15px] font-semibold text-neutral-900">What a marketplace provides</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">
            AgriLink aims to make that connection simpler: a shared place where listings are easy
            to create, produce is easy to discover and compare, and buyer-seller
            communication is direct through enquiries and purchase requests.
          </p>
        </article>
      </section>

      {/* --------------------------- mission/vision ------------------------- */}
      <section className="mt-4 grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-6 text-white shadow-lift sm:p-8">
          <h2 className="font-display text-lg font-bold">Our mission</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/85">
            Make it simple for farmers to list produce and for buyers to find and reach them —
            fair, direct and clear about the facts of every listing.
          </p>
        </article>
        <article className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="font-display text-lg font-bold text-neutral-900">Our vision</h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500">
            A market where any small-scale farmer can reach potential buyers directly, fully
            online — across Kenya and beyond, from the phone in their pocket.
          </p>
        </article>
      </section>

      {/* --------------------------- who we serve --------------------------- */}
      <section aria-labelledby="serves" className="mt-10">
        <h2 id="serves" className="text-center font-display text-xl font-bold text-neutral-900">
          Who AgriLink serves
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary-dark">
                <Sprout size={18} aria-hidden="true" />
              </span>
              <h3 className="text-[15px] font-semibold text-neutral-900">Farmers & sellers</h3>
            </div>
            <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-neutral-500">
              <li className="flex items-start gap-2">
                <ListPlus size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-primary" />
                List produce with photos, prices, units and current stock.
              </li>
              <li className="flex items-start gap-2">
                <Eye size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-primary" />
                Appear in a public feed that stays honest: only active listings are shown.
              </li>
              <li className="flex items-start gap-2">
                <MessagesSquare size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-primary" />
                Hear from buyers through enquiries and purchase requests.
              </li>
            </ul>
            <a
              href="#/start-selling"
              className="mt-4 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-lift transition-all hover:bg-primary-dark active:scale-[0.98]"
            >
              Start selling
            </a>
          </article>

          <article className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary/40 text-neutral-800">
                <ShoppingBag size={18} aria-hidden="true" />
              </span>
              <h3 className="text-[15px] font-semibold text-neutral-900">Buyers</h3>
            </div>
            <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-neutral-500">
              <li className="flex items-start gap-2">
                <ListPlus size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-primary" />
                Browse and search live produce across categories.
              </li>
              <li className="flex items-start gap-2">
                <Eye size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-primary" />
                Compare listing facts — price, unit, stock — before committing.
              </li>
              <li className="flex items-start gap-2">
                <MessagesSquare size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-primary" />
                Contact sellers directly and keep a record of your requests.
              </li>
            </ul>
            <a
              href="#/"
              className="mt-4 inline-flex h-10 items-center rounded-full border border-neutral-200 px-5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100"
            >
              Find produce
            </a>
          </article>
        </div>
      </section>

      {/* ----------------------------- CTAs -------------------------------- */}
      <div className="mt-12">
        <CtaBand
          title="AgriLink grows with its farmers and buyers"
          subtitle="Create a free account, explore the marketplace, or reach the team with any question."
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
