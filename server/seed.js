/**
 * Seeds the demo farmer accounts so the /?demo=farmer showcase works out of
 * the box and the public marketplace has genuine exhibitors.
 * Runs on every API boot and is a no-op once each account exists.
 */
import bcrypt from 'bcryptjs'
import User from './models/User.js'
import Listing from './models/Listing.js'
import PurchaseRequest from './models/PurchaseRequest.js'
import { DEMO_FARMERS, DEMO_CATALOG } from './demoCatalog.js'

const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'demo1234'

async function ensureFarmer(name, email) {
  const exists = await User.findOne({ email })
  if (exists) return
  await User.create({
    name,
    email,
    passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10),
    role: 'Farmer',
  })
  console.log(`✓ Seeded demo farmer → ${email} / ${DEMO_PASSWORD}`)
}

export async function seedDemoUser() {
  const email = (process.env.DEMO_EMAIL || 'demo@agrilink.co.ke').toLowerCase()
  await ensureFarmer('Joseph Kariuki', email)
}

/* Extra demo farmer accounts that host part of the showcase catalog. */
export async function seedDemoFarmers() {
  for (const f of DEMO_FARMERS) await ensureFarmer(f.name, f.email)
}


/**
 * Ensures the demo showcase catalogue is present in MongoDB: every demo
 * farmer gets their assigned catalog rows, never creating duplicates
 * (keyed by farmer + product name), and legacy rows get backfilled with
 * the county/region they belong to.
 * Regular (non-demo) farmer accounts are never touched here — they start
 * empty and see honest empty states.
 */
/* Ensures the demo showcase catalogue is present in MongoDB: every demo
   farmer gets their assigned catalog rows, never creating duplicates
   (keyed by farmer + product name), and legacy rows get backfilled with
   the county/region they belong to.
   Regular (non-demo) farmer accounts are never touched here — they start
   empty and see honest empty states. */
export async function seedDemoListings() {
  const primaryEmail = (process.env.DEMO_EMAIL || 'demo@agrilink.co.ke').toLowerCase()
  const buckets = [
    { email: primaryEmail, location: 'Meru', items: DEMO_CATALOG.demo },
    ...DEMO_FARMERS.map((f) => ({
      email: f.email,
      location: f.location,
      items: DEMO_CATALOG[f.email] ?? [],
    })),
  ]

  let created = 0
  for (const { email, location, items } of buckets) {
    const farmer = await User.findOne({ email })
    if (!farmer || !items?.length) continue

    for (const item of items) {
      if (await Listing.exists({ farmerId: farmer._id, name: item.name })) continue
      await Listing.create({ ...item, farmerId: farmer._id, location })
      created++
    }
  }

  /* backfill location on the two rows that were seeded before the
     field existed — they belong to the primary demo farmer in Meru.
     Legacy docs LACK the field entirely (≠ ''), so check both shapes. */
  const demo = await User.findOne({ email: primaryEmail })
  if (demo) {
    const unlocated = await Listing.find({
      farmerId: demo._id,
      $or: [{ location: '' }, { location: { $exists: false } }],
    })
    for (const doc of unlocated) {
      doc.location = 'Meru'
      await doc.save()
    }
  }

  if (created) console.log(`✓ Seeded demo marketplace catalogue (${created} real rows)`)
}

/**
 * Seeds the demo BUYER account ("Wanjiku Kamau") so the buyer dashboard
 * showcase has genuine data the first time you open it: two bookmarked
 * listings and one pending purchase request — all real database records
 * created through the real APIs' models (no fake UI state). Idempotent:
 * once the account exists, nothing is touched. Real buyers must sign up
 * normally and start with empty dashboards.
 */
export async function seedDemoBuyer() {
  const email = process.env.DEMO_BUYER_EMAIL || 'wanjiku@agrilink.co.ke'
  if (await User.findOne({ email })) return

  /* the demo buyer bookmarks two real listings and has one pending
     request for the primary demo farmer's Green Maize */
  const primaryEmail = (process.env.DEMO_EMAIL || 'demo@agrilink.co.ke').toLowerCase()
  const [graceFarmer, aminaFarmer, maize] = await Promise.all([
    User.findOne({ email: 'grace@agrilink.co.ke' }),
    User.findOne({ email: 'amina@agrilink.co.ke' }),
    (async () => {
      const demoFarmer = await User.findOne({ email: primaryEmail })
      return demoFarmer && Listing.findOne({ farmerId: demoFarmer._id, name: 'Green Maize' })
    })(),
  ])

  const [potatoRow, mangoRow] = await Promise.all([
    graceFarmer && Listing.findOne({ name: 'Red Potatoes', farmerId: graceFarmer._id }),
    aminaFarmer && Listing.findOne({ name: 'Ripe Mangoes', farmerId: aminaFarmer._id }),
  ])

  const buyer = await User.create({
    name: 'Wanjiku Kamau',
    email,
    passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10),
    role: 'Buyer',
    savedListings: [potatoRow?._id, mangoRow?._id].filter(Boolean).map(String),
  })

  if (maize) {
    await PurchaseRequest.create({
      buyerId: buyer._id,
      listingId: maize._id,
      quantity: 200,
      unit: maize.unit,
      note: 'Weekly supply for a restaurant in Thika.',
    })
  }

  console.log(`✓ Seeded demo buyer → ${email} / ${DEMO_PASSWORD}`)
}
