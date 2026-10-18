/**
 * MyProduce — real produce management against /api/farmer/listings.
 * Create + delete are genuine database operations; the cards show only
 * factual fields (price, stock, status, posted date) — no simulated
 * views/orders/revenue. Status tones never rely on color alone: every chip
 * carries a text label.
 */
import { useState } from 'react'
import { Sprout, PackagePlus, Wheat, Carrot, Tractor, AlertCircle, RotateCw } from 'lucide-react'
import { farmerCreateListing, farmerDeleteListing } from '../../../utils/api'
import { kes, fmtDate } from '../../../utils/format'
import Field, { FIELD_ICONS } from '../../ui/Field'
import EmptyState from '../parts/EmptyState'
import ConfirmDelete from '../parts/ConfirmDelete'
import useFarmerListings from '../parts/useFarmerListings'

const CATEGORIES = [
  { id: 'Grains', icon: Wheat },
  { id: 'Fruits & Veg', icon: Carrot },
  { id: 'Livestock', icon: Tractor },
]
const UNITS = ['kg', 'litre', 'bunch', 'tray', 'crate', 'bird', 'head', 'cob', 'jar']

const selectCls =
  'h-12 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-900 shadow-sm outline-none transition-colors hover:border-neutral-300 focus:border-primary focus:ring-2 focus:ring-primary/20 aria-[invalid=true]:border-red-300 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-200'

