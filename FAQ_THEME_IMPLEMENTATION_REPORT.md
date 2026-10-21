# FAQ Page + Global Light/Dark Theme — Implementation Report

**Task:** AGRILINK-FAQ-GLOBAL-THEME-001 · **Mode:** frontend-only · **Date:** 2026-10-22
**Constraints honored:** no backend changes · no duplicate router/theme systems · existing hash routing, auth, cart and checkout logic untouched · nothing committed (working tree left uncommitted).

---

## 1. FAQ route and files created

Route: **`#/faq`** (public page inside the existing hash router — no framework router added).

| File | Purpose |
|---|---|
| `frontend/src/features/faq/FAQ.jsx` *(new)* | The FAQ page: compact intro, labeled search, category chips, accessible accordion, honest empty state, “Still need help?” support section. |
| `frontend/src/features/faq/faqContent.js` *(new)* | Centralized data module — `FAQ_CATEGORIES` (7 chips) + `FAQ_ITEMS` (12 entries). All content lives here; the page is purely presentational. |
| `frontend/src/router/routes.js` | `'faq'` added to `PUBLIC_PAGE_IDS`. |
| `frontend/src/App.jsx` | `#/faq` render branch (between How It Works and About) + `FAQ` import. Footer shows on the FAQ page (it is not an authenticated route). |
| `frontend/src/components/layout/Navbar.jsx` | “FAQ” entry in `NAV_LINKS` (drives desktop + mobile menus). |
| `frontend/src/components/layout/Footer.jsx` | FAQ link in the “Company” group. |

**FAQ behaviors implemented**
- **Search**: labeled (`Search the FAQ`), live, case-insensitive, scans question **and** answer text, with an inline clear (×) button.
- **Category chips**: `All Questions / Getting Started / Farmer Accounts / Buyer Accounts / Produce Listings / Cart and Checkout / Account and Security` — compact pills, selected state visible, combined with search (`aria-pressed` on each chip).
- **Accordion**: expandable cards; multiple answers may stay open; native `<button>` triggers with `aria-expanded`, `aria-controls`, `role="region"` panels referenced by `aria-labelledby`; subtle `grid-template-rows` 0fr→1fr animation that is disabled for `prefers-reduced-motion` users, closed panels removed from the accessibility tree (`aria-hidden`); Enter and Space activation is explicit and single-fire.
- **Empty state**: “No matching questions” card with a **Clear search and filters** action; results count announced via `aria-live="polite"`.
- **Support section**: real destinations — `#/contact`, `#/start-selling`, `#/how-it-works` (all in the router).

**Content integrity** — every answer was cross-checked against the actual implementation (login/signup dialog with role cards; My Produce create/delete only — no edit/pause; per-listing Request/Inquire controls; cart on the public marketplace; orders created as Pending/Unpaid with payments NOT configured; no password-recovery claim; theme toggle answer became true with this task). No entry claims payments, deliveries, refunds, seller verification or account recovery.

## 2. Theme architecture and files changed

One shared system, mounted once:

- **`frontend/src/features/theme/theme.jsx`** *(new)* — `ThemeProvider` exported and rendered **inside `App.jsx`’s root return** (wraps navbar, pages, shells, AuthModal). State: `light | dark`; flips the Tailwind `darkMode: 'class'` class on `<html>`, stamps `style.colorScheme` (native inputs/scrollbars follow), and syncs the mobile browser-chrome `<meta name="theme-color">`. Persistence key **`agrilink_theme`** in `localStorage` (try/catch — storage failures degrade to session-only). While no explicit choice is stored the provider **follows the OS `prefers-color-scheme`** live; the explicit user choice always wins. Storage is written **only on explicit toggles**, so a system-derived default is never pinned.
- **`frontend/src/features/theme/ThemeToggle.jsx`** *(new)* — shared icon button (Sun in dark mode, Moon in light), `aria-pressed` for state, action-labelled `aria-label`/`title` (“Switch to light mode” / “Switch to dark mode”), real `<button>` (Enter/Space native), global `:focus-visible` ring.
- **`frontend/index.html`** — pre-paint boot script (same key) applies the saved theme — or the OS preference — **before first paint**; also updates the theme-color meta. No flash on refresh.
- **`frontend/tailwind.config.js`** — `darkMode: 'class'`; all theme-sensitive colors converted to rgb-triplet CSS variables (`--ag-*`) with `<alpha-value>` support (so `bg-paper/75` etc. work). Button/overlay brand backgrounds (`primary`, `farmer.primary`) stay constant; text-facing brand shades (`brand`, `brand-deep`, `brand-amber…`, `farmer.brand`) are variable-driven so they stay readable on dark surfaces.
- **`frontend/src/styles/index.css`** — the single palette source: `:root` light values are **byte-identical to the shipped palette** (visual change zero in light mode); a `.dark` block swaps them for green-tinted charcoal surfaces (never pure black — e.g. page `#121814`, cards `#1A201B`, lightened brand text `#7CC782`). Light-mode `::selection` preserved exactly; a dark pairing added. Focus ring uses `--ag-focus-inner` (page bg in dark so the green ring reads alone).
- **Sweep (mechanical, ~58 files)** — recurring light-only utility classes mapped 1:1 to semantic tokens: `bg-white→bg-paper`, `text-neutral-900…300→text-ink/ink-2/ink-3/ink-4/muted/muted-2/faint`, `bg-neutral-50/100/200→bg-paper-soft/soft/soft-strong`, `border/divide/ring-neutral-*→*-line(*-strong)`, red state classes→`danger/danger-wash/danger-line`, green→`ok/ok-strong/ok-wash/ok-line`, blue→`info/info-wash`; `text-primary(-dark)→brand(-deep)`, `text-secondary(-dark)→brand-amber(-deep)`, `text-farmer-primary→text-farmer-brand`; accent rings/borders `ring/border-(farmer-)primary→ring/border-(farmer-)brand` so focus states stay visible in dark. Light values identical throughout (`farmer.brand` light = the original `farmer.primary` hex).
- **Dashboard shells** — `farmer-page/fsurface/fink/fmuted/fline/success/warning/danger` are variable-driven, so every Farmer and Buyer page themes via tokens with no layout change.
- **Intentional constants** (not swept, verified): chip text over photo overlays (`bg-neutral-900/55-70`, `ring-white`, `from-neutral-900/35` photo scrims), text on solid amber chips (kept `text-neutral-900`), the amber “paused” chip (`bg-amber-50` + fixed `#946200`), emerald-950 sections (Footer/Hero), `bg-primary*`/`bg-farmer-primary`/`bg-secondary` buttons, glass `border-white/*` rings over photos.
- **Drawer/dialog scrims** — `bg-farmer-ink/30-40` → `bg-black/30-40` (4×) so overlays stay dark in dark mode (visually identical in light).

### Toggle placement (shared controller in all layouts)
- **Public navbar** desktop cluster (always visible at every width) and a labelled “Appearance” row in the mobile menu.
- **BuyerShell header** and **FarmerShell header** — same `ThemeToggle` component beside the menu button (`buyer`/`farmer` dashboards are separate headers; both share the app-level provider — no second theme state exists).

## 3. Pages verified in both themes

No browser automation exists in this environment (no playwright/puppeteer), so verification is **code-review + generated-CSS analysis + tests**, not screenshots:

- **Public**: Landing/Hero (photo overlays constant, glass panels flip), Marketplace + ProductCard (cards, price chip, sold-out/low-stock overlays), CategoryFilter, About, How It Works, Contact (forms/textarea focus states), Start Selling, FAQ, NotFound, Footer, Navbar (glass bar, cart badge, mobile menu).
- **Auth**: AuthModal (frosted `bg-paper/65` glass, segmented control tint, inputs, role cards, recovery notice, scrim `bg-emerald-950/55`), the app-level auth-boot loader.
- **Buyer dashboard**: shell header/sidebar drawer, Overview, Browse (+filters), Checkout (quantity steppers, banner states, order summary), Orders, Inquiries, Requests + Request/Inquiry dialogs, Saved, Profile, Settings, PriceCompare, AI pages (Produce Finder/Purchase Planning/Supplier Matching) — all farmer-token surfaces flip via variables.
- **Farmer dashboard**: shell header/sidebar drawer, Overview + StatCard, My Produce (form, status chips, ConfirmDelete), Orders, Inquiries, Farm Profile, Settings, MarketIntelligence, AI pages — likewise token-driven.
- **Shared primitives**: Field inputs (error/focus/disable states), EmptyState/ConfirmDelete dialogs, Common components (AccountSummary, CtaBand gradient, SettingUnavailable).
- Native controls (checkboxes, selects, scrollbars, autofill) follow via `color-scheme`; `:focus-visible` ring verified visible on both surfaces (inner ring matches the surface).

