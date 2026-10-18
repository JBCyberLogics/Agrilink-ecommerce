/**
 * Seeds the demo farmer so the /?demo=farmer showcase works out of the box.
 * Runs on every API boot and is a no-op once the account exists.
 */
import bcrypt from 'bcryptjs'
import User from './models/User.js'
import Listing from './models/Listing.js'

export async function seedDemoUser() {
  const email = (process.env.DEMO_EMAIL || 'demo@agrilink.co.ke').toLowerCase()
  const password = process.env.DEMO_PASSWORD || 'demo1234'

  if (await User.findOne({ email })) return

  await User.create({
    name: 'Joseph Kariuki',
    email,
    passwordHash: await bcrypt.hash(password, 10),
    role: 'Farmer',
  })
  console.log(`✓ Seeded demo farmer → ${email} / ${password}`)
}

/**
 * Seeds a couple of REAL listings for the seeded demo farmer account only,
 * so the /?demo=farmer showcase has genuine database records to render.
 * Regular farmer accounts start empty and see honest empty states.
 */
export async function seedDemoListings() {
  const email = (process.env.DEMO_EMAIL || 'demo@agrilink.co.ke').toLowerCase()
  const demo = await User.findOne({ email })
  if (!demo || (await Listing.findOne({ farmerId: demo._id }))) return

  await Listing.create([
    { farmerId: demo._id, name: 'Green Maize', category: 'Grains', price: 40, unit: 'cob', stock: 1200 },
    { farmerId: demo._id, name: 'Sun-Ripened Tomatoes', category: 'Fruits & Veg', price: 130, unit: 'kg', stock: 36 },
  ])
  console.log('✓ Seeded demo listings for the demo farmer account')
}
