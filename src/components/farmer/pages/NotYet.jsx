/**
 * NotYet — intentional "not yet available" pages for dashboard destinations
 * that have no data source or feature yet. They are honest placeholders:
 * no fake tables, no fake counts, no fake toggles (spec phase 3: "show an
 * intentional placeholder or not-yet-available page rather than a broken
 * link").
 */
import EmptyState from '../parts/EmptyState'

export default function NotYet({ icon, title, children }) {
  return (
    <section className="rounded-xl border border-farmer-line bg-white p-6 sm:p-8">
      <EmptyState icon={icon} title={title} className="border-none bg-transparent py-6">
        {children}
      </EmptyState>
    </section>
  )
}
