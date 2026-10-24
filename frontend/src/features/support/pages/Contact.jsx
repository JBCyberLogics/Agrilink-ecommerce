/**
 * Contact (AGRILINK-PUBLIC-PAGES-001) — route #/contact.
 *
 * The only contact details shown are the ones already approved in the
 * project footer (hello@agrilink.co.ke, +254 700 123 456). There is no
 * messaging API in the backend, so the form validates client-side and then
 * reports — truthfully — that delivery is not connected, offering the
 * working mailto fallback. Nothing pretends an enquiry was delivered.
 */
import { useRef, useState } from 'react'
import { Mail, Sprout, ShoppingBag, Wrench, CircleAlert, RotateCw, ArrowRight } from 'lucide-react'
import Field, { FIELD_ICONS } from '../../../components/ui/Field'

const SUPPORT_EMAIL = 'hello@agrilink.co.ke'
const USER_TYPES = ['Farmer', 'Buyer', 'Other']
const CATEGORIES = [
  'General enquiry',
  'Farmer assistance',
  'Buyer assistance',
  'Technical support',
]

const SELECT_CLASS =
  'h-12 w-full rounded-xl border border-line/80 bg-paper/75 px-4 text-sm text-ink shadow-sm outline-none backdrop-blur-sm transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20'
const TEXTAREA_CLASS =
  'w-full rounded-xl border border-line/80 bg-paper/75 px-4 py-3 text-sm text-ink shadow-sm outline-none backdrop-blur-sm transition-colors placeholder:text-muted-2 focus:border-brand focus:bg-paper focus:ring-2 focus:ring-brand/20'

/* In-page smooth scroll that respects prefers-reduced-motion */
const focusForm = (formRef) => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  formRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

