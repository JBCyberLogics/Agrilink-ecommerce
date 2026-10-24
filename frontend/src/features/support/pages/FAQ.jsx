/**
 * FAQ page (#/faq) — public help center for the marketplace
 * (task AGRILINK-FAQ-GLOBAL-THEME-001).
 *
 * • Centered container: compact intro + accessible search + category chips
 *   + expandable question cards + "still need help" support section.
 * • Accordion: native <button> triggers with aria-expanded/aria-controls,
 *   region panels with role="region" + aria-labelledby, and a button id so
 *   the relationship is programmatically complete. Multiple answers may
 *   stay open; Enter/Space work (native button activation); expansion
 *   animates subtly and respects prefers-reduced-motion.
 * • Search scans question + answer text, combines with the selected
 *   category, updates live, and offers a clear action with an honest empty
 *   state. All client-side — no backend involved.
 * • Theming: every element reads the shared theme tokens from
 *   styles/index.css, so the page carries no theme state of its own.
 * • Links hit real hash routes (#/contact, #/start-selling, #/how-it-works).
 */
import { useMemo, useState } from 'react'
import {
  Search,
  Sprout,
  ChevronDown,
  SearchX,
  RotateCcw,
  MessageCircleQuestion,
  ArrowRight,
  ShoppingBag,
  ShoppingCart,
  Tractor,
  BookOpen,
  Headset,
  Wheat,
} from 'lucide-react'
import { FAQ_CATEGORIES, FAQ_ITEMS } from './faqContent'

const ALL_QUESTIONS = FAQ_CATEGORIES[0]

/* Icon per category chip (existing icon library, no emoji) */
const CATEGORY_ICONS = {
  'All Questions': Sprout,
  'Getting Started': BookOpen,
  'Farmer Accounts': Tractor,
  'Buyer Accounts': ShoppingBag,
  'Produce Listings': Wheat,
  'Cart and Checkout': ShoppingCart,
  'Account and Security': Headset,
}

const slug = (s) => s.replace(/[^a-zA-Z0-9]+/g, '-')

