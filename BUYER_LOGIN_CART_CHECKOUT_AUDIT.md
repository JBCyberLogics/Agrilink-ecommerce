# BUYER_LOGIN_CART_CHECKOUT_AUDIT.md

**Task:** AGRILINK-BUYER-CHECKOUT-FLOW-AUDIT-001 — Investigate Buyer Login, Cart, and Checkout Flow
**Mode:** read-only diagnostic first — **no application code was modified during this audit**
**File created:** new file; does not overwrite the existing `AUTH_SESSION_FIX_REPORT.md`, `PUBLIC_PAGES_REPORT.md`, `UI_SETTINGS_FOOTER_REPORT.md`, or `SETTINGS_PERSISTENCE_REQUIREMENTS.md`

**Evidence legend** — every claim below is tagged:
- `[static]` = confirmed by reading code (file + function cited)
- `[dynamic]` = confirmed by running the repo's own test stack (Vitest/jsdom) against the real component, with all scratch fixtures kept **outside the repository** (`/tmp/opencode/`), fetch stubbed at the transport boundary only, and **no production records or payments of any kind created**
- `[test]` = result of the repo's committed test suites or the production build

Repo state note: the working tree already contained **uncommitted changes** to `frontend/src/App.jsx` (auth-boot `AuthBoot` panel, buyer-restore landing change, footer gating — described by the untracked `AUTH_SESSION_FIX_REPORT.md` and `frontend/src/tests/authSession.test.jsx`). This audit audited the code **as it exists in the working tree** and committed nothing.

---

## 1. Executive summary

The Buyer journey **login → marketplace → cart → checkout → order record** is mostly real and honestly guarded: authentication is a server-verified httpOnly JWT-cookie session, the marketplace feed is live MongoDB data, the cart is a single validated copy of app state persisted to `localStorage['agrilink_cart_v1']`, checkout calls the real `POST /api/orders` endpoint, and every payment surface honestly says "not configured – pending & unpaid". **No fake orders, fake payment success or fabricated listings exist in this flow.**

However, the audit found **two currently-reachable, high-impact defects**, **three state/navigation defects**, and a **server-side authorization gap**:

