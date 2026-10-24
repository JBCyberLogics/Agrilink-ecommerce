import { useState, useCallback, useEffect, useRef } from 'react'
import { RotateCw } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import AuthModal from '../features/auth/components/AuthModal'
import Hero from '../features/marketplace/components/Hero'
import Marketplace from '../features/marketplace/components/Marketplace'
import FarmerShell from '../features/farmer/FarmerShell'
import BuyerShell from '../features/buyer/BuyerShell'
import Overview from '../features/farmer/pages/Overview'
import MarketIntelligence from '../features/farmer/pages/MarketIntelligence'
import MyProduce from '../features/farmer/pages/MyProduce'
import FarmProfile from '../features/farmer/pages/FarmProfile'
import FarmerOrders from '../features/orders/pages/FarmerOrders'
import FarmerInquiries from '../features/inquiries/pages/FarmerInquiries'
import FarmerSettings from '../features/settings/pages/FarmerSettings'
import ContactPage from '../features/support/pages/Contact'
import HowItWorks from '../features/support/pages/HowItWorks'
import AboutPage from '../features/support/pages/About'
import StartSelling from '../features/support/pages/StartSelling'
import BuyerOverview from '../features/buyer/pages/Overview'
import BuyerBrowse from '../features/buyer/pages/Browse'
import BuyerPriceCompare from '../features/buyer/pages/PriceCompare'
import BuyerRequests from '../features/buyer/pages/Requests'
import BuyerSaved from '../features/buyer/pages/Saved'
import BuyerOrders from '../features/orders/pages/BuyerOrders'
import BuyerInquiries from '../features/inquiries/pages/BuyerInquiries'
import BuyerProfile from '../features/buyer/pages/Profile'
import BuyerSettings from '../features/settings/pages/BuyerSettings'
import FAQ from '../features/support/pages/FAQ'
import { ThemeProvider } from './providers/theme'

/* Shared AI pages */
import AIAdvisor from '../features/ai/pages/AIAdvisor'
import AIAssistant from '../features/ai/pages/AIAssistant'
import AIRecommendations from '../features/ai/pages/AIRecommendations'

/* Farmer AI pages */
import AICropInsights from '../features/ai/pages/farmer/AICropInsights'
import AIPriceRecommendation from '../features/ai/pages/farmer/AIPriceRecommendation'
import AIListingImprovement from '../features/ai/pages/farmer/AIListingImprovement'
import AIBuyerMatching from '../features/ai/pages/farmer/AIBuyerMatching'
import AIHarvestPlanner from '../features/ai/pages/farmer/AIHarvestPlanner'

/* Buyer AI pages */
import AIProduceFinder from '../features/ai/pages/buyer/AIProduceFinder'
import AISupplierMatching from '../features/ai/pages/buyer/AISupplierMatching'
import AIPurchasePlanning from '../features/ai/pages/buyer/AIPurchasePlanning'
import Footer from '../components/layout/Footer'
import Checkout from '../features/cart/pages/Checkout'
import NotFound from '../features/support/pages/NotFound'
import { me as fetchMe, login as demoLogin, logout as apiLogout } from '../features/auth/services/authService'
import Browse, { EMPTY_FILTERS } from '../features/buyer/pages/Browse'
import { parseHash } from '../router/routes'

/* Auth boot panel — shown on protected routes while the boot session
   check (httpOnly cookie restore via GET /api/auth/me) is still in
   flight. Prevents the shells from flashing their signed-out access
   gate before flipping to the dashboard on refresh. */
function AuthBoot() {
  return (
    <div className="min-h-[calc(100vh-72px)] bg-farmer-page px-4 py-16" aria-busy="true">
      <div
        role="status"
        className="mx-auto max-w-md rounded-2xl border border-line/80 bg-paper p-8 text-center shadow-sm"
      >
        <RotateCw size={26} aria-hidden="true" className="mx-auto animate-spin text-brand" />
        <h2 className="mt-3 font-display text-lg font-bold text-ink">Checking your session…</h2>
        <p className="mt-1 text-sm text-muted">
          Restoring your sign-in from the secure session cookie.
        </p>
      </div>
    </div>
  )
}

