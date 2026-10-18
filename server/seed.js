/**
 * Seeds the demo farmer accounts so the /?demo=farmer showcase works out of
 * the box and the public marketplace has genuine exhibitors.
 * Runs on every API boot and is a no-op once each account exists.
 */
import bcrypt from 'bcryptjs'
import User from './models/User.js'
import Listing from './models/Listing.js'
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
