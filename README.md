# Agrilink — Farm-Fresh Marketplace

A full-stack agricultural e-commerce marketplace that directly connects farmers (sellers) and buyers. **React 18 + Vite + Tailwind CSS 3.4** on the front, **Express + Mongoose + MongoDB Atlas** behind `/api`, JWT-cookie sessions with bcrypt-hashed passwords.

## Quickstart

```bash
npm install
npm run dev:api    # terminal 1 — http://localhost:4000 (Express + MongoDB)
npm run dev        # terminal 2 — http://localhost:5199 (Vite proxies /api → 4000)
npm run build      # production build -> dist/ (served by the same Express app)
```

The API reads `server/.env` — copy `server/.env.example` and fill in your MongoDB URI + JWT secret. On first boot it seeds a demo farmer (`demo@agrilink.co.ke` / `demo1234`).

## Demo shortcuts

| URL | What it shows |
| --- | --- |
| `/?auth=1` | Opens the glassmorphism auth modal on load |
| `/?demo=farmer` | Silently signs in as the seeded demo farmer (`demo@agrilink.co.ke` / `demo1234`) → lands on `#/farmer/dashboard` |
| — Demo farmers | `demo@agrilink.co.ke` · `amina@agrilink.co.ke` · `grace@agrilink.co.ke` · `kwame@agrilink.co.ke` · `njoki@agrilink.co.ke` — all password `demo1234`. They exist purely as exhibitors for the seeded marketplace catalogue; real (non-demo) farmers start empty |
| `#shop` | Buyer marketplace |
| `#/farmer/{dashboard,market-intelligence,produce,inquiries,orders,profile,settings}` | Farmer dashboard pages (`#farmer` still redirects to the dashboard for compatibility) |

## Pages & role routing

- Successful **login or signup routes by the account's DB role**: Buyers land on the **shop page** (`#shop`), farmers straight into the **Farmer Dashboard** (`#/farmer/dashboard`) — synced to the URL hash so refresh and browser back/forward keep the right page.
- **Strict role gate (server-enforced):** a Buyer account can't enter via the Farmer card and vice versa — `POST /api/auth/login` returns `403 { error, field: 'role', accountRole }`, the modal shows the exact reason under the role cards and pre-selects the account's true role so you just hit Sign In again.
- **Farmer pages are also gated server-side:** every `/api/farmer/*` endpoint rejects anonymous users with `401` and buyers with `403 { code: 'FARMER_ONLY' }`. The UI mirrors it: visitors get the sign-in gate (return path preserved), buyers get a "Create a farmer account" upsell — there is no client-only bypass.

## Features

- **Global navbar** — leaf/brand mark, wide live search (filters the feed), Marketplace & Farmer Panel links, cart icon with animated floating count badge + glass dropdown basket (qty steppers, subtotal), Sign In button that becomes a user chip (initials avatar, role badge, sign out → clears the JWT cookie) after auth.
- **Glassmorphism auth modal** — frosted card (`bg-white/65`, `backdrop-blur-2xl`, `border-white/50`, inset ring highlight) over a blurred dark scrim with brand glows; animated Login/Sign Up tabs; Name (signup only) / Email / Password / **Confirm password** (signup only, with independent show-hide toggles) with blur-free inline validation; crucial **Buyer vs Farmer role selector** as custom radio cards. Submits hit the real API: `409` duplicate email lands inline under the email field, bad credentials surface in a red alert strip, the submit button shows a spinner during the round-trip.
- **Farmer dashboard (real data)** — sidebar shell (sticky, mobile drawer) in the farmer palette with seven destinations:
  - **Overview** — honest stat cards (Active Listings = real DB count; Market Prices / Inquiries / Sales render `—` with an explanation until their data source exists), price/insight sections and recent activity built only from genuine listing events.
  - **Market Intelligence** — intentional "not configured" state that documents the future contract (`GET /api/market/prices`), no fake numbers or dead filters.
  - **My Produce** — live CRUD against MongoDB: seeded or new listings (name, category, price/unit, stock **and a product photo**), validation errors mapped to fields from the API, mobile-friendly rows, labels like "Low stock" (never color-only), two-step confirm delete with optimistic removal. Photos are uploaded to the API (`POST /api/farmer/uploads`, 5 MB cap, JPEG/PNG/WebP, stored under `server/uploads/` and served from `/uploads`), previewed instantly with a "Remove photo" action, rendered as thumbnails on every listing row, and deleted from disk when their listing is deleted.
  - **Buyer Inquiries / Orders & Sales / Settings** — honest "not yet available" placeholders (no fabricated counts or toggles).
  - **Farm Profile** — the server-verified session (name, email, role, member since); profile editing is labelled as a later stage.
