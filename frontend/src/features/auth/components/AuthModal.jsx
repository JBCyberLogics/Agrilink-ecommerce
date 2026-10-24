/**
 * AuthModal — the authentication experience (login + signup) for AgriLink.
 * Reworked presentation (AGRILINK-AUTH-UI-REVAMP-001): a premium
 * split-screen takeover — brand storytelling panel on the left, the
 * centered auth card with orbiting technology/agriculture badges on the
 * right — while every piece of authentication logic, state and
 * integration stays exactly as shipped:
 *
 *   • Single source of login/signup logic — apiLogin/apiSignup against the
 *     real backend; onAuth(user) is only ever called with a genuine
 *     server-verified response. No fake users, no simulated success.
 *   • Same open contract used by the navbar, Start Selling and the role
 *     gates (open/onClose/onAuth/initialTab/initialRole); Escape, backdrop
 *     click, scroll-lock and the card focus trap are unchanged.
 *   • Honest recovery: no reset endpoint exists → the Forgot password
 *     control explains that instead of pretending email was sent.
 *   • Honest small print: the phony "Remember me" checkbox was removed
 *     (session persistence is the server cookie — nothing to remember),
 *     the dead "#" Terms/Privacy links were replaced by an explicit
 *     consent checkbox, and the "data never leaves the farm" trust strip
 *     now describes the real secure-cookie behavior.
 *   • Tabs animate with a short fade/slide swap; role choice and typed
 *     values survive the switch (state lives at component level).
 */
import { useEffect, useRef, useState } from 'react'
import { Sprout, X, LogIn, UserPlus, ShoppingBag, Tractor, Check, Eye, EyeOff, Lock, Loader2, ShieldCheck, AlertCircle } from 'lucide-react'
import Field, { FIELD_ICONS } from '../../components/ui/Field'
import { signup as apiSignup, login as apiLogin } from '../../api/endpoints'
import AuthBrandPanel from './AuthBrandPanel'
import OrbitingBadges from './OrbitingBadges'

const TABS = [
  { id: 'login', label: 'Login', icon: LogIn },
  { id: 'signup', label: 'Sign Up', icon: UserPlus },
]

