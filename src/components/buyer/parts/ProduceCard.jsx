/**
 * ProduceCard — one REAL marketplace listing as the buyer sees it in the
 * dashboard (Browse / Saved). Data comes from /api/market/listings or
 * /api/buyer/saved — never invented. Availability text comes from the real
 * stock number; a photo-less listing renders a category-icon placeholder,
 * never a borrowed stock photo.
 */
import { MapPin, Heart, MessageSquarePlus, Wheat, Carrot, Tractor } from 'lucide-react'
import { kes, fmtDate } from '../../../utils/format'

const CATEGORY_ART = {
  Grains: Wheat,
  'Fruits & Veg': Carrot,
  Livestock: Tractor,
}

export default function ProduceCard({ listing, saved = false, saveBusy = false, onToggleSave, onRequest }) {
  const out = listing.stock <= 0
  const Icon = CATEGORY_ART[listing.category] ?? Wheat

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-farmer-line bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      {/* ------------------------------ image ------------------------------ */}
      <div className="relative h-40 overflow-hidden bg-farmer-surface/60">
        {listing.imageUrl ? (
          <img
            src={listing.imageUrl}
            alt={listing.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
          />
        ) : (
          <span className="grid h-full w-full place-items-center text-farmer-primary/50">
            <Icon size={40} aria-hidden="true" />
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-farmer-primary shadow-glass backdrop-blur">
          {listing.category}
        </span>

        {/* save — server-persisted wish list, keyboard operable */}
        <button
          type="button"
          onClick={() => onToggleSave(listing)}
          disabled={saveBusy}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${listing.name} from saved produce` : `Save ${listing.name}`}
          className={`absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full shadow-glass backdrop-blur transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-farmer-primary/40 ${
            saved ? 'bg-white text-farmer-danger' : saveBusy ? 'bg-white/70 text-farmer-muted' : 'bg-white/95 text-farmer-muted hover:text-farmer-danger'
          }`}
        >
          <Heart size={16} aria-hidden="true" className={saved ? 'fill-current' : ''} />
        </button>
      </div>

      {/* ----------------------------- content ----------------------------- */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-[15px] font-bold leading-tight text-farmer-ink">{listing.name}</h3>
        </div>

        <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-farmer-muted">
          {listing.farmer && <span className="font-medium text-farmer-ink/80">{listing.farmer}</span>}
          {listing.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin size={11} aria-hidden="true" className="shrink-0" />
              {listing.location}
            </span>
          )}
          <span aria-hidden="true">·</span>
          <span>Listed {fmtDate(listing.createdAt)}</span>
        </p>

        {/* stock reality — text, never color-only; sold-out cannot be requested */}
        <p className="mt-2 text-xs font-medium">
          {out ? (
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-farmer-muted">Sold out</span>
          ) : listing.stock <= 50 ? (
            <span className="rounded-full bg-secondary-soft px-2 py-0.5 font-bold text-secondary-dark">
              Only {listing.stock.toLocaleString('en-KE')} {listing.unit} left
            </span>
          ) : (
            <span className="text-farmer-muted">
              {listing.stock.toLocaleString('en-KE')} {listing.unit} available
            </span>
          )}
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <p className="font-display text-lg font-bold text-farmer-primary">
            {kes(listing.price)}
            <span className="ml-1 text-xs font-medium text-farmer-muted">/ {String(listing.unit).split(' ')[0]}</span>
          </p>
          <div className="flex items-center gap-2">
            {onRequest && (
              <button
                type="button"
                onClick={() => onRequest(listing)}
                disabled={out}
                aria-label={`Send a purchase request for ${listing.name}`}
                className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold transition-all ${
                  out
                    ? 'cursor-not-allowed bg-neutral-100 text-farmer-muted'
                    : 'bg-farmer-primary text-white hover:bg-farmer-primary-hover active:scale-95'
                }`}
              >
                <MessageSquarePlus size={14} aria-hidden="true" /> Request
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
