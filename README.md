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
| `/?demo=buyer` | Silently signs in as the seeded demo buyer (`wanjiku@agrilink.co.ke` / `demo1234`) → lands on `#/buyer/dashboard` |
| — Demo farmers | `demo@agrilink.co.ke` · `amina@agrilink.co.ke` · `grace@agrilink.co.ke` · `kwame@agrilink.co.ke` · `njoki@agrilink.co.ke` — all password `demo1234`. They exist purely as exhibitors for the seeded marketplace catalogue; real (non-demo) farmers start empty |
| — Demo buyer | `wanjiku@agrilink.co.ke` / `demo1234` — "Wanjiku Kamau", seeded with two real saved listings and one pending purchase request so the buyer showcase opens with genuine data; real (non-demo) buyers start empty |
| `#shop` | Buyer marketplace |
| `#/farmer/{dashboard,market-intelligence,produce,inquiries,orders,profile,settings}` | Farmer dashboard pages (`#farmer` still redirects to the dashboard for compatibility) |
| `#/buyer/{dashboard,produce,price-comparison,requests,saved,orders,profile,settings}` | Buyer dashboard pages (`#buyer` still redirects to the dashboard for compatibility) |

## Pages & role routing

- Successful **login or signup routes by the account's DB role**: Buyers land on the **shop page** (`#shop`), farmers straight into the **Farmer Dashboard** (`#/farmer/dashboard`) — synced to the URL hash so refresh and browser back/forward keep the right page. Session restores never steal a deep link: sitting on `#/farmer/*` or `#/buyer/*` while restoring keeps that page (a login *requested* from a role gate still returns to that exact page via the saved return path).
- **Strict role gate (server-enforced):** a Buyer account can't enter via the Farmer card and vice versa — `POST /api/auth/login` returns `403 { error, field: 'role', accountRole }`, the modal shows the exact reason under the role cards and pre-selects the account's true role so you just hit Sign In again.
- **Farmer pages are also gated server-side:** every `/api/farmer/*` endpoint rejects anonymous users with `401` and buyers with `403 { code: 'FARMER_ONLY' }`. The UI mirrors it: visitors get the sign-in gate (return path preserved), buyers get a "Create a farmer account" upsell — there is no client-only bypass.
- **Buyer pages are the mirror image:** every `/api/buyer/*` endpoint rejects anonymous users with `401` and farmers with `403 { code: 'BUYER_ONLY' }`. Visitors get a sign-in gate that remembers the buyer route; farmers get a "You're signed in as a farmer" panel whose CTA routes them back to their own dashboard. The role always comes from the verified session — never from a URL parameter or form selection.

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
- **Buyer dashboard (real data, spec AGRILINK-FE-BUYER-001)** — sidebar shell in the same dashboard design system with eight destinations, entered via the navbar **Buyer Hub** button:
  - **Overview** — honest stat cards (Available Produce = real public feed count, My Requests / Saved Produce = real record counts, Active Orders = `—` until an order backend exists), a **Find Produce** form whose filters jump straight into a pre-filtered Browse, a transparent "Produce You May Need" section (rule printed on screen: active listings in the categories across the buyer's saved items + requests — no AI claims), real Recently Listed rows and real purchase-request activity.
  - **Browse Produce** — the live public feed with search / category / county / min-max price / min-quantity filters and price & quantity sorting (only over genuine listing fields), "X of Y listings" counts computed from actual results, 12-per-page pagination, save-to-account hearts, photo-less listings as category placeholders, sold-out rows that cannot be requested, "Request" opening an accessible dialog (quantity, optional KSh counter-offer, note) whose success shows only after the backend's 201.
  - **Price Comparison** — real multi-offer groups (produces listed by more than one farmer): seller-table sorted cheapest-first with the lowest price marked "Lowest listed price", same-name-same-unit grouping only (mixed units render as separate sections, never converted), single-offer produce gets an explicit "nothing to compare yet" note, and a fixed disclaimer that these are individual sellers' listing prices — **not official market averages**, no invented savings.
  - **Purchase Requests** — the buyer's real records: listing facts, quantity/unit, optional offer, note, backend status chip (Pending/Accepted/Declined, text-carried) and submit date; pending requests can be withdrawn with a two-step confirm; deleted listings degrade gracefully ("Listing no longer available") while keeping the record.
  - **Saved Produce** — real account-level bookmarks (`/api/buyer/saved`), not browser storage; unsave round-trips to the server; farmer-deleted listings are pruned server-side so no ghosts render.
  - **Orders & History / Settings** — intentional "no checkout/order backend yet" placeholders documenting the future contract; nothing simulated. **Buyer Profile** — the server-verified session + real saved/request counters; editing labelled as a later stage.
- **Data honesty policy** — **no part of the app is backed by mock product data anymore.** The farmer dashboard reads `/api/farmer/*` and the buyer marketplace reads `/api/market/listings` — every card on the shop is a real MongoDB listing (including the main demo farmer's rows, the exhibitor accounts' showcase rows, and any real user's own posts, like account `muchiribithon@gmail.com`'s "Rabbits" listing). Market prices/inquiries/sales don't exist yet and are shown as explicitly "not available" rather than simulated. Cards carry only factual fields — no fabricated ratings, reviews or marketing badges; stock chips ("Low stock" / "Sold out") come from the real stock number, and listings without a photo show a category-icon placeholder instead of a borrowed stock photo.

## Backend (`server/`)

| Route | Purpose |
| --- | --- |
| `POST /api/auth/signup` | Validates, bcrypt-hashes the password, inserts into MongoDB `users`, sets the session cookie (409 on duplicate email) |
| `POST /api/auth/login` | Finds by email, compares hashes, sets the session cookie (401 on any mismatch) |
| `POST /api/auth/logout` | Clears the session cookie |
| `GET /api/auth/me` | Returns `{ name, email, role }` from the JWT cookie; anonymous → `{ user: null }` |
| `GET /api/farmer/profile` | Server-verified session for farmer pages (401 anon, 403 buyer) |
| `GET /api/buyer/profile` | Server-verified account for buyer pages (401 anon, 403 farmer `BUYER_ONLY`) |
| `GET /api/buyer/saved` | The signed-in buyer's saved listings (populated with farmer names); farmer-deleted references are auto-pruned |
| `POST /api/buyer/saved/:listingId` | Bookmarks a real listing onto the buyer's account — `$addToSet`, duplicates impossible (201) |
| `DELETE /api/buyer/saved/:listingId` | Removes a bookmark (200) |
| `GET /api/buyer/requests` | The buyer's purchase requests, newest first, listing + farmer joined; listing-less records return with `listing: null` (real history preserved) |
| `POST /api/buyer/requests` | Creates a purchase request for a REAL active listing: validates quantity > 0 and ≤ stock, optional KSh counter-offer ≥ 1, optional note ≤ 400 chars; returns 201 with the joined request |
| `DELETE /api/buyer/requests/:id` | Withdraws the buyer's OWN pending request (foreign/missing → 404, non-pending → 409) |
| `GET /api/market/listings` | **Public** shop feed: ACTIVE listings of every farmer, newest first, farmer name joined from the DB — this is what buyers see, so what farmers post is what the marketplace sells |
| `GET /api/farmer/listings` | The signed-in farmer's own listings, newest first |
| `POST /api/farmer/listings` | Creates a listing (name, category, price KES ≥ 1, unit, stock, optional `imageUrl` that must point at a stored `/uploads/` file); field-level 400 errors |
| `DELETE /api/farmer/listings/:id` | Deletes **own** listing only (foreign/missing ids → 404); its uploaded photo file is removed too |
| `POST /api/farmer/uploads` | Farmer-only multipart photo upload (multer): JPEG/PNG/WebP ≤ 5 MB, random filename, returns `{ url }` under `/uploads/`; the file is served publicly (CDN-style) but only creatable by farmers |
| `GET /api/health` | Liveness check |

- `server/db.js` — Mongoose connection; the Atlas `mongodb+srv://` URI is stored as its **seedlist equivalent** in `server/.env` (Node's c-ares resolver misreads SRV records behind some DNS setups)
- `server/middleware/auth.js` — shared `requireAuth` (JWT cookie → live user document) used by both role routers; a request's role can only ever come from the database
- `server/models/User.js` — unique lowercase email index, `role: 'Buyer' | 'Farmer'`, `savedListings: [Listing._id]` (buyer wish list, kept duplicate-free by `$addToSet`), `comparePassword()` helper; plaintext passwords are never persisted (bcrypt, 10 rounds, verified `$2b$10$…`)
- `server/models/Listing.js` — farmer listing schema: name, category enum, price (KES, min 1), unit, stock, status, `imageUrl` (stored `/uploads/` file or a seeded cover); `farmerId` ownership
- `server/routes/buyer.js` — the buyer router: `requireAuth` + `buyerOnly` gate on every route, following the farmer router's conventions (401 anonymous · 403 farmers with `code: 'BUYER_ONLY'`)
- `server/index.js` — Express 5 on port 4000, cookie-parser, mounts `/api/auth` + `/api/farmer` + static `/uploads` (farmer product photos, 7-day cache); in production (and whenever `dist/` exists) it also serves the built frontend so the whole app deploys as one process
- `server/seed.js` — at boot: the demo buyer (`wanjiku@…`, with two real saved listings + one pending purchase request), the five demo farmer accounts, and the whole showcase catalogue (`demoCatalog.js` — 23 listings across the exhibitors, including two-farmer groups for price comparison and three photo-less "second offers"); all idempotent (keyed by farmer + product name / account email) and **seeding only happens for the predetermined demo accounts** — freshly created farmer or buyer accounts start completely empty

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

## Buyer dashboard structure

```
src/components/buyer/
├── BuyerShell.jsx            # sidebar + mobile drawer + access gates (visitor/farmer)
└── parts/
    ├── EmptyState.jsx        # re-export of the farmer parts (one design system)
    ├── ConfirmDelete.jsx     # two-step withdraw confirm
    ├── StatusChip.jsx        # Pending/Accepted/Declined — text-carried, never color-only
    ├── ProduceCard.jsx       # real listing card: save heart, Request action, honest stock text
    ├── RequestDialog.jsx     # accessible request form; server-mapped field errors
    └── useBuyerData.js       # loading/error/data hooks over the market feed + buyer APIs
└── pages/
    ├── Overview.jsx          # real counters, Find Produce jump, transparent recommendations
    ├── Browse.jsx            # feed search/filter/sort/pagination + save + request flow
    ├── PriceCompare.jsx      # real multi-offer tables, cheapest marked, units kept
    ├── Requests.jsx          # real records, withdraw pending, graceful deleted-listing state
    ├── Saved.jsx             # account-level bookmarks round-tripping the server
    ├── Orders.jsx            # honest "no order backend yet" placeholder
    ├── Profile.jsx           # server-verified session + real counters
    └── Settings.jsx          # honest placeholder (reuses NotYet)
```

## Structure

```
server/
├── index.js                   # Express entry: /api routes + static dist/ when built
├── db.js                      # Mongoose connect (seedlist Atlas URI)
├── seed.js                    # demo farmers + showcase listings + demo buyer (idempotent)
├── demoCatalog.js             # the showcase catalogue (real rows seeded at boot) + demo farmer accounts
├── .env / .env.example        # MONGODB_URI, JWT_SECRET, PORT, demo creds (env gitignored)
├── models/User.js             # unique email, bcrypt hash, role enum, savedListings
├── models/Listing.js          # produce listings (KES price, category/unit enums, photo, county)
├── models/PurchaseRequest.js  # buyer offers: quantity/unit, optional price, note, status enum
├── middleware/auth.js         # shared session gate (JWT cookie → live user)
└── routes/{auth,farmer,market,buyer}.js  # auth / farmer CRUD + uploads / public feed / buyer-only API

src/
├── main.jsx                  # entry
├── index.css                 # Tailwind layers + focus-ring + scrollbar utilities
├── App.jsx                   # hash router (shop + farmer/* + buyer/*), auth/cart state, cookie session
├── utils/format.js           # currency + date helpers (Kenyan Shillings, Kenyan English)
├── utils/api.js              # fetch wrapper for /api (same-origin via Vite proxy)
├── data/mockData.js          # IMAGES + category filter defs (legacy helpers; the feed itself is API-driven)
└── components/
    ├── Navbar.jsx            # brand, search, cart (glass dropdown), auth area, mobile menu
    ├── AuthModal.jsx         # glassmorphic login/signup dialog, confirm-password, role selector
    ├── Hero.jsx              # farm-to-table banner with floating glass cards
    ├── Marketplace.jsx       # live API feed + category pills + product grid + empty state
    ├── CategoryFilter.jsx
    ├── ProductCard.jsx
    ├── Footer.jsx
    ├── ui/Field.jsx          # shared labeled input with leading icon + error slot
    ├── farmer/…              # FarmerShell + dashboard pages (see section above)
    └── buyer/…               # BuyerShell + dashboard pages (see section above)
```

## Design system

| Token | Value | Use |
| --- | --- | --- |
| `primary` | `#2E7D32` Nature Green | CTAs, price, active pills, links |
| `primary-dark` | `#1B5E20` | hover states, deep banner |
| `secondary` | `#FFA000` Warm Amber | cart badge, hero CTA, low-stock, farmer ring |
| `farmer-primary` | `#17633D` Farmer Green | both dashboards only: CTAs, active nav — the buyer spec (AGRILINK-FE-BUYER-001) lists these exact values as its design tokens, so one shared dashboard palette serves both shells |
| `farmer-*` | deep/ink/muted/line/page tokens | dashboard sidebar, cards, tables (scoped — the marketplace keeps its own palette) |
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
| `cdp-buyer.mjs` | **buyer dashboard E2E: visitor stopped at the buyer gate → sign-in returns to the hub; overview real counters (feed 23 / requests 1 / saved 2) + honest "—" Active Orders; Find Produce → pre-filtered Browse with the exact count line; search/category/price/sort filters verified against the API's own numbers; save → reload persistence → re-save round trip; purchase request → Pending record after real 201 → two-step withdraw; price comparison multi-offer group (lowest price marked, units kept, "not official averages" disclaimer); honest orders/settings placeholders + server-verified profile; farmer blocked from buyer pages via the hub link (URL stays put); 390px drawer, no overflow; zero console errors/exceptions** | 39/39 |
| `cdp-market.mjs` | **the core loop: farmer posts (with photo) → card appears on the public marketplace instantly → delete removes it**; real feed for visitors (farmer names, KSh pricing, no fabricated ratings), search narrowing, real-card add-to-cart, user-posted rows rendering | 12/12 |
| `cdp-search.mjs` / `cdp-cart.mjs` | shop feed filtering/empty state (23 real rows — mango narrows to its single match); cart count, dropdown basket, subtotal math (KSh 30,085) — all against the live API feed | verified |
| curl API probes | farmer API: 401 anon · 403 buyer (`FARMER_ONLY`) · 201 create · 400 field errors · 404 foreign/missing · ownership-enforced delete · uploads: 201 farmer / 401 anon / 403 buyer / 400 wrong-type / 400 >5 MB / bogus `imageUrl` rejected / delete removes the stored file. **buyer API: 401 anon · 403 farmer (`BUYER_ONLY`) · save/unsave round trip (duplicate `$addToSet` → still 1) · request create 201 with joined listing + farmer · quantity>stock / qty 0 / offer<1 → field-mapped 400s · requests scoped to the owner · cancel pending 200 then 404 · bogus/deleted listing ids rejected · seeded demo buyer sees 2 saved + 1 pending** · `GET /api/market/listings` public 200 with farmer-joined rows | verified |
| `npm run build` | production build + Express serving `dist/` on one port (smoke-tested in headless Chrome) | passing |

**Dev-tooling note:** after changing `tailwind.config.js` (like the farmer palette), a **full Vite restart** is required — HMR / "page reload of the config" does not rescan the JIT for new theme colors, which silently renders new palette classes transparent (the "Post produce" button was white-on-white until the dev server was restarted).
