import { useEffect, useRef, useState } from 'react'
import { Sprout, X, LogIn, UserPlus, ShoppingBag, Tractor, Check, Eye, EyeOff, Lock, Loader2, ShieldCheck, AlertCircle } from 'lucide-react'
import Field, { FIELD_ICONS } from '../../components/ui/Field'
import { signup as apiSignup, login as apiLogin } from '../../api/endpoints'

const TABS = [
  { id: 'login', label: 'Login', icon: LogIn },
  { id: 'signup', label: 'Sign Up', icon: UserPlus },
]

const ROLES = [
  { id: 'Buyer', label: 'I am a Buyer', desc: 'Shop fresh farm produce', icon: ShoppingBag },
  { id: 'Farmer', label: 'I am a Farmer', desc: 'Sell my harvest direct', icon: Tractor },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function AuthModal({ open, onClose, onAuth, initialTab = 'login', initialRole = null }) {
  const [tab, setTab] = useState('login')
  const [role, setRole] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [recoveryMessage, setRecoveryMessage] = useState('')
  const panelRef = useRef(null)

  /* Reset transient state whenever the dialog opens (honouring role presets,
     e.g. the "sell your harvest" upsell pre-picking the Farmer card) */
  useEffect(() => {
    if (open) {
      setTab(initialTab)
      setRole(initialRole)
      setForm({ name: '', email: '', password: '', confirmPassword: '' })
      setErrors({})
      setSubmitting(false)
      setShowPass(false)
      setShowConfirm(false)
      setRecoveryMessage('')
      panelRef.current?.querySelector('input')?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  /* Scroll lock + Escape to close + simple focus trap (Tab cycling) */
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') {
        const focusables = panelRef.current?.querySelectorAll(
          'button, input, [tabindex]:not([tabindex="-1"])',
        )
        if (!focusables?.length) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const setField = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const next = {}
    if (tab === 'signup' && form.name.trim().length < 2)
      next.name = 'Please tell us your full name.'
    if (!EMAIL_RE.test(form.email)) next.email = 'Enter a valid email address.'
    if (form.password.length < 6) next.password = 'Use at least 6 characters.'
    if (tab === 'signup') {
      if (!form.confirmPassword) next.confirmPassword = 'Please confirm your password.'
      else if (form.confirmPassword !== form.password)
        next.confirmPassword = "Passwords don't match."
    }
    if (!role) next.role = 'Choose how you use Agrilink.'
    return next
  }

  /* Honest integration placeholder: no password-reset backend endpoint exists,
     so clicking "Forgot password?" shows a clear message instead of silently
     doing nothing or pretending a reset email was sent. */
  const handleForgotPassword = () => {
    setRecoveryMessage(
      'Password recovery is not configured yet — no email provider is connected. Please contact support to reset your password.',
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) {
      panelRef.current
        ?.querySelector('[aria-invalid="true"], [data-error="role"]')
        ?.focus()
      return
    }

    setSubmitting(true)
    try {
      /* Real auth — login/signup hit MongoDB through the Agrilink API;
         on success the backend also sets the httpOnly session cookie. */
      const apiUser =
        tab === 'signup'
          ? await apiSignup({
              name: form.name.trim(),
              email: form.email.trim(),
              password: form.password,
              role,
            })
          : await apiLogin({ email: form.email.trim(), password: form.password, role })

      onAuth(apiUser) // { name, email, role } — exactly the shape App expects
    } catch (err) {
      const next = {}
      if (err?.field) next[err.field] = err.error
      else next.global = err?.error || 'Something went wrong. Please try again.'
      /* role gate 403: pre-select the account's real role so the user
         can simply press Sign In again */
      if (err?.field === 'role' && (err?.accountRole === 'Buyer' || err?.accountRole === 'Farmer'))
        setRole(err.accountRole)
      setErrors(next)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex min-h-full items-center justify-center overflow-y-auto p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
    >
      {/* Backdrop: dark scrim + blur — the glass needs something behind it to shine */}
      <div
        className="fixed inset-0 -z-10 bg-emerald-950/55 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative flex w-full max-w-[430px] items-center justify-center">
        {/* Ambient brand glows reflected through the frosted card */}
        <div
          aria-hidden="true"
          className="absolute -left-16 -top-14 -z-10 h-44 w-44 rounded-full bg-secondary/50 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-16 -right-14 -z-10 h-52 w-52 rounded-full bg-primary-light/75 blur-3xl"
        />

        {/* ============================ frosted card ============================ */}
        <div
          ref={panelRef}
          className="w-full overflow-hidden rounded-3xl border border-white/50 bg-white/65 shadow-[0_32px_90px_-20px_rgba(6,58,23,0.5)] backdrop-blur-2xl"
        >
          {/* inner highlight ring (frosted edge) */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/40" />
          {/* brand gradient hairline */}
          <div className="h-1 w-full bg-gradient-to-r from-primary via-secondary to-primary-light" />

          <div className="relative p-6 sm:p-8">
            {/* close */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/60 bg-white/60 text-neutral-500 transition-colors hover:bg-white hover:text-neutral-800"
            >
              <X size={16} aria-hidden="true" />
            </button>

            {/* header */}
            <div className="mb-6">
              <span className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-lift">
                <Sprout size={22} aria-hidden="true" />
              </span>
              <h2 id="auth-title" className="font-display text-[22px] font-bold text-neutral-900">
                {tab === 'login' ? 'Welcome back to the farm' : 'Join the marketplace'}
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                {tab === 'login'
                  ? 'Sign in to keep buying and selling fresh produce.'
                  : 'Create an account in less than a minute.'}
              </p>
            </div>

            {/* tab switcher */}
            <div
              role="tablist"
              aria-label="Authentication mode"
              className="mb-6 grid grid-cols-2 gap-1 rounded-2xl border border-white/60 bg-neutral-900/[0.045] p-1.5"
            >
              {TABS.map((t) => {
                const active = tab === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(t.id)}
                    className={`flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      active
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-neutral-500 hover:bg-white/50 hover:text-neutral-700'
                    }`}
                  >
                    <t.icon size={15} aria-hidden="true" />
                    {t.label}
                  </button>
                )
              })}
            </div>

            {/* form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {tab === 'signup' && (
                <Field
                  id="name"
                  label="Full name"
                  placeholder="e.g. Joseph Kariuki"
                  icon={FIELD_ICONS.name}
                  value={form.name}
                  onChange={setField('name')}
                  error={errors.name}
                  autoComplete="name"
                  className="animate-fade-up"
                />
              )}

              <Field
                id="email"
                label="Email address"
                type="email"
                placeholder="you@example.com"
                icon={FIELD_ICONS.email}
                value={form.email}
                onChange={setField('email')}
                error={errors.email}
                autoComplete="email"
              />

              <Field
                id="password"
                label="Password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                icon={FIELD_ICONS.password}
                value={form.password}
                onChange={setField('password')}
                error={errors.password}
                autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    className="grid h-8 w-8 place-items-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                  >
                    {showPass ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                  </button>
                }
              />

              {/* Sign-up only: plaintext-mismatch guard (never sent to the API) */}
              {tab === 'signup' && (
                <Field
                  id="confirm-password"
                  label="Confirm password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  icon={FIELD_ICONS.password}
                  value={form.confirmPassword}
                  onChange={setField('confirmPassword')}
                  error={errors.confirmPassword}
                  autoComplete="new-password"
                  className="animate-fade-up"
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                      className="grid h-8 w-8 place-items-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                    >
                      {showConfirm ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                    </button>
                  }
                />
              )}

              {/* --- Custom role selector (Buyer / Farmer) --- */}
              <fieldset>
                <legend className="mb-1.5 text-[13px] font-semibold text-neutral-700">
                  Choose your role
                </legend>
                <div role="radiogroup" aria-label="Account role" className="grid grid-cols-2 gap-3">
                  {ROLES.map((r) => {
                    const active = role === r.id
                    return (
                      <button
                        key={r.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => {
                          setRole(r.id)
                          setErrors((e) => ({ ...e, role: undefined }))
                        }}
                        className={`relative flex flex-col gap-2 rounded-2xl border p-3.5 text-left transition-all duration-200 ${
                          active
                            ? 'border-primary/70 bg-primary-soft/80 ring-1 ring-primary/25'
                            : 'border-white/70 bg-white/50 hover:border-primary/30 hover:bg-white/70'
                        }`}
                      >
                        <span
                          className={`grid h-9 w-9 place-items-center rounded-xl transition-colors ${
                            active ? 'bg-primary text-white shadow-lift' : 'bg-neutral-100 text-neutral-400'
                          }`}
                        >
                          <r.icon size={17} aria-hidden="true" />
                        </span>
                        <span>
                          <span className={`block text-[13px] font-semibold ${active ? 'text-primary-dark' : 'text-neutral-700'}`}>
                            {r.label}
                          </span>
                          <span className={`mt-0.5 block text-[11px] ${active ? 'text-primary/80' : 'text-neutral-400'}`}>
                            {r.desc}
                          </span>
                        </span>
                        {active && (
                          <span className="absolute right-2.5 top-2.5 grid h-5 w-5 animate-pop place-items-center rounded-full bg-primary text-white">
                            <Check size={12} aria-hidden="true" />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
                {errors.role && (
                  <p role="alert" data-error="role" className="mt-1.5 text-xs font-medium text-red-600">
                    {errors.role}
                  </p>
                )}
              </fieldset>

              {tab === 'login' ? (
                <div className="flex items-center justify-between text-[13px]">
                  <label className="flex cursor-pointer select-none items-center gap-2 text-neutral-600">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-neutral-300 text-primary accent-[#2E7D32]"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="font-semibold text-primary hover:text-primary-dark"
                  >
                    Forgot password?
                  </button>
                </div>
              ) : null}

              {recoveryMessage && (
                <p
                  role="alert"
                  className="flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700"
                >
                  <AlertCircle size={13} aria-hidden="true" className="shrink-0" />
                  {recoveryMessage}
                </p>
              )}

              {/* server-level errors (bad credentials, network, 500s) */}
              {errors.global && (
                <p
                  role="alert"
                  className="flex items-center gap-1.5 rounded-xl bg-red-50/90 px-3 py-2 text-xs font-medium text-red-600"
                >
                  <AlertCircle size={13} aria-hidden="true" className="shrink-0" />
                  {errors.global}
                </p>
              )}

              {/* submit */}
              <button
                type="submit"
                disabled={submitting}
                className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-lift transition-all ${
                  submitting ? 'cursor-wait bg-primary-light' : 'bg-primary hover:bg-primary-dark active:scale-[0.98]'
                } disabled:opacity-90 motion-safe:active:scale-[0.98]`}
              >
                {submitting ? (
                  <>
                    <Loader2 size={17} className="animate-spin" aria-hidden="true" />
                    {tab === 'login' ? 'Signing you in…' : 'Creating account…'}
                  </>
                ) : tab === 'login' ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </button>

              {tab === 'signup' && (
                <p className="text-center text-[11px] leading-relaxed text-neutral-400">
                  By creating an account you agree to our{' '}
                  <a href="#" className="underline hover:text-neutral-600">
                    Terms
                  </a>{' '}
                  &{' '}
                  <a href="#" className="underline hover:text-neutral-600">
                    Privacy Policy
                  </a>
                  .
                </p>
              )}
            </form>

            {/* switch mode */}
            <div className="mt-5 flex items-center justify-center gap-1.5 border-t border-neutral-200/70 pt-4 text-[13px] text-neutral-500">
              <Lock size={12} aria-hidden="true" className="text-neutral-400" />
              {tab === 'login' ? (
                <>
                  New around here?
                  <button
                    type="button"
                    onClick={() => setTab('signup')}
                    className="font-semibold text-primary transition-colors hover:text-primary-dark"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already a member?
                  <button
                    type="button"
                    onClick={() => setTab('login')}
                    className="font-semibold text-primary transition-colors hover:text-primary-dark"
                  >
                    Sign in instead
                  </button>
                </>
              )}
            </div>
          </div>

          {/* trust strip */}
          <div className="flex items-center justify-center gap-1.5 border-t border-white/60 bg-white/50 px-4 py-2.5 text-[11px] font-medium text-neutral-400">
            <ShieldCheck size={13} aria-hidden="true" className="text-primary/70" />
            Encrypted &amp; secured — your data never leaves the farm*
          </div>
        </div>
      </div>
    </div>
  )
}
