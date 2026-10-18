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
 * The photos are the subject-verified category covers used across the
 * marketplace. Regular farmer accounts start empty and see honest empty
 * states.
 */
export async function seedDemoListings() {
  const email = (process.env.DEMO_EMAIL || 'demo@agrilink.co.ke').toLowerCase()
  const demo = await User.findOne({ email })
  if (!demo) return

  /* photos arrived later than the first seed — backfill the demo listings'
     image from the verified covers, but never create duplicates */
  if (await Listing.findOne({ farmerId: demo._id })) {
    const cover = {
      'Green Maize': 'https://live.staticflickr.com/4115/4776897224_c9c4e47bc9_b.jpg',
      'Sun-Ripened Tomatoes':
        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&h=300&q=80',
    }
    for (const doc of await Listing.find({ farmerId: demo._id })) {
      if (!doc.imageUrl && cover[doc.name]) {
        doc.imageUrl = cover[doc.name]
        await doc.save()
      }
    }
    return
  }

  await Listing.create([
    {
      farmerId: demo._id,
      name: 'Green Maize',
      category: 'Grains',
      price: 40,
      unit: 'cob',
      stock: 1200,
      imageUrl: 'https://live.staticflickr.com/4115/4776897224_c9c4e47bc9_b.jpg',
    },
    {
      farmerId: demo._id,
      name: 'Sun-Ripened Tomatoes',
      category: 'Fruits & Veg',
      price: 130,
      unit: 'kg',
      stock: 36,
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&h=300&q=80',
    },
  ])
  console.log('✓ Seeded demo listings for the demo farmer account')
}
