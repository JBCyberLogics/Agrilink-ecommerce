// Central image source — Unsplash CDN (verified live URLs).
const unsplash = (id, w = 800, h = 600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`

export const IMAGES = {
  heroCover: unsplash('photo-1625246333195-78d9c38ad449', 1600, 900),
  covers: {
    // subject-verified thumbnails used for freshly posted farmer listings
    Grains: 'https://live.staticflickr.com/4115/4776897224_c9c4e47bc9_b.jpg',
    'Fruits & Veg': unsplash('photo-1592924357228-91a4daadcfea', 1000, 700),
    Livestock: 'https://live.staticflickr.com/2523/3845505147_765bcbc099_b.jpg',
  },
}

// Category keys shared by products, filters and forms.
export const CATEGORIES = ['Grains', 'Fruits & Veg', 'Livestock']
export const CATEGORY_FILTERS = ['All', ...CATEGORIES]

// Mock marketplace products
export const PRODUCTS = [
  { id: 'P-001', name: 'Green Maize', category: 'Grains', price: 0.58, unit: 'cob', stock: 1200, stockLabel: '1,200 cobs', image: 'https://live.staticflickr.com/4115/4776897224_c9c4e47bc9_b.jpg', farmer: 'Farmer Joseph', location: 'Meru', rating: 4.8, reviews: 124, badge: 'Hot' },
  { id: 'P-002', name: 'Sun-Ripened Tomatoes', category: 'Fruits & Veg', price: 3.5, unit: 'kg', stock: 480, stockLabel: '480 kg', image: unsplash('photo-1592924357228-91a4daadcfea'), farmer: 'Farmer Joseph', location: 'Meru', rating: 4.9, reviews: 210, badge: 'Organic' },
  { id: 'P-003', name: 'Free-Range Eggs', category: 'Livestock', price: 3.2, unit: 'tray of 30', stock: 85, stockLabel: '85 trays', image: unsplash('photo-1506976785307-8732e854ad03'), farmer: 'Farmer Amina', location: 'Nakuru', rating: 4.7, reviews: 98, badge: 'Farm Fresh' },
  { id: 'P-004', name: 'Baby Spinach', category: 'Fruits & Veg', price: 2.25, unit: 'kg', stock: 260, stockLabel: '260 kg', image: unsplash('photo-1574316071802-0d684efa7bf5'), farmer: 'Farmer Grace', location: 'Nyeri', rating: 4.8, reviews: 64, badge: null },
  { id: 'P-005', name: 'Ripe Mangoes', category: 'Fruits & Veg', price: 1.8, unit: 'kg', stock: 720, stockLabel: '720 kg', image: unsplash('photo-1553279768-865429fa0078'), farmer: 'Farmer Amina', location: 'Nakuru', rating: 4.6, reviews: 143, badge: 'Seasonal' },
  { id: 'P-006', name: 'Raw Wildflower Honey', category: 'Grains', price: 12.0, unit: 'jar · 500g', stock: 140, stockLabel: '140 jars', image: 'https://live.staticflickr.com/65535/51330849013_2fc392fd42_b.jpg', farmer: 'Farmer Kwame', location: 'Baringo', rating: 5.0, reviews: 87, badge: 'Raw' },
  { id: 'P-007', name: 'Red Potatoes', category: 'Grains', price: 1.1, unit: 'kg', stock: 2000, stockLabel: '2,000 kg', image: unsplash('photo-1518977676601-b53f82aba655'), farmer: 'Farmer Grace', location: 'Nyeri', rating: 4.5, reviews: 230, badge: null },
  { id: 'P-008', name: 'Stone-Baked Wholewheat Loaves', category: 'Grains', price: 2.6, unit: 'loaf', stock: 180, stockLabel: '180 loaves', image: unsplash('photo-1509440159596-0249088772ff'), farmer: 'Farmer Kwame', location: 'Baringo', rating: 4.9, reviews: 77, badge: null },
  { id: 'P-009', name: 'Fresh Dairy Milk', category: 'Livestock', price: 1.35, unit: 'litre', stock: 900, stockLabel: '900 L', image: unsplash('photo-1550583724-b2692b85b150', 800, 500), farmer: 'Farmer Amina', location: 'Nakuru', rating: 4.8, reviews: 156, badge: 'Daily' },
  { id: 'P-010', name: 'Kienyeji Chicken', category: 'Livestock', price: 14.0, unit: 'bird', stock: 64, stockLabel: '64 birds', image: 'https://live.staticflickr.com/2523/3845505147_765bcbc099_b.jpg', farmer: 'Farmer Joseph', location: 'Meru', rating: 4.9, reviews: 92, badge: 'Free Range' },
  { id: 'P-011', name: 'Boer Goats', category: 'Livestock', price: 95.0, unit: 'head', stock: 28, stockLabel: '28 heads', image: 'https://live.staticflickr.com/65535/52500798717_f456a7fb6a_b.jpg', farmer: 'Farmer Kwame', location: 'Baringo', rating: 4.7, reviews: 41, badge: null },
  { id: 'P-012', name: 'Hass Avocados', category: 'Fruits & Veg', price: 2.1, unit: 'kg', stock: 640, stockLabel: '640 kg', image: unsplash('photo-1519162808019-7de1683fa2ad'), farmer: 'Farmer Grace', location: 'Nyeri', rating: 4.8, reviews: 188, badge: 'Export' },
  { id: 'P-013', name: 'Sweet Bananas', category: 'Fruits & Veg', price: 2.0, unit: 'bunch', stock: 310, stockLabel: '310 bunches', image: unsplash('photo-1528825871115-3581a5387919'), farmer: 'Farmer Joseph', location: 'Meru', rating: 4.7, reviews: 112, badge: null },
  { id: 'P-014', name: 'Green Beans', category: 'Fruits & Veg', price: 2.75, unit: 'kg', stock: 150, stockLabel: '150 kg', image: unsplash('photo-1515543904379-3d757afe72e4'), farmer: 'Farmer Amina', location: 'Nakuru', rating: 4.8, reviews: 132, badge: 'Organic' },
  { id: 'P-015', name: 'Bell Peppers', category: 'Fruits & Veg', price: 4.2, unit: 'kg', stock: 95, stockLabel: '95 kg', image: unsplash('photo-1563565375-f3fdfdbefa83'), farmer: 'Farmer Kwame', location: 'Baringo', rating: 4.6, reviews: 70, badge: 'New' },
  { id: 'P-016', name: 'Red Kidney Beans', category: 'Grains', price: 2.4, unit: 'kg', stock: 800, stockLabel: '800 kg', image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/Kidney_beans.jpg/960px-Kidney_beans.jpg', farmer: 'Farmer Grace', location: 'Nyeri', rating: 4.7, reviews: 59, badge: null },
  { id: 'P-017', name: 'Sukuma Wiki (Collard Greens)', category: 'Fruits & Veg', price: 1.15, unit: 'kg', stock: 420, stockLabel: '420 kg', image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5e/Sukuma_wiki_Farm_to_plate_2025.jpg/960px-Sukuma_wiki_Farm_to_plate_2025.jpg', farmer: 'Farmer Grace', location: 'Nyeri', rating: 4.6, reviews: 83, badge: null },
  { id: 'P-018', name: 'Field Fresh Cabbage', category: 'Fruits & Veg', price: 0.9, unit: 'head', stock: 560, stockLabel: '560 heads', image: 'https://live.staticflickr.com/75/190618763_703fc86034_b.jpg', farmer: 'Farmer Joseph', location: 'Meru', rating: 4.5, reviews: 61, badge: null },
  { id: 'P-019', name: 'Mwea Pishori Rice', category: 'Grains', price: 3.9, unit: 'kg', stock: 1100, stockLabel: '1,100 kg', image: unsplash('photo-1536304993881-ff6e9eefa2a6'), farmer: 'Farmer Njoki', location: 'Mwea', rating: 4.8, reviews: 96, badge: 'Aromatic' },
]

// Farmer's own active listings (mock)
export const MY_LISTINGS = [
  { id: 'L-001', name: 'Green Maize', category: 'Grains', price: 0.55, unit: 'cob', stock: 1200, stockUnit: 'cob', image: 'https://live.staticflickr.com/4115/4776897224_c9c4e47bc9_b.jpg', views: 1243, orders: 47, status: 'Active' },
  { id: 'L-002', name: 'Sun-Ripened Tomatoes', category: 'Fruits & Veg', price: 3.5, unit: 'kg', stock: 480, stockUnit: 'kg', image: unsplash('photo-1592924357228-91a4daadcfea', 600, 400), views: 2418, orders: 96, status: 'Active' },
  { id: 'L-003', name: 'Sukuma Wiki (Collard Greens)', category: 'Fruits & Veg', price: 1.1, unit: 'kg', stock: 420, stockUnit: 'kg', image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5e/Sukuma_wiki_Farm_to_plate_2025.jpg/960px-Sukuma_wiki_Farm_to_plate_2025.jpg', views: 862, orders: 31, status: 'Active' },
  { id: 'L-004', name: 'Kienyeji Chicken', category: 'Livestock', price: 14.0, unit: 'bird', stock: 64, stockUnit: 'bird', image: 'https://live.staticflickr.com/2523/3845505147_765bcbc099_b.jpg', views: 1109, orders: 22, status: 'Active' },
]

// Buyer notifications (mock)
export const NOTIFICATIONS = [
  { id: 'N-001', title: 'New match for "Irish Potatoes"', detail: '3 new farms near you listed fresh potatoes.', time: '2h' },
  { id: 'N-002', title: 'Price drop', detail: 'Hass Avocados dropped from $2.80 to $2.10 per kg.', time: '5h' },
  { id: 'N-003', title: 'Harvest alert', detail: 'Farmer Joseph listed 1,200 new cobs of green maize.', time: '1d' },
]
