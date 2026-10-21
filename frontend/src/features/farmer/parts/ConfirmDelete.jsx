/**
 * ConfirmDelete — two-step destructive action for real database records.
 * First click arms the button ("Confirm delete?"), a second click executes;
 * it auto-disarms after 3.5s so a stray click never deletes produce.
 */
import { useEffect, useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'

export default function ConfirmDelete({ label, onConfirm, className = '' }) {
  const [armed, setArmed] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const arm = () => {
    setArmed(true)
    timer.current = setTimeout(() => setArmed(false), 3500)
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={armed ? onConfirm : arm}
      className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors ${
        armed
          ? 'border-farmer-danger bg-red-50 text-farmer-danger'
          : 'border-farmer-line text-farmer-muted hover:border-farmer-danger/40 hover:text-farmer-danger'
      } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-farmer-danger/40 ${className}`}
    >
      <Trash2 size={14} aria-hidden="true" />
      {armed ? 'Confirm delete?' : 'Delete'}
    </button>
  )
}
