/* ---------------------------------------------------------------- routing
   The app's existing convention is a hash-synced page state (no router
   dependency). Role dashboards extend it: #/farmer/dashboard, #/buyer/
   produce, … (each page set is guarded by the SERVER-verified session
   role). Legacy #farmer/#buyer aliases land on the first dashboard page;
   unknown hashes fall back to the shop. */

export const FARMER_PAGE_IDS = [
  'dashboard',
  'market-intelligence',
  'produce',
  'inquiries',
  'orders',
  'profile',
  'settings',
  'ai-market-advisor',
  'ai-agricultural-assistant',
  'ai-recommendations',
  'ai-crop-insights',
  'ai-price-recommendation',
  'ai-listing-improvement',
  'ai-buyer-matching',
  'ai-harvest-planner',
]

export const BUYER_PAGE_IDS = [
  'dashboard',
  'produce',
  'price-comparison',
  'requests',
  'inquiries',
  'saved',
  'orders',
  'profile',
  'settings',
  'ai-market-advisor',
  'ai-agricultural-assistant',
  'ai-recommendations',
  'ai-produce-finder',
  'ai-supplier-matching',
  'ai-purchase-planning',
]

export const SHOP_PAGE_IDS = ['checkout']

export const parseHash = () => {
  const h = window.location.hash.replace(/^#\/?/, '').toLowerCase()
  if (h === '' || h === 'shop') return 'shop'
  if (h.startsWith('shop/')) {
    const page = h.slice('shop/'.length)
    return SHOP_PAGE_IDS.includes(page) ? `shop/${page}` : 'not-found'
  }
  if (h === 'farmer') return 'farmer/dashboard' // legacy alias
  if (h.startsWith('farmer/')) {
    const page = h.slice('farmer/'.length)
    return FARMER_PAGE_IDS.includes(page) ? `farmer/${page}` : 'not-found'
  }
  if (h === 'buyer') return 'buyer/dashboard' // legacy alias
  if (h.startsWith('buyer/')) {
    const page = h.slice('buyer/'.length)
    return BUYER_PAGE_IDS.includes(page) ? `buyer/${page}` : 'not-found'
  }
  return 'not-found'
}
