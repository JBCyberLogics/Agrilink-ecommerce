/**
 * StatCard — compact summary metric tile. `value` is required and must be
 * real (or an honest "—"); empty/unavailable datasets pass a hint message.
 */
export default function StatCard({ icon: Icon, label, value, hint }) {
  const hasValue = value !== null && value !== undefined && value !== '—'
  return (
    <div className="rounded-xl border border-farmer-line bg-paper p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-farmer-muted">{label}</p>
        {Icon && (
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-farmer-surface text-farmer-brand">
            <Icon size={16} aria-hidden="true" />
          </span>
        )}
      </div>
      {hasValue ? (
        <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-farmer-ink">{value}</p>
      ) : (
        <p className="mt-2 font-display text-2xl font-semibold text-farmer-ink/30">—</p>
      )}
      {hint && <p className="mt-1.5 text-xs leading-relaxed text-farmer-muted">{hint}</p>}
    </div>
  )
}