## 4. Persistence behavior

- Toggle → `<html class="dark">` + `colorScheme` + `localStorage.agrilink_theme` (explicit choices only).
- First visit: stored preference → else OS `prefers-color-scheme`, applied pre-paint by the index.html boot script; the provider adopts the same value at mount (no conflict, no flash).
- Refresh restores the saved theme **before** React renders; route changes (hash navigation, deep links, role switches) never reset it; storage failures fall back to in-session state.

## 5. Accessibility checks

- Toggle: real button · `aria-pressed` state · action-labelled accessible name + tooltip · global `:focus-visible` ring in both modes.
- FAQ: labeled search · `aria-pressed` chips · accordion `aria-expanded/controls/labelledby`, `role="region"`, Enter/Space activation (explicit, single-fire) · reduced-motion respected (transitions off; animation is decorative only) · `aria-live` results count · honest empty state with accessible clear action · all support links have real destinations.
- Contrast in dark mode hand-checked for text steps (ink ≈15:1, muted ≈6:1, muted-2 ≈4:1, brand ≈7:1 on cards) and state pairs (danger/ok/info washes). Inputs/dropdowns/dialogs inherit the theme; disabled state (Add-to-cart sold-out button) uses `bg-soft-strong` and remains legible.

## 6. Test results

- **Existing frontend tests: 16/16 pass** (checkout 5, authModal 6, authSession 5) — unchanged behavior confirmed.
- **New tests (20)** — `frontend/src/tests/faq.test.jsx` (11: route/search/answers-text/category-chips/combined-filters/empty-state/accordion-ARIA/keyboard Enter+Space/help links/app integration) and `frontend/src/tests/theme.test.jsx` (10: light default, OS-preference start without pinning storage, explicit choice beats OS, toggle ARIA+storage, survives navigation & remount, buyer + farmer shell toggles, no sign-out/no cart reset on toggle).
- **Total: 36/36 client tests pass.**
- jsdom lacks `matchMedia` and does not synthesize native button activation — the suite stubs `matchMedia` explicitly and the accordion implements explicit (single-fire) Enter/Space activation so keyboard behavior is testable in this environment. In real browsers native button semantics are unchanged.
- **Server tests: 46/46 pass** (4 files, 326.67s; validation/auth/ownership/authorization suites) — server code untouched by this task; re-run confirms no regression from the frontend-only changes.
- The pre-existing checkout defect documented in `BUYER_LOGIN_CART_CHECKOUT_AUDIT.md` (B1 – direct `#/buyer/checkout` crash on empty cart) was deliberately **not** touched: color tokens were swept in `Checkout.jsx` only; no logic changed.

## 7. Production build

`npm run build` → **succeeds** (1638 modules; `dist/` regenerated). Generated CSS verified to contain the `.dark` variable block, the new token utilities (`bg-paper-soft`, `text-ink`, `bg-ok-wash`, `text-brand-amber-deep`, `text-farmer-brand`, `bg-paper/65`, grid-rows accordion transition), and the boot script is present in `dist/index.html`.

## 8. Remaining limitations

1. **No pixel-level visual QA** — no browser automation available in this repo/env; both-mode verification is code + generated-CSS + test based. A quick manual pass in a browser is worth 10 minutes (faq page, auth modal, one farmer page, checkout).
2. **Copy on photos kept literal** (Hero/Footer emerald text, photo chip scrims) — correct by design but means those areas render identically in both modes.
3. Dark glass surfaces (`border-white/*` rings on the auth modal/navbar) keep a light hairline aesthetic in dark mode — intentional glassmorphism, not a defect.
4. The pre-paint boot script applies the theme before first paint; any perceived flash during load is limited to normal web-font swap (FOUT), which is unrelated to theming.
5. **`prefers-contrast` / high-contrast OS themes are not targeted** — tokens could be extended later with `forced-colors` fallbacks.
6. FAQ search is client-side only (per spec, no backend); a large future FAQ set might want server-side search or URL-state persistence of filters.
7. The farmer-primary constant is still used for **button backgrounds**; if brand guidance ever shifts, text-safe (`farmer.brand`) and background (`farmer.primary`) tokens now move independently.
