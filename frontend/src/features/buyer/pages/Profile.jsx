/**
 * Buyer Profile — real account data from /api/buyer/profile (server-verified
 * session, same pattern as the farmer's Farm Profile). Editing/deleting the
 * account is not built yet, so nothing fakes working controls; saving and
 * request counters come from this buyer's actual MongoDB records.
 */
import { useEffect, useState } from 'react'
import { UserRound, Mail, Heart, MessageSquare, ShieldCheck, AlertCircle, RotateCw } from 'lucide-react'
import { buyerProfile, buyerRequests } from '../../../api/endpoints'
import { useBuyerSaved } from '../parts/useBuyerData'
import EmptyState from '../parts/EmptyState'
import { fmtDate } from '../../../utils/format'

export default function Profile() {
  const [profileState, setProfileState] = useState({ status: 'loading', user: null, error: null })
  const [reqCount, setReqCount] = useState(null)
  const savedQ = useBuyerSaved()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    setProfileState((s) => ({ ...s, status: 'loading' }))
    Promise.all([buyerProfile(), buyerRequests().catch(() => null)])
      .then(([p, r]) => {
        if (!alive) return
        /* call() unwraps `.user` already (auth-style shape); accept both
           shapes defensively so the page only renders a real account */
        const u = p && (p.user ?? p)
        setProfileState({ status: 'ok', user: u && u.name ? u : null, error: null })
        setReqCount(r ? r.requests.length : null)
      })
      .catch((e) =>
        alive && setProfileState({ status: 'error', user: null, error: e?.error || 'Could not load your profile.' }),
      )
    return () => {
      alive = false
    }
  }, [tick])

  if (profileState.status === 'error' || (profileState.status === 'ok' && !profileState.user))
    return (
      <div className="rounded-xl border border-farmer-line bg-white p-6 text-center">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-farmer-danger">
          <AlertCircle size={20} aria-hidden="true" />
        </span>
        <p className="mt-3 text-sm font-semibold text-farmer-ink">
          {profileState.error || 'Your profile could not be loaded right now.'}
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

  if (profileState.status === 'loading' || savedQ.status === 'loading')
    return (
      <div className="max-w-xl space-y-4" aria-busy="true" aria-label="Loading profile">
        <div className="h-40 animate-pulse rounded-xl border border-farmer-line bg-white/70" />
        <div className="h-16 animate-pulse rounded-xl border border-farmer-line bg-white/70" />
      </div>
    )

  const u = profileState.user
  const initials = u.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="max-w-xl space-y-5">
      {/* verified account card — the session the server attests to */}
      <section className="rounded-xl border border-farmer-line bg-white p-6">
        <div className="flex items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-farmer-primary font-display text-base font-bold text-white" aria-hidden="true">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-bold text-farmer-ink">{u.name}</h2>
            <dl className="mt-2 grid grid-cols-1 gap-2 text-[13px] sm:grid-cols-2">
              <div className="flex items-center gap-2 text-farmer-muted">
                <dt className="sr-only">Email</dt>
                <Mail size={14} aria-hidden="true" />
                <dd className="truncate font-medium text-farmer-ink">{u.email}</dd>
              </div>
              <div className="flex items-center gap-2 text-farmer-muted">
                <dt className="sr-only">Role</dt>
                <dd className="rounded-full bg-farmer-surface px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-farmer-primary">
                  {u.role} account
                </dd>
              </div>
              <div className="flex items-center gap-2 text-farmer-muted">
                <dt className="sr-only">Member since</dt>
                <dd className="font-medium text-farmer-ink">Member since {fmtDate(u.memberSince)}</dd>
              </div>
              <div className="flex items-center gap-2 text-farmer-muted">
                <dt className="sr-only">Verification</dt>
                <dd className="inline-flex items-center gap-1.5 font-medium text-farmer-ink">
                  <ShieldCheck size={14} aria-hidden="true" className="text-farmer-success" /> Session verified by the server
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* real counters from the buyer's own records */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-farmer-line bg-white p-5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-farmer-surface text-farmer-primary">
            <Heart size={16} aria-hidden="true" />
          </span>
          <p className="text-[13px] text-farmer-muted">
            <span className="block font-display text-xl font-bold text-farmer-ink">{savedQ.saved.length}</span>
            saved produce
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-farmer-line bg-white p-5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-farmer-surface text-farmer-primary">
            <MessageSquare size={16} aria-hidden="true" />
          </span>
          <p className="text-[13px] text-farmer-muted">
            <span className="block font-display text-xl font-bold text-farmer-ink">{reqCount ?? 0}</span>
            purchase requests
          </p>
        </div>
      </div>

      {/* honest "not built yet" — no fake edit form */}
      <section className="rounded-xl border border-farmer-line bg-white p-6 sm:p-8">
        <EmptyState icon={UserRound} title="Profile editing is not available yet." className="border-none bg-transparent py-4">
          <span>
            Name and password changes (and account deletion) will arrive with an account-management stage — this page
            shows only data the server has verified. Nothing here is simulated.
          </span>
        </EmptyState>
      </section>
    </div>
  )
}
