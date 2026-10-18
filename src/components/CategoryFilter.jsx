import { LayoutGrid, Wheat, Carrot, Tractor } from 'lucide-react'

/* Pill style catalog for each category state */
const PILL_STYLES = {
  active:
    'border-primary bg-primary text-white shadow-lift hover:bg-primary-dark',
  inactive:
    'border-neutral-200/90 bg-white text-neutral-600 shadow-sm hover:border-primary/40 hover:text-primary-dark',
}

const ICONS = {
  All: LayoutGrid,
  Grains: Wheat,
  'Fruits & Veg': Carrot,
  Livestock: Tractor,
}

/**
 * Category filter pills — horizontally scrollable on mobile, wrapped on desktop.
 */
export default function CategoryFilter({ active, onChange, counts }) {
  return (
    <div
      role="tablist"
      aria-label="Filter produce by category"
      className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
    >
      {Object.keys(ICONS).map((cat) => {
        const Icon = ICONS[cat]
        const isActive = active === cat
        const count = counts[cat] ?? 0
        return (
          <button
            key={cat}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(cat)}
            className={`flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-all duration-200 ${
              PILL_STYLES[isActive ? 'active' : 'inactive']
            }`}
          >
            <Icon size={15} aria-hidden="true" />
            {cat}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                isActive ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-500'
              }`}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