function StatusChip({ stock }) {
  const low = stock > 0 && stock < 50
  const out = stock === 0
  const tone = out
    ? 'bg-red-50 text-farmer-danger border-red-100'
    : low
      ? 'bg-amber-50 text-farmer-warning border-amber-100'
      : 'bg-farmer-surface text-farmer-success border-farmer-line'
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tone}`}>
      {out ? 'Sold out' : low ? 'Low stock' : 'In stock'}
    </span>
  )
}

/* --------------------------------------------------------------- form */
function PostForm({ onSaved }) {
  const [form, setForm] = useState({ name: '', category: '', price: '', unit: 'kg', stock: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [failed, setFailed] = useState(null)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const next = {}
    if (form.name.trim().length < 3) next.name = 'Give your produce a clear name.'
    if (!form.category) next.category = 'Pick the closest category.'
    if (!form.price || Number(form.price) <= 0) next.price = 'Price must be greater than zero.'
    if (form.stock === '' || Number(form.stock) < 0) next.stock = 'Enter the units you have.'
    setErrors(next)
    if (Object.keys(next).length) return

    setSaving(true)
    setSaved(false)
    setFailed(null)
    try {
      const d = await farmerCreateListing({
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        unit: form.unit,
        stock: Number(form.stock),
      })
      onSaved(d.listing)
      setForm({ name: '', category: '', price: '', unit: 'kg', stock: '' })
      setSaved(true)
      setErrors({})
    } catch (err) {
      if (err?.field) setErrors({ [err.field]: err.error })
      else setFailed(err?.error || 'Could not save the listing. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="produce-name"
          label="Produce name"
          placeholder="e.g. Green Maize"
          icon={FIELD_ICONS.name}
          value={form.name}
          onChange={set('name')}
          error={errors.name}
          autoComplete="off"
        />
        <div>
          <label htmlFor="produce-category" className="mb-1.5 block text-[13px] font-semibold text-neutral-700">
            Category
          </label>
          <select
            id="produce-category"
            value={form.category}
            onChange={set('category')}
            aria-invalid={!!errors.category}
            className={selectCls}
          >
            <option value="">Select category…</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1.5 text-xs font-medium text-farmer-danger">{errors.category}</p>}
        </div>
        <Field
          id="produce-price"
          label="Price per unit (KSh)"
          type="number"
          min="0"
          step="1"
          placeholder="e.g. 120"
          icon={FIELD_ICONS.money}
          value={form.price}
          onChange={set('price')}
          error={errors.price}
        />
        <div>
          <label htmlFor="produce-unit" className="mb-1.5 block text-[13px] font-semibold text-neutral-700">
            Unit
          </label>
          <select id="produce-unit" value={form.unit} onChange={set('unit')} className={selectCls}>
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
        <Field
          id="produce-stock"
          label="Available stock"
          type="number"
          min="0"
          step="1"
          placeholder="e.g. 500"
          icon={FIELD_ICONS.stock}
          value={form.stock}
          onChange={set('stock')}
          error={errors.stock}
        />
      </div>

      {failed && (
        <p role="alert" className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-farmer-danger">
          <AlertCircle size={13} aria-hidden="true" /> {failed}
        </p>
      )}
      <p aria-live="polite" className="min-h-[18px] text-xs font-medium text-farmer-success">
        {saved && !saving ? 'Listing saved to your produce.' : ''}
      </p>

      <button
        type="submit"
        disabled={saving}
        className={`inline-flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-farmer-primary/40 focus-visible:ring-offset-2 ${
          saving ? 'cursor-wait bg-farmer-primary/70' : 'bg-farmer-primary hover:bg-farmer-primary-hover'
        }`}
      >
        <PackagePlus size={16} aria-hidden="true" />
        {saving ? 'Saving…' : 'Post produce'}
      </button>
    </form>
  )
}

/* --------------------------------------------------------------- page */
export default function MyProduce() {
  const { status, listings, error, refresh } = useFarmerListings()
  const [rows, setRows] = useState(null) // local mirror seeded from server state

  if (status === 'loading')
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading produce">
        <div className="h-64 animate-pulse rounded-xl border border-farmer-line bg-white/70" />
        <div className="h-40 animate-pulse rounded-xl border border-farmer-line bg-white/70" />
      </div>
    )
  if (status === 'error')
    return (
      <div className="rounded-xl border border-farmer-line bg-white p-6 text-center">
        <p className="text-sm font-semibold text-farmer-ink">{error}</p>
        <button
          type="button"
          onClick={refresh}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-farmer-primary px-4 text-[13px] font-semibold text-white hover:bg-farmer-primary-hover"
        >
          <RotateCw size={14} aria-hidden="true" /> Try again
        </button>
      </div>
    )

  const current = rows ?? listings

  const saved = (listing) => setRows([listing, ...(current ?? [])])

  const removed = async (id) => {
    setRows((prev) => (prev ?? listings).filter((l) => l.id !== id))
    try {
      await farmerDeleteListing(id)
    } catch {
      /* optimistic removal failed server-side → resync */
      setRows(null)
      refresh()
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-farmer-line bg-white p-5 sm:p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-[15px] font-semibold text-farmer-ink">
          <Sprout size={16} aria-hidden="true" className="text-farmer-primary" />
          Post new produce
        </h2>
        <PostForm onSaved={saved} />
      </section>

      <section className="rounded-xl border border-farmer-line bg-white p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-[15px] font-semibold text-farmer-ink">
            Active listings
            <span className="ml-2 rounded-full bg-farmer-surface px-2 py-0.5 text-[11px] font-semibold text-farmer-primary">
              {current.length}
            </span>
          </h2>
        </div>

        {current.length === 0 ? (
          <EmptyState icon={Sprout} title="You have no active produce listings yet.">
            Post your first produce above — it is saved straight to your farm account.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-farmer-line">
            {current.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3.5 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-farmer-ink">{l.name}</p>
                  <p className="mt-0.5 text-xs text-farmer-muted">
                    {l.category} · {kes(l.price)} / {l.unit} · posted {fmtDate(l.createdAt)}
                  </p>
                </div>
                <p className="text-[13px] tabular-nums text-farmer-ink">
                  {l.stock.toLocaleString('en-KE')} {l.unit}
                </p>
                <StatusChip stock={l.stock} />
                <ConfirmDelete label={`Delete ${l.name} listing`} onConfirm={() => removed(l.id)} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
