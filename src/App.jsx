import { useState, useCallback, useEffect, useRef } from 'react'
import Navbar from './components/Navbar'
import AuthModal from './components/AuthModal'
import Hero from './components/Hero'
import Marketplace from './components/Marketplace'
import FarmerShell from './components/farmer/FarmerShell'
import BuyerShell from './components/buyer/BuyerShell'
import Overview from './components/farmer/pages/Overview'
import MarketIntelligence from './components/farmer/pages/MarketIntelligence'
import MyProduce from './components/farmer/pages/MyProduce'
import FarmProfile from './components/farmer/pages/FarmProfile'
import FarmerOrders from './components/farmer/pages/Orders'
import FarmerInquiries from './components/farmer/pages/Inquiries'
import NotYet from './components/farmer/pages/NotYet'
import BuyerOverview from './components/buyer/pages/Overview'
import BuyerBrowse from './components/buyer/pages/Browse'
import BuyerPriceCompare from './components/buyer/pages/PriceCompare'
import BuyerRequests from './components/buyer/pages/Requests'
import BuyerSaved from './components/buyer/pages/Saved'
import BuyerOrders from './components/buyer/pages/Orders'
import BuyerInquiries from './components/buyer/pages/Inquiries'
import BuyerProfile from './components/buyer/pages/Profile'
import BuyerSettings from './components/buyer/pages/Settings'
import Footer from './components/Footer'
import Checkout from './components/shop/Checkout'
import NotFound from './components/NotFound'
import { me as fetchMe, login as demoLogin, logout as apiLogout } from './utils/api'
import Browse, { EMPTY_FILTERS } from './components/buyer/pages/Browse'
import { Settings as SettingsIcon } from 'lucide-react'

/* ---------------------------------------------------------------- routing
   The app's existing convention is a hash-synced page state (no router
   dependency). Role dashboards extend it: #/farmer/dashboard, #/buyer/
   produce, … (each page set is guarded by the SERVER-verified session
   role). Legacy #farmer/#buyer aliases land on the first dashboard page;
   unknown hashes fall back to the shop. */
const FARMER_PAGE_IDS = [
  'dashboard',
  'market-intelligence',
  'produce',
  'inquiries',
  'orders',
  'profile',
  'settings',
]

const BUYER_PAGE_IDS = [
  'dashboard',
  'produce',
  'price-comparison',
  'requests',
  'inquiries',
  'saved',
  'orders',
  'profile',
  'settings',
]

const SHOP_PAGE_IDS = ['checkout']

const parseHash = () => {
  const h = window.location.hash.replace(/^#\/?/, '').toLowerCase()
  if (h === '' || h === 'shop') return 'shop'
  if (h.startsWith('shop/')) {
    const page = h.slice('shop/'.length)
    return SHOP_PAGE_IDS.includes(page) ? `shop/${page}` : 'not-found'
  }
  if (h === 'farmer') return 'farmer/dashboard' // legacy alias
  if (h.startsWith('farmer/')) {
    const page = h.slice('farmer/'.length)
    return FARMER_PAGE_IDS.includes(page) ? `farmer/${page}` : 'not-found'
  }
  if (h === 'buyer') return 'buyer/dashboard' // legacy alias
  if (h.startsWith('buyer/')) {
    const page = h.slice('buyer/'.length)
    return BUYER_PAGE_IDS.includes(page) ? `buyer/${page}` : 'not-found'
  }
  return 'not-found'
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

  /* Where a farmer wanted to go before being asked to sign in — restored
     after a successful auth. A ref so the boot effect can read it too. */
  const returnTo = useRef(null)

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

  /* Browser back/forward and manual hash edits stay in sync */
  useEffect(() => {
    const onHash = () => setRoute(parseHash())
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
        .then(handleAuth)
        // API offline → visual fallback so the dashboard demo still shows
        .catch(() =>
          handleAuth({ name: 'Joseph Kariuki', email: 'joseph@agrilink.co.ke', role: 'Farmer' }),
        )
      if (params.get('auth')) openAuth()
      return
    }

    /* ?demo=buyer — the seeded demo buyer (real MongoDB account) lands on
       the buyer dashboard for the showcase */
    if (params.get('demo') === 'buyer') {
      demoLogin({ email: 'wanjiku@agrilink.co.ke', password: 'demo1234', role: 'Buyer' })
        .then((u) => {
          setUser(u)
          setAuthOpen(false)
          goRoute('buyer/dashboard')
        })
        .catch(() =>
          handleAuth({ name: 'Wanjiku Kamau', email: 'wanjiku@agrilink.co.ke', role: 'Buyer' }),
        )
      if (params.get('auth')) openAuth()
      return
    }

    if (params.get('auth')) openAuth()

    // plain visit — the signed JWT cookie decides who we are
    fetchMe()
      .then((u) => u && handleAuth(u))
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ------------------------------------------------------------------ auth
  /* Every successful login/signup/restore routes by the SERVER-returned
     role — but never steals a deep link the app is already showing:
     • fresh login from the shop → farmers land on their dashboard,
       buyers stay on the shop (the marketplace is a buyer's home)
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
          current.startsWith('buyer/') ? current : (target && target.startsWith('buyer/')) ? target : 'shop'
        goRoute(deep)
      }
    },
    [goRoute],
  )

  const signOut = useCallback(async () => {
    try {
      await apiLogout() // clear the session cookie server-side
    } catch {
      /* API offline — clear local state anyway */
    }
    setUser(null)
    returnTo.current = null
    goRoute('shop')
  }, [goRoute])

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
    settings: (
      <NotYet icon={SettingsIcon} title="Settings are not available yet.">
        Account and notification preferences will be available in a later stage.
      </NotYet>
    ),
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
  }[buyerPage ?? 'dashboard'] ?? <BuyerOverview onJumpToBrowse={jumpToBrowse} />

  return (
    <div className="min-h-screen">
      <Navbar
        user={user}
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
        {route === 'shop/checkout' ? (
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
        <Footer />
      </main>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuth={handleAuth}
        initialTab={authPreset?.tab ?? 'login'}
        initialRole={authPreset?.role ?? null}
      />
    </div>
  )
}
