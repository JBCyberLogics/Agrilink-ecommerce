# SETTINGS_PERSISTENCE_REQUIREMENTS.md

**Task:** AGRILINK-UI-SETTINGS-FOOTER-001 · **Status: FRONTEND-ONLY build shipped — backend approval still REQUIRED for real persistence**
**Why this document exists:** account-level settings must survive refreshes, sessions, and browser restarts and must be scoped to the authenticated account. That cannot be delivered by React state or `localStorage` (project rules: browser storage may never be the authoritative store for account settings, and no passwords/security data may live in localStorage). The backend inspected for this task does not support settings storage, so the frontend ships honest "not configured" states and this document specifies exactly what the backend must add. **No backend code was modified.**

---

## 1. Backend reality (inspected)

| Area | What exists today | What's missing for settings |
|---|---|---|
| `server/models/User.js` | `name`, `email` (unique, lowercase), `passwordHash`, `role ('Buyer'\|'Farmer')`, `savedListings[]`, `timestamps` | No phone, location/address, farm name, notification or privacy preference fields |
| `GET /api/farmer/profile`, `GET /api/buyer/profile` | Read-only `{ user: { name, email, role, memberSince } }`; session-`requireAuth` scoped to the caller's document | No update verb (PATCH/PUT), no composite settings payload |
| `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` | bcrypt signup (min 6 chars), login, me, logout with httpOnly JWT-cookie session | No change-password route; login/signup are the only password operations |
| Ownership/isolation | `requireAuth` middleware + `req.user._id` as the only identity used by every query | Same guarantee can be reused — settings endpoints must never accept a user id from the client |

## 2. Required database additions (User model)

All fields optional with schema defaults so existing documents stay valid (`strict: true`):

```js
// contact / location
phone: { type: String, default: '', trim: true },          // free-form; validated client + server (<= 20 chars, phone-ish)
location: { type: String, default: '', trim: true },       // county / delivery area ("Nakuru")
// farmer workflow
farmName: { type: String, default: '', trim: true },       // displayed on Farm Profile once stored
// preferences (role-agnostic booleans; UI filters by role)
prefs: {
  notifyOrders: { type: Boolean, default: true },          // order confirmations
  notifyRequests: { type: Boolean, default: true },        // purchase-request / inquiry updates
  notifyMarketing: { type: Boolean, default: false },      // product updates & promotions
},
// privacy (only meaningful once a real surface exists)
privacy: {
  showContactOnListings: { type: Boolean, default: false },
  anonymousInquiries: { type: Boolean, default: false },
},
```

Optional settings are "deleted/reset" by writing back default/empty values through the same PATCH endpoint (real delete semantics for optional data; account deletion is out of scope and would need a cascade strategy for listings/orders/inquiries).

## 3. Required endpoints

| Route | Behavior | Guarantees |
|---|---|---|
| `GET /api/account/settings` | Returns the caller's own `{ name, email, role, memberSince, phone, location, farmName?, prefs, privacy }` | `requireAuth`; reads `req.user` only; role determines which keys are sent |
| `PATCH /api/account/settings` | Accepts a whitelisted subset (`phone`, `location`, `farmName`, `prefs{3 flags}`, `privacy{2 flags}`); trims strings, caps lengths, coerces booleans | `requireAuth`; operates on `req.user._id` only (client-sent ids ignored/rejected); unknown fields rejected; `400 {error, field}` shaped exactly like existing validation errors |
| `POST /api/auth/password` | `{ currentPassword, newPassword }`: bcrypt-verify current → reject 401 on mismatch; min 6 chars on new; re-hash and save | `requireAuth`; reuse the `rateLimit` middleware pattern used by signup/login; never log or persist the plaintext; session cookie stays valid (no forced re-login) |

Notes:
- **Email/name updates:** deliberately not included. Email is the login identity — changing it safely wants a verification flow; that is a separate approval. The frontend therefore renders name/email read-only.
- **CES surrogate keys / security:** no password or security data may ever be written by the settings PATCH (whitelist enforces this). Nothing security-sensitive goes to localStorage (there is nothing; the JWT stays in the httpOnly cookie as today).
- **Multi-account isolation:** all three routes derive identity from the verified session token (`req.user._id`) — identical to every existing route, so account A can never read or mutate account B's settings.

## 4. Proposed server tests (extend the existing Vitest suite)

1. settings round-trip: PATCH preferences → refresh (`GET`) → values persist on the same session; different session cannot see another user's values (requires two users).
2. ownership: PATCH/GET with another user's token still only touches their own record (no cross-account writes possible — id never accepted from body).
3. validation: bad phone length rejected with `{ error, field }`; unknown/extra fields rejected; boolean coercion for `prefs`.
4. password: wrong current password → 401, unchanged hash; correct current + short new password → 400; correct pair → login succeeds with the new password, old one fails.
5. rate limit on `POST /api/auth/password` fires within the configured window.

## 5. Frontend integration planned once approved (already shaped)

- `api/endpoints.js`: `accountSettings()`, `updateAccountSettings(patch)`, `changePassword(body)` (call sites ready in the two settings pages).
- `features/farmer/pages/Settings.jsx` + `features/buyer/pages/Settings.jsx`: replace each `SettingUnavailable` card with a real form (validation, save/cancel, loading, success/failure feedback), keep the reset-with-confirmation semantics via the feature's confirm dialog.
- Same visual/interaction patterns the dashboards already use (`Field` primitive, `EmptyState`, confirm dialogs) — no redesign.

## 6. Current state of the shipped frontend (honest)

- Both Settings pages load the real account details (read-only) from the session-verified profile endpoints with loading/error/retry states.
- Every persistent-settings category renders the "not configured yet" card naming its missing backend pieces; a page-level notice states plainly that nothing can be saved yet.
- No localStorage substitutes, no fake toggles, no false success messages; `NotYet.jsx` placeholder was retired because its only consumer (settings) is now real-but-honest.
- **Persistence acceptance criteria (§4 of the task) are NOT met in this build by design** — they are contingent on approvals of §§2–3 above.
