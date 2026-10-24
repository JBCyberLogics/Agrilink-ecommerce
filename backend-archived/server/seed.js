/**
 * Seed scripts — disabled (AGRILINK-MARKETPLACE-DATA-CLEANUP-005).
 *
 * All seeded/demo data has been removed. The marketplace starts with zero
 * listings: no demo farmers, no demo listings, no demo buyer. Genuine
 * farmers create real listings through POST /api/farmer/listings and those
 * appear in the buyer marketplace via GET /api/market/listings.
 *
 * These functions are retained as no-ops so that server/index.js imports
 * remain valid; they create no data.
 *
 * DEMO_CATALOG (server/demoCatalog.js) is empty, so even if these functions
 * were re-enabled they would insert nothing.
 */

export async function seedDemoUser() {
  /* no-op: no demo user is seeded */
}

export async function seedDemoFarmers() {
  /* no-op: no demo farmers are seeded */
}

export async function seedDemoListings() {
  /* no-op: no demo listings are seeded (DEMO_CATALOG is empty) */
}

export async function seedDemoBuyer() {
  /* no-op: no demo buyer is seeded */
}
