/**
 * SettingUnavailable — the honest placeholder for a settings category the
 * product cannot persist yet. States plainly what is missing (which fields
 * and which endpoint) instead of shipping fake toggles or fake success
 * messages — the same honesty policy as the AI "not configured" states and
 * the NotYet placeholders this replaces for real categories.
 */
export default function SettingUnavailable({ icon: Icon, title, reason, requires = [] }) {
  return (
    <section className="rounded-xl border border-farmer-line bg-white p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-farmer-surface text-farmer-muted">
          <Icon size={16} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-farmer-ink">{title}</h3>
          <p className="mt-1 text-[13px] leading-relaxed text-farmer-muted">{reason}</p>
          {requires.length > 0 && (
            <>
              <p className="mt-2.5 text-[11px] font-semibold uppercase tracking-wide text-farmer-muted">
                Needs backend support
              </p>
              <ul className="mt-1 space-y-1">
                {requires.map((r) => (
                  <li key={r} className="flex items-start gap-1.5 text-xs leading-relaxed text-farmer-muted">
                    <span aria-hidden="true" className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-farmer-muted" />
                    {r}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
