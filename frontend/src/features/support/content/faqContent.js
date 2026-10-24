/**
 * FAQ content — the single centralized data module for the FAQ page
 * (edited here, not inside the page component).
 *
 * CONTENT INTEGRITY (AGRILINK-FAQ-GLOBAL-THEME-001): every answer was
 * cross-checked against the actual implementation in this repository:
 * • Login/signup use one glass auth dialog with a required Buyer/Farmer
 *   role card (features/auth/AuthModal.jsx; server routes/auth.js).
 * • Farmers publish listings (name/category/price/unit/stock + photo
 *   upload) and delete them from My Produce — there is NO listing editing
 *   or pausing yet (farmer/pages/MyProduce.jsx; api endpoints.js).
 * • Buyers reach sellers per listing with the "Request" (purchase request)
 *   and "Inquire" (inquiry) controls on the dashboard cards
 *   (buyer/parts/ProduceCard.jsx) — there is no general chat.
 * • Cart = navbar basket + checkout page on the public marketplace;
 *   "Place order" POSTs the order to the real API and only then reports
 *   success. Payments are NOT configured — orders stay Pending/Unpaid
 *   (features/buyer/Checkout.jsx; server/routes/orders.js).
 * • Password recovery is NOT wired to any backend (AuthModal honestly says
 *   so) — no FAQ entry claims it does.
 * • Theme: the header theme toggle (features/theme) switches light/dark.
 * No entry claims payments, deliveries, refunds, seller verification or
 * account recovery work — none of those are implemented.
 */
export const FAQ_CATEGORIES = [
  'All Questions',
  'Getting Started',
  'Farmer Accounts',
  'Buyer Accounts',
  'Produce Listings',
  'Cart and Checkout',
  'Account and Security',
]

export const FAQ_ITEMS = [
  {
    category: 'Getting Started',
    question: 'What is AgriLink?',
    answer:
      'AgriLink is a digital marketplace designed to connect farmers with buyers of agricultural produce — farmers post what they have harvested, buyers browse the live marketplace feed.',
  },
  {
    category: 'Getting Started',
    question: 'Who can use AgriLink?',
    answer:
      'AgriLink provides separate Farmer and Buyer experiences. Choose the role that matches how you intend to use the platform — Buyers shop, compare prices and track orders; Farmers manage listings, inquiries and sales.',
  },
  {
    category: 'Getting Started',
    question: 'How do I create an account?',
    answer:
      'Open the signup dialog ("Sign In" → "Sign Up"), pick Buyer or Farmer, complete the name, email and password fields, and submit. Your account is created immediately and you stay signed in.',
  },
  {
    category: 'Farmer Accounts',
    question: 'How do I start selling produce?',
    answer:
      'Open Start Selling, create (or sign in to) a Farmer account, and you land on the Farmer dashboard. From there, use My Produce to publish your first listing.',
  },
  {
    category: 'Farmer Accounts',
    question: 'How do I manage a produce listing?',
    answer:
      'In your Farmer dashboard, My Produce lets you publish new listings (name, category, price, unit, stock and an optional photo) and delete listings you no longer sell. Editing or pausing an existing listing is not available yet.',
  },
  {
    category: 'Buyer Accounts',
    question: 'How do I find produce?',
    answer:
      'Open the Marketplace from the header, or use the Buyer dashboard\'s Browse Produce page for search, category, county, price and availability filters. The findings reflect the live listings farmers have posted.',
  },
  {
    category: 'Buyer Accounts',
    question: 'How do I contact a seller?',
    answer:
      'Open the listing card for the produce you are interested in and use its Request (send a purchase offer) or Inquire (ask the farmer a question) control. Both send real messages the farmer answers in their dashboard.',
  },
  {
    category: 'Produce Listings',
    question: 'Are listed prices guaranteed?',
    answer:
      'No. Treat displayed prices as listing information unless the application explicitly confirms a binding transaction price. Listings are offers by the farmer of record, and the marketplace marks the lowest offer in Price Comparison without claiming official averages.',
  },
  {
    category: 'Cart and Checkout',
    question: 'How do I add produce to my cart?',
    answer:
      'Use the "Add to Cart" button on a produce card in the public Marketplace, then review your selections in the basket under the cart icon. Your basket survives page refreshes.',
  },
  {
    category: 'Cart and Checkout',
    question: 'Does checkout guarantee that an order has been placed?',
    answer:
      'An order is confirmed only when the checkout workflow receives a genuine successful result from the order service. When that happens, the order is recorded as Pending & Unpaid — nothing is charged because payments are not configured yet.',
  },
  {
    category: 'Account and Security',
    question: 'How do I access my account?',
    answer:
      'Use the Sign In interface in the header, enter your email and password, and select the role associated with your account (Buyer or Farmer). Your session is kept in a secure, server-side cookie.',
  },
  {
    category: 'Account and Security',
    question: 'How do I change the appearance of AgriLink?',
    answer:
      'Use the theme toggle in the application header to switch between light and dark modes. The choice is remembered on this device, and if you have never chosen one the app follows your system preference.',
  },
]
