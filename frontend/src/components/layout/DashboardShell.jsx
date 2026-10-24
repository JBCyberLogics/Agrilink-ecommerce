/**
 * DashboardShell — the shared chrome for BOTH role dashboards
 * (AGRILINK-UI-SECURITY-INFRA-002). FarmerShell and BuyerShell hand in
 * their own page lists, brand icon and labels; scrolling, focus, drawer
 * and accessibility behavior stay in lockstep between farmer and buyer.
 *
 * Layout contract:
 * • Desktop (lg+): sticky sidebar pinned under the fixed navbar. The menu
 *   area is the ONLY scrolling region (flex-1 min-h-0 overflow-y-auto) so
 *   long pages lists stay reachable on short viewports while the brand
 *   header and account footer remain always visible.
 * • Menu scrolling is NATIVE (no scroll-jacking), stops scroll-chaining
 *   while hunting menu items (overscroll-contain), and animates only the
 *   deliberate reveal of the active item when it is off-screen — with
 *   prefers-reduced-motion honored (instant snapping instead of smooth).
 * • The active route is highlighted (aria-current=page) and scrolled into
 *   view only when needed (scrollIntoView block:'nearest' is a no-op when
 *   the item is already visible, so scroll position stays stable).
 * • Mobile/tablet: an accessible drawer (dialog) with backdrop, close
 *   control, Escape handling, focus trap and focus return; it closes
 *   after every in-drawer navigation.
 * • No added animation libraries — only Tailwind transitions and native
 *   scrolling; the page column scrolls the window independently.
 */
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Menu, X, LogOut } from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle'

/* 'smooth' for deliberate long-menu reveals, 'auto' when the user asked
   the system to minimize motion. Read on call so a live settings change
   is honored on the next navigation. */
const scrollBehavior = () =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth'

