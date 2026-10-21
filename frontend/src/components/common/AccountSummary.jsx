/**
 * AccountSummary — read-only account details loaded from the session-verified
 * profile endpoint (GET /api/{farmer,buyer}/profile). Purely presentational;
 * the caller owns loading/error states and maps its rows.
 */
export default function AccountSummary({ title = 'Account', note, rows }) {
  return (
    <section className="rounded-xl border border-farmer-line bg-white p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-farmer-ink">{title}</h3>
      {note && <p className="mt-1 text-[13px] leading-relaxed text-farmer-muted">{note}</p>}
      <dl className="mt-3 divide-y divide-farmer-line">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3 py-2.5 first:pt-0">
            <r.icon size={15} className="shrink-0 text-farmer-muted" aria-hidden="true" />
            <dt className="w-24 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-farmer-muted">
              {r.label}
            </dt>
            <dd className="min-w-0 flex-1 break-words text-sm font-medium text-farmer-ink">{r.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
