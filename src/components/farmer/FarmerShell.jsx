/**
 * FarmerShell — the dashboard chrome: persistent left sidebar on desktop,
 * a drawer below `lg`, a page header (title + intro), and the farmer-role
 * access guard. Only authenticated Farmer accounts ever see the shell; the
 * role comes from the trusted session (server-verified), never from form
 * selections or URL parameters.
 *
 * Routes follow the app's existing hash convention: #/farmer/dashboard,
 * #/farmer/produce, … (no router dependency; documented in README).
 */
import { useEffect, useRef, useState } from 'react'
import {
  LayoutDashboard,
  LineChart,
  Sprout,
  MessageSquare,
  Receipt,
  UserRound,
  Settings,
  Lock,
  ShoppingBag,
  Menu,
  X,
  ArrowRight,
  LogOut,
} from 'lucide-react'

export const FARMER_PAGES = [
  { id: 'dashboard', label: 'Farmer Overview', nav: 'Overview', icon: LayoutDashboard, intro: 'Monitor market prices and manage your farm business.' },
  { id: 'market-intelligence', label: 'Market Intelligence', nav: 'Market Intelligence', icon: LineChart, intro: 'Observe verified market prices for your produce.' },
  { id: 'produce', label: 'My Produce', nav: 'My Produce', icon: Sprout, intro: 'Post, stock and manage everything you sell.' },
  { id: 'inquiries', label: 'Buyer Inquiries', nav: 'Buyer Inquiries', icon: MessageSquare, intro: 'Messages from interested buyers.' },
  { id: 'orders', label: 'Orders & Sales', nav: 'Orders & Sales', icon: Receipt, intro: 'Recorded transactions for your produce.' },
  { id: 'profile', label: 'Farm Profile', nav: 'Farm Profile', icon: UserRound, intro: 'How buyers see your farm.' },
  { id: 'settings', label: 'Settings', nav: 'Settings', icon: Settings, intro: 'Account and notification preferences.' },
]

/* ---------------------------------------------------------------- guard */
function AccessPanel({ icon: Icon, title, desc, cta, onClick, secondaryCta, onSecondary, note }) {
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
    <nav aria-label="Farmer dashboard">
      <ul className="space-y-1">
        {FARMER_PAGES.map((p) => {
          const isActive = active === p.id
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => {
                  onNavigate(`farmer/${p.id}`)
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
export default function FarmerShell({ user, page, onNavigate, onSignOut, onOpenAuth, onBackToShop, children }) {
  /* ---- farmer-only access, enforced on the session the server verified ---- */
  if (!user)
    return (
      <div className="min-h-[calc(100vh-72px)] bg-farmer-page px-4 py-16">
        <AccessPanel
          icon={Lock}
          title="Farmers only beyond this gate"
          desc="Sign in to manage produce listings, view live metrics and reach thousands of buyers."
          cta="Sign in as a farmer"
          onClick={onOpenAuth}
        />
      </div>
    )

  if (user.role !== 'Farmer')
    return (
      <div className="min-h-[calc(100vh-72px)] bg-farmer-page px-4 py-16">
        <AccessPanel
          icon={ShoppingBag}
          title={`You're browsing as a ${user.role.toLowerCase()}, ${user.name.split(' ')[0]}`}
          desc="Farmer accounts unlock produce listings, stock management and live sales metrics. Create a free farmer account to start selling your own harvest."
          cta="Create a farmer account"
          onClick={() => onOpenAuth({ tab: 'signup', role: 'Farmer' })}
          secondaryCta="Back to Marketplace"
          onSecondary={onBackToShop}
          note="Buyer accounts cannot access farmer pages."
        />
      </div>
    )

  const meta = FARMER_PAGES.find((p) => p.id === page) || FARMER_PAGES[0]

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
              <Sprout size={17} aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-[15px] font-semibold text-farmer-ink">Agrilink</span>
              <span className="block text-[11px] font-medium text-farmer-muted">Farmer Dashboard</span>
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
                aria-controls="farmer-drawer"
                aria-label="Open dashboard menu"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-farmer-line text-farmer-muted transition-colors hover:bg-farmer-page hover:text-farmer-ink lg:hidden"
              >
                <Menu size={18} aria-hidden="true" />
              </button>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8" aria-busy={undefined}>
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
            id="farmer-drawer"
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
