/**
 * Market Intelligence (spec phase 6).
 *
 * There is NO market-price API yet, so per the data rules this page renders
 * an honest not-configured state and documents the required backend
 * contract. The produce/location/period filters are intentionally NOT
 * rendered — nonfunctional controls are forbidden. Once a price source
 * exists, the reusable PriceTable component renders real observations.
 */
import { LineChart } from 'lucide-react'
import EmptyState from '../../../components/feedback/EmptyState'

export default function MarketIntelligence() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-farmer-line bg-paper p-6">
        <h2 className="font-display text-[15px] font-semibold text-farmer-ink">Market price records</h2>
        <p className="mt-1 text-[13px] text-farmer-muted">
          Historical, verified observations — never presented as live prices.
        </p>
        <EmptyState icon={LineChart} title="Market price integration is not configured yet." className="mt-4 border-solid">
          <span>
            This page activates when a market-price source is connected to the backend.
          </span>
          <span className="mt-3 block rounded-lg border border-farmer-line bg-paper-soft p-3 text-left font-mono text-[11px] leading-relaxed text-farmer-ink">
            GET /api/market/prices → [{'\n'} {'{'} produce, market, price, unit:{' '}
            {'"kg" | …'}, observedAt, source {'}'}{'\n'}]{'\n'}
            currency: KES (Kenyan Shillings), from the source
          </span>
          <span className="mt-3 block">
            Filters for produce, market location and time period switch on with the data. Prices only
            ever compare within the same unit.
          </span>
        </EmptyState>
      </section>
    </div>
  )
}
