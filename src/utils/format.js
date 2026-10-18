/**
 * Currency formatting — Agrilink is a Kenya-first marketplace, all
 * prices display in Kenyan Shillings.
 */
export const kes = (n) =>
  `KSh ${Number(n).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`

/** Short human date (Kenyan English), e.g. "18 Oct 2026" */
export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