export default function FAQ() {
  const [category, setCategory] = useState(ALL_QUESTIONS)
  const [query, setQuery] = useState('')
  const [openIds, setOpenIds] = useState(() => new Set())

  const q = query.trim().toLowerCase()

  /* category ∩ search, live as the user types */
  const visible = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      if (category !== ALL_QUESTIONS && item.category !== category) return false
      if (!q) return true
      return item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
    })
  }, [category, q])

  const toggleOpen = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const clearAll = () => {
    setQuery('')
    setCategory(ALL_QUESTIONS)
  }
  const filtersActive = category !== ALL_QUESTIONS || q !== ''

  return (
    <div className="mx-auto min-h-[calc(100vh-72px)] max-w-3xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14 lg:px-8">
      {/* ---------------------------- introduction ---------------------------- */}
      <header className="text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <MessageCircleQuestion size={22} aria-hidden="true" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Frequently Asked Questions
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-[15px] leading-relaxed text-muted">
          Quick answers for farmers and buyers using AgriLink — how accounts, listings,
          enquiries, the cart and checkout work today.
        </p>
      </header>

      {/* ------------------------------- search ------------------------------ */}
      <div className="mt-7">
        <label htmlFor="faq-search" className="mb-1.5 block text-[13px] font-semibold text-ink-3">
          Search the FAQ
        </label>
        <div className="relative">
          <Search
            size={17}
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-2"
          />
          <input
            id="faq-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. cart, listing, account…"
            aria-label="Search frequently asked questions"
            className="h-12 w-full rounded-xl border border-line bg-paper text-sm text-ink shadow-sm outline-none transition-colors placeholder:text-muted-2 focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-muted-2 transition-colors hover:bg-soft hover:text-ink-4"
            >
              <span aria-hidden="true" className="text-base leading-none">&times;</span>
            </button>
          )}
        </div>
      </div>

      {/* ------------------------- category navigation ------------------------ */}
      <div
        role="group"
        aria-label="Filter questions by category"
        className="scrollbar-none mt-4 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
      >
        {FAQ_CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICONS[cat] ?? Sprout
          const active = category === cat
          return (
            <button
              key={cat}
              type="button"
              aria-pressed={active}
              onClick={() => setCategory(cat)}
              className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold transition-all duration-200 motion-reduce:transition-none ${
                active
                  ? 'border-brand bg-brand text-white shadow-soft hover:bg-brand-deep'
                  : 'border-line bg-paper text-ink-4 hover:border-brand/40 hover:text-brand'
              }`}
            >
              <Icon size={14} aria-hidden="true" className={active ? 'text-white' : 'text-muted-2'} />
              {cat}
            </button>
          )
        })}
      </div>

      {/* ------------------------------ results ------------------------------ */}
      <p className="mt-5 text-xs font-medium text-muted" aria-live="polite">
        {visible.length} question{visible.length === 1 ? '' : 's'}
        {filtersActive ? ' matching your filters' : ''}
      </p>

      {/* --------------------------- FAQ accordion ---------------------------- */}
      {visible.length === 0 ? (
        <div className="mt-3 flex flex-col items-center rounded-2xl border border-dashed border-line-strong bg-paper px-6 py-14 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-soft text-muted-2">
            <SearchX size={26} aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-display text-lg font-bold text-ink">No matching questions</h2>
          <p className="mt-1 max-w-sm text-sm text-muted">
            No FAQ entry matches your current search and category. Try different keywords or
            clear the filters — or reach the team directly from the Contact page.
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-deep"
          >
            <RotateCcw size={14} aria-hidden="true" /> Clear search and filters
          </button>
        </div>
      ) : (
        <ul className="mt-3 space-y-3">
          {visible.map((item) => {
            const open = openIds.has(item.question)
            const buttonId = `faq-trigger-${slug(item.question)}`
            const panelId = `faq-panel-${slug(item.question)}`
            return (
              <li
                key={item.question}
                className="overflow-hidden rounded-2xl border border-line bg-paper shadow-soft transition-colors hover:border-brand/30"
              >
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => toggleOpen(item.question)}
                  onKeyDown={(e) => {
                    /* explicit Enter/Space activation (single-fire: the
                       preventDefault suppresses the browser's native
                       button activation path so it never double-toggles;
                       native <button> semantics remain for other keys) */
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggleOpen(item.question)
                    }
                  }}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left sm:px-5"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-deep">
                      {item.category}
                    </span>
                    <span className="mt-0.5 block text-[15px] font-semibold leading-snug text-ink">
                      {item.question}
                    </span>
                  </span>
                  <ChevronDown
                    size={18}
                    aria-hidden="true"
                    className={`shrink-0 text-muted-2 transition-transform duration-200 motion-reduce:transition-none ${
                      open ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {/* grid-rows animation — collapses to 0 without measuring
                    heights; content is dropped from the accessibility tree
                    while closed (aria-hidden) */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  aria-hidden={!open}
                  className="grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none"
                  style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="border-t border-line px-4 py-4 text-[14px] leading-relaxed text-ink-4 sm:px-5">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {/* --------------------------- still need help --------------------------- */}
      <section
        aria-labelledby="faq-help-title"
        className="mt-10 overflow-hidden rounded-2xl border border-line bg-paper shadow-soft"
      >
        <div className="bg-brand-soft px-5 py-6 text-center sm:px-8">
          <h2 id="faq-help-title" className="font-display text-lg font-bold text-ink sm:text-xl">
            Still need help?
          </h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-ink-4">
            Can&apos;t find an answer above? Send your question through the Contact page, learn how the
            marketplace works step by step, or start selling as a farmer.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#/contact"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-deep"
            >
              Contact Us <ArrowRight size={15} aria-hidden="true" />
            </a>
            <a
              href="#/start-selling"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-paper px-5 text-sm font-semibold text-ink transition-colors hover:border-brand/40 hover:text-brand"
            >
              <Tractor size={15} aria-hidden="true" /> Start Selling
            </a>
            <a
              href="#/how-it-works"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-paper px-5 text-sm font-semibold text-ink transition-colors hover:border-brand/40 hover:text-brand"
            >
              <BookOpen size={15} aria-hidden="true" /> How It Works
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