/* ---------------------------------------------------------------- gate */
export function AccessPanel({ icon: Icon, title, desc, cta, onClick, secondaryCta, onSecondary, note }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-farmer-line bg-paper px-6 py-12 text-center shadow-sm">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-farmer-surface text-farmer-brand">
        <Icon size={24} aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-display text-xl font-semibold text-farmer-ink">{title}</h2>
      <p className="mt-2 text-[13px] leading-relaxed text-farmer-muted">{desc}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onClick}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-farmer-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-farmer-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-farmer-brand/40 focus-visible:ring-offset-2"
        >
          {cta}
          <ArrowRight size={15} aria-hidden="true" />
        </button>
        {secondaryCta && (
          <button
            type="button"
            onClick={onSecondary}
            className="inline-flex h-11 items-center rounded-lg border border-farmer-line px-5 text-sm font-semibold text-farmer-muted transition-colors hover:border-farmer-brand/40 hover:text-farmer-brand"
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
function NavList({ base, items, active, onNavigate, onAfterNavigate, label }) {
  const activeRef = useRef(null)

  /* Long menus: keep the active item visible. block:'nearest' never moves
     the scroll when the item is already fully visible, so navigating
     between pages leaves the menu's scroll position stable.
     (jsdom/older browsers may not implement scrollIntoView — guard it.) */
  useEffect(() => {
    if (!activeRef.current?.scrollIntoView) return
    activeRef.current.scrollIntoView({ block: 'nearest', behavior: scrollBehavior() })
  }, [active])

  return (
    <nav
      aria-label={label}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-1 pr-1"
    >
      <ul className="space-y-1">
        {items.map((p) => {
          const isActive = active === p.id
          return (
            <li key={p.id}>
              <button
                type="button"
                ref={isActive ? activeRef : undefined}
                onClick={() => {
                  onNavigate(`${base}/${p.id}`)
                  onAfterNavigate?.()
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-farmer-brand/40 ${
                  isActive
                    ? 'bg-farmer-surface text-farmer-brand'
                    : 'text-farmer-muted hover:bg-farmer-page hover:text-farmer-ink'
                }`}
              >
                <p.icon size={16} aria-hidden="true" className={isActive ? 'text-farmer-brand' : 'text-farmer-muted'} />
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
    <div className="mt-auto shrink-0 border-t border-farmer-line pt-4">
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
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-lg text-farmer-muted transition-colors hover:bg-danger-wash hover:text-farmer-danger"
        >
          <LogOut size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- shell */
export default function DashboardShell({
  base, // 'farmer' | 'buyer'
  items, // [{ id, label, nav, icon, intro }]
  icon: BrandIcon,
  dashboardLabel, // 'Farmer Dashboard' | 'Buyer Dashboard'
  user, // server-verified session user (name/email for the footer)
  active,
  onNavigate,
  onSignOut,
  children,
}) {
  const [drawer, setDrawer] = useState(false)
  const menuBtn = useRef(null)
  const drawerPanel = useRef(null)
  const drawerId = `${base}-drawer`

  /* Open: focus the drawer; Esc → close + return focus. Tab is trapped
     inside the dialog while it is open. */
  useEffect(() => {
    if (!drawer) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setDrawer(false)
        menuBtn.current?.focus()
        return
      }
      if (e.key !== 'Tab') return
      const focusables = drawerPanel.current?.querySelectorAll(
        'button, a[href], input, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusables?.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    drawerPanel.current?.querySelector('button')?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [drawer])

  const meta = items.find((p) => p.id === active) || items[0]

  return (
    <div className="min-h-[calc(100vh-72px)] bg-farmer-page">
      <div className="mx-auto flex max-w-[1440px]">
        {/* -------------------------- desktop sidebar -------------------------- */}
        {/* The menu list scrolls on its own; brand header + account footer
            are pinned, so nothing is cut off on short viewports. */}
        <aside className="sticky top-[72px] hidden h-[calc(100vh-72px)] w-[264px] shrink-0 flex-col border-r border-farmer-line bg-paper px-4 py-6 lg:flex">
          <div className="mb-5 flex shrink-0 items-center gap-2 px-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-farmer-primary text-white">
              <BrandIcon size={17} aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-[15px] font-semibold text-farmer-ink">Agrilink</span>
              <span className="block text-[11px] font-medium text-farmer-muted">{dashboardLabel}</span>
            </span>
          </div>
          <NavList
            base={base}
            items={items}
            active={active}
            onNavigate={onNavigate}
            label={`${base === 'farmer' ? 'Farmer' : 'Buyer'} dashboard`}
          />
          <UserFooter user={user} onSignOut={onSignOut} />
        </aside>

        {/* ------------------------------ content ------------------------------ */}
        <div className="min-w-0 flex-1">
          <header className="border-b border-farmer-line bg-paper px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-xl font-semibold text-farmer-ink">{meta.label}</h1>
                <p className="mt-0.5 text-[13px] text-farmer-muted">{meta.intro}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {/* shared light/dark controller — same ThemeProvider instance
                    as the navbar (app-level provider) */}
                <ThemeToggle className="h-10 w-10 border border-farmer-line bg-paper" size={17} />
                <button
                  ref={menuBtn}
                  type="button"
                  onClick={() => setDrawer(true)}
                  aria-expanded={drawer}
                  aria-controls={drawerId}
                  aria-label="Open dashboard menu"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-farmer-line text-farmer-muted transition-colors hover:bg-farmer-page hover:text-farmer-ink lg:hidden"
                >
                  <Menu size={18} aria-hidden="true" />
                </button>
              </div>
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
            className="absolute inset-0 bg-black/30"
            onClick={() => setDrawer(false)}
            aria-hidden="true"
          />
          <div
            ref={drawerPanel}
            id={drawerId}
            role="dialog"
            aria-modal="true"
            aria-label={`${base === 'farmer' ? 'Farmer' : 'Buyer'} dashboard navigation`}
            className="absolute inset-y-0 left-0 flex w-[280px] flex-col bg-paper px-4 py-6 shadow-xl"
          >
            <div className="mb-5 flex shrink-0 items-center justify-between px-1">
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
            <NavList
              base={base}
              items={items}
              active={active}
              onNavigate={onNavigate}
              onAfterNavigate={() => {
                /* close after route navigation; focus lands back on the
                   trigger so screen readers/keys stay anchored */
                setDrawer(false)
                menuBtn.current?.focus()
              }}
              label={`${base === 'farmer' ? 'Farmer' : 'Buyer'} dashboard`}
            />
            <UserFooter user={user} onSignOut={onSignOut} />
          </div>
        </div>
      )}
    </div>
  )
}
