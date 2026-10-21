/**
 * BuyerShell — the buyer dashboard chrome: persistent left sidebar on
 * desktop, a drawer below `lg`, a page header (title + intro), and the
 * buyer-role access guard. Only authenticated Buyer accounts ever see the
 * shell; the role comes from the trusted session (server-verified), never
 * from form selections or URL parameters. The design reuses the farmer
 * dashboard's design system (the buyer spec's tokens are the same values).
 *
 * Routes follow the app's existing hash convention: #/buyer/dashboard,
 * #/buyer/produce, … (no router dependency; documented in README).
 */
import { useEffect, useRef, useState } from 'react'
import {
  LayoutDashboard,
  ShoppingBasket,
  Scale,
  MailQuestion,
  Heart,
  Receipt,
  UserRound,
  Settings,
  Lock,
  Sprout,
  Menu,
  X,
  ArrowRight,
  LogOut,
  Truck,
  DollarSign,
  CalendarPlus,
  MessageSquare,
  SlidersHorizontal,
  Search,
} from 'lucide-react'

export const BUYER_PAGES = [
  { id: 'dashboard', label: 'Buyer Overview', nav: 'Overview', icon: LayoutDashboard, intro: 'Find fresh produce for your business.' },
  { id: 'produce', label: 'Browse Produce', nav: 'Browse Produce', icon: ShoppingBasket, intro: 'Search and filter everything farmers have listed right now.' },
  { id: 'price-comparison', label: 'Price Comparison', nav: 'Price Comparison', icon: Scale, intro: 'Compare real seller offers side by side.' },
  { id: 'requests', label: 'Purchase Requests', nav: 'Purchase Requests', icon: MailQuestion, intro: 'Track the buy offers you have sent to farmers.' },
  { id: 'saved', label: 'Saved Produce', nav: 'Saved Produce', icon: Heart, intro: 'Produce you bookmarked for later.' },
  { id: 'orders', label: 'Orders & History', nav: 'Orders & History', icon: Receipt, intro: 'Your completed purchases once orders exist.' },
  { id: 'profile', label: 'Buyer Profile', nav: 'Buyer Profile', icon: UserRound, intro: 'How sellers see your account.' },
  { id: 'settings', label: 'Settings', nav: 'Settings', icon: Settings, intro: 'Account and notification preferences.' },
  { id: 'ai-market-advisor', label: 'AI Market Advisor', nav: 'AI Market Advisor', icon: Scale, intro: 'Get AI-powered market insights and price trends.' },
  { id: 'ai-agricultural-assistant', label: 'AI Assistant', nav: 'AI Assistant', icon: MessageSquare, intro: 'Ask agricultural and marketplace questions.' },
  { id: 'ai-recommendations', label: 'AI Recommendations', nav: 'AI Recommendations', icon: SlidersHorizontal, intro: 'Get AI-powered recommendations for your purchases.' },
  { id: 'ai-produce-finder', label: 'AI Produce Finder', nav: 'AI Produce Finder', icon: Search, intro: 'Find produce matching your purchasing needs.' },
  { id: 'ai-supplier-matching', label: 'AI Supplier Matching', nav: 'AI Supplier Matching', icon: Truck, intro: 'Find suitable farmers and suppliers.' },
  { id: 'ai-purchase-planning', label: 'AI Purchase Planning', nav: 'AI Purchase Planning', icon: CalendarPlus, intro: 'Plan your produce purchasing requirements.' },
]

/* ---------------------------------------------------------------- shared panels */
export function AccessPanel({ icon: Icon, title, desc, cta, onClick, secondaryCta, onSecondary, note }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-farmer-line bg-white px-6 py-12 text-center shadow-sm">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-farmer-surface text-farmer-primary">
        <Icon size={24} aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-display text-xl font-semibold text-farmer-ink">{title}</h2>
      <p className="mt-2 text-[13px] leading-relaxed text-farmer-muted">{desc}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onClick}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-farmer-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-farmer-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-farmer-primary/40 focus-visible:ring-offset-2"
        >
          {cta}
          <ArrowRight size={15} aria-hidden="true" />
        </button>
        {secondaryCta && (
          <button
            type="button"
            onClick={onSecondary}
            className="inline-flex h-11 items-center rounded-lg border border-farmer-line px-5 text-sm font-semibold text-farmer-muted transition-colors hover:border-farmer-primary/40 hover:text-farmer-primary"
          >
            {secondaryCta}
          </button>
        )}
      </div>
      {note && <p className="mt-4 text-xs text-farmer-muted">{note}</p>}
    </div>
  )
}

