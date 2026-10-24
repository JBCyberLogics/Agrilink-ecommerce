# Agrilink — Farm-Fresh Marketplace (Frontend-Only)

A frontend-first agricultural e-commerce marketplace that directly connects farmers (sellers) and buyers. **React 18 + Vite + Tailwind CSS 3.4** on the front. The backend (Express + Mongoose + MongoDB) has been removed from this delivery and archived at `backend-archived/`; the frontend is designed to connect to a real backend later via `VITE_API_BASE_URL` and the `src/services/` API interfaces.

## Status: Frontend-only

This delivery contains the **frontend application only**. There is no Express server, no Mongoose/MongoDB connection, and no seeded or demo data. The marketplace opens with zero listings until a real backend is connected and a farmer creates one.

All page layouts, navigation, role-based shells, forms, validation, cart UI and interaction logic are preserved. Where a feature depends on the backend (auth, listings, orders, inquiries, AI), the UI renders an honest **unavailable / not-configured state** instead of fabricating success or data.

## Quickstart

```bash
npm install          # install frontend dependencies
npm run dev          # Vite dev server — http://localhost:5199
npm run build        # production build -> dist/
npm run test:client  # frontend unit tests (vitest/jsdom)
```

There is no `dev:api` and no `test:server` — no backend process or database is required to run, test or build the frontend.

## Routes & navigation

The app uses hash-based routing (no router dependency):

| Hash | Page |
| --- | --- |
| `#shop` | Buyer marketplace (public) |
| `#/farmer/dashboard` | Farmer dashboard shell + pages |
| `#/farmer/produce` | My Produce (create/delete listings) |
| `#/farmer/market-intelligence` | Market intelligence (not configured) |
| `#/farmer/inquiries` | Buyer inquiries (not configured) |
| `#/farmer/orders` | Farmer orders (not configured) |
| `#/farmer/profile` | Farm profile |
| `#/farmer/settings` | Farmer settings |
| `#/buyer/dashboard` | Buyer dashboard shell + pages |
| `#/buyer/produce` | Browse Produce (public feed) |
| `#/buyer/price-comparison` | Price comparison (not configured) |
| `#/buyer/requests` | Purchase requests (not configured) |
| `#/buyer/saved` | Saved Produce (not configured) |
| `#/buyer/orders` | Orders & History (not configured) |
| `#/buyer/profile` | Buyer profile |
| `#/buyer/settings` | Buyer settings |
| `#/about` | About |
| `#/contact` | Contact |
| `#/faq` | FAQ |
| `#/start-selling` | Start selling |
| `#/not-found` | Not found |

Role-based shells (`FarmerShell`, `BuyerShell`) enforce access at the UI level; until a backend session service is connected, protected pages show an honest sign-in gate.

## Features

- **Global navbar** — brand mark, live search (filters the marketplace feed), role-appropriate links (logged-out users see Marketplace, How it works, About, FAQ, Contact plus Sign In/Sign Up; authenticated users also see their own dashboard), cart icon with animated count badge + glass dropdown basket (qty steppers, subtotal), light/dark ThemeToggle.
- **Auth modal** — glassmorphism Login/Sign Up dialog with Name/Email/Password/Confirm password fields and Buyer vs Farmer role selector. Until an auth backend is connected, submission shows an honest "backend not configured" state — it does not fabricate a session or token.
- **Farmer dashboard** — sidebar shell (sticky desktop, mobile drawer) with Overview, Market Intelligence, My Produce, Buyer Inquiries, Orders & Sales, Farm Profile, Settings. Listing creation form with full client-side validation (name, category, price, unit, stock, optional photo) submits to the API; until a backend is connected it reports backend-not-configured instead of pretending the listing was saved.
- **Buyer marketplace** — public product feed with category filter pills, navbar search, responsive product card grid (photo or honest category-icon placeholder, `KSh` pricing, real farmer chip, stock reality text, "Add to Cart" / "Sold out"), loading skeleton, API-error retry state, and empty-market state ("No produce listed yet").
- **Buyer dashboard** — shell with Overview, Browse Produce, Price Comparison, Purchase Requests, Saved Produce, Orders & History, Buyer Profile, Settings.
- **Checkout UI** — cart review with subtotal and "Place order" button; order submission is clearly marked unavailable until a backend order service is connected (no fabricated payments, orders or stock reservations).
- **AI pages** — Agricultural Assistant, Market Advisor, Recommendations Center (farmer + buyer variants); each shows `AI_SERVICE_NOT_CONFIGURED` until a real AI backend is connected.
- **Settings** — page shells preserved; only explicitly safe, non-sensitive local preferences persist locally. No passwords, tokens or sensitive records in browser storage.

