import { useState } from 'react'
import { Sprout, Search, ShoppingBag, Menu, X, LogOut, ChevronDown, Plus, Minus, ArrowRight } from 'lucide-react'
import { kes } from '../../utils/format'

/* Navbar logo — the official Agrilink brand artwork (logo.png).
   The source PNG is square with generous margins, so object-cover
   crops to the wordmark band at the visual center. */
function Brand() {
  return (
    <a href="#/" aria-label="Agrilink home — back to the marketplace" className="flex shrink-0 items-center">
      <img
        src="/images/logo.png"
        alt="Agrilink — Connecting Farm to Future"
        className="h-10 w-32 object-cover object-center sm:h-11 sm:w-36"
      />
    </a>
  )
}

/* Wide central search — filters the marketplace feed live */
function SearchBar({ search, onSearch, id = 'nav-search' }) {
  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className="relative w-full max-w-xl"
    >
      <Search
        size={18}
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
      />
      <input
        id={id}
        type="search"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search fresh produce, farms, counties…"
        aria-label="Search produce"
        className="h-11 w-full rounded-full border border-neutral-200/80 bg-neutral-100/70 pl-11 pr-10 text-sm text-neutral-900 shadow-sm outline-none backdrop-blur transition-all placeholder:text-neutral-400 hover:bg-neutral-100 focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/10"
      />
      {search && (
        <button
          type="button"
          onClick={() => onSearch('')}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-600"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </form>
  )
}

/* Cart with glass dropdown panel: qty steppers, remove, subtotal */
function CartButton({ cart, onQty, onRemove, count, onCheckout = () => {} }) {
  const [open, setOpen] = useState(false)
  const subtotal = cart.reduce((sum, it) => sum + it.price * it.qty, 0)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`Shopping cart, ${count} item${count === 1 ? '' : 's'}`}
        className="relative grid h-11 w-11 place-items-center rounded-xl text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-primary focus-visible:bg-neutral-100"
      >
        <ShoppingBag size={21} aria-hidden="true" />
        {/* Floating numeric badge — re-keyed every count change so the pop animation replays */}
        {count > 0 && (
          <span
            key={count}
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 grid h-[19px] min-w-[19px] animate-pop place-items-center rounded-full bg-secondary px-1 text-[10px] font-bold text-neutral-900 ring-2 ring-white"
          >
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
      )}
      {open && (
        <div className="absolute right-0 z-50 mt-3 w-80 animate-fade-up overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-glass backdrop-blur-2xl">
          {/*---------------------------- cart items ----------------------------*/}
          <div className="flex items-center justify-between border-b border-neutral-200/60 px-4 py-3">
            <p className="text-sm font-semibold text-neutral-900">Your basket</p>
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary-dark">
              {count} item{count === 1 ? '' : 's'}
            </span>
          </div>

          {cart.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-neutral-100 text-neutral-300">
                <ShoppingBag size={22} aria-hidden="true" />
              </span>
              <p className="mt-3 text-sm font-medium text-neutral-500">Your basket is empty</p>
              <p className="mt-1 text-xs text-neutral-400">Fresh produce is one click away.</p>
            </div>
          ) : (
            <ul className="max-h-64 divide-y divide-neutral-200/60 overflow-y-auto px-2">
              {cart.map((it) => (
                <li key={it.productId} className="flex items-center gap-3 px-2 py-3">
                  <img
                    src={it.image}
                    alt=""
                    loading="lazy"
                    className="h-11 w-11 shrink-0 rounded-lg bg-neutral-100 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-neutral-900">{it.name}</p>
                    <p className="text-xs text-neutral-400">
                      {kes(it.price)} / {it.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onQty(it.productId, -1)}
                      aria-label={`Decrease ${it.name} quantity`}
                      className={`grid h-7 w-7 place-items-center rounded-md border border-neutral-200 text-neutral-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500`}
                    >
                      <Minus size={12} aria-hidden="true" />
                    </button>
                    <span className="w-5 text-center text-[13px] font-semibold tabular-nums">{it.qty}</span>
                    <button
                      type="button"
                      onClick={() => onQty(it.productId, +1)}
                      aria-label={`Increase ${it.name} quantity`}
                      className="grid h-7 w-7 place-items-center rounded-md border border-neutral-200 text-neutral-500 transition-colors hover:border-primary/30 hover:bg-primary-soft hover:text-primary"
                    >
                      <Plus size={12} aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {cart.length > 0 && (
            <div className="border-t border-neutral-200/60 bg-white/50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Subtotal</span>
                <span className="font-display text-lg font-bold text-neutral-900">{kes(subtotal)}</span>
              </div>
              <button
                type="button"
                onClick={onCheckout}
                className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-lift transition-all hover:bg-primary-dark active:scale-[0.98]"
              >
                Checkout <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* Sign-in button OR the signed-in profile chip */
export function AuthArea({ user, onSignIn, onSignOut, mobile = false }) {
  if (user) {
    return (
      <div className={mobile ? 'flex items-center gap-2' : 'ml-1 flex items-center gap-2'}>
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-dark font-display text-sm font-bold text-white ${user.role === 'Farmer' ? 'ring-2 ring-secondary ring-offset-2' : ''}`}
          aria-hidden="true"
        >
          {user.name
            .split(' ')
            .map((w) => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()}
        </span>
        {!mobile && (
          <span className="hidden leading-tight xl:block">
            <span className="block max-w-[9rem] truncate text-[13px] font-semibold text-neutral-900">{user.name}</span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${user.role === 'Farmer' ? 'text-secondary-dark' : 'text-primary'}`}
            >
              {user.role}
            </span>
          </span>
        )}
        <button
          type="button"
          onClick={onSignOut}
          title="Sign out"
          aria-label="Sign out"
          className="grid h-10 w-10 place-items-center rounded-xl text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-red-500"
        >
          <LogOut size={18} aria-hidden="true" />
        </button>
      </div>
    )
  }
  return (
    <button
      type="button"
      onClick={onSignIn}
      className="flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-lift transition-all hover:bg-primary-dark active:scale-[0.97]"
    >
      Sign In
    </button>
  )
}

/* The top-level destinations — buttons (not anchors) switch routes.
   Public content pages (how-it-works, about, contact) sit beside the app
   destinations; Farmer/Buyer hubs are visible to everyone: clicking the
   wrong one gets a polite role gate (server-verified), never a silent
   dead end. */
const NAV_LINKS = [
  { id: 'shop', label: 'Marketplace' },
  { id: 'farmer/dashboard', label: 'Farmer Panel' },
  { id: 'buyer/dashboard', label: 'Buyer Hub' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
]

export default function Navbar({ user, route = 'shop', onRoute = () => {}, search, onSearch, cart, cartCount, onQty, onRemoveFromCart, onCheckout, onSignIn, onSignOut, onOpenAuth = () => {} }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const isActive = (link) => {
    const base = link.id.split('/')[0]
    /* dashboard hubs stay active across their pages; simple pages match exactly */
    return base === 'shop'
      ? route === 'shop'
      : link.id.includes('/')
        ? route.startsWith(base + '/')
        : route === link.id
  }
  const showSellingCta = !user || user.role !== 'Farmer'

  return (
    <header className="fixed top-0 z-50 w-full border-b border-neutral-200/60 bg-white/75 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-white/60">
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center gap-3 px-4 sm:gap-5 sm:px-6 lg:px-8">
        <Brand />

        {/* desktop search bar */}
        <div className="ml-6 hidden flex-1 justify-center md:flex">
          <SearchBar search={search} onSearch={onSearch} />
        </div>

        {/* right cluster */}
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <ul className="mr-2 hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  onClick={() => onRoute(link.id)}
                  aria-current={isActive(link) ? 'page' : undefined}
                  className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive(link)
                      ? 'bg-primary-soft text-primary-dark'
                      : 'text-neutral-600 hover:bg-primary-soft/60 hover:text-primary-dark'
                  }`}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          {/* public sell-side CTA — hidden for signed-in farmers who already
              live in their dashboard */}
          {showSellingCta && (
            <a
              href="#/start-selling"
              className="mr-1 hidden rounded-full border border-primary/25 bg-primary-soft/70 px-4 py-2 text-sm font-semibold text-primary-dark transition-colors hover:bg-primary-soft lg:inline-flex"
            >
              Start Selling
            </a>
          )}

          <CartButton cart={cart} count={cartCount} onQty={onQty} onRemove={onRemoveFromCart} onCheckout={onCheckout} />
          <div className="hidden sm:block">
            <AuthArea user={user} onSignIn={onSignIn} onSignOut={onSignOut} />
          </div>

          {/* mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label="Open menu"
            className="grid h-11 w-11 place-items-center rounded-xl text-neutral-600 transition-colors hover:bg-neutral-100 lg:hidden"
          >
            {mobileOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {/* mobile search row */}
      <div className="border-t border-neutral-200/50 px-4 py-2.5 md:hidden">
        <SearchBar search={search} onSearch={onSearch} id="nav-search-mobile" />
      </div>

      {/* mobile dropdown panel */}
      {mobileOpen && (
        <div className="border-t border-neutral-200/60 bg-white/90 p-4 backdrop-blur-xl lg:hidden">
          <ul className="space-y-1">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  onClick={() => {
                    onRoute(link.id)
                    setMobileOpen(false)
                  }}
                  aria-current={isActive(link) ? 'page' : undefined}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                    isActive(link)
                      ? 'bg-primary-soft text-primary-dark'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {link.label}
                  <ChevronDown size={16} className="rotate-[-90deg] text-neutral-300" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          {showSellingCta && (
            <a
              href="#/start-selling"
              onClick={() => setMobileOpen(false)}
              className="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-primary/25 bg-primary-soft/70 text-sm font-semibold text-primary-dark transition-colors hover:bg-primary-soft"
            >
              Start Selling
            </a>
          )}
          <div className="mt-3 border-t border-neutral-200/60 pt-3 sm:hidden">
            <AuthArea user={user} onSignIn={onSignIn} onSignOut={onSignOut} mobile />
          </div>
        </div>
      )}
    </header>
  )
}
