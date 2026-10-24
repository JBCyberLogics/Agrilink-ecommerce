import { useEffect, useRef, useState } from 'react'
import { SearchX, Sprout, RefreshCw } from 'lucide-react'
import { CATEGORY_FILTERS } from '../../../constants/index.js'
import { marketListings } from '../services/marketplaceService'
import CategoryFilter from './CategoryFilter'
import ProductCard from './ProductCard'

/* Shape the public API rows into what ProductCard renders — the feed is
   real production data (what farmers post is what buyers see). */
const toCard = (l) => ({
  id: l.id,
  name: l.name,
  category: l.category,
  price: l.price,
  unit: l.unit,
  stock: l.stock,
  image: l.imageUrl,
  farmer: l.farmer || 'Agrilink farmer',
  location: l.location || '',
})

export default function Marketplace({ search, onClearSearch, onAddToCart }) {
  const [feed, setFeed] = useState(null) // null = loading · [] = empty · array = live data
  const [dead, setDead] = useState(false) // API unreachable
  const [category, setCategory] = useState('All')
  const gridRef = useRef(null)

  const load = () => {
    setFeed(null)
    setDead(false)
    marketListings()
      .then((d) => setFeed((d.listings || []).map(toCard)))
      .catch(() => setDead(true))
  }

  /* the feed is refetched every time the shop mounts (route change):
     a listing a farmer posts moments ago is instantly visible to buyers */
  useEffect(load, [])

  const products = feed || []

  const filtered = products.filter((p) => {
    const inCategory = category === 'All' || p.category === category
    const q = search.trim().toLowerCase()
    const matches =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.farmer.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q)
    return inCategory && matches
  })

  /* keep counts per category (unfiltered by search): badges on pills */
  const counts = Object.fromEntries(
    CATEGORY_FILTERS.map((c) => [
      c,
      c === 'All' ? products.length : products.filter((p) => p.category === c).length,
    ]),
  )

  /* ---------- product card mount animation stagger ---------- */
  useEffect(() => {
    if (!gridRef.current) return
    Array.from(gridRef.current.children).forEach((el, i) => {
      el.style.animationDelay = `${Math.min(i * 60, 420)}ms`
    })
  }, [filtered])

  return (
    <section id="marketplace" className="mx-auto max-w-7xl scroll-mt-28 px-4 pb-8 pt-10 sm:px-6 lg:px-8">
      {/* ---------------- header row ---------------- */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand">
            <Sprout size={14} aria-hidden="true" />
            Farm fresh — no middlemen
          </p>
          <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-ink sm:text-[28px]">
            Today&apos;s Marketplace
          </h2>
          {search && (
            <p className="mt-1 text-sm text-muted" aria-live="polite">
              Showing results for{' '}
              <span className="font-semibold text-ink-2">“{search}”</span> —{' '}
              <button onClick={onClearSearch} className="font-semibold text-brand hover:text-brand-deep">
                clear
              </button>
            </p>
          )}
        </div>
        {!feed && <p className="text-sm text-muted-2" aria-live="polite">Loading the market…</p>}
        {feed && (
          <p className="text-sm text-muted-2" aria-live="polite">
            <span className="font-bold text-ink-3">{filtered.length}</span> of {products.length} listings
          </p>
        )}
      </div>

      {/* ---------------- category pills ---------------- */}
      <CategoryFilter active={category} onChange={setCategory} counts={counts} />

      {/* ---------------- product grid / states ---------------- */}
      {!feed ? (
        /* loading; a quiet skeleton keeps the layout stable */
        <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <li key={i} className="animate-pulse overflow-hidden rounded-2xl border border-line bg-paper">
              <div className="h-44 bg-soft" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-3/4 rounded bg-soft" />
                <div className="h-3 w-1/2 rounded bg-soft" />
                <div className="flex items-center justify-between pt-2">
                  <div className="h-5 w-20 rounded bg-soft" />
                  <div className="h-10 w-24 rounded-xl bg-soft" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : dead ? (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-line-strong bg-paper/60 px-6 py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-danger-wash text-danger">
            <SearchX size={26} aria-hidden="true" />
          </span>
          <h3 className="mt-4 font-display text-lg font-bold text-ink">Marketplace is unavailable</h3>
          <p className="mt-1 max-w-sm text-sm text-muted">
            The market feed could not be reached — check your connection and try again.
          </p>
          <button
            type="button"
            onClick={load}
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-dark"
          >
            <RefreshCw size={14} aria-hidden="true" /> Retry
          </button>
        </div>
      ) : filtered.length > 0 ? (
        <ul
          ref={gridRef}
          className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filtered.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} onAddToCart={onAddToCart} />
            </li>
          ))}
        </ul>
      ) : products.length === 0 ? (
        /* honest empty market: no farmer has posted anything yet */
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-line-strong bg-paper/60 px-6 py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-brand">
            <Sprout size={26} aria-hidden="true" />
          </span>
          <h3 className="mt-4 font-display text-lg font-bold text-ink">No produce listed yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Farmers are still resting their harvests — everything they post on Agrilink appears here the moment
            it is listed.
          </p>
        </div>
      ) : (
        /* filtered empty state */
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-line-strong bg-paper/60 px-6 py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-soft text-muted-2">
            <SearchX size={26} aria-hidden="true" />
          </span>
          <h3 className="mt-4 font-display text-lg font-bold text-ink">No produce found</h3>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Try a different search term or category filter — new harvests are listed every day.
          </p>
          <button
            type="button"
            onClick={() => {
              setCategory('All')
              onClearSearch()
            }}
            className="mt-5 h-10 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-dark"
          >
            Reset filters
          </button>
        </div>
      )}
    </section>
  )
}