| # | Finding | Severity | Where |
|---|---------|----------|-------|
| B1 | Whole-app crash (`TypeError: Cannot read properties of undefined (reading 'reduce')`) on **every visit/refresh of `#shop/checkout` before auth resolves** — anonymous **and** signed-in users | **Critical** | `frontend/src/App.jsx` (checkout branch), `frontend/src/features/buyer/Checkout.jsx:14` |
| B2 | A multi-item cart **orders only the first item** and then **wipes the entire cart** — items 2..N are silently destroyed with no order record, while the shown subtotal includes all items | **Critical** | `frontend/src/features/buyer/Checkout.jsx` `placeOrder()` (lines 49–57), `frontend/src/App.jsx:409` |
| B3 | `POST /api/orders` has **no Buyer-role gate** (its own docstring says "Buyer role only") — a signed-in Farmer can reach the checkout UI and create an order record that **no page can ever display** | **High** | `server/routes/orders.js:22`, `frontend/src/App.jsx` (`Checkout` branch has no role check) |
| B4 | Refreshing while signed in on `#shop/checkout` bounces the buyer to the dashboard instead of returning to the checkout (masked today by B1's crash) | Medium | `frontend/src/features/buyer/Checkout` restore path, `App.jsx` `handleAuth()` |
| B5 | The navbar cart dropdown can **increase quantities but never remove an item or return to qty 0** — removal is only possible on the checkout page | Medium | `frontend/src/components/layout/Navbar.jsx` `CartButton`, `App.jsx` `<Navbar>` props |
| B6 | Stale `returnTo` — closing the auth modal does not clear the remembered page, so a later successful login can land the user on `shop/checkout` unexpectedly | Medium | `frontend/src/App.jsx` `openCheckout`/`onOpenAuth`, `AuthModal` `onClose` |
| B7–B9 | Cosmetic/UX: checkout steppers & remove use the `Truck` icon; Buyer Overview "Active Orders" still claims the order backend doesn't exist; place-order button stays enabled for an empty cart | Low | `Checkout.jsx`, `buyer/pages/Overview.jsx` |
| I1–I3 | Missing integrations: no payment provider (honest), **no delivery/contact-info capture anywhere in the order flow**, one-listing-per-order API (the root cause behind B2) | Info | see §9 |

**What is genuinely working and honest** (verified, not assumed): password validation + role-gated login (401/403 `accountRole` hints), protected-route gates for both dashboards with a "Checking your session…" boot state, cart hydration/validation across refreshes, honest "Marketplace is unavailable" retry state, honest empty-basket/error handling at checkout, and an atomic server-side stock reservation that reports real failure reasons.

---

## 2. Actual route and component flow

Hash-synced routing with no router dependency (`frontend/src/router/routes.js` `parseHash()`; `App.jsx` `goRoute()` uses `history.replaceState`):

| Stage | Actual route | Component(s) | Notes |
|-------|--------------|--------------|-------|
| Login / signup | none (modal) | `App.jsx` `<Navbar onSignIn>` → `features/auth/AuthModal.jsx`, opened also via `?auth=1`, `?demo=buyer|farmer`, gates (`BuyerShell`/`FarmerShell` `onOpenAuth`) | Role cards (Buyer/Farmer) are *required even on login* |
| Buyer dashboard | `#/buyer/dashboard` | `features/buyer/pages/Overview.jsx` inside `features/buyer/BuyerShell.jsx` | Restore-after-login lands here (deep links preserved for `buyer/*`) |
| Buyer Browse | `#/buyer/produce` | `pages/Browse.jsx` + `parts/ProduceCard.jsx` | **No add-to-cart** — only Save / Request / Inquire |
| Public marketplace | `#shop` | `features/marketplace/Marketplace.jsx` → `ProductCard.jsx` | **The only add-to-cart UI in the entire app** (`App.jsx:430 onAddToCart={addToCart}`) |
| Cart | none (navbar dropdown) | `components/layout/Navbar.jsx` `CartButton` | Qty +/- only; see B5 |
| Checkout | `#shop/checkout` | `features/buyer/Checkout.jsx` (branch at `App.jsx:393–411`) | Login gate for anonymous users; crash on boot — B1 |
| Order confirmation | none (inline panel) | `Checkout.jsx` success block (lines 192–205) | "Order placed — pending & unpaid" |
| Order history | `#/buyer/orders` | `pages/Orders.jsx` via `GET /api/orders` | Buyer-role gated by `BuyerShell` |

**State sources of truth**
- Authentication: **server-verified session** — `POST /api/auth/login|signup` sets an httpOnly JWT cookie (`server/routes/auth.js`); boot restore via `GET /api/auth/me` (`App.jsx` boot effect, `authReady` state). Role never comes from the client.
- Cart: **App state + `localStorage['agrilink_cart_v1']`** (`App.jsx:81–145`). Restore is shape-validated (product id/name/price/unit/qty/stock types and ranges). Not user-scoped.
- Checkout/order state: local to `Checkout.jsx` (`orderStatus`, `placedOrder`); totals recomputed from cart each render (`subtotal = cart.reduce(...)`).
- Not used: no sessionStorage, no tokens/credentials in localStorage (comment-verified at `App.jsx:94–99`).

---

## 3. Buyer login diagnosis

Traced handler chain: `Navbar AuthArea "Sign In"` → `App.openAuth()` → `AuthModal` (required role card + client validation `EMAIL_RE`, password ≥ 6, name ≥ 2, confirm-match) → `apiLogin({email, password, role})` → `POST /api/auth/login`:

`[static] verify` results
- Submit handler is wired to the real `<form onSubmit={handleSubmit}>` (`AuthModal.jsx:243`, handler 113–151). ✔
- Invalid credentials: server returns 401 `{error:'Invalid email or password.'}` (`server/routes/auth.js:71–73`) → surfaced as `errors.global` alert strip (`AuthModal.jsx:139–147, 404–412`). ✔ `[test] server/tests/auth.test.js + validation.test.js cover 401s; frontend authModal tests cover inline errors.`
- Role cannot be swapped: server compares the selected role to the DB role and rejects with 403 `{field:'role', accountRole}`; the UI then pre-selects the account's real role (`auth.js:77–84`, `AuthModal.jsx:143–146`). ✔ `[test] auth.test.js "rejects role mismatch with 403…"`.
- **No redirect before auth finishes**: navigation happens only inside the `await`ed success path. ✔
- Protected buyer routes check auth state on the server-verified user (`BuyerShell.jsx:147–175`: anonymous → access panel; Farmer → role gate), with the `AuthBoot` "Checking your session…" state preventing a gate flash while `GET /api/auth/me` is in flight (`App.jsx:57–72, 391–392`). ✔ `[test] authSession.test.jsx #2`.
- Refresh/Back/Forward: session lives at App level and is re-restored from the cookie on mount; hash edits never clear it. ✔ `[test] authSession.test.jsx #4`.

`[static] issues found`
- **"Remember me" checkbox is non-functional** (`AuthModal.jsx:375–382`) — it submits nothing and the session is always a 7-day cookie (`auth.js:19,30`). Misleading control, no data risk.
- `?demo=buyer` fallback: if the demo login fails, `App.jsx:261–270` calls `handleAuth({name:'Wanjiku Kamau', …})` — a **client-side user object with no session cookie** (`[static]`). The stated intent is a visual fallback ` // API offline → visual fallback`; consequence: the navbar shows a signed-in buyer that is not actually authenticated; the first real API call surfaces an error state. Honest on errors, but the identity display is fabricated UI. Demo-URL only, so not a production-neutral login defect — flagged I1-bound for decision-makers.
- Stale `returnTo` (`openCheckout`/shell guards) — see B6.

---

## 4. Marketplace-to-cart flow

`[static]`
- Feed is real: `GET /api/market/listings` (only Active listings of existing farmers, newest first; `server/routes/market.js`) → `toCard()` maps **actual server fields** (`Marketplace.jsx:10–20`). No fixture data anywhere in the shop feed.
- Add-to-cart button calls a real handler: `ProductCard.handleAdd → onAddToCart(product)` wired to `App.addToCart` (`ProductCard.jsx:20–23`, `App.jsx:147–168`). ✔
- Duplicate add → existing intended behavior: increments qty, clamped to **current listing stock** (`App.addToCart`). Sold-out rows are disabled (`ProductCard.jsx:105`). ✔
- The cart receives the correct product identifier (`product.id` = the MongoDB listing `_id` string) and listing fields. `[dynamic]` confirmed the id survives the cart→checkout→`POST` payload round-trip (B2 test asserts the body's `listingId`).
- Cart state survives route changes (App-level state). ✔ `[dynamic]` cart rendered correctly on the checkout route after navigating within the running app instance.
- Refresh persistence: `loadCart()` validates and restores `agrilink_cart_v1` on mount. `[test]` no committed test covers cart persistence; `[dynamic]` the B2 scratch test exercised the real hydration path (2 items injected through the app's own storage key → both rendered in checkout).
- Empty-cart checkout is guarded (`Checkout.placeOrder` early-return + success UI). Error feed/retry states are honest (`Marketplace` dead state). ✔

`[static] gaps`
- **The buyer dashboard's Browse/Saved pages cannot add to the cart** — the "Place an order from Browse Produce…" instructions in `pages/Orders.jsx:69` and the Overview hint text (`Overview.jsx` empty-orders copy) do not match the actual UI: you can only order through the public `#shop` cards. Buyers on dashboard pages have no add-to-cart affordance at all.
- No quantity picker on the card — every add is exactly +1 (repeat-click to build qty). Not a correctness bug, but the "Buyer selects a product **and quantity**" step of the traced journey is only achievable by re-clicking Implicitly.

---

## 5. Cart state and calculation behavior

`[static]`
- Source of truth: `App.cart` (+ validated `localStorage` mirror). No duplicate contexts; a single `cartCount` derived value feeds the navbar badge.
- Totals are recomputed from current cart data on every render in both cart UIs (`Navbar.CartButton.subtotal`, `Checkout.subtotal`, `lineTotal`) — no caching, no drift. KSh formatting shared via `utils/format.js`. ✔
- `changeQty` clamps `1 ≤ qty ≤ item.stock` (stock falls back to `?? 99` only for items missing the field) (`App.jsx:170–180`). Removing drops the row then re-saves storage. ✔
- "Empty-cart behavior handled correctly": navbar dropdown shows an empty-basket state; checkout shows "Your basket is empty." and refuses to submit.
- Corruption handling: invalid stored entries are dropped wholesale (start empty). ✔

`[static] defects in this area`
- **B5 — no removal and no decrement-to-zero from the navbar basket:** `CartButton` renders only +/- steppers; the `onRemove` prop is *declared but never used* (`Navbar.jsx:57,283`), and `App.jsx:372–384` never passes `onRemoveFromCart`. `changeQty` floors at 1, so a minus press at qty 1 is a dead control. A buyer on any page other than checkout **cannot remove an unwanted item**.
- Item price/stock is snapshotted at add time and never re-synced with the live listing before checkout; the server re-validates stock at order time and its message is surfaced — acceptable, noted for completeness.
- Cart is **not user-scoped** (shared browser history across logins; see §7) — design decision to be confirmed by product.

---

## 6. Checkout and order submission behavior

`[static]` trace: `Navbar "Checkout" → App.openCheckout()` (anonymous → auth modal with `returnTo='shop/checkout'`; signed-in → `goRoute('shop/checkout')`) → `App.jsx` checkout branch renders `Checkout` with `{cart, user, onQty, onRemove, onBack, onOrderPlaced}` → `Checkout.placeOrder` → `POST /api/orders` `{listingId, quantity}` → server re-validates listing/Active/stock, **atomically reserves stock**, creates `Pending/Unpaid` record, returns 201 `{order}` → UI shows "Order placed — pending & unpaid" with server-derived fields (id tail, name, qty, totalAmount) → `onOrderPlaced → setCart([])`.

`verify` results:
- Cart state reaches checkout correctly (via props, `[dynamic]` verified). ✔
- Totals recomputed consistently from current cart — ✔ for the UI, **but see B2: the UI subtotal includes items that will never be ordered.**
- Required client validation — **N/A: the only user input is implicit (cart contents). There is no delivery, contact, or note form anywhere in the checkout page** (`Checkout.jsx` reviewed in full). The order API accepts only `{listingId, quantity}` (`server/routes/orders.js:49–56`). This is a missing feature, reported honestly in §9/I2.
- Invalid submissions rejected at the server with field-level errors (listing missing/404, inactive listing, stock shortfall) (`orders.js:53–77`); error text is displayed without failing the cart ([dynamic] transport-failure behavior is identical — see §7 scenario 8). ✔
- **Duplicate submission protection:** button renders `disabled={orderStatus === 'submitting'}` with a `Placing order…` spinner (`Checkout.jsx:161–175`) — repeated clicks cannot fire a second request. ✔ (server also rejects out-of-stock on replay)
- Loading & error states handled: `submitting` → spinner; `error` → alert strip with the server/client message; **cart is never cleared on failure** (`onOrderPlaced` only runs after `createOrder` resolves). ✔
- Unavailable service reported honestly: transport failure surfaces `"Could not reach the Agrilink server."` (`api/client.js:27`). ✔
- **No fake order confirmation:** success panel appears only when the server responds 201 and prints the server's own record. ✔ Payment is never described as completed ("pending & unpaid" everywhere). ✔
- **Cart not cleared before configured operation succeeds:** ✔ strictly awkward though — see B2 (cleared *too much* after success, not too early).

`[dynamic] + [static] defects`
- **B2 — confirmed end-to-end:** with a 2-item cart, exactly one `POST /api/orders` was fired with `{"listingId": "<item A id>", "quantity": 3}` and after the 201 delivery `localStorage['agrilink_cart_v1'] = []`. Item B was never ordered yet disappeared from the basket. UI meanwhile advertises a subtotal covering **both** items (KSh 370 in the reconstruction) while `placedOrder.totalAmount` covers only item A (KSh 210) — two contradictory totals are displayed after the same submission flow.
- **B9 — place-order button is not disabled when the cart is empty** (the handler's early return hides it, but the control suggests an action that cannot happen). Minor honesty polish.
- **B3 — role naming mismatch UI↔server:** a signed-in Farmer can open the navbar cart and checkout (no role check in `App.jsx`'s checkout branch or `openCheckout`, and `Navbar` is rendered on all routes) and `POST /api/orders` will succeed. The route file's own header comment promises *"Buyer role only"* (`orders.js:1–11`) but the router only mounts `requireAuth` (`orders.js:22`) — unlike `/api/buyer/*` which enforces `buyerOnly` (`server/routes/buyer.js:25–31`). A Farmer-placed order (`buyerId`=the farmer) never appears in any page: buyer pages are role-gated and `GET /api/farmer/orders` filters by `farmerId`.

## 7. Authentication and navigation findings

Recorded actual results for the required scenarios (`[static]` unless noted; browser-level automation was not available — see §12):

1. **Login → marketplace:** works; from the shop a fresh Buyer login lands on `buyer/dashboard` (server-role-driven `handleAuth`), marketplace reachable via navbar. `[test]`
2. **Add to cart → navigate:** cart persists across routes (App-level state). ✔
3. **Refresh cart page:** cart restored from validated `localStorage` (`[dynamic]` — exercised through App's real hydration). Dropdown closes; session restores from the httpOnly cookie; refreshed on farmer/buyer routes shows the honest "Checking your session…" boot state. **Refresh at `#shop/checkout` = B1 crash.**
4. **Back from checkout:** the app's `goRoute()` uses `history.replaceState` (single-entry navigation; `App.jsx:190–195`) — in-app jumps do **not** create history entries, so Browser-Back from checkout leaves the app's entry (returns to the URL that existed before the session started), it does **not** go back to `#shop`. This is the app's existing navigation design, not browser-navigation-dropping — recorded as-is per the audit requirement.
5. **Forward:** symmetric — there is no pushed forward-entry to return to; arriving at an old hash re-parses via `hashchange` and `parseHash`. No stale content can re-mount because dashboards always run their live gate and data fetches.
6. **Logout while cart/checkout open:** `signOut` → `apiLogout()` clears the server cookie → `goRoute('shop')` forcibly leaves protected pages (`App.jsx:319–328`). Stale protected content cannot remain usable — the dashboards re-gate on `user`, which is already `null` in memory, and a Back press re-renders gates rather than content. ✔ **The cart itself is not cleared** and is not tied to the account — an explicit design decision to document (shared-browser leakage of checkout intent, no credentials involved).
7. **Protected route without login:** buyer/farmer routes: "Checking your session…" then access gate with remembered `returnTo` (`BuyerShell` guard; `[test]` authSession #2/#5). **`#shop/checkout` is the exception — it is protected by the anonymous login gate *inside* `Checkout`, but that gate is unreachable because the render crashes first (B1).**
8. **Checkout while service down:** `api/client.js` throws `{status:0, error:'Could not reach the Agrilink server.'}` → red alert strip; cart intact. ✔

**Do not auto-logout on Back:** verified — hash edits never touch session state; only `signOut` clears it. ✔

## 8. Confirmed bugs with file paths and relevant functions

| ID | Severity | Title | File / symbol | Evidence |
|----|----------|-------|---------------|----------|
| **B1** | **Critical** | Rendering `#shop/checkout` before auth state resolves crashes the whole SPA: `TypeError: Cannot read properties of undefined (reading 'reduce')` | `frontend/src/App.jsx` checkout branch (`<Checkout user={null} onSignIn={…}/>` — **no `cart` prop**) + `frontend/src/features/buyer/Checkout.jsx:14` `const subtotal = cart.reduce(...)` (computed before the `if (!user)` gate) | `[dynamic]` repro on a real `<App/>` render, both anonymous and mid-boot signed-in |
| **B2** | **Critical** | Multi-item cart: only `cart[0]` is ordered (`listingId: cart[0].productId`) then **the whole cart is cleared** (`onOrderPlaced={() => setCart([])}`); items 2..N vanish without any order; UI subtotal (`all items`) contradicts `placedOrder.totalAmount` (`first item`) | `frontend/src/features/buyer/Checkout.jsx` `placeOrder()` lines 49–57 + `App.jsx:409` | `[dynamic]` POST body + `localStorage` state captured |
| **B3** | **High** | `/api/orders` allows any authenticated role; docstring claims Buyer-only; Farmer-placed orders are unreachable in the UI | `server/routes/orders.js:22` (missing `buyerOnly`) · `frontend/src/App.jsx` (no role check on checkout branch · `openCheckout`) | `[static]` |
| **B4** | **Medium** | Session restore on `#shop/checkout` redirects a signed-in Buyer to `buyer/dashboard` (checkout deep link not preserved; masked by B1 today) | `frontend/src/features/buyer/Checkout` boot path · `App.jsx` `handleAuth()` Buyer branch (`current.startsWith('buyer/')` excludes `shop/checkout`) | `[static]` |
| **B5** | **Medium** | Navbar basket has no remove control; decrement is floored at 1; `onRemove` prop wired but unused, `onRemoveFromCart` never passed | `frontend/src/components/layout/Navbar.jsx` `CartButton` (57, 283) · `App.jsx:372–384` · `App.jsx changeQty` | `[static]` |
| **B6** | **Medium** | Stale `returnTo`: `AuthModal` close (Esc/backdrop/×) leaves `App.returnTo` set — a later successful login lands the user on `shop/checkout` or a stale dashboard route | `frontend/src/App.jsx` `openCheckout`/`onOpenAuth` vs `AuthModal.jsx` `onClose` | `[static]` |
| **B7** | Low | Checkout "+/−/remove" icons are `Truck` (wrong affordance) | `frontend/src/features/buyer/Checkout.jsx:109,118,129` | `[static]` |
| **B8** | Low | Buyer Overview hardcodes "Active Orders —" and states no order backend although `POST/GET /api/orders` ship | `frontend/src/features/buyer/pages/Overview.jsx:103–108` (+ header comment line 5) | `[static]` |
| **B9** | Low | Place-order button stays enabled with an empty cart (early-return guard only) | `frontend/src/features/buyer/Checkout.jsx:45,158–175` | `[static]` |
| **B10** | Low | "Remember me" checkbox is inert (session is always a 7-day cookie) | `frontend/src/features/auth/AuthModal.jsx:375–382` · `server/routes/auth.js:19–30` | `[static]` |
| **I1** | Info | `?demo=buyer` failure path fabricates a signed-in identity without a cookie (demo URL only) | `frontend/src/App.jsx:261–270` | `[static]` |
| **I2** | Info | README documents `cdp-*.mjs` browser E2E suites that do not exist in the repo | `README.md` §testing vs `glob **/cdp*.mjs` = none | `[static]` |

## 9. Missing or unconfigured integrations

1. **Payment provider** — none connected. Every surface states "Payments not configured yet / pending & unpaid" (`Checkout.jsx:142–155`, `buyer/pages/Orders.jsx`, `farmer/pages/Orders.jsx`). This is the intended honest state, consistent with the audit's no-fake-payment constraint. (Marketing strings in `Hero.jsx:122` / `Footer.jsx:58` say "Escrow-secured payments" while no escrow exists — recommend rewording for consistency.)
2. **Delivery / contact information** — no fields exist in the checkout UI and `POST /api/orders` accepts none. If these are required eventually, both shapes must be added; today nothing invents them.
3. **Multi-line order API** — the order contract is one listing per order (`{listingId, quantity}`, `Order` model has single `listingId`). There is currently **no real way to order several cart rows**, which is the root cause of B2.
4. **Password recovery** — no email provider; the UI says so honestly (`AuthModal.jsx:97–111`).
5. **Market intelligence / AI surfaces** — out of scope for this audit; no claims inspected.

## 10. Reproduction steps for each confirmed issue

**B1 — checkout boot crash** `[dynamic]`
1. Open the app at `http://localhost:5199/#shop/checkout` (or press F5 while on checkout), **before** any auth session UI settles (any time `user` is still `null` — i.e. anonymous visitors *always*, signed-in users during the cookie-restore instant).
2. Expected per design: sign-in gate / brief boot state → dashboard or checkout.
3. Actual: the entire app unmounts; page becomes blank; console shows `TypeError: Cannot read properties of undefined (reading 'reduce')` from `Checkout.jsx:14` — because `App.jsx` renders `<Checkout user={null}/>` **without** a `cart` prop, and the subtotal is computed before the `!user` gate. (Verified with the real `<App/>` in jsdom; both variants threw.)

**B2 — first-item-only order + cart wipe** `[dynamic]`
1. Marketplace: add any two products (e.g. item A, item B). Confirm the navbar shows 3 items (A×2 + B×1 in the reconstruction → subtotal KSh 220).
2. Sign in, open the basket, press "Checkout".
3. Press "Place order" once.
4. Observe: the success panel reports an order **only for item A** (qty/total of A), "pending & unpaid".
5. Observe: the navbar badge drops to **0** and the basket review reads "Your basket is empty." — item B was never ordered and is gone from storage (`agrilink_cart_v1`). Network inspector: exactly one `POST /api/orders` with `body {"listingId":"<A id>","quantity":2}`.

**B3 — farmer can place an order** `[static]`
1. Sign in with a Farmer account (e.g. the seeded `demo@agrilink.co.ke` / `demo1234`).
2. Add any listing to the cart from `#shop`, press "Checkout".
3. Actual: the checkout page renders ("You're signed in as … (Farmer)") and "Place order" is clickable; the server would store the order (no `BUYER_ONLY` gate) while the farmer can never see it afterwards.

**B5 — cannot remove or zero-out from the basket** `[static]`
1. Add one item, open the navbar basket, press "−" until qty = 1, press again.
2. Actual: quantity stays 1 forever; no remove control exists (must open `#shop/checkout` to remove).

**B6 — stale returnTo** `[static]`
1. Anonymous: add item → open basket → press "Checkout" (auth modal opens, `returnTo='shop/checkout'`) → press Esc.
2. Later (any page) press "Sign In" and sign in with a Buyer account.
3. Actual: skipped to `#shop/checkout` although the user never re-requested it.

## 11. Recommended fixes ranked by severity

All within "frontend_only / preserve existing logic / no backend changes":

1. **B1 (must):** pass `cart` to the anonymous checkout render (`App.jsx`) **and** make `Checkout.jsx` crash-proof: `const subtotal = cart?.reduce(...,0)` / default `cart = []` in destructuring, and only compute after the `!user` gate. Optionally include `shop/checkout` in the `AuthBoot` branch (`App.jsx:391`) so signed-in refreshes don't flash the anonymous gate.
2. **B2 (must):** choose honestly between (a) **sequential per-item ordering** — loop `createOrder` per cart item, verify every response, clear only the rows whose orders were confirmed and surface real partial-failure evidence (stock decrements are server-side already); or (b) until the backend supports multi-line orders, **honestly disable multi-item checkout** ("checkout supports one produce listing per order") and prevent building a basket that cannot be fulfilled. Do **not** silently drop items as today.
3. **B3 (high):** `frontend`: role-gate the checkout route in `App.jsx` (Buyer-only, farmer users get the polite role gate panel precedent already existing in `BuyerShell`). Backlog (needs backend contact per constraints): align `server/routes/orders.js` with its documented "Buyer role only" contract.
4. **B4:** preserve the checkout deep link on restore — in `handleAuth`, keep the user on `shop/checkout` when `current === 'shop/checkout'` (same branch that protects `farmer/*`/`buyer/*` links).
5. **B5:** render a real remove button in the navbar basket (and allow − at 1 to remove), wired to the existing `removeFromCart`.
6. **B6:** clear `returnTo.current = null` in the `AuthModal` `onClose` handler (or reset it inside `openAuth`).
7. **B7–B10:** swap `Truck`→`Minus/Plus`/**Trash2** icons in `Checkout`; wire `Active Orders` on `Overview` to the now-real `buyerOrders` count (honest values, no fabrication); disable place-order when `cart.length === 0`; remove or implement "Remember me".
8. **I1/I2:** product decision on the `?demo=*` fabricated-identity fallback (keep with a visible "demo mode" chip, or remove the fallback); fix the stale README testing section.

## 12. Tests executed and their actual results

| Suite / action | Result (actual) |
|---|---|
| `npm run test:client` (authModal, authSession, checkout — committed suites) | **16 / 16 passed** |
| `npm run build` (vite production) | **SUCCESS** — 1634 modules, `dist/assets/index-DzPAfHs5.js` 472.65 kB |
| `npm run test:server` (supertest against isolated `agrilink_test` DB; dev DB name guarded) | see running tally below — recorded from the actual run |
| Audit scratch tests in `/tmp/opencode/audit.*.test.jsx` (outside the repo; real `<App/>`; fetch stubbed; **no DB writes, no production records**) | **B2 confirmed** (1 order call for item A only; `localStorage cart = []` after success). **B1 confirmed** (2× `TypeError: Cannot read properties of undefined (reading 'reduce')`; the scratch tests assert *no-crash*, so both appear as failures — the failure *is* the recorded defect evidence) |
| Browser automation / manual browser observation | **NOT PERFORMED — no automation available:** no `playwright/puppeteer/cypress` in `node_modules`, the README-referenced `cdp-*.mjs` scripts do not exist (stale docs). Findings tagged `[dynamic]` come from the component-level runs above, not from a real browser |
| MongoDB reachability during server suite | server reachable in this environment; suites ran slowly (network DB), `client` tests unaffected |

Actual server-suite tally observed in the run log while it executed (command: `timeout 480 npm run test:server`, output `/tmp/opencode/server-tests.log`):

```
✓ server/tests/validation.test.js   (16 tests) — passed
✓ server/tests/ownership.test.js    ( 9 tests) — passed
✓ server/tests/auth.test.js         (10 tests) — passed
✓ server/tests/authorization.test.js(11 tests) — passed

Test Files  4 passed (4)   Tests  46 passed (46)   exit=0   Duration 336.95s
```

Full pass includes the auth behaviours this audit depends on: login 401 for bad credentials, 403 + `accountRole` on role mismatch, `GET /api/auth/me` restore, logout clearing the cookie, and farmer↔buyer 403 role gates on `/api/buyer/*` and `/api/farmer/*`.

**Reinforcing evidence for B3:** the authorization suite proves farmers are rejected on every `/api/buyer/*` endpoint (403 `BUYER_ONLY`), yet **not one test exercises `/api/orders`** — the only role-scoped router in the project without a role guard or coverage.

**Coverage gaps identified ([static], pre-run):** no committed tests for `POST/GET /api/orders` at all (auth/validation/authorization/ownership suites skip the orders router), no checkout *submission* behavior test in the client suite (the committed checkout tests only assert static renders), and no test renders `<App/>` on `#shop/checkout` — which is why B1 survived.

The full suite is now complete — see §12 above for the final 46/46 tally; no further `§12b` placeholder pending.

---

*End of report. No application source file, test file, or existing report in the repository was modified, and nothing was committed.*