const ROLES = [
  { id: 'Buyer', label: 'I am a Buyer', desc: 'Shop fresh farm produce', icon: ShoppingBag },
  { id: 'Farmer', label: 'I am a Farmer', desc: 'Sell my harvest direct', icon: Tractor },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* accessible show/hide-password icon button (shared by both password fields) */
function PasswordReveal({ show, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={show ? 'Hide password' : 'Show password'}
      className="grid h-8 w-8 place-items-center rounded-lg text-muted-2 transition-colors hover:bg-soft hover:text-ink-4"
    >
      {show ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
    </button>
  )
}

export default function AuthModal({ open, onClose, onAuth, initialTab = 'login', initialRole = null }) {
  const [tab, setTab] = useState('login')
  const [role, setRole] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [terms, setTerms] = useState(false)
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
      setTerms(false)
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
      if (!terms) next.terms = 'Please accept the marketplace terms to continue.'
    }
    if (!role) next.role = 'Choose how you use Agrilink.'
    return next
  }

  /* Honest integration placeholder: no password-reset backend endpoint exists,
     so clicking "Forgot password?" shows a clear message instead of silently
     doing nothing or pretending a reset email was sent. */
  const handleForgotPassword = () => {
    setRecoveryMessage(
      <span>
        Password recovery is not configured yet — no email provider is connected, so no email
        will be sent from here. For help with account access, reach the team from the{' '}
        <a href="#/contact" onClick={onClose} className="font-semibold underline hover:text-info">
          Contact page
        </a>
        .
      </span>,
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    /* pending request absorbs any further submissions while auth is in flight
       (the disabled submit button covers clicks; this covers implicit submits) */
    if (submitting) return
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) {
      panelRef.current
        ?.querySelector('[aria-invalid="true"], [data-error="role"], [data-error="terms"]')
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
      className="fixed inset-0 z-[70] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
    >
      {/* Backdrop: dark scrim + blur — the shell needs contrast behind it */}
      <div
        className="fixed inset-0 -z-10 bg-emerald-950/85 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-0 sm:p-6 lg:p-8">
        {/* ======================= split-screen shell ======================= */}
        <div className="relative z-10 my-4 w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-white/15 shadow-[0_40px_120px_-30px_rgba(4,36,18,0.65)] lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">

          {/* ============ left: brand storytelling (lg+ only) ============ */}
          <AuthBrandPanel className="hidden lg:flex" />

          {/* ============ right: authentication panel ============ */}
          <div className="relative bg-paper-soft px-4 pb-8 pt-7 sm:px-8 sm:pb-10 lg:px-10 lg:py-10">
            {/* ambient brand glows (theme tokens — flip with the dark mode) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-primary-light/60 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-secondary/40 blur-3xl"
            />

            {/* compact brand strip for the single-column (phone) layout */}
            <div className="relative mb-5 flex items-center gap-3 lg:hidden">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-lift">
                <Sprout size={19} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-[15px] font-bold text-ink">AgriLink</span>
                <span className="block text-[11px] font-medium text-muted">
                  Connecting farms to opportunity
                </span>
              </span>
            </div>

            {/* ============ orbiting badges (decorative, behind card) ============ */}
            <div className="relative mx-auto w-fit">
              <OrbitingBadges />

              {/* ======================= frosted card ======================= */}
              <div
                ref={panelRef}
                className="relative z-10 w-full max-w-[26rem] overflow-hidden rounded-3xl border border-white/50 bg-paper/80 shadow-[0_32px_90px_-20px_rgba(6,58,23,0.45)] backdrop-blur-2xl sm:max-w-[26.5rem]"
              >
                {/* inner highlight ring (frosted edge) */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/40" />
                {/* brand gradient hairline */}
                <div className="h-1 w-full bg-gradient-to-r from-primary via-secondary to-primary-light" />

                <div className="relative p-5 sm:p-7">
                  {/* close */}
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close dialog"
                    className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/60 bg-paper/60 text-muted transition-colors hover:bg-paper hover:text-ink-2"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>

                  {/* header */}
                  <div className="mb-5">
                    <span className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-lift">
                      <Sprout size={22} aria-hidden="true" />
                    </span>
                    <h2 id="auth-title" className="font-display text-[21px] font-bold text-ink sm:text-[22px]">
                      {tab === 'login' ? 'Welcome back to the farm' : 'Join the marketplace'}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      {tab === 'login'
                        ? 'Sign in to keep buying and selling fresh produce.'
                        : 'Create an account in less than a minute.'}
                    </p>
                  </div>

                  {/* mode switcher */}
                  <div
                    role="tablist"
                    aria-label="Authentication mode"
                    className="mb-5 grid grid-cols-2 gap-1 rounded-2xl border border-white/60 bg-ink/[0.045] p-1.5"
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
                              ? 'bg-paper text-brand shadow-sm'
                              : 'text-muted hover:bg-paper/50 hover:text-ink-3'
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
                    {/* short slide between the login and signup fields; typed
                        values survive (controlled state, not DOM state) */}
                    <div key={tab} className="space-y-4 motion-safe:animate-fade-up">
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
                        rightSlot={<PasswordReveal show={showPass} onToggle={() => setShowPass((v) => !v)} />}
                      />

                      {/* sign-up only: plaintext-mismatch guard (never sent to the API) */}
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
                          rightSlot={
                            <PasswordReveal
                              show={showConfirm}
                              onToggle={() => setShowConfirm((v) => !v)}
                            />
                          }
                        />
                      )}
                    </div>

                    {/* --- role selector (Buyer / Farmer) — shared by both tabs --- */}
                    <fieldset>
                      <legend className="mb-1.5 text-[13px] font-semibold text-ink-3">
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
                              aria-label={r.label}
                              onClick={() => {
                                setRole(r.id)
                                setErrors((e) => ({ ...e, role: undefined }))
                              }}
                              className={`relative flex flex-col gap-2 rounded-2xl border p-3.5 text-left transition-all duration-200 ${
                                active
                                  ? 'border-brand/70 bg-primary-soft/80 ring-1 ring-brand/25'
                                  : 'border-white/70 bg-paper/50 hover:border-brand/30 hover:bg-paper/70'
                              }`}
                            >
                              <span
                                className={`grid h-9 w-9 place-items-center rounded-xl transition-colors ${
                                  active ? 'bg-primary text-white shadow-lift' : 'bg-soft text-muted-2'
                                }`}
                              >
                                <r.icon size={17} aria-hidden="true" />
                              </span>
                              <span>
                                <span className={`block text-[13px] font-semibold ${active ? 'text-brand-deep' : 'text-ink-3'}`}>
                                  {r.label}
                                </span>
                                <span className={`mt-0.5 block text-[11px] ${active ? 'text-brand/80' : 'text-muted-2'}`}>
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
                        <p role="alert" data-error="role" className="mt-1.5 text-xs font-medium text-danger">
                          {errors.role}
                        </p>
                      )}
                    </fieldset>

                    {/* login: honest recovery link (no fake "remember me" —
                        sessions persist via the server cookie) */}
                    {tab === 'login' && (
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-[13px] font-semibold text-brand transition-colors hover:text-brand-deep"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}

                    {/* signup: explicit, required consent (the previous "#"
                        Terms/Privacy links were dead ends — this states the ask
                        plainly instead of linking nowhere) */}
                    {tab === 'signup' && (
                      <div>
                        <label
                          htmlFor="auth-terms"
                          className={`flex cursor-pointer items-start gap-2.5 rounded-xl border px-3.5 py-3 transition-colors ${
                            errors.terms
                              ? 'border-danger-line bg-danger-wash/60'
                              : 'border-white/70 bg-paper/50 hover:bg-paper/70'
                          }`}
                        >
                          <input
                            id="auth-terms"
                            type="checkbox"
                            checked={terms}
                            onChange={(e) => {
                              setTerms(e.target.checked)
                              setErrors((err) => ({ ...err, terms: undefined }))
                            }}
                            aria-invalid={errors.terms ? true : undefined}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-line-strong accent-[#2E7D32]"
                          />
                          <span className="text-[12px] leading-relaxed text-ink-4">
                            I agree to AgriLink&apos;s marketplace terms and privacy policy, and I
                            understand my account details are stored securely by the platform.
                          </span>
                        </label>
                        {errors.terms && (
                          <p role="alert" data-error="terms" className="mt-1.5 text-xs font-medium text-danger">
                            {errors.terms}
                          </p>
                        )}
                      </div>
                    )}

                    {recoveryMessage && (
                      <p
                        role="alert"
                        className="flex items-center gap-1.5 rounded-xl bg-info-wash px-3 py-2 text-xs font-medium text-info"
                      >
                        <AlertCircle size={13} aria-hidden="true" className="shrink-0" />
                        {recoveryMessage}
                      </p>
                    )}

                    {/* server-level errors (bad credentials, network, 500s) */}
                    {errors.global && (
                      <p
                        role="alert"
                        className="flex items-center gap-1.5 rounded-xl bg-danger-wash/90 px-3 py-2 text-xs font-medium text-danger"
                      >
                        <AlertCircle size={13} aria-hidden="true" className="shrink-0" />
                        {errors.global}
                      </p>
                    )}

                    {/* submit — loading state disables re-submission */}
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
                  </form>

                  {/* switch mode — values and role survive the switch */}
                  <div className="mt-4 flex items-center justify-center gap-1.5 border-t border-line/70 pt-3.5 text-[13px] text-muted">
                    <Lock size={12} aria-hidden="true" className="text-muted-2" />
                    {tab === 'login' ? (
                      <>
                        New around here?
                        <button
                          type="button"
                          onClick={() => setTab('signup')}
                          className="font-semibold text-brand transition-colors hover:text-brand-deep"
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
                          className="font-semibold text-brand transition-colors hover:text-brand-deep"
                        >
                          Sign in instead
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* trust strip — describes the real mechanism (server-side
                    httpOnly session cookie), no unverifiable claims */}
                <div className="flex items-center justify-center gap-1.5 border-t border-white/60 bg-paper/50 px-4 py-2.5 text-[11px] font-medium text-muted-2">
                  <ShieldCheck size={13} aria-hidden="true" className="text-brand/70" />
                  Your session is protected with a secure, server-side cookie
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