/* ----------------------------------------------------------------- nav */
function NavList({ active, onNavigate, onAfterNavigate }) {
  return (
    <nav aria-label="Buyer dashboard">
      <ul className="space-y-1">
        {BUYER_PAGES.map((p) => {
          const isActive = active === p.id
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => {
                  onNavigate(`buyer/${p.id}`)
                  onAfterNavigate?.()
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-farmer-primary/40 ${
                  isActive
                    ? 'bg-farmer-surface text-farmer-primary'
                    : 'text-farmer-muted hover:bg-farmer-page hover:text-farmer-ink'
                }`}
              >
                <p.icon size={16} aria-hidden="true" className={isActive ? 'text-farmer-primary' : 'text-farmer-muted'} />
                {p.nav}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function UserFooter({ user, onSignOut }) {
  return (
    <div className="mt-auto border-t border-farmer-line pt-4">
      <div className="flex items-center gap-2.5 px-1">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-farmer-primary font-display text-xs font-bold text-white" aria-hidden="true">
          {user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-[13px] font-semibold text-farmer-ink">{user.name}</span>
          <span className="block truncate text-[11px] text-farmer-muted">{user.email}</span>
        </span>
        <button
          type="button"
          onClick={onSignOut}
          title="Sign out"
          aria-label="Sign out"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-lg text-farmer-muted transition-colors hover:bg-red-50 hover:text-farmer-danger"
        >
          <LogOut size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- shell */
export default function BuyerShell({ user, page, onNavigate, onSignOut, onOpenAuth, onBackToShop, onFarmerDashboard, children }) {
  /* ---- buyer-only access, enforced on the session the server verified ---- */
  if (!user)
    return (
      <div className="min-h-[calc(100vh-72px)] bg-farmer-page px-4 py-16">
        <AccessPanel
          icon={Lock}
          title="Buyers only beyond this gate"
          desc="Sign in to browse the market, compare seller prices, save produce and send purchase requests."
          cta="Sign in as a buyer"
          onClick={onOpenAuth}
        />
      </div>
    )

  if (user.role !== 'Buyer') {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-farmer-page px-4 py-16">
        <AccessPanel
          icon={Sprout}
          title={`You're signed in as a farmer, ${user.name.split(' ')[0]}`}
          desc="Buyer pages are for sourcing produce. Your listings, stock and sales live in the farmer dashboard."
          cta="Open Farmer Dashboard"
          onClick={onFarmerDashboard}
          secondaryCta="Back to Marketplace"
          onSecondary={onBackToShop}
          note="Farmer accounts cannot access buyer pages."
        />
      </div>
    )
  }

  const meta = BUYER_PAGES.find((p) => p.id === page) || BUYER_PAGES[0]

  return (
    <ShellFrame user={user} page={page} meta={meta} onNavigate={onNavigate} onSignOut={onSignOut}>
      {children}
    </ShellFrame>
  )
}

function ShellFrame({ user, page, meta, onNavigate, onSignOut, children }) {
  const [drawer, setDrawer] = useState(false)
  const menuBtn = useRef(null)
  const drawerPanel = useRef(null)

  /* Esc closes the drawer; focus returns to the trigger */
  useEffect(() => {
    if (!drawer) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setDrawer(false)
        menuBtn.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    drawerPanel.current?.querySelector('button')?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [drawer])

  return (
    <div className="min-h-[calc(100vh-72px)] bg-farmer-page">
      <div className="mx-auto flex max-w-[1440px]">
        {/* -------------------------- desktop sidebar -------------------------- */}
        <aside className="sticky top-[72px] hidden h-[calc(100vh-72px)] w-[264px] shrink-0 flex-col border-r border-farmer-line bg-white px-4 py-6 lg:flex">
          <div className="mb-5 flex items-center gap-2 px-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-farmer-primary text-white">
              <ShoppingBasket size={17} aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-[15px] font-semibold text-farmer-ink">Agrilink</span>
              <span className="block text-[11px] font-medium text-farmer-muted">Buyer Dashboard</span>
            </span>
          </div>
          <NavList active={page} onNavigate={onNavigate} />
          <UserFooter user={user} onSignOut={onSignOut} />
        </aside>

        {/* ------------------------------ content ------------------------------ */}
        <div className="min-w-0 flex-1">
          <header className="border-b border-farmer-line bg-white px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-xl font-semibold text-farmer-ink">{meta.label}</h1>
                <p className="mt-0.5 text-[13px] text-farmer-muted">{meta.intro}</p>
              </div>
              <button
                ref={menuBtn}
                type="button"
                onClick={() => setDrawer(true)}
                aria-expanded={drawer}
                aria-controls="buyer-drawer"
                aria-label="Open dashboard menu"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-farmer-line text-farmer-muted transition-colors hover:bg-farmer-page hover:text-farmer-ink lg:hidden"
              >
                <Menu size={18} aria-hidden="true" />
              </button>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>

      {/* --------------------------- mobile drawer --------------------------- */}
      {drawer && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-farmer-ink/30"
            onClick={() => setDrawer(false)}
            aria-hidden="true"
          />
          <div
            ref={drawerPanel}
            id="buyer-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard navigation"
            className="absolute inset-y-0 left-0 flex w-[280px] flex-col bg-white px-4 py-6 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between px-1">
              <span className="font-display text-[15px] font-semibold text-farmer-ink">Dashboard menu</span>
              <button
                type="button"
                onClick={() => {
                  setDrawer(false)
                  menuBtn.current?.focus()
                }}
                aria-label="Close menu"
                className="grid h-9 w-9 place-items-center rounded-lg text-farmer-muted hover:bg-farmer-page"
              >
                <X size={17} aria-hidden="true" />
              </button>
            </div>
            <NavList active={page} onNavigate={onNavigate} onAfterNavigate={() => setDrawer(false)} />
            <UserFooter user={user} onSignOut={onSignOut} />
          </div>
        </div>
      )}
    </div>
  )
}
