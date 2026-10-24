/**
 * BuyerShell — the buyer dashboard boundary: role guards + page list.
 *
 * The shared chrome (sidebar scrolling, drawer, focus management, a11y)
 * lives in components/layout/DashboardShell.jsx so farmer and buyer stay
 * consistent by construction (AGRILINK-UI-SECURITY-INFRA-002). Only
 * authenticated Buyer accounts ever see the shell; the role comes from
 * the trusted session (server-verified), never from form selections or
 * URL parameters. The design reuses the farmer dashboard's design system
 * (the buyer spec's tokens are the same values).
 *
 * Routes follow the app's existing hash convention: #/buyer/dashboard,
 * #/buyer/produce, … (no router dependency; documented in README).
 */
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
  Truck,
  CalendarPlus,
  MessageSquare,
  SlidersHorizontal,
  Search,
} from 'lucide-react'
import DashboardShell, { AccessPanel } from '../../components/layout/DashboardShell'

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

  return (
    <DashboardShell
      base="buyer"
      items={BUYER_PAGES}
      icon={ShoppingBasket}
      dashboardLabel="Buyer Dashboard"
      user={user}
      active={page}
      onNavigate={onNavigate}
      onSignOut={onSignOut}
    >
      {children}
    </DashboardShell>
  )
}