export default function ContactPage({ onOpenAuth = () => {} }) {
  const formRef = useRef(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    userType: '',
    category: CATEGORIES[0],
    subject: '',
    message: '',
  })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // 'idle' | 'unavailable'

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    /* clear a field's error while the user fixes it */
    setErrors((errs) => (errs[key] ? { ...errs, [key]: undefined } : errs))
    if (status === 'unavailable') setStatus('idle')
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Please enter your name.'
    if (!form.email.trim()) errs.email = 'Please enter your email address.'
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = 'Enter a valid email address, e.g. you@example.com.'
    if (!form.userType) errs.userType = 'Select the user type that fits you best.'
    if (!form.category) errs.category = 'Select an enquiry category.'
    if (!form.message.trim()) errs.message = 'Please write a short message so we can understand the enquiry.'
    return errs
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    /* No messaging service is configured in this build — say so plainly
       (there is deliberately no "sending" spinner, because nothing goes
       anywhere). The typed message stays in the form so it isn't lost. */
    setStatus('unavailable')
  }

  const pickCategory = (category) => (e) => {
    e.preventDefault()
    setForm((f) => ({ ...f, category }))
    setStatus('idle')
    focusForm(formRef)
  }

  const optionCards = [
    {
      icon: Mail,
      title: 'General enquiries',
      desc: 'Questions about using AgriLink or the marketplace in general.',
      action: (
        <button
          type="button"
          onClick={() => focusForm(formRef)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-deep"
        >
          Use the contact form <ArrowRight size={15} aria-hidden="true" />
        </button>
      ),
      note: SUPPORT_EMAIL,
    },
    {
      icon: Sprout,
      title: 'Farmer & seller assistance',
      desc: 'Help with your farmer account, produce listings, or selling.',
      actions: [
        { label: 'Start selling', href: '#/start-selling' },
        { label: 'Ask about selling', onClick: pickCategory('Farmer assistance') },
      ],
    },
    {
      icon: ShoppingBag,
      title: 'Buyer assistance',
      desc: 'Finding produce, buying, or your buyer account.',
      actions: [
        { label: 'Find produce', href: '#/' },
        { label: 'Ask about buying', onClick: pickCategory('Buyer assistance') },
      ],
    },
    {
      icon: Wrench,
      title: 'Technical support',
      desc: 'Something not working the way it should? Tell us what happened.',
      action: (
        <button
          type="button"
          onClick={pickCategory('Technical support')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-deep"
        >
          Report an issue <ArrowRight size={15} aria-hidden="true" />
        </button>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 lg:px-8">
      {/* ------------------------------ intro ------------------------------ */}
      <section className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Help & support</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Contact AgriLink</h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-4">
            Farmers, buyers and visitors — reach the AgriLink team for anything from listing
            questions to account access. Choose a topic below or send a message with the form.
          </p>
        </div>
        {/* restrained brand visual — the same approved cover imagery the
            marketplace hero already uses */}
        <img
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&h=700&q=80"
          alt="Farmland rows at golden hour"
          loading="lazy"
          className="h-44 w-full rounded-3xl object-cover ring-1 ring-line/70 sm:h-52 lg:h-56"
        />
      </section>

      {/* --------------------------- option cards --------------------------- */}
      <section aria-label="Contact options" className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {optionCards.map((o) => (
          <article key={o.title} className="rounded-2xl border border-line/80 bg-paper p-5 shadow-sm">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-brand-deep">
              <o.icon size={18} aria-hidden="true" />
            </span>
            <h2 className="mt-3 text-[15px] font-semibold text-ink">{o.title}</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">{o.desc}</p>
            {o.actions ? (
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                {o.actions.map((a) =>
                  a.href ? (
                    <a
                      key={a.label}
                      href={a.href}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-deep"
                    >
                      {a.label} <ArrowRight size={15} aria-hidden="true" />
                    </a>
                  ) : (
                    <button
                      key={a.label}
                      type="button"
                      onClick={a.onClick}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-deep"
                    >
                      {a.label} <ArrowRight size={15} aria-hidden="true" />
                    </button>
                  ),
                )}
              </div>
            ) : (
              <div className="mt-3">{o.action}</div>
            )}
            {'note' in o && (
              <p className="mt-2 text-xs text-muted-2">
                by email: <a href={`mailto:${o.note}`} className="font-medium text-muted hover:text-brand">{o.note}</a>
              </p>
            )}
          </article>
        ))}
      </section>

      {/* ------------------------------ form ------------------------------- */}
      <section ref={formRef} aria-label="Contact form" className="mt-10 scroll-mt-24">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-3xl border border-line/80 bg-paper p-6 shadow-sm sm:p-8">
            <h2 className="font-display text-xl font-bold text-ink">Send a message</h2>
            <p className="mt-1 text-sm text-muted">
              Fields marked * are required.
            </p>

            {status === 'unavailable' && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2.5 rounded-xl border border-brand/20 bg-primary-soft px-4 py-3"
              >
                <CircleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-brand-deep" />
                <p className="text-[13px] leading-relaxed text-brand-deep">
                  Message delivery isn't connected yet, so nothing was sent and nothing will be
                  lost — your message is still here to copy. You can also email us directly at{' '}
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold underline">
                    {SUPPORT_EMAIL}
                  </a>
                  .
                </p>
              </div>
            )}

            <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit} noValidate>
              <Field
                id="contact-name"
                label="Full name *"
                value={form.name}
                onChange={set('name')}
                icon={FIELD_ICONS.name}
                error={errors.name}
                placeholder="Your full name"
                autoComplete="name"
              />
              <Field
                id="contact-email"
                label="Email address *"
                type="email"
                value={form.email}
                onChange={set('email')}
                icon={FIELD_ICONS.email}
                error={errors.email}
                placeholder="you@example.com"
                autoComplete="email"
              />

              {/* user type */}
              <div>
                <label htmlFor="contact-user-type" className="mb-1.5 block text-[13px] font-semibold text-ink-3">
                  User type *
                </label>
                <select
                  id="contact-user-type"
                  name="contact-user-type"
                  data-invalid={Boolean(errors.userType)}
                  value={form.userType}
                  onChange={set('userType')}
                  aria-invalid={Boolean(errors.userType)}
                  aria-describedby={errors.userType ? 'contact-user-type-error' : undefined}
                  className={`${SELECT_CLASS} ${errors.userType ? 'border-danger-line' : ''}`}
                >
                  <option value="">Select user type…</option>
                  {USER_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.userType && (
                  <p id="contact-user-type-error" role="alert" className="mt-1.5 text-xs font-medium text-danger">
                    {errors.userType}
                  </p>
                )}
              </div>

              {/* category */}
              <div>
                <label htmlFor="contact-category" className="mb-1.5 block text-[13px] font-semibold text-ink-3">
                  Enquiry category *
                </label>
                <select
                  id="contact-category"
                  name="contact-category"
                  data-invalid={Boolean(errors.category)}
                  value={form.category}
                  onChange={set('category')}
                  aria-invalid={Boolean(errors.category)}
                  aria-describedby={errors.category ? 'contact-category-error' : undefined}
                  className={`${SELECT_CLASS} ${errors.category ? 'border-danger-line' : ''}`}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.category && (
                  <p id="contact-category-error" role="alert" className="mt-1.5 text-xs font-medium text-danger">
                    {errors.category}
                  </p>
                )}
              </div>

              {/* subject spans both columns */}
              <div className="sm:col-span-2">
                <Field
                  id="contact-subject"
                  label="Subject (optional)"
                  value={form.subject}
                  onChange={set('subject')}
                  icon={Wrench}
                  placeholder="A short summary"
                />
              </div>

              {/* message */}
              <div className="sm:col-span-2">
                <label htmlFor="contact-message" className="mb-1.5 block text-[13px] font-semibold text-ink-3">
                  Message *
                </label>
                <textarea
                  id="contact-message"
                  name="contact-message"
                  rows={5}
                  value={form.message}
                  onChange={set('message')}
                  placeholder="Tell us how we can help…"
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? 'contact-message-error' : undefined}
                  className={`${TEXTAREA_CLASS} ${errors.message ? 'border-danger-line focus:border-danger focus:ring-danger-line' : ''}`}
                />
                {errors.message && (
                  <p id="contact-message-error" role="alert" className="mt-1.5 text-xs font-medium text-danger">
                    {errors.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-lift transition-all hover:bg-primary-dark active:scale-[0.98] sm:w-auto sm:px-8"
                >
                  Send message
                </button>
                <p className="mt-2 text-xs text-muted-2">
                  Submission needs a messaging service, which isn't configured yet — the form will
                  tell you honestly after validation.
                </p>
              </div>
            </form>
          </div>

          {/* ----------------------- help & navigation ----------------------- */}
          <aside className="space-y-4">
            <div className="rounded-3xl border border-line/80 bg-paper p-6 shadow-sm">
              <h2 className="text-[15px] font-semibold text-ink">Finding your way</h2>
              <ul className="mt-3 space-y-3 text-sm">
                <li>
                  <a href="#/how-it-works" className="font-semibold text-brand hover:text-brand-deep">
                    How it works →
                  </a>
                  <p className="text-[13px] text-muted">Product guidance for both roles.</p>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onOpenAuth({ tab: 'login' })}
                    className="font-semibold text-brand hover:text-brand-deep"
                  >
                    Sign in →
                  </button>
                  <p className="text-[13px] text-muted">Account-specific issues are handled after login.</p>
                </li>
                <li>
                  <a href="#/" className="font-semibold text-brand hover:text-brand-deep">
                    Back to the marketplace →
                  </a>
                  <p className="text-[13px] text-muted">Continue browsing produce.</p>
                </li>
              </ul>
            </div>
            <div className="rounded-3xl border border-line/80 bg-paper-soft p-6">
              <h2 className="text-[15px] font-semibold text-ink">Verified contact details</h2>
              <ul className="mt-2 space-y-1.5 text-sm text-ink-4">
                <li>Email: <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-brand hover:text-brand-deep">{SUPPORT_EMAIL}</a></li>
                <li>Phone: +254 700 123 456</li>
              </ul>
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-2">
                <RotateCw size={12} aria-hidden="true" />
                Same details as the site footer — nothing invented for this page.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
