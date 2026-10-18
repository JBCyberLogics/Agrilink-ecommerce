import { useState } from 'react'
import { MapPin, BadgeCheck, ShoppingCart, Check, Wheat, Carrot, Tractor } from 'lucide-react'
import { kes } from '../utils/format'

const LOW_STOCK = 50

/* honest placeholder art per category when a listing has no photo yet */
const CATEGORY_ART = {
  Grains: Wheat,
  'Fruits & Veg': Carrot,
  Livestock: Tractor,
}

export default function ProductCard({ product, onAddToCart }) {
  const [added, setAdded] = useState(false)
  const low = product.stock > 0 && product.stock <= LOW_STOCK
  const out = product.stock === 0
  const Icon = CATEGORY_ART[product.category] ?? Wheat

  const handleAdd = () => {
    onAddToCart(product)
    setAdded(true)
  }

  return (
    <article className="group relative flex animate-fade-up flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      {/* ------------------------------ image ------------------------------ */}
      <div className="relative h-44 overflow-hidden bg-primary-soft/60">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
          />
        ) : (
          /* no photo on this listing yet — neutral icon block, never a
             borrowed "similar-looking" stock photo */
          <span className="grid h-full w-full place-items-center text-primary/60">
            <Icon size={44} aria-hidden="true" />
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/35 via-transparent to-neutral-900/5" />

        {/* left chip: stock reality only — In stock stays clean, warnings labelled */}
        {out && (
          <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-neutral-900/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-glass backdrop-blur">
            Sold out
          </span>
        )}
        {low && !out && (
          <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-secondary/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-neutral-900 shadow-glass backdrop-blur">
            Low stock
          </span>
        )}

        {/* right chip: category */}
        <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-dark shadow-glass backdrop-blur">
          {product.category}
        </span>

        {/* bottom chip: real farmer identity */}
        <span className="absolute bottom-3 left-3 inline-flex max-w-[85%] items-center gap-1.5 rounded-full bg-neutral-900/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
          <MapPin size={11} aria-hidden="true" className="shrink-0 text-secondary" />
          <span className="truncate">
            {product.farmer}
            {product.location ? ` • ${product.location}` : ''}
          </span>
        </span>
      </div>

      {/* ------------------------------ content ------------------------------ */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-[15px] font-bold leading-tight text-neutral-900">
          {product.name}
        </h3>

        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-neutral-500">
          {product.farmer}
          <BadgeCheck size={14} aria-label="Verified farmer" className="shrink-0 text-primary" />
          {product.location && (
            <>
              <span className="text-neutral-300">|</span>
              {product.location}
            </>
          )}
          {low && (
            <span className="ml-1 rounded-full bg-secondary-soft px-2 py-0.5 text-[10px] font-bold text-secondary-dark">
              {product.stock.toLocaleString('en-KE')} {product.unit} left
            </span>
          )}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2 pt-1">
          <p className="font-display text-lg font-bold text-primary-dark">
            {kes(product.price)}
            <span className="ml-1 text-xs font-medium text-neutral-400">/ {product.unit.split(' ')[0]}</span>
          </p>

          {/* Add to Cart — swapped label/icon confirms the action; sold-out rows
              keep their card but the action explains itself */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={out}
            aria-label={`Add ${product.name} to cart`}
            className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold text-white transition-all duration-200 ${
              out
                ? 'cursor-not-allowed bg-neutral-300'
                : added
                  ? 'bg-primary-light shadow-soft active:scale-95'
                  : 'bg-primary shadow-lift hover:bg-primary-dark active:scale-95'
            }`}
          >
            {out ? (
              'Sold out'
            ) : added ? (
              <>
                <Check size={16} aria-hidden="true" className="animate-pop" />
                Added
              </>
            ) : (
              <>
                <ShoppingCart size={15} aria-hidden="true" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>

      {/* added tick overlay (bottom border flash) */}
      {added && <span className="absolute inset-x-0 bottom-0 h-1 animate-pop bg-secondary" />}
    </article>
  )
}
