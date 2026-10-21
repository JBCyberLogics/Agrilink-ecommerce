/**
 * NotFound — dedicated 404 page for unknown hash routes.
 *
 * Unknown hashes (e.g. #/does-not-exist) render here instead of silently
 * falling back to the marketplace. Valid routes that require login keep
 * their role gates; this page is only for genuinely unknown paths.
 * Provides clear navigation back to the marketplace and, when signed in,
 * to the user's own dashboard — no redirect loops.
 */
import { ArrowLeft, AlertCircle, LayoutDashboard, ShoppingBag } from 'lucide-react'

export default function NotFound({ user, onRoute }) {
  const isFarmer = user?.role === 'Farmer'
  const dashboardRoute = isFarmer ? 'farmer/dashboard' : 'buyer/dashboard'
  const dashboardLabel = isFarmer ? 'Farmer Dashboard' : 'Buyer Dashboard'
  const dashboardIcon = isFarmer ? LayoutDashboard : ShoppingBag

  return (
    <main className="max-w-2xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
      <AlertCircle size="48" className="mx-auto text-neutral-400 mb-4" aria-hidden="true" />
      <h1 className="font-display text-2xl font-bold text-neutral-900">Page not found</h1>
      <p className="mt-2 text-sm text-neutral-500">
        The page you&rsquo;re looking for doesn&rsquo;t exist. It may have been removed or the link
        may be outdated.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => onRoute('shop')}
          aria-label="Back to marketplace"
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-lift transition-all hover:bg-primary-dark active:scale-[0.98]"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Marketplace
        </button>

        {user && (
          <button
            type="button"
            onClick={() => onRoute(dashboardRoute)}
            aria-label={`Go to ${dashboardLabel}`}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-900 shadow-sm transition-colors hover:bg-neutral-100 active:scale-[0.98]"
          >
            <dashboardIcon size={16} aria-hidden="true" />
            Go to {dashboardLabel}
          </button>
        )}
      </div>
    </main>
  )
}
