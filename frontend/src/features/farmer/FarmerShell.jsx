/**
 * FarmerShell — the farmer dashboard boundary: role guards + page list.
 *
 * The shared chrome (sidebar scrolling, drawer, focus management, a11y)
 * lives in components/layout/DashboardShell.jsx so farmer and buyer stay
 * consistent by construction (AGRILINK-UI-SECURITY-INFRA-002). Only
 * authenticated Farmer accounts ever see the shell; the role comes from
 * the trusted session (server-verified), never from form selections or
 * URL parameters.
 *
 * Routes follow the app's existing hash convention: #/farmer/dashboard,
 * #/farmer/produce, … (no router dependency; documented in README).
 */
import { LayoutDashboard, LineChart, Sprout, MessageSquare, Receipt, UserRound, Settings, Lock, ShoppingBag, Truck, DollarSign, CalendarPlus, Scale, Plus, SlidersHorizontal } from 'lucide-react'
import DashboardShell, { AccessPanel } from '../../components/layout/DashboardShell'

export const FARMER_PAGES = [
  { id: 'dashboard', label: 'Farmer Overview', nav: 'Overview', icon: LayoutDashboard, intro: 'Monitor market prices and manage your farm business.' },
  { id: 'market-intelligence', label: 'Market Intelligence', nav: 'Market Intelligence', icon: LineChart, intro: 'Observe verified market prices for your produce.' },
  { id: 'produce', label: 'My Produce', nav: 'My Produce', icon: Sprout, intro: 'Post, stock and manage everything you sell.' },
  { id: 'inquiries', label: 'Buyer Inquiries', nav: 'Buyer Inquiries', icon: MessageSquare, intro: 'Messages from interested buyers.' },
  { id: 'orders', label: 'Orders & Sales', nav: 'Orders & Sales', icon: Receipt, intro: 'Recorded transactions for your produce.' },
  { id: 'profile', label: 'Farm Profile', nav: 'Farm Profile', icon: UserRound, intro: 'How buyers see your farm.' },
  { id: 'settings', label: 'Settings', nav: 'Settings', icon: Settings, intro: 'Account and notification preferences.' },
  { id: 'ai-market-advisor', label: 'AI Market Advisor', nav: 'AI Market Advisor', icon: Scale, intro: 'Get AI-powered market insights and price trends.' },
  { id: 'ai-agricultural-assistant', label: 'AI Assistant', nav: 'AI Assistant', icon: MessageSquare, intro: 'Ask agricultural and marketplace questions.' },
  { id: 'ai-recommendations', label: 'AI Recommendations', nav: 'AI Recommendations', icon: SlidersHorizontal, intro: 'Get AI-powered recommendations for your farm.' },
  { id: 'ai-crop-insights', label: 'AI Crop Insights', nav: 'AI Crop Insights', icon: Sprout, intro: 'Explore market opportunities for your produce.' },
  { id: 'ai-price-recommendation', label: 'AI Price Recommendation', nav: 'AI Price Recommendation', icon: DollarSign, intro: 'Get suggested selling price ranges.' },
  { id: 'ai-listing-improvement', label: 'AI Listing Improvement', nav: 'AI Listing Improvement', icon: Plus, intro: 'Improve your listing titles and descriptions.' },
  { id: 'ai-buyer-matching', label: 'AI Buyer Matching', nav: 'AI Buyer Matching', icon: Truck, intro: 'Find buyers for your produce.' },
  { id: 'ai-harvest-planner', label: 'AI Harvest Planner', nav: 'AI Harvest Planner', icon: CalendarPlus, intro: 'Plan your harvest and selling windows.' },
]

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

  /* Role guards above decide access; the shared chrome renders the rest. */
  return (
    <DashboardShell
      base="farmer"
      items={FARMER_PAGES}
      icon={Sprout}
      dashboardLabel="Farmer Dashboard"
      user={user}
      active={page}
      onNavigate={onNavigate}
      onSignOut={onSignOut}
    >
      {children}
    </DashboardShell>
  )
}
