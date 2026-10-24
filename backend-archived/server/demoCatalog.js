/**
 * The demo catalog — REAL listings seeded into MongoDB so the public
 * marketplace is backed by genuine database rows while still looking like a
 * full market. Every row is created through the seed at boot (idempotent,
 * keyed by farmer + product name), never fabricated at request time.
 *
 * The extra farmer accounts exist purely as exhibitors for this showcase;
 * newly-registered (non-demo) farmers still start with an empty store.
 *
 * Multi-offer produce: Joseph's sukuma, Amina's maize and Njoki's potatoes
 * duplicate produce other exhibitors already sell, at their own prices —
 * that is what gives the buyer's Price Comparison page real groups of two.
 * The second offers intentionally carry NO photo: not every farmer
 * uploads one, and the buyer UI renders an honest category placeholder.
 */
const unsplash = (id, w = 800, h = 600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`

/* Demo farmer accounts (password: process.env.DEMO_PASSWORD || 'demo1234') */
export const DEMO_FARMERS = [
  { name: 'Amina Wanjiru', email: 'amina@agrilink.co.ke', location: 'Nakuru' },
  { name: 'Grace Njeri', email: 'grace@agrilink.co.ke', location: 'Nyeri' },
  { name: 'Kwame Mutiso', email: 'kwame@agrilink.co.ke', location: 'Baringo' },
  { name: 'Njoki Mwangi', email: 'njoki@agrilink.co.ke', location: 'Mwea' },
]

/* additional listings for the primary demo farmer (demo@agrilink.co.ke) —
   Meru-based produce beyond his two starter rows */
export const DEMO_LANDLORD_EMAIL = 'demo' // catalog key for the primary demo farmer

export const DEMO_CATALOG = {
  demo: [
    { name: 'Kienyeji Chicken', category: 'Livestock', price: 1200, unit: 'bird', stock: 64, imageUrl: 'https://live.staticflickr.com/2523/3845505147_765bcbc099_b.jpg' },
    { name: 'Sweet Bananas', category: 'Fruits & Veg', price: 300, unit: 'bunch', stock: 310, imageUrl: unsplash('photo-1528825871115-3581a5387919') },
    { name: 'Field Fresh Cabbage', category: 'Fruits & Veg', price: 55, unit: 'head', stock: 560, imageUrl: 'https://live.staticflickr.com/75/190618763_703fc86034_b.jpg' },
    /* second offer — pairs with Grace's sukuma for price comparison */
    { name: 'Sukuma Wiki (Collard Greens)', category: 'Fruits & Veg', price: 65, unit: 'kg', stock: 300, imageUrl: '' },
  ],
  'amina@agrilink.co.ke': [
    { name: 'Free-Range Eggs', category: 'Livestock', price: 450, unit: 'tray', stock: 85, imageUrl: unsplash('photo-1506976785307-8732e854ad03') },
    { name: 'Ripe Mangoes', category: 'Fruits & Veg', price: 80, unit: 'kg', stock: 720, imageUrl: unsplash('photo-1553279768-865429fa0078') },
    { name: 'Fresh Dairy Milk', category: 'Livestock', price: 80, unit: 'litre', stock: 900, imageUrl: unsplash('photo-1550583724-b2692b85b150', 800, 500) },
    { name: 'Green Beans', category: 'Fruits & Veg', price: 220, unit: 'kg', stock: 150, imageUrl: unsplash('photo-1515543904379-3d757afe72e4') },
    /* second offer — pairs with Joseph's maize for price comparison */
    { name: 'Green Maize', category: 'Grains', price: 55, unit: 'cob', stock: 800, imageUrl: '' },
  ],
  'grace@agrilink.co.ke': [
    { name: 'Baby Spinach', category: 'Fruits & Veg', price: 120, unit: 'kg', stock: 260, imageUrl: unsplash('photo-1574316071802-0d684efa7bf5') },
    { name: 'Red Potatoes', category: 'Grains', price: 70, unit: 'kg', stock: 2000, imageUrl: unsplash('photo-1518977676601-b53f82aba655') },
    { name: 'Hass Avocados', category: 'Fruits & Veg', price: 95, unit: 'kg', stock: 640, imageUrl: unsplash('photo-1519162808019-7de1683fa2ad') },
    { name: 'Red Kidney Beans', category: 'Grains', price: 240, unit: 'kg', stock: 800, imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/Kidney_beans.jpg/960px-Kidney_beans.jpg' },
    { name: 'Sukuma Wiki (Collard Greens)', category: 'Fruits & Veg', price: 50, unit: 'kg', stock: 420, imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5e/Sukuma_wiki_Farm_to_plate_2025.jpg/960px-Sukuma_wiki_Farm_to_plate_2025.jpg' },
  ],
  'kwame@agrilink.co.ke': [
    { name: 'Raw Wildflower Honey', category: 'Grains', price: 1200, unit: 'jar', stock: 140, imageUrl: 'https://live.staticflickr.com/65535/51330849013_2fc392fd42_b.jpg' },
    { name: 'Wholewheat Loaves', category: 'Grains', price: 180, unit: 'loaf', stock: 180, imageUrl: unsplash('photo-1509440159596-0249088772ff') },
    { name: 'Boer Goats', category: 'Livestock', price: 15000, unit: 'head', stock: 28, imageUrl: 'https://live.staticflickr.com/65535/52500798717_f456a7fb6a_b.jpg' },
    { name: 'Bell Peppers', category: 'Fruits & Veg', price: 400, unit: 'kg', stock: 95, imageUrl: unsplash('photo-1563565375-f3fdfdbefa83') },
  ],
  'njoki@agrilink.co.ke': [
    { name: 'Mwea Pishori Rice', category: 'Grains', price: 320, unit: 'kg', stock: 1100, imageUrl: unsplash('photo-1536304993881-ff6e9eefa2a6') },
    /* second offer — pairs with Grace's potatoes for price comparison */
    { name: 'Red Potatoes', category: 'Grains', price: 85, unit: 'kg', stock: 1500, imageUrl: '' },
  ],
}
