/**
 * StatusChip — a purchase-request status rendered as TEXT on the
 * backend's documented values (Pending / Accepted / Declined). Labels
 * carry meaning themselves — color never does.
 */
export default function StatusChip({ status }) {
  const cls =
    status === 'Accepted'
      ? 'bg-farmer-surface text-farmer-success'
      : status === 'Declined'
        ? 'bg-danger-wash text-farmer-danger'
        : 'bg-secondary-soft text-brand-amber-deep'
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${cls}`}>
      {status}
      {status === 'Pending' ? ' · waiting' : ''}
    </span>
  )
}