## Data honesty

- **No seeded, fabricated, hardcoded or mock business records.** No demo farmer/buyer accounts, no demo listings, no fake prices, ratings or analytics.
- The marketplace renders **zero listings** when no real data source is configured — never example products or sample listings.
- Search, filtering and sorting operate only on genuine API response data.
- Empty results show an honest empty state; API failures show an error state with Retry (never confused with a successful empty response).
- Cart/checkout/orders/inquiries preserve their UI and validation but do not claim successful persistence without a backend.

## Design system

| Token | Value | Use |
| --- | --- | --- |
| `primary` | `#2E7D32` Nature Green | CTAs, price, active pills, links |
| `primary-dark` | `#1B5E20` | hover states, deep banner |
| `secondary` | `#FFA000` Warm Amber | cart badge, hero CTA, low-stock, farmer ring |
| `farmer-primary` | `#17633D` Farmer Green | both dashboards only: CTAs, active nav |
| `farmer-*` | deep/ink/muted/line/page tokens | dashboard sidebar, cards, tables |

Typography: **Poppins** (display) + **Inter** (body) via Google Fonts. Glass effects use Tailwind's `backdrop-blur-xl/2xl`, `bg-white/60-75`, `border-white/40-60`. Motion respects `prefers-reduced-motion`; all interactive elements have visible focus rings; icon system is lucide-react (no emoji).

## Branding

- `frontend/public/images/logo.png` — official wordmark used in the navbar
- `frontend/public/images/icon.svg` — favicon mark
- All prices display in **Kenyan Shillings (KSh)** via `kes()` in `frontend/src/utils/format.js`

## Future backend integration

The frontend is structured to connect to a real backend later:

- **`services/apiClient.js`** — single fetch transport (`credentials: 'include'` for cookie-based sessions). Base URL is env-driven via `VITE_API_BASE_URL` (defaults to same-origin).
- **Feature services** under `features/*/services/` (auth, marketplace, farmer, buyer, orders, inquiries) wrap `call()` per endpoint.
- **`services/ai.js`** — honest AI adapter returning `AI_SERVICE_NOT_CONFIGURED` until a real AI endpoint exists.
- **Expected backend contract** — documented in `docs/FUTURE_BACKEND_API_CONTRACT.md`: auth (signup/login/logout/me), marketplace listings, farmer listings CRUD + uploads, buyer saved/requests, orders, inquiries.

Set `VITE_API_BASE_URL` to point the frontend at a separate API origin when a backend is available; no code changes needed.

## Removed backend & seed data

The Express server, Mongoose models, route handlers, middleware, seed scripts and demo data were removed from the active frontend delivery and archived at `backend-archived/`. See `docs/REMOVED_BACKEND_AND_SEED_DATA.md` for the inventory. No remote database was touched or deleted.

## Testing

```bash
npm run test:client   # vitest/jsdom unit tests (no backend or database required)
npm run build         # production Vite build
```

Frontend tests mock `fetch` and run entirely in jsdom — no MongoDB, no Express process.

## Dev-tooling note

After changing `tailwind.config.js` (e.g. the farmer palette), a full Vite restart is required — HMR does not rescan the JIT for new theme colors.