import { useState, useCallback, useEffect } from 'react'
import Navbar from './components/Navbar'
import AuthModal from './components/AuthModal'
import Hero from './components/Hero'
import Marketplace from './components/Marketplace'
import FarmerPanel from './components/FarmerPanel'
import Footer from './components/Footer'
import { PRODUCTS, MY_LISTINGS, IMAGES } from './data/mockData'

export default function App() {
  // ------------------------------------------------------------------ state
  const [user, setUser] = useState(null) // { name, email, role: 'Buyer' | 'Farmer' }
  const [authOpen, setAuthOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([]) // [{ productId, name, price, unit, image, qty }]
  // products + farmer listings both live here so a freshly posted listing
  // immediately appears on the marketplace feed too
  const [products, setProducts] = useState(PRODUCTS)
  const [listings, setListings] = useState(MY_LISTINGS)

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

  /* Demo hooks: /?auth=1 opens the auth modal, /?demo=farmer previews the dashboard */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('auth')) setAuthOpen(true)
    if (params.get('demo') === 'farmer')
      setUser({ name: 'Joseph Kariuki', email: 'joseph@agrilink.co.ke', role: 'Farmer' })
  }, [])

  // ------------------------------------------------------------------ auth
  const handleAuth = useCallback((authUser) => {
    setUser(authUser)
    setAuthOpen(false)
  }, [])

  const signOut = useCallback(() => setUser(null), [])

  // ------------------------------------------------------- farmer listings
  const postListing = useCallback(
    (form) => {
      if (!user) return
      const id = `L-${Date.now()}`
      setListings((prev) => [
        {
          id,
          name: form.name,
          category: form.category,
          price: form.price,
          unit: form.unit,
          stock: form.stock,
          stockUnit: form.unit,
          image: IMAGES.covers[form.category],
          views: 0,
          orders: 0,
        },
        ...prev,
      ])
      // make it visible on the marketplace feed instantly
      setProducts((prev) => [
        {
          id,
          name: form.name,
          category: form.category,
          price: form.price,
          unit: form.unit,
          stock: form.stock,
          stockLabel: `${form.stock} ${form.unit}`,
          image: IMAGES.covers[form.category],
          farmer: `Farmer ${user.name.split(' ')[0]}`,
          location: 'Your farm',
          rating: 4.8,
          reviews: 3,
          badge: 'New',
        },
        ...prev,
      ])
    },
    [user],
  )

  const removeListing = useCallback((id) => {
    setListings((prev) => prev.filter((l) => l.id !== id))
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  // ------------------------------------------------------------------ render
  return (
    <div className="min-h-screen">
      <Navbar
        user={user}
        search={search}
        onSearch={setSearch}
        cart={cart}
        cartCount={cartCount}
        onQty={changeQty}
        onSignIn={() => setAuthOpen(true)}
        onSignOut={signOut}
      />

      {/* offset for the fixed navbar (main row + mobile search row) */}
      <main className="pt-[136px] md:pt-[72px]">
        <Hero onJoin={() => setAuthOpen(true)} />
        <Marketplace
          products={products}
          search={search}
          onClearSearch={() => setSearch('')}
          onAddToCart={addToCart}
        />
        <section id="farmer-panel" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-10 sm:px-6 lg:px-8">
          <FarmerPanel
            user={user}
            onOpenAuth={() => setAuthOpen(true)}
            onSwitchRole={() => setUser((u) => ({ ...u, role: 'Farmer' }))}
            listings={listings}
            onPostListing={postListing}
            onRemoveListing={removeListing}
          />
        </section>
        <Footer />
      </main>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuth={handleAuth} />
    </div>
  )
}
