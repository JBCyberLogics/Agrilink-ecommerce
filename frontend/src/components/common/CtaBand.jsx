/**
 * CtaBand — the shared closing call-to-action band for public content
 * pages. Actions are either real hash destinations or handler buttons
 * (e.g. opening the existing auth modal). No fake destinations.
 */
export default function CtaBand({ title, subtitle, actions = [] }) {
  const base =
    'inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold shadow-lift transition-all active:scale-[0.98]'
  const styles = {
    primary: `${base} bg-white text-primary-dark hover:bg-neutral-100`,
    outline: `${base} border border-white/40 bg-transparent text-white hover:bg-white/10 shadow-none`,
  }
  return (
    <section className="rounded-3xl bg-gradient-to-br from-primary to-primary-dark px-6 py-9 text-center sm:py-12">
      <h2 className="font-display text-xl font-bold text-white sm:text-2xl">{title}</h2>
      {subtitle && (
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-white/80">{subtitle}</p>
      )}
      {actions.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actions.map((a) =>
            a.href ? (
              <a key={a.label} href={a.href} className={styles[a.variant ?? 'primary']}>
                {a.label}
              </a>
            ) : (
              <button key={a.label} type="button" onClick={a.onClick} className={styles[a.variant ?? 'primary']}>
                {a.label}
              </button>
            ),
          )}
        </div>
      )}
    </section>
  )
}
