/**
 * Buyer Settings (AGRILINK-UI-SETTINGS-FOOTER-001, frontend-only scope).
 *
 * Same honesty policy as the farmer page: the account details are real —
 * loaded from GET /api/buyer/profile, which the server serves only to the
 * signed-in buyer's own session — and every category that needs backend
 * storage (contact, location, buyer preferences, notifications, privacy,
 * password) shows exactly what is missing instead of fake controls.
 * No localStorage substitutes: settings belong to the account, not the
 * browser. Requirements are documented in SETTINGS_PERSISTENCE_REQUIREMENTS.md.
 */
import { useEffect, useState } from 'react'
import {
  UserRound,
  Mail,
  ShieldCheck,
  CalendarPlus,
  Phone,
  MapPin,
  SlidersHorizontal,
  Bell,
  Eye,
  KeyRound,
  RotateCw,
  AlertCircle,
  Info,
} from 'lucide-react'
import { buyerProfile } from '../../buyer/services/buyerService'
import { fmtDate } from '../../../utils/format'
import AccountSummary from '../components/AccountSummary'
import SettingUnavailable from '../components/SettingUnavailable'

export default function Settings() {
  const [state, setState] = useState({ status: 'loading', user: null, error: null })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    setState((s) => ({ ...s, status: 'loading' }))
    buyerProfile()
      .then((d) => {
        /* call() unwraps `.user` already; accept both shapes defensively so
           the page only renders a real account (same as buyer Profile) */
        const u = d && (d.user ?? d)
        if (!alive) return
        setState({ status: 'ok', user: u && u.name ? u : null, error: null })
      })
      .catch((e) =>
        alive && setState({ status: 'error', user: null, error: e?.error || 'Could not load your settings.' }),
      )
    return () => {
      alive = false
    }
  }, [tick])

  if (state.status === 'loading')
    return (
      <div className="h-48 animate-pulse rounded-xl border border-farmer-line bg-paper/70" aria-busy="true" aria-label="Loading settings" />
    )

  if (state.status === 'error' || (state.status === 'ok' && !state.user))
    return (
      <div className="rounded-xl border border-farmer-line bg-paper p-6 text-center">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-danger-wash text-farmer-danger">
          <AlertCircle size={20} aria-hidden="true" />
        </span>
        <p className="mt-3 text-sm font-semibold text-farmer-ink">
          {state.error || 'Your settings could not be loaded right now.'}
        </p>
        <button
          type="button"
          onClick={() => setTick((t) => t + 1)}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-farmer-primary px-4 text-[13px] font-semibold text-white hover:bg-farmer-primary-hover"
        >
          <RotateCw size={14} aria-hidden="true" /> Try again
        </button>
      </div>
    )

  const { user } = state
  return (
    <div className="space-y-4">
      {/* honesty banner — set expectations before any controls are seen */}
      <p
        role="note"
        className="flex items-start gap-2.5 rounded-xl border border-farmer-line bg-farmer-surface px-4 py-3 text-[13px] leading-relaxed text-farmer-ink"
      >
        <Info size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-farmer-muted" />
        <span>
          Settings can't be saved in this build yet — account-level persistence needs backend
          support that doesn't exist. Nothing on this page is simulated.
        </span>
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* REAL — read-only account facts from the session-verified endpoint */}
        <AccountSummary
          title="Account details"
          note="Loaded from your signed-in session. Editing name or email isn't supported by the API yet."
          rows={[
            { icon: UserRound, label: 'Name', value: user.name },
            { icon: Mail, label: 'Email', value: user.email },
            { icon: ShieldCheck, label: 'Role', value: user.role },
            { icon: CalendarPlus, label: 'Since', value: fmtDate(user.memberSince) },
          ]}
        />

        <SettingUnavailable
          icon={Phone}
          title="Contact information"
          reason="Your account has no phone number field yet, and there is no endpoint that could update one."
          requires={[
            'A phone field stored on the signed-in user record (User model)',
            'A session-scoped settings endpoint: read + update your own record only',
          ]}
        />

        <SettingUnavailable
          icon={MapPin}
          title="Location & address"
          reason="Delivery addresses are not stored on accounts today — checkout and orders don't use one yet either."
          requires={['A delivery address field on the user record', 'The settings read + update endpoint']}
        />

        <SettingUnavailable
          icon={SlidersHorizontal}
          title="Buyer preferences"
          reason="Workflow preferences (preferred units, delivery notes, default filters) are not modeled on accounts yet."
          requires={['Buyer preference fields on the user record', 'The settings read + update endpoint']}
        />

        <SettingUnavailable
          icon={Bell}
          title="Notification preferences"
          reason="No per-account notification flags exist, and AgriLink does not send email yet — flags could be stored now for when it does, but only with a settings endpoint."
          requires={[
            'Preference flags saved on the user record (e.g. request updates, inquiry alerts)',
            'The settings read + update endpoint',
          ]}
        />

        <SettingUnavailable
          icon={Eye}
          title="Privacy & account preferences"
          reason="There is nothing for a privacy flag to control yet — the current product has no public profiles and exposes no contact details. Adding controls now would be decorative."
          requires={[
            'Privacy preference flags on the user record',
            'A real product surface the flags govern (e.g. anonymous purchase requests)',
          ]}
        />

        <SettingUnavailable
          icon={KeyRound}
          title="Password & security"
          reason="Password changes need a server route that verifies your current password before accepting a new one. Today only signup and login touch passwords."
          requires={[
            'A change-password endpoint (bcrypt-verify current password, minimum 6 characters for the new one)',
            'Rate limiting on attempts (the auth routes already apply this pattern)',
          ]}
        />
      </div>
    </div>
  )
}
