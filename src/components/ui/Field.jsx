import { Search, Lock, Mail, User, DollarSign, Boxes, Package, X } from 'lucide-react'

/**
 * Shared input icons for email / password / name fields.
 */
export const FIELD_ICONS = {
  email: Mail,
  password: Lock,
  name: User,
  search: Search,
  money: DollarSign,
  stock: Boxes,
}

/**
 * Labeled, icon-led input with inline validation message.
 * Kept as one primitive so every form in the app looks identical.
 */
export default function Field({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  rightSlot, // e.g. password reveal button
  autoComplete,
  className = '',
}) {
  const hasError = Boolean(error)
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-neutral-700">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            aria-hidden="true"
            className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 ${hasError ? 'text-red-400' : 'text-neutral-400'}`}
          />
        )}
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
          className={[
            'h-12 w-full rounded-xl border bg-white/75 text-sm text-neutral-900 shadow-sm outline-none backdrop-blur-sm transition-colors placeholder:text-neutral-400',
            Icon ? 'pl-10 pr-10' : 'px-4',
            hasError
              ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-200'
              : 'border-neutral-200/80 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20',
          ].join(' ')}
        />
        {rightSlot && <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</div>}
      </div>
      {hasError && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
          <X size={12} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}
