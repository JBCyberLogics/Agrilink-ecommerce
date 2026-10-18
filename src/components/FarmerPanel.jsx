import { useState } from 'react'
import {
  Lock,
  Tractor,
  ShoppingBag,
  ArrowRight,
  Package,
  Eye,
  Trash2,
  PackagePlus,
  Check,
  TrendingUp,
  Wheat,
  Carrot,
  Info,
} from 'lucide-react'
import { CATEGORIES, IMAGES } from '../data/mockData'
import Field, { FIELD_ICONS } from './ui/Field'

const LOW_STOCK = 50

const CATEGORY_ICONS = {
  Grains: Wheat,
  'Fruits & Veg': Carrot,
  Livestock: Tractor,
}
const CATEGORY_IMAGES = {
  Grains: IMAGES.covers.Grains,
  'Fruits & Veg': IMAGES.covers['Fruits & Veg'],
  Livestock: IMAGES.covers.Livestock,
}
const UNITS = ['kg', 'litre', 'bunch', 'tray', 'crate', 'bird', 'head', 'cob', 'jar']

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
const money = (n) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`

/* ================================================================== */
/* Post-produce form                                                   */
/* ================================================================== */
function PostListingForm({ onSubmit }) {
  const [form, setForm] = useState({ name: '', category: null, price: '', unit: 'kg', stock: '' })
  const [errors, setErrors] = useState({})
  const [posting, setPosting] = useState(false)
  const [posted, setPosted] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const next = {}
    if (form.name.trim().length < 3) next.name = 'Give your produce a clear name.'
    if (!form.category) next.category = 'Pick the closest category.'
    if (!form.price || Number(form.price) <= 0) next.price = 'Price must be greater than $0.'
    if (form.stock === '' || Number(form.stock) < 0) next.stock = 'Enter the units you have.'
    setErrors(next)
    if (Object.keys(next).length) return

    setPosting(true)
    /* --- Mock network latency for the future API call --- */
    setTimeout(() => {
      setPosting(false)
      setPosted(true)
      setTimeout(() => setPosted(false), 3500)
      onSubmit({ ...form, price: Number(form.price), stock: Number(form.stock) })
      setForm({ name: '', category: null, price: '', unit: 'kg', stock: '' })
    }, 700)
  }

  const selectCls =
    'h-12 w-full rounded-xl border bg-white/75 text-sm outline-none backdrop-blur-sm transition-colors ' +
    (errors.category ? 'border-red-300' : 'border-neutral-200/80 focus:border-primary focus:ring-2 focus:ring-primary/20')

  return (
    <form
      onSubmit={submit}
      noValidate
      className="sticky top-28 rounded-3xl border border-neutral-100 bg-white p-6 shadow-soft"
    >
      <div className="mb-5 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-lift">
          <PackagePlus size={19} aria-hidden="true" />
        </span>
        <div>
          <h3 className="font-display text-lg font-bold text-neutral-900">Post New Produce</h3>
          <p className="text-xs text-neutral-500">Reach thousands of buyers in under a minute.</p>
        </div>
      </div>

      <div className="space-y-4">
        <Field
          id="produce-name"
          label="Product name"
          placeholder="e.g. Sun-Ripened Tomatoes"
          icon={FIELD_ICONS.search}
          value={form.name}
          onChange={set('name')}
          error={errors.name}
        />

        {/* category segmented picker */}
        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-neutral-700">Category</p>
          <div role="radiogroup" aria-label="Produce category" className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICONS[c]
              const active = form.category === c
              return (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    setForm((f) => ({ ...f, category: c }))
                    setErrors((er) => ({ ...er, category: undefined }))
                  }}
                  className={`flex h-[52px] items-center justify-center gap-1.5 rounded-xl border text-[12px] font-semibold transition-all ${
                    active
                      ? 'border-primary bg-primary-soft text-primary-dark ring-1 ring-primary/25'
                      : 'border-neutral-200 bg-white text-neutral-500 hover:border-primary/30'
                  }`}
                >
                  <Icon size={15} aria-hidden="true" />
                  {c}
                </button>
              )
            })}
          </div>
          {errors.category && (
            <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
              {errors.category}
            </p>
          )}
        </div>

        {/* price + unit */}
        <div className="grid grid-cols-[1fr_112px] gap-3">
          <Field
            id="produce-price"
            label="Price per unit"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            icon={FIELD_ICONS.money}
            value={form.price}
            onChange={set('price')}
            error={errors.price}
          />
          <div>
            <label htmlFor="produce-unit" className="mb-1.5 block text-[13px] font-semibold text-neutral-700">
              Unit
            </label>
            <select
              id="produce-unit"
              value={form.unit}
              onChange={set('unit')}
              className="h-12 w-full cursor-pointer rounded-xl border border-neutral-200/80 bg-white/75 px-3 text-sm outline-none backdrop-blur-sm transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  / {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Field
          id="produce-stock"
          label="Stock availability"
          type="number"
          min="0"
          step="1"
          placeholder="e.g. 480"
          icon={FIELD_ICONS.stock}
          value={form.stock}
          onChange={set('stock')}
          error={errors.stock}
        />

        {/* submit */}
        <button
          type="submit"
          disabled={posting}
          className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-lift transition-all ${
            posting ? 'cursor-wait bg-primary-light' : 'bg-primary hover:bg-primary-dark'
          } motion-safe:active:scale-[0.98]`}
        >
          {posting ? 'Publishing…' : 'Publish listing'}
          <ArrowRight size={16} aria-hidden="true" />
        </button>

        {/* success confirmation */}
        {posted ? (
          <p className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary-soft px-3.5 py-3 text-[13px] font-medium text-primary-dark" aria-live="polite">
            <Check size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            Listing published — it is now live on the marketplace!
          </p>
        ) : (
          <p className="flex items-start gap-2 text-[11px] leading-relaxed text-neutral-400">
            <Info size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
            Listings go live instantly. You can edit stock anytime from this panel.
          </p>
        )}
      </div>
    </form>
  )
}

