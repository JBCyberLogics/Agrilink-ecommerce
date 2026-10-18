import { useState } from 'react'
import { MapPin, BadgeCheck, ShoppingCart, Check, Star } from 'lucide-react'

const LOW_STOCK = 50

export default function ProductCard({ product, onAddToCart }) {
  const [added, setAdded] = useState(false)
  const low = product.stock <= LOW_STOCK

  const handleAdd = () => {
    onAddToCart(product)
    setAdded(true)
  }

  return (
    <article className="group relative flex animate-fade-up flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      {/* ------------------------------ image ------------------------------ */}
      <div className="relative h-44 cursor-pointer overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/35 via-transparent to-neutral-900/5" />

        {/* left chip: badge or low-stock warning */}
        {product.badge && (
          <span
            className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-glass backdrop-blur ${
              low ? 'bg-secondary/90 text-neutral-900' : 'bg-white/90 text-primary-dark'
            }`}
          >
            {product.badge}
          </span>
        )}

        {/* right chip: rating */}
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-bold text-neutral-900 shadow-glass backdrop-blur">
          <Star size={11} fill="currentColor" className="text-secondary" aria-hidden="true" />
          {product.rating}
        </span>

        {/* bottom chip: farmer identity */}
        <span className="absolute bottom-3 left-3 inline-flex max-w-[85%] items-center gap-1.5 rounded-full bg-neutral-900/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
          <MapPin size={11} aria-hidden="true" className="shrink-0 text-secondary" />
          <span className="truncate">
            {product.farmer} • {product.location}
          </span>
        </span>
      </div>

      {/* ------------------------------ content ------------------------------ */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-[15px] font-bold leading-tight text-neutral-900">
          {product.name}
        </h3>

        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-neutral-500">
          {product.farmer.replace('Farmer ', '')}
          <BadgeCheck size={14} aria-label="Verified farmer" className="shrink-0 text-primary" />
          <span className="text-neutral-300">|</span>
          {product.location}
          {low && (
            <span className="ml-1 rounded-full bg-secondary-soft px-2 py-0.5 text-[10px] font-bold text-secondary-dark">
              {product.stockLabel} left
            </span>
          )}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2 pt-1">
          <p className="font-display text-lg font-bold text-primary-dark">
            ${product.price.toFixed(2)}
            <span className="ml-1 text-xs font-medium text-neutral-400">/ {product.unit.split(' ')[0]}</span>
          </p>

          {/* Add to Cart — swapped label/icon confirms the action */}
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
            className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold text-white transition-all duration-200 active:scale-95 ${
              added ? 'bg-primary-light shadow-soft' : 'bg-primary shadow-lift hover:bg-primary-dark'
            }`}
          >
            {added ? (
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
