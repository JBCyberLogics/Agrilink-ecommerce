import { useState, useCallback, useEffect, useRef } from 'react'
import Navbar from './components/Navbar'
import AuthModal from './components/AuthModal'
import Hero from './components/Hero'
import Marketplace from './components/Marketplace'
import FarmerShell from './components/farmer/FarmerShell'
import Overview from './components/farmer/pages/Overview'
import MarketIntelligence from './components/farmer/pages/MarketIntelligence'
import MyProduce from './components/farmer/pages/MyProduce'
import FarmProfile from './components/farmer/pages/FarmProfile'
import NotYet from './components/farmer/pages/NotYet'
import Footer from './components/Footer'
import { PRODUCTS } from './data/mockData'
import { me as fetchMe, login as demoLogin, logout as apiLogout } from './utils/api'
import { MessageSquare, Receipt, Settings as SettingsIcon } from 'lucide-react'

/* ---------------------------------------------------------------- routing
   The app's existing convention is a hash-synced page state (no router
   dependency). Farmer routes extend it: #/farmer/dashboard, #/farmer/
   produce, … #/farmer/settings. #farmer (legacy) still lands on the
   dashboard. Unknown hashes fall back to the shop. */
const FARMER_PAGE_IDS = [
  'dashboard',
  'market-intelligence',
  'produce',
  'inquiries',
  'orders',
  'profile',
  'settings',
]

const parseHash = () => {
  const h = window.location.hash.replace(/^#\/?/, '').toLowerCase()
  if (h === '' || h === 'shop') return 'shop'
  if (h === 'farmer') return 'farmer/dashboard' // legacy alias
  if (h.startsWith('farmer/')) {
    const page = h.slice('farmer/'.length)
    return FARMER_PAGE_IDS.includes(page) ? `farmer/${page}` : 'farmer/dashboard'
  }
  return 'shop'
}

export default function App() {
  // ------------------------------------------------------------------ state
  const [user, setUser] = useState(null) // { name, email, role: 'Buyer' | 'Farmer' } — server-verified session
  const [route, setRoute] = useState(parseHash) // 'shop' | 'farmer/<page>'
  const [authOpen, setAuthOpen] = useState(false)
  const [authPreset, setAuthPreset] = useState(null) // { tab, role } — pre-selects modal state
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([]) // [{ productId, name, price, unit, image, qty }]
  const products = PRODUCTS // marketplace feed (buyer experience, unchanged)

  /* Where a farmer wanted to go before being asked to sign in — restored
     after a successful auth. A ref so the boot effect can read it too. */
  const returnTo = useRef(null)

  // ------------------------------------------------------------------ cart
  const addToCart = useCallback((product) => {
    setCart((prev) => {
      const found = prev.find((i) => i.productId === product.id)
      if (found)
        return prev.map((i) => (i.productId === product.id ? { ...i, qty: i.qty + 1 } : i))
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          unit: product.unit.split(' ')[0],
          image: product.image,
          qty: 1,
        },
      ]
    })
  }, [])

  const changeQty = useCallback((productId, delta) => {
    setCart((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    )
  }, [])

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)

  /* ---------------------------------------------------------------- routes */
  const goRoute = useCallback((next) => {
    setRoute(next)
    const hash = next === 'shop' ? '#shop' : `#/${next}`
    if (window.location.hash !== hash) history.replaceState(null, '', hash)
    window.scrollTo(0, 0)
  }, [])

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

    if (params.get('auth')) openAuth()

    // plain visit — the signed JWT cookie decides who we are
    fetchMe()
      .then((u) => u && handleAuth(u))
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ------------------------------------------------------------------ auth
  /* Every successful login/signup/restore routes by the SERVER-returned
     role: farmers land on their dashboard (returning to the page they
     tried to reach, when one was saved), buyers on the shop. A buyer is
     never dropped into farmer pages. */
  const handleAuth = useCallback(
    (authUser) => {
      setUser(authUser)
      setAuthOpen(false)
      const target = returnTo.current
      returnTo.current = null
      if (authUser?.role === 'Farmer') {
        goRoute(target && target.startsWith('farmer/') ? target : 'farmer/dashboard')
      } else {
        goRoute('shop')
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

  const farmerPage = {
    dashboard: <Overview onNavigate={goRoute} />,
    'market-intelligence': <MarketIntelligence />,
    produce: <MyProduce />,
    inquiries: (
      <NotYet icon={MessageSquare} title="Buyer inquiries are not available yet.">
        No buyer inquiries are available. Messaging between buyers and farmers opens in a later
        stage — nothing is simulated here.
      </NotYet>
    ),
    orders: (
      <NotYet icon={Receipt} title="No recorded sales yet.">
        Sales information will appear when recorded transactions are available.
      </NotYet>
    ),
    profile: <FarmProfile />,
    settings: (
      <NotYet icon={SettingsIcon} title="Settings are not available yet.">
        Account and notification preferences will be available in a later stage.
      </NotYet>
    ),
  }[page ?? 'dashboard'] ?? <Overview onNavigate={goRoute} />

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
        onSignIn={() => openAuth()}
        onSignOut={signOut}
      />

      {/* offset for the fixed navbar (main row + mobile search row) */}
      <main className="pt-[136px] md:pt-[72px]">
        {route === 'shop' ? (
          <>
            {/* hero CTA pre-picks the Farmer card: "Join as a Farmer" leads
                straight into farmer signup */}
            <Hero onJoin={() => openAuth({ tab: 'signup', role: 'Farmer' })} />
            <Marketplace
              products={products}
              search={search}
              onClearSearch={() => setSearch('')}
              onAddToCart={addToCart}
            />
          </>
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
