/**
 * Demo catalog — intentionally EMPTY (AGRILINK-MARKETPLACE-DATA-CLEANUP-005).
 *
 * All hardcoded/fabricated produce listings and seeded user accounts have
 * been removed from this file. The marketplace must display no listings
 * when no legitimate farmer-created records exist in MongoDB.
 *
 * seedDemoListings() (server/seed.js) iterates DEMO_CATALOG, so an empty
 * catalog means no demo listings are inserted on API boot.
 * seedDemoFarmers() iterates DEMO_FARMERS, so an empty array means no demo
 * farmer accounts are created on API boot.
 *
 * Newly-registered farmers start with an empty store and list real produce
 * through POST /api/farmer/listings. Those genuine listings flow to the
 * buyer marketplace via GET /api/market/listings.
 */

/* No seeded farmer accounts — empty by design. */
export const DEMO_FARMERS = []

/* Catalog key retained for reference only; no catalog data is seeded. */
export const DEMO_LANDLORD_EMAIL = 'demo'

/* No hardcoded produce listings — empty by design. */
export const DEMO_CATALOG = {}
