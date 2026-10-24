/**
 * EmptyState — the honest "nothing here yet" presentation used across the
 * farmer dashboard. Every unavailable dataset renders one of these instead
 * of fabricated numbers (AGRILINK-FE-FARMER-001 data rules).
 */
export default function EmptyState({ icon: Icon, title, children, action, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center rounded-xl border border-dashed border-farmer-line bg-paper px-6 py-10 text-center ${className}`}
    >
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-farmer-surface text-farmer-brand">
        {Icon && <Icon size={20} aria-hidden="true" />}
      </span>
      <p className="mt-3 text-sm font-semibold text-farmer-ink">{title}</p>
      {children && (
        <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-farmer-muted">{children}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
