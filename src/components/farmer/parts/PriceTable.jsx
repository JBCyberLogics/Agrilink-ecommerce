/**
 * PriceTable — reusable market-price observation presentation.
 * Rendered only with REAL rows: every record must carry produce, market
 * location, price + currency, unit, observation date and source. Columns
 * are sortable once real data exists; with no rows the caller renders an
 * honest empty/not-configured state instead.
 */
import { useState } from 'react'
import { kes } from '../../../utils/format'

const COLUMNS = [
  { key: 'produce', label: 'Produce' },
  { key: 'market', label: 'Market' },
  { key: 'price', label: 'Price', sortable: true },
  { key: 'unit', label: 'Unit' },
  { key: 'observedAt', label: 'Observed', sortable: true },
  { key: 'source', label: 'Source' },
]

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })

export default function PriceTable({ rows, caption }) {
  const [sort, setSort] = useState({ key: 'observedAt', dir: 'desc' })

  if (!rows?.length) return null

  const sorted = [...rows].sort((a, b) => {
    const dir = sort.dir === 'asc' ? 1 : -1
    if (sort.key === 'price') return (a.price - b.price) * dir
    if (sort.key === 'observedAt') return (new Date(a.observedAt) - new Date(b.observedAt)) * dir
    return String(a[sort.key]).localeCompare(String(b[sort.key])) * dir
  })

  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }))

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <caption className="sr-only">{caption || 'Market price observations'}</caption>
        <thead>
          <tr className="border-b border-farmer-line">
            {COLUMNS.map((c) => (
              <th
                key={c.key}
                scope="col"
                className="whitespace-nowrap px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-farmer-muted"
                aria-sort={
                  c.sortable
                    ? sort.key === c.key
                      ? sort.dir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                    : undefined
                }
              >
                {c.sortable ? (
                  <button
                    type="button"
                    onClick={() => toggleSort(c.key)}
                    className="inline-flex items-center gap-1 rounded hover:text-farmer-ink"
                  >
                    {c.label}
                    {sort.key === c.key && <span aria-hidden="true">{sort.dir === 'asc' ? '↑' : '↓'}</span>}
                  </button>
                ) : (
                  c.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-farmer-line">
          {sorted.map((r, i) => (
            <tr key={`${r.produce}-${r.observedAt}-${i}`} className="text-farmer-ink">
              <td className="px-3 py-2.5 font-medium">{r.produce}</td>
              <td className="px-3 py-2.5 text-farmer-muted">{r.market}</td>
              <td className="whitespace-nowrap px-3 py-2.5 font-semibold tabular-nums">{kes(r.price)}</td>
              <td className="px-3 py-2.5 text-farmer-muted">{r.unit}</td>
              <td className="whitespace-nowrap px-3 py-2.5 text-farmer-muted">{fmtDate(r.observedAt)}</td>
              <td className="px-3 py-2.5 text-farmer-muted">{r.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