export default function App() {
  // ------------------------------------------------------------------ state
  const [user, setUser] = useState(null) // { name, email, role: 'Buyer' | 'Farmer' } — server-verified session
  const [route, setRoute] = useState(parseHash) // 'shop' | 'farmer/<page>'
  const [authOpen, setAuthOpen] = useState(false)
  const [authPreset, setAuthPreset] = useState(null) // { tab, role } — pre-selects modal state
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([]) // [{ productId, name, price, unit, image, stock, qty }]
  const [hydrated, setHydrated] = useState(false) // localStorage cart restored
  /* Auth boot: the fresh mount looks identical to "signed out" until the
     cookie-restore check answers. authReady turns true once the boot check
     settles (fetchMe resolve/reject or demo fallback), so protected routes
     show a loading state instead of flashing an access panel before
     flipping to the dashboard. */
  const [authReady, setAuthReady] = useState(false)

  /* Where a farmer wanted to go before being asked to sign in — restored
     after a successful auth. A ref so the boot effect can read it too. */
  const returnTo = useRef(null)
  /* Generation counter bumped on sign-out: any in-flight session restore
     (or demo login) that resolves AFTER a logout is ignored, so a stale
     response can never re-authenticate the UI (session security). */
  const sessionEpoch = useRef(0)

  // ------------------------------------------------------------------ cart
  /* Persist the cart to a versioned localStorage key so it survives
     refreshes. Restored data is validated before use; corrupted storage
     is ignored. No tokens, payment credentials or other sensitive data
     are ever persisted. */
  const CART_STORAGE_KEY = 'agrilink_cart_v1'

  const loadCart = useCallback(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return
      const valid = parsed.filter(
        (i) =>
          i &&
          typeof i.productId === 'string' &&
          typeof i.name === 'string' &&
          typeof i.price === 'number' &&
          i.price > 0 &&
          typeof i.unit === 'string' &&
          typeof i.qty === 'number' &&
          i.qty >= 1 &&
          typeof i.stock === 'number' &&
          i.qty <= i.stock,
      )
      setCart(valid)
    } catch {
      /* corrupted or unreadable storage — start with an empty cart */
    }
    setHydrated(true)
  }, [])

  const saveCart = useCallback(
    (c) => {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(c))
      } catch {
        /* storage unavailable or quota exceeded — cart lives in memory only */
      }
    },
    [],
  )

  useEffect(() => {
    loadCart()
  }, [loadCart])

  useEffect(() => {
    if (!hydrated) return
    saveCart(cart)
  }, [cart, hydrated, saveCart])

  const addToCart = useCallback((product) => {
    setCart((prev) => {
      const found = prev.find((i) => i.productId === product.id)
      /* respect the farmer's real stock: never allow more than is listed */
      if (found)
        return prev.map((i) =>
          i.productId === product.id ? { ...i, qty: Math.min(i.qty + 1, product.stock) } : i,
        )
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          unit: product.unit.split(' ')[0],
          image: product.image,
          stock: product.stock,
          qty: 1,
        },
      ]
    })
  }, [])

  const changeQty = useCallback((productId, delta) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.productId === productId
            ? { ...i, qty: Math.min(Math.max(i.qty + delta, 1), i.stock ?? 99) }
            : i,
        )
        .filter((i) => i.qty > 0),
    )
  }, [])

  const removeFromCart = useCallback(
    (productId) => setCart((prev) => prev.filter((i) => i.productId !== productId)),
    [],
  )

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)

  /* ---------------------------------------------------------------- routes */
  const goRoute = useCallback((next) => {
    setRoute(next)
    const hash = next === 'shop' ? '#shop' : `#/${next}`
    if (window.location.hash !== hash) history.replaceState(null, '', hash)
    window.scrollTo(0, 0)
  }, [])

  /* Buyer dashboard: Browse's filter state lives at app level so the
     Overview's "Find Produce" form can jump straight into a pre-filtered
     Browse (and "clear filters" has a single source of truth). */
  const [browseFilters, setBrowseFilters] = useState(EMPTY_FILTERS)
  const jumpToBrowse = useCallback(
    (patch = {}) => {
      setBrowseFilters({ ...EMPTY_FILTERS, ...patch })
      goRoute('buyer/produce')
    },
    [goRoute],
  )

  /* Browser back/forward and manual hash edits stay in sync. Scrolling to
     the top matches goRoute() so hash-anchor links (footer/nav CTAs) land
     the user at the start of the destination page, like the buttons do. */
  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const openAuth = useCallback((preset = {}) => {
    setAuthPreset(preset)
    setAuthOpen(true)
  }, [])

  /* Checkout gate: signed-in buyers go straight to checkout; anonymous
     users open the login modal and return here after signing in. */
  const openCheckout = useCallback(() => {
    if (!user) {
      returnTo.current = 'shop/checkout'
      openAuth({ tab: 'login' })
      return
    }
    goRoute('shop/checkout')
  }, [user, goRoute, openAuth])

  /* Session boot:
     ✓ /?auth=1 opens the auth modal
     ✓ /?demo=farmer silently signs in as the seeded demo farmer (real
        MongoDB session; visual fallback if the API is offline)
     ✓ otherwise restore an in-progress session from the httpOnly cookie,
        then land each role on its own page (farmer dashboard / shop) */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    if (params.get('demo') === 'farmer') {
      demoLogin({ email: 'demo@agrilink.co.ke', password: 'demo1234', role: 'Farmer' })
        .then((u) => u && sessionEpoch.current === 0 && handleAuth(u))
        // API offline → visual fallback so the dashboard demo still shows
        .catch(() =>
          handleAuth({ name: 'Joseph Kariuki', email: 'joseph@agrilink.co.ke', role: 'Farmer' }),
        )
        .finally(() => setAuthReady(true))
      if (params.get('auth')) openAuth()
      return
    }

    /* ?demo=buyer — the seeded demo buyer (real MongoDB account) lands on
       the buyer dashboard for the showcase */
    if (params.get('demo') === 'buyer') {
      demoLogin({ email: 'wanjiku@agrilink.co.ke', password: 'demo1234', role: 'Buyer' })
        .then((u) => {
          if (sessionEpoch.current !== 0) return
          setUser(u)
          setAuthOpen(false)
          goRoute('buyer/dashboard')
        })
        .catch(() =>
          handleAuth({ name: 'Wanjiku Kamau', email: 'wanjiku@agrilink.co.ke', role: 'Buyer' }),
        )
        .finally(() => setAuthReady(true))
      if (params.get('auth')) openAuth()
      return
    }

    if (params.get('auth')) openAuth()

    // plain visit — the signed JWT cookie decides who we are
    fetchMe()
      .then((u) => {
        if (u && sessionEpoch.current === 0) handleAuth(u)
      })
      /* A confirmed 401 means the stored JWT is expired/invalid: purge the
         stale cookie server-side so it can never authenticate again.
         Network failures (status 0) are NOT treated as logout — the user
         keeps whatever session the cookie really holds (retry on refresh). */
      .catch((err) => {
        if (err?.status === 401) apiLogout().catch(() => {})
      })
      .finally(() => setAuthReady(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ------------------------------------------------------------------ auth
  /* Every successful login/signup/restore routes by the SERVER-returned
     role — but never steals a deep link the app is already showing:
     • fresh login from a public page → each role lands on its own
       dashboard (farmer dashboard / buyer dashboard)
     • session restored while sitting on #/farmer/* or #/buyer/* → the
       deep link survives the reload
     • a saved "returnTo" (the page the user was blocked from) wins over
       all of the above for its own role */
  const handleAuth = useCallback(
    (authUser) => {
      setUser(authUser)
      setAuthOpen(false)
      const target = returnTo.current
      returnTo.current = null
      const current = parseHash()
      /* checkout deep link restored after login/signup */
      if (target === 'shop/checkout') {
        goRoute('shop/checkout')
        return
      }
      if (authUser?.role === 'Farmer') {
        const deep =
          current.startsWith('farmer/') ? current : (target && target.startsWith('farmer/')) ? target : 'farmer/dashboard'
        goRoute(deep)
      } else {
        const deep =
          current.startsWith('buyer/') ? current : (target && target.startsWith('buyer/')) ? target : 'buyer/dashboard'
        goRoute(deep)
      }
    },
    [goRoute],
  )

  const [notice, setNotice] = useState(null) // sign-out confirmation (aria-live)

  const signOut = useCallback(async () => {
    let serverConfirmed = false
    try {
      await apiLogout() // clear the session cookie server-side
      serverConfirmed = true
    } catch {
      /* API offline — local state is still cleared below; the toast says
         honestly that the server-side cookie could not be dropped. */
    }
    /* bump the epoch FIRST so any request in flight can no longer restore
       an authenticated state after the user asked to sign out */
    sessionEpoch.current += 1
    setUser(null)
    returnTo.current = null
    goRoute('shop')
    setNotice(
      serverConfirmed
        ? 'You are signed out.'
        : 'Signed out on this device — but the server could not be reached to invalidate the session. Avoid shared computers.',
    )
  }, [goRoute])

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 5000)
    return () => clearTimeout(t)
  }, [notice])

  // ----------------------------------------------------------------- render
  const page = route.startsWith('farmer/') ? route.slice('farmer/'.length) : null
  const buyerPage = route.startsWith('buyer/') ? route.slice('buyer/'.length) : null

  const farmerPage = {
    dashboard: <Overview onNavigate={goRoute} />,
    'market-intelligence': <MarketIntelligence />,
    produce: <MyProduce />,
    inquiries: <FarmerInquiries />,
    orders: <FarmerOrders />,
    profile: <FarmProfile />,
    settings: <FarmerSettings />,
    'ai-market-advisor': <AIAdvisor />,
    'ai-agricultural-assistant': <AIAssistant />,
    'ai-recommendations': <AIRecommendations userRole="farmer" />,
    'ai-crop-insights': <AICropInsights />,
    'ai-price-recommendation': <AIPriceRecommendation />,
    'ai-listing-improvement': <AIListingImprovement />,
    'ai-buyer-matching': <AIBuyerMatching />,
    'ai-harvest-planner': <AIHarvestPlanner />,
  }[page ?? 'dashboard'] ?? <Overview onNavigate={goRoute} />

  const buyerNode = {
    dashboard: <BuyerOverview onJumpToBrowse={jumpToBrowse} />,
    produce: <BuyerBrowse filters={browseFilters} onFiltersChange={setBrowseFilters} />,
    'price-comparison': <BuyerPriceCompare />,
    requests: <BuyerRequests />,
    inquiries: <BuyerInquiries />,
    saved: <BuyerSaved onBrowse={() => jumpToBrowse()} />,
    orders: <BuyerOrders />,
    profile: <BuyerProfile />,
    settings: <BuyerSettings />,
    'ai-market-advisor': <AIAdvisor />,
    'ai-agricultural-assistant': <AIAssistant />,
    'ai-recommendations': <AIRecommendations userRole="buyer" />,
    'ai-produce-finder': <AIProduceFinder />,
    'ai-supplier-matching': <AISupplierMatching />,
    'ai-purchase-planning': <AIPurchasePlanning />,
  }[buyerPage ?? 'dashboard'] ?? <BuyerOverview onJumpToBrowse={jumpToBrowse} />

  return (
    <ThemeProvider>
      <div className="min-h-screen">
      <Navbar
        user={user}
        booting={!authReady}
        route={route}
        onRoute={goRoute}
        search={search}
        onSearch={setSearch}
        cart={cart}
        cartCount={cartCount}
        onQty={changeQty}
        onCheckout={openCheckout}
        onSignIn={() => openAuth()}
        onSignOut={signOut}
      />

      {/* offset for the fixed navbar (main row + mobile search row) */}
      <main className="pt-[136px] md:pt-[72px]">
        {/* while the boot session check is in flight, protected routes
            render a loading state — never a flash of the signed-out gate
            followed by the dashboard */}
        {!authReady && (route.startsWith('farmer/') || route.startsWith('buyer/')) ? (
          <AuthBoot />
        ) : route === 'shop/checkout' ? (
          !user ? (
            <Checkout
              user={null}
              onSignIn={() => {
                returnTo.current = 'shop/checkout'
                openAuth({ tab: 'login' })
              }}
            />
          ) : (
            <Checkout
              cart={cart}
              user={user}
              onQty={changeQty}
              onRemove={removeFromCart}
              onBack={() => goRoute('shop')}
              onOrderPlaced={() => setCart([])}
            />
          )
        ) : route === 'contact' ? (
          <ContactPage onOpenAuth={openAuth} />
        ) : route === 'how-it-works' ? (
          <HowItWorks />
        ) : route === 'faq' ? (
          <FAQ />
        ) : route === 'about' ? (
          <AboutPage />
        ) : route === 'start-selling' ? (
          <StartSelling user={user} onOpenAuth={openAuth} onNavigate={goRoute} />
        ) : route === 'not-found' ? (
          <NotFound user={user} onRoute={goRoute} />
        ) : route === 'shop' ? (
          <>
            {/* hero CTA pre-picks the Farmer card: "Join as a Farmer" leads
                straight into farmer signup */}
            <Hero onJoin={() => openAuth({ tab: 'signup', role: 'Farmer' })} />
            <Marketplace
              search={search}
              onClearSearch={() => setSearch('')}
              onAddToCart={addToCart}
            />
          </>
        ) : route.startsWith('buyer/') ? (
          <BuyerShell
            user={user}
            page={buyerPage}
            onNavigate={goRoute}
            onSignOut={signOut}
            /* the access guard remembers the buyer route, so after
               sign-in the user lands where they intended */
            onOpenAuth={(preset) => {
              returnTo.current = route
              openAuth(preset)
            }}
            onBackToShop={() => goRoute('shop')}
            onFarmerDashboard={() => goRoute('farmer/dashboard')}
          >
            {buyerNode}
          </BuyerShell>
        ) : (
          <FarmerShell
            user={user}
            page={page}
            onNavigate={goRoute}
            onSignOut={signOut}
            /* the access guard remembers the farmer route, so after
               sign-in the user lands where they intended */
            onOpenAuth={(preset) => {
              returnTo.current = route
              openAuth(preset)
            }}
            onBackToShop={() => goRoute('shop')}
          >
            {farmerPage}
          </FarmerShell>
        )}
        {/* The marketing footer belongs to the public-side chrome (shop,
            checkout, public content pages). Farmer/Buyer dashboard routes
            — including their signed-out access gates — render without it;
            the shells' own full-height layout fills the viewport instead. */}
        {!route.startsWith('farmer/') && !route.startsWith('buyer/') && (
          <Footer onLogin={() => openAuth({ tab: 'login' })} />
        )}
      </main>

      {/* Sign-out (etc.) confirmation — aria-live so screen readers hear it */}
      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-1/2 z-[70] -translate-x-1/2 rounded-xl border border-line/70 bg-paper px-4 py-2.5 text-sm font-medium text-ink shadow-lg"
        >
          {notice}
        </div>
      )}

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuth={handleAuth}
        initialTab={authPreset?.tab ?? 'login'}
        initialRole={authPreset?.role ?? null}
      />
      </div>
    </ThemeProvider>
  )
}