- **Buyer marketplace — real DB feed** — hero banner with floating glass stat cards, then a **live feed of what farmers actually post** (`GET /api/market/listings`, fetched fresh every time the shop mounts, so a listing saved moments ago is already on the shelf). Category filter pills (All / Grains / Fruits & Veg / Livestock with live counts from the feed) + navbar search across name/farmer/county, responsive product card grid (1→2→3→4 columns): photo (or honest category-icon placeholder), name, `KSh 130 / kg` pricing, real farmer + county chip, stock reality as text ("Low stock", "28 head left", "Sold out"), "Add to Cart" with confirm state, plus dedicated loading skeleton, unreachable-API retry state and empty-market state. Cart honours the listing's real stock (also in client-side quantity clamping).
- **Data honesty policy** — **no part of the app is backed by mock product data anymore.** The farmer dashboard reads `/api/farmer/*` and the buyer marketplace reads `/api/market/listings` — every card on the shop is a real MongoDB listing (including the main demo farmer's rows, the exhibitor accounts' showcase rows, and any real user's own posts, like account `muchiribithon@gmail.com`'s "Rabbits" listing). Market prices/inquiries/sales don't exist yet and are shown as explicitly "not available" rather than simulated. Cards carry only factual fields — no fabricated ratings, reviews or marketing badges; stock chips ("Low stock" / "Sold out") come from the real stock number, and listings without a photo show a category-icon placeholder instead of a borrowed stock photo.

## Backend (`server/`)

| Route | Purpose |
| --- | --- |
| `POST /api/auth/signup` | Validates, bcrypt-hashes the password, inserts into MongoDB `users`, sets the session cookie (409 on duplicate email) |
| `POST /api/auth/login` | Finds by email, compares hashes, sets the session cookie (401 on any mismatch) |
| `POST /api/auth/logout` | Clears the session cookie |
| `GET /api/auth/me` | Returns `{ name, email, role }` from the JWT cookie; anonymous → `{ user: null }` |
| `GET /api/farmer/profile` | Server-verified session for farmer pages (401 anon, 403 buyer) |
| `GET /api/market/listings` | **Public** shop feed: ACTIVE listings of every farmer, newest first, farmer name joined from the DB — this is what buyers see, so what farmers post is what the marketplace sells |
| `GET /api/farmer/listings` | The signed-in farmer's own listings, newest first |
| `POST /api/farmer/listings` | Creates a listing (name, category, price KES ≥ 1, unit, stock, optional `imageUrl` that must point at a stored `/uploads/` file); field-level 400 errors |
| `DELETE /api/farmer/listings/:id` | Deletes **own** listing only (foreign/missing ids → 404); its uploaded photo file is removed too |
| `POST /api/farmer/uploads` | Farmer-only multipart photo upload (multer): JPEG/PNG/WebP ≤ 5 MB, random filename, returns `{ url }` under `/uploads/`; the file is served publicly (CDN-style) but only creatable by farmers |
| `GET /api/health` | Liveness check |