/* ================================================================== */
/* One of the farmer's active listings                                 */
/* ================================================================== */
function ListingCard({ listing, onRemove }) {
  const low = listing.stock <= LOW_STOCK && listing.stock > 0
  const out = listing.stock === 0

  return (
    <article className="group relative flex animate-fade-up items-center gap-4 overflow-hidden rounded-2xl border border-neutral-100 bg-white p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift">
      <img
        src={listing.image}
        alt={listing.name}
        loading="lazy"
        className="h-20 w-20 shrink-0 rounded-xl bg-neutral-100 object-cover"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate font-display text-[15px] font-bold text-neutral-900">{listing.name}</h4>
          <span className="shrink-0 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-dark">
            {listing.category}
          </span>
        </div>
        <p className="mt-1 font-display text-[15px] font-bold text-primary-dark">
          ${listing.price.toFixed(2)}
          <span className="text-xs font-medium text-neutral-400"> / {listing.unit}</span>
        </p>

        {/* stock + simulated metrics */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              out
                ? 'bg-red-50 text-red-600'
                : low
                  ? 'bg-secondary-soft text-secondary-dark'
                  : 'bg-primary-soft text-primary-dark'
            }`}
          >
            {out ? 'Sold out' : low ? `Low — ${listing.stock} ${listing.stockUnit} left` : `In stock — ${listing.stock} ${listing.stockUnit}`}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-400">
            <Eye size={12} aria-hidden="true" />
            {fmt(listing.views)} views
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-400">
            <ShoppingBag size={12} aria-hidden="true" />
            {listing.orders} sold
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
            <TrendingUp size={12} aria-hidden="true" />
            {money(listing.orders * listing.price)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => onRemove(listing.id)}
          aria-label={`Delete ${listing.name} listing`}
          title="Delete listing"
          className="grid h-9 w-9 place-items-center rounded-lg text-neutral-300 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}

/* ================================================================== */
/* Dashboard shell: stats + form + listings                            */
/* ================================================================== */
function Dashboard({ user, listings, onPost, onRemove }) {
  const totalViews = listings.reduce((s, l) => s + l.views, 0)
  const totalOrders = listings.reduce((s, l) => s + l.orders, 0)
  const revenue = listings.reduce((s, l) => s + l.orders * l.price, 0)

  const stats = [
    { icon: Package, label: 'Active listings', value: listings.length, tone: 'bg-primary-soft text-primary' },
    { icon: Eye, label: 'Total views', value: fmt(totalViews), tone: 'bg-sky-50 text-sky-600' },
    { icon: ShoppingBag, label: 'Items sold', value: fmt(totalOrders), tone: 'bg-secondary-soft text-secondary-dark' },
    { icon: TrendingUp, label: 'Revenue (est.)', value: revenue.toLocaleString('en-US', { maximumFractionDigits: 2, style: 'currency', currency: 'USD' }), tone: 'bg-primary-soft text-primary-dark' },
  ]

  return (
    <div>
      {/* banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-dark via-primary to-primary-light p-8 text-white shadow-lift">
        <Tractor size={150} aria-hidden="true" className="absolute -right-6 -top-8 rotate-12 text-white/10" />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur">
          Farmer Dashboard
        </span>
        <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
          Karibu, {user.name.split(' ')[0]}
        </h2>
        <p className="mt-1 max-w-md text-sm text-emerald-50/85">
          {listings.length} active listings are live. Fresh produce posted here reaches buyers in all 47 counties.
        </p>
      </div>

      {/* stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((st) => (
          <div key={st.label} className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-soft">
            <span className={`grid h-9 w-9 place-items-center rounded-lg ${st.tone}`}>
              <st.icon size={17} aria-hidden="true" />
            </span>
            <p className="mt-3 font-display text-xl font-bold text-neutral-900">{st.value}</p>
            <p className="text-xs font-medium text-neutral-400">{st.label}</p>
          </div>
        ))}
      </div>

      {/* main split: form + listings */}
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[380px_1fr]">
        <PostListingForm onSubmit={onPost} />

        <section aria-label="Active listings">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-neutral-900">Active Listings</h3>
            <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-bold text-neutral-500">
              {listings.length}
            </span>
          </div>

          {listings.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-neutral-300 bg-white/60 px-6 py-14 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-neutral-100 text-neutral-400">
                <Package size={22} aria-hidden="true" />
              </span>
              <p className="mt-3 text-sm font-semibold text-neutral-700">No listings yet</p>
              <p className="mt-1 max-w-xs text-xs text-neutral-400">
                Post your first produce using the form — buyers are notified instantly.
              </p>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {listings.map((l) => (
                <li key={l.id}>
                  <ListingCard listing={l} onRemove={onRemove} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

/* ================================================================== */
/* Gating: visitor / buyer / farmer                                    */
/* ================================================================== */
export default function FarmerPanel({ user, onOpenAuth, onSwitchRole, listings, onPostListing, onRemoveListing }) {
  if (!user)
    return (
      <Gate
        title="Farmers only beyond this gate"
        desc="Sign in to manage produce listings, view live metrics and reach thousands of buyers."
        cta="Sign in as a farmer"
        icon={Lock}
        onClick={onOpenAuth}
      />
    )

  if (user.role !== 'Farmer')
    return (
      <Gate
        icon={ShoppingBag}
        title={`You're browsing as a ${user.role.toLowerCase()}, ${user.name.split(' ')[0]}`}
        desc="Switch to farmer mode to post produce, manage stock and track sales from your own dashboard."
        cta="Try Farmer mode (demo)"
        secondaryCta="Back to Marketplace"
        secondaryHref="#marketplace"
        onClick={onSwitchRole}
      />
    )

  return <Dashboard user={user} listings={listings} onPost={onPostListing} onRemove={onRemoveListing} />
}

function Gate({ title, desc, cta, onClick, icon: Icon, secondaryCta, secondaryHref }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-neutral-100 bg-white px-6 py-16 text-center shadow-soft">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-lift">
        <Icon size={26} aria-hidden="true" />
      </span>
      <h2 className="mt-5 max-w-md font-display text-2xl font-bold text-neutral-900">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-500">{desc}</p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onClick}
          className="flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-lift transition-all hover:bg-primary-dark active:scale-[0.98]"
        >
          {cta}
          <ArrowRight size={16} aria-hidden="true" />
        </button>
        {secondaryCta && (
          <a
            href={secondaryHref}
            className="flex h-12 items-center gap-2 rounded-full border border-neutral-200 px-6 text-sm font-semibold text-neutral-600 transition-colors hover:border-primary/40 hover:text-primary-dark"
          >
            {secondaryCta}
          </a>
        )}
      </div>
    </div>
  )
}
