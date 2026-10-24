import { useEffect, useRef, useState } from 'react'
import { Sprout, Search, ShoppingBag, Menu, X, LogOut, ChevronDown, Plus, Minus, ArrowRight } from 'lucide-react'
import { kes } from '../../utils/format'
import ThemeToggle from '../ui/ThemeToggle'

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
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-2"
      />
      <input
        id={id}
        type="search"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search fresh produce, farms, counties…"
        aria-label="Search produce"
        className="h-11 w-full rounded-full border border-line/80 bg-soft/70 pl-11 pr-10 text-sm text-ink shadow-sm outline-none backdrop-blur transition-all placeholder:text-muted-2 hover:bg-soft focus:border-brand/40 focus:bg-paper focus:ring-4 focus:ring-brand/10"
      />
      {search && (
        <button
          type="button"
          onClick={() => onSearch('')}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted-2 transition-colors hover:bg-soft-strong hover:text-ink-4"
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
        className="relative grid h-11 w-11 place-items-center rounded-xl text-ink-4 transition-colors hover:bg-soft hover:text-brand focus-visible:bg-soft"
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
        <div className="absolute right-0 z-50 mt-3 w-80 animate-fade-up overflow-hidden rounded-2xl border border-white/60 bg-paper/80 shadow-glass backdrop-blur-2xl">
          {/*---------------------------- cart items ----------------------------*/}
          <div className="flex items-center justify-between border-b border-line/60 px-4 py-3">
            <p className="text-sm font-semibold text-ink">Your basket</p>
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-brand-deep">
              {count} item{count === 1 ? '' : 's'}
            </span>
          </div>

          {cart.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-soft text-faint">
                <ShoppingBag size={22} aria-hidden="true" />
              </span>
              <p className="mt-3 text-sm font-medium text-muted">Your basket is empty</p>
              <p className="mt-1 text-xs text-muted-2">Fresh produce is one click away.</p>
            </div>
          ) : (
            <ul className="max-h-64 divide-y divide-line/60 overflow-y-auto px-2">
              {cart.map((it) => (
                <li key={it.productId} className="flex items-center gap-3 px-2 py-3">
                  <img
                    src={it.image}
                    alt=""
                    loading="lazy"
                    className="h-11 w-11 shrink-0 rounded-lg bg-soft object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-ink">{it.name}</p>
                    <p className="text-xs text-muted-2">
                      {kes(it.price)} / {it.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onQty(it.productId, -1)}
                      aria-label={`Decrease ${it.name} quantity`}
                      className={`grid h-7 w-7 place-items-center rounded-md border border-line text-muted transition-colors hover:border-danger-line hover:bg-danger-wash hover:text-danger`}
                    >
                      <Minus size={12} aria-hidden="true" />
                    </button>
                    <span className="w-5 text-center text-[13px] font-semibold tabular-nums">{it.qty}</span>
                    <button
                      type="button"
                      onClick={() => onQty(it.productId, +1)}
                      aria-label={`Increase ${it.name} quantity`}
                      className="grid h-7 w-7 place-items-center rounded-md border border-line text-muted transition-colors hover:border-brand/30 hover:bg-primary-soft hover:text-brand"
                    >
                      <Plus size={12} aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {cart.length > 0 && (
            <div className="border-t border-line/60 bg-paper/50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="font-display text-lg font-bold text-ink">{kes(subtotal)}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  onCheckout()
                }}
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
export function AuthArea({ user, onSignIn, onSignOut, mobile = false, booting = false }) {
  /* While the boot session check is in flight the slot holds a neutral
     placeholder — identical footprint, so the row never shifts when the
     real chip (or the Sign In button) arrives. No invented name/role. */
  if (!user && booting) {
    return (
      <div className={mobile ? 'flex items-center gap-2' : 'ml-1 flex items-center gap-2'}>
        <span
          role="status"
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-soft ${mobile ? '' : 'animate-pulse'}`}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
            <circle cx="12" cy="8" r="4" className="fill-muted-2/40" />
            <path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" className="stroke-muted-2/40" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {!mobile && <span className="sr-only">Checking sign-in status…</span>}
        </span>
      </div>
    )
  }
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
            <span className="block max-w-[9rem] truncate text-[13px] font-semibold text-ink">{user.name}</span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${user.role === 'Farmer' ? 'text-brand-amber-deep' : 'text-brand'}`}
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
          className="grid h-10 w-10 place-items-center rounded-xl text-muted-2 transition-colors hover:bg-soft hover:text-danger"
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

/* Public destinations — visible to everyone, logged out or in.
   Role dashboards are NOT public links: an authenticated user only ever
   gets a link to THEIR OWN dashboard (see dashboardLinkFor below), so a
   buyer never sees a farmer entry point and vice versa. */
const PUBLIC_NAV_LINKS = [
  { id: 'shop', label: 'Marketplace' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'about', label: 'About' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' },
]

/* Returns the authenticated user's own dashboard link, derived from the
   server-validated session role (user.role) — never from a manually
   selected frontend value, URL param or localStorage. Returns null for
   logged-out users (they see Login/Sign Up via AuthArea). */
function dashboardLinkFor(user) {
  if (!user) return null
  if (user.role === 'Farmer')
    return { id: 'farmer/dashboard', label: 'Farmer Dashboard' }
  if (user.role === 'Buyer')
    return { id: 'buyer/dashboard', label: 'Buyer Dashboard' }
  return null
}

/* Combined desktop + mobile link list: public links for everyone, plus
   the signed-in user's own dashboard when authenticated. */
function navLinksFor(user) {
  if (!user) return PUBLIC_NAV_LINKS
  const own = dashboardLinkFor(user)
  return own ? [...PUBLIC_NAV_LINKS, own] : PUBLIC_NAV_LINKS
}

export default function Navbar({ user, route = 'shop', onRoute = () => {}, search, onSearch, cart, cartCount, onQty, onRemoveFromCart, onCheckout, onSignIn, onSignOut, onOpenAuth = () => {}, booting = false }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const mobileBtn = useRef(null)

  /* Escape closes the mobile menu and returns focus to the trigger. */
  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMobileOpen(false)
        mobileBtn.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  /* Any route change (button, hash edit, back/forward) closes the menu,
     so the panel never lingers over a page the user already left. */
  useEffect(() => {
    setMobileOpen(false)
  }, [route])

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
    <header className="fixed top-0 z-50 w-full border-b border-line/60 bg-paper/75 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-paper/60">
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center gap-3 px-4 sm:gap-5 sm:px-6 lg:px-8">
        <Brand />

        {/* desktop search bar */}
        <div className="ml-6 hidden flex-1 justify-center md:flex">
          <SearchBar search={search} onSearch={onSearch} />
        </div>

        {/* right cluster */}
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <ul className="mr-2 hidden items-center gap-1 lg:flex">
            {navLinksFor(user).map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  onClick={() => onRoute(link.id)}
                  aria-current={isActive(link) ? 'page' : undefined}
                  className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive(link)
                      ? 'bg-primary-soft text-brand-deep'
                      : 'text-ink-4 hover:bg-primary-soft/60 hover:text-brand-deep'
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
              className="mr-1 hidden rounded-full border border-brand/25 bg-primary-soft/70 px-4 py-2 text-sm font-semibold text-brand-deep transition-colors hover:bg-primary-soft lg:inline-flex"
            >
              Start Selling
            </a>
          )}

          <ThemeToggle className="h-11 w-11" size={20} />
          <CartButton cart={cart} count={cartCount} onQty={onQty} onRemove={onRemoveFromCart} onCheckout={onCheckout} />
          <div className="hidden sm:block">
            <AuthArea user={user} onSignIn={onSignIn} onSignOut={onSignOut} booting={booting} />
          </div>

          {/* mobile menu trigger */}
          <button
            ref={mobileBtn}
            type="button"
            onClick={() => {
              if (!mobileOpen) setMobileOpen(true)
              else {
                setMobileOpen(false)
                mobileBtn.current?.focus()
              }
            }}
            aria-expanded={mobileOpen}
            aria-controls="nav-mobile-menu"
            aria-label="Open menu"
            className="grid h-11 w-11 place-items-center rounded-xl text-ink-4 transition-colors hover:bg-soft lg:hidden"
          >
            {mobileOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {/* mobile search row */}
      <div className="border-t border-line/50 px-4 py-2.5 md:hidden">
        <SearchBar search={search} onSearch={onSearch} id="nav-search-mobile" />
      </div>

      {/* mobile dropdown panel */}
      {mobileOpen && (
        <div id="nav-mobile-menu" className="border-t border-line/60 bg-paper/90 p-4 backdrop-blur-xl lg:hidden">
          <ul className="space-y-1">
            {navLinksFor(user).map((link) => (
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
                      ? 'bg-primary-soft text-brand-deep'
                      : 'text-ink-3 hover:bg-soft'
                  }`}
                >
                  {link.label}
                  <ChevronDown size={16} className="rotate-[-90deg] text-faint" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          {showSellingCta && (
            <a
              href="#/start-selling"
              onClick={() => setMobileOpen(false)}
              className="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-brand/25 bg-primary-soft/70 text-sm font-semibold text-brand-deep transition-colors hover:bg-primary-soft"
            >
              Start Selling
            </a>
          )}
          {/* appearance row — the shared theme controller (footer spec keeps
              the marketing footer off authenticated pages; this row follows
              the same visual language as the rest of the dropdown) */}
          <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-3 sm:hidden">
            <span className="flex items-center gap-2 text-sm font-medium text-ink-3">
              Appearance
            </span>
            <ThemeToggle className="h-10 w-10 border border-line" size={18} />
          </div>
          <div className="mt-3 border-t border-line/60 pt-3 sm:hidden">
            <AuthArea user={user} onSignIn={onSignIn} onSignOut={onSignOut} booting={booting} mobile />
          </div>
        </div>
      )}
    </header>
  )
}