- `server/db.js` — Mongoose connection; the Atlas `mongodb+srv://` URI is stored as its **seedlist equivalent** in `server/.env` (Node's c-ares resolver misreads SRV records behind some DNS setups)
- `server/models/User.js` — unique lowercase email index, `role: 'Buyer' | 'Farmer'`, `comparePassword()` helper; plaintext passwords are never persisted (bcrypt, 10 rounds, verified `$2b$10$…`)
- `server/models/Listing.js` — farmer listing schema: name, category enum, price (KES, min 1), unit, stock, status, `imageUrl` (stored `/uploads/` file or a seeded cover); `farmerId` ownership
- `server/index.js` — Express 5 on port 4000, cookie-parser, mounts `/api/auth` + `/api/farmer` + static `/uploads` (farmer product photos, 7-day cache); in production (and whenever `dist/` exists) it also serves the built frontend so the whole app deploys as one process
- `server/seed.js` — upserts the demo farmer at boot **plus two demo listings only for the demo farmer account** (green maize, sun-ripened tomatoes — one intentionally low-stocked, both with verified photos); freshly created farmer accounts start with an empty listings list

## Farmer dashboard structure

```
src/components/farmer/
├── FarmerShell.jsx           # sidebar + mobile drawer + access gates (visitor/buyer)
└── parts/
    ├── EmptyState.jsx        # shared "not available yet" visual
    ├── StatCard.jsx          # honest value-or-"—" metric tile
    ├── PriceTable.jsx        # sortable table that only renders real rows
    ├── ConfirmDelete.jsx     # two-step destructive-action confirm
    └── useFarmerListings.js  # loading/error/data hook over GET ·POST·DELETE
└── pages/
    ├── Overview.jsx          # honest stats, empty intel sections, real activity
    ├── MarketIntelligence.jsx
    ├── MyProduce.jsx         # PostForm + listings rows (real CRUD)
    ├── FarmProfile.jsx
    └── NotYet.jsx            # inquiries / orders / settings placeholders
```

## Structure

```
server/
├── index.js                   # Express entry: /api routes + static dist/ when built
├── db.js                      # Mongoose connect (seedlist Atlas URI)
├── seed.js                    # demo farmer + demo listings upsert (idempotent)
├── demoCatalog.js             # the showcase catalogue (real rows seeded at boot) + demo farmer accounts
├── .env / .env.example        # MONGODB_URI, JWT_SECRET, PORT, demo creds (env gitignored)
├── models/User.js             # unique email, bcrypt hash, role enum
├── models/Listing.js          # produce listings (KES price, category/unit enums, photo, county)
└── routes/{auth,farmer,market}.js  # auth / farmer CRUD + photo uploads / public shop feed

src/
├── main.jsx                  # entry
├── index.css                 # Tailwind layers + focus-ring + scrollbar utilities
├── App.jsx                   # hash router (shop + farmer/*), auth/cart state, cookie session
├── utils/format.js           # currency + date helpers (Kenyan Shillings, Kenyan English)
├── utils/api.js              # fetch wrapper for /api (same-origin via Vite proxy)
├── data/mockData.js          # mock products for the buyer marketplace feed ONLY
└── components/
    ├── Navbar.jsx            # brand, search, cart (glass dropdown), auth area, mobile menu
    ├── AuthModal.jsx         # glassmorphic login/signup dialog, confirm-password, role selector
    ├── Hero.jsx              # farm-to-table banner with floating glass cards
    ├── Marketplace.jsx       # category pills + filtered product grid + empty state
    ├── CategoryFilter.jsx
    ├── ProductCard.jsx
    ├── Footer.jsx
    ├── ui/Field.jsx          # shared labeled input with leading icon + error slot
    └── farmer/…              # FarmerShell + dashboard pages (see section above)
```

## Design system

| Token | Value | Use |
| --- | --- | --- |
| `primary` | `#2E7D32` Nature Green | CTAs, price, active pills, links |
| `primary-dark` | `#1B5E20` | hover states, deep banner |
| `secondary` | `#FFA000` Warm Amber | cart badge, hero CTA, low-stock, farmer ring |
| `farmer-primary` | `#17633D` Farmer Green | farmer dashboard only: CTAs, active nav |
| `farmer-*` | deep/ink/muted/line/page tokens | farmer sidebar, cards, tables (scoped — the marketplace keeps its own palette) |
| Neutrals | Tailwind `neutral-*` + white | cards, text on white (`neutral-900/700/400`) |

Typography: **Poppins** (display) + **Inter** (body) via Google Fonts. Glass effects use Tailwind's standard `backdrop-blur-xl/2xl`, `bg-white/60-75`, `border-white/40-60`. Motion respects `prefers-reduced-motion` (`motion-safe:` variants); all interactive elements have visible focus rings; icon system is lucide-react (no emoji).

Product photography: Unsplash CDN, Flickr (CC) and Wikimedia Commons — subject-verified to match every listing.

## Branding

- `public/images/logo.png` — official wordmark used in the navbar (square master, center-cropped via `object-cover` to render the logo band)
- `public/images/icon.svg` — mark used as the favicon
- All prices display in **Kenyan Shillings (KSh)** via a single `kes()` formatting helper (`src/utils/format.js`), with realistic market rates across every mock price.

## Verification (Chrome DevTools-Protocol E2E)

The repo is verified with headless-Chrome CDP suites (`/tmp/opencode/cdp-*.mjs`), driving the real dev server + real MongoDB:

| Suite | Coverage | Result |
| --- | --- | --- |
| `cdp-roles.mjs` | visitor/buyer/farmer routing, login-role 403 + auto-correct, refresh restore | 9/9 |
| `cdp-auth.mjs` | signup, inline validation (mismatch/duplicate/409), wrong password, cookie session restore, sign-out, demo farmer → real listings | 11/11 |
| `cdp-dashboard.mjs` | farmer gate + return path, honest empty states, no fabricated metrics, market-intelligence contract, profile, produce CRUD (post + two-step delete), **photo upload E2E: real browser file pick → multipart POST → instant preview → row thumbnail from `/uploads/` → picker reset**, deep-link refresh, 390px drawer + overflow, buyer block, zero console errors/exceptions | 34/34 |
| `cdp-market.mjs` | **the core loop: farmer posts (with photo) → card appears on the public marketplace instantly → delete removes it**; real feed for visitors (farmer names, KSh pricing, no fabricated ratings), search narrowing, real-card add-to-cart, user-posted rows rendering | 12/12 |
| `cdp-search.mjs` / `cdp-cart.mjs` | shop feed filtering/empty state (20 real rows); cart count, dropdown basket, subtotal math — all against the live API feed | verified |
| curl API probes | 401 anon · 403 buyer (`FARMER_ONLY`) · 201 create · 400 field errors · 404 foreign/missing · ownership-enforced delete · uploads: 201 farmer / 401 anon / 403 buyer / 400 wrong-type / 400 >5 MB / bogus `imageUrl` rejected / delete removes the stored file · `GET /api/market/listings` public 200 with farmer-joined rows | verified |
| `npm run build` | production build + Express serving `dist/` on one port (smoke-tested in headless Chrome) | passing |

**Dev-tooling note:** after changing `tailwind.config.js` (like the farmer palette), a **full Vite restart** is required — HMR / "page reload of the config" does not rescan the JIT for new theme colors, which silently renders new palette classes transparent (the "Post produce" button was white-on-white until the dev server was restarted).
