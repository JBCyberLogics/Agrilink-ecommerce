/**
 * Orders & History (spec phase 9) — there is NO order backend yet, so this
 * page is an intentional "not available" placeholder: no fabricated
 * references, quantities, prices, statuses, payment or delivery claims.
 * It documents what will need to exist before the page can show anything
 * real (a checkout/order service), mirroring the farmer dashboard's
 * honest placeholder pattern.
 */
import { Receipt } from 'lucide-react'
import EmptyState from '../parts/EmptyState'

export default function Orders() {
  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-farmer-line bg-white p-6 sm:p-8">
        <EmptyState icon={Receipt} title="No recorded orders yet." className="border-none bg-transparent py-4">
          <span>
            Purchases are completed outside the platform for now — Agrilink has no checkout or order backend yet, so
            there is no order history to show. Nothing is simulated here.
          </span>
          <span className="mt-2 block" aria-hidden="true"></span>
          <span className="mt-2 block">
            When an order-processing stage ships, every record shown here will be a real order: reference, produce,
            quantity, agreed price, date and the backend&apos;s own status values.
          </span>
        </EmptyState>
      </section>
      <p className="rounded-xl border border-farmer-line bg-white px-4 py-3 text-xs leading-relaxed text-farmer-muted">
        In the meantime you can track the offers you have sent to farmers under{' '}
        <span className="font-semibold text-farmer-ink">Purchase Requests</span> — those records are live in the
        database today.
      </p>
    </div>
  )
}
