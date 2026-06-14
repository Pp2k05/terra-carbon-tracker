# TERRA - Carbon Footprint Tracker

TERRA is a comprehensive carbon footprint tracking system combining a web dashboard with a Chrome extension for passive intelligence on emissions from shopping, travel, and food delivery.

## Features

### Web Dashboard
- **Receipt Scanner**: Upload receipt photos and use DeepSeek Vision AI to analyze purchases and calculate carbon footprints
- **Today's Footprint Timeline**: View all emissions tracked today with ability to mark, skip, or delete entries
- **Emissions Trends**: 12-week stacked area chart showing carbon trends by category (Food, Transport, Clothing, Electronics)
- **Achievement Badges**: Unlock badges as you track more emissions and reduce your footprint
- **Eco-Green Theme**: Beautiful, modern UI with green color scheme emphasizing environmental consciousness

### Chrome Extension (MV3)
The extension works passively on supported e-commerce, flight, and food delivery sites:

#### E-Commerce Sites (Amazon, Best Buy, Walmart, Target, eBay)
- Injects green carbon chips showing estimated CO2 for each product
- Estimates based on product category and price
- One-click addition to tracking queue

#### Flight Booking Sites (Booking.com, Expedia, Kayak)
- Detects flight searches and automatically calculates CO2 emissions
- Estimates based on flight distance and radiative forcing multiplier
- Shows total emissions per flight route

#### Food Delivery (Uber Eats, DoorDash, Grubhub)
- Calculates emissions for food orders (~3kg CO2 per meal including delivery)
- Shows order summary with total carbon footprint
- Quick sync to dashboard

#### Service Worker & Queue System
- All detected items are queued in local Chrome storage
- Automatic sync to dashboard when extension popup is opened
- Offline-first approach - works without internet

## Technology Stack

### Web Dashboard
- **Framework**: Next.js 16 with React 19
- **UI Components**: shadcn/ui with Tailwind CSS v4
- **Theme**: Eco-green design tokens (OKLCH color space)
- **Charts**: Recharts for trends visualization
- **Database**: Neon PostgreSQL + Drizzle ORM
- **Auth**: Better Auth (email + password)
- **AI**: DeepSeek Vision API via Deep Infra for receipt OCR

### Chrome Extension
- **Manifest**: MV3 (Manifest Version 3)
- **Content Scripts**: Per-site for e-commerce, flights, food delivery
- **Service Worker**: Background task processing
- **Storage**: Chrome Storage API for queue management
- **Communication**: Chrome Runtime API for inter-script messaging

## Installation & Setup

### Web Dashboard

1. **Clone and install**:
```bash
cd /vercel/share/v0-project
pnpm install
```

2. **Set environment variables**:
```bash
BETTER_AUTH_SECRET=<your-secret>  # Generate with: openssl rand -base64 32
DEEPSEEK_API_KEY=<your-api-key>   # From Deep Infra
DATABASE_URL=<neon-database-url>  # Optional if using auth
```

3. **Run dev server**:
```bash
pnpm dev
```

4. **Access dashboard**:
Open http://localhost:3000

### Chrome Extension

1. **Build files** (already created in `/extension`):
- `manifest.json` - Extension configuration
- `service-worker.js` - Background service worker
- `content-*.js` - Content scripts for each site type
- `popup.html` / `popup.js` - Extension popup UI
- `content-styles.css` - Injected styles

2. **Load in Chrome**:
- Open `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked"
- Select the `/extension` directory

3. **Verify installation**:
- Visit Amazon.com, Booking.com, or Uber Eats
- Should see green carbon chips on products/flights/orders
- Click chips to queue items for tracking
- Click extension icon to see popup with synced items

## Directory Structure

```
/vercel/share/v0-project/
├── app/
│   ├── page.tsx                 # Dashboard home
│   ├── sign-in/page.tsx         # Sign-in page
│   ├── sign-up/page.tsx         # Sign-up page
│   ├── api/auth/[...all]/       # Better Auth handler
│   └── api/analyze-receipt/     # DeepSeek receipt API
├── components/
│   ├── dashboard-layout.tsx     # Main dashboard layout
│   ├── sidebar.tsx              # Navigation sidebar
│   ├── receipt-scanner.tsx      # Receipt upload & analysis
│   ├── today-footprint.tsx      # Daily timeline
│   ├── trends-chart.tsx         # Recharts visualization
│   ├── badges-display.tsx       # Achievement badges
│   └── auth-form.tsx            # Shared auth form
├── lib/
│   ├── auth.ts                  # Better Auth config
│   ├── auth-client.ts           # Browser auth client
│   ├── db/
│   │   ├── index.ts             # Drizzle + pg Pool
│   │   └── schema.ts            # Database tables
│   └── utils.ts                 # Helpers (cn)
├── extension/
│   ├── manifest.json            # MV3 configuration
│   ├── service-worker.js        # Background worker
│   ├── content-ecommerce.js     # Product detection
│   ├── content-flights.js       # Flight detection
│   ├── content-food.js          # Food order detection
│   ├── popup.html               # Extension popup
│   ├── popup.js                 # Popup logic
│   └── content-styles.css       # Injected styles
├── app/globals.css              # Tailwind + design tokens
├── next.config.mjs              # Next.js config
├── tsconfig.json                # TypeScript config
└── package.json                 # Dependencies
```

## Key Features Deep Dive

### Receipt Scanner (DeepSeek Vision)
1. Upload receipt image
2. DeepSeek Vision API extracts items and prices
3. AI calculates itemized carbon footprints:
   - Food: 0.5-2 kg CO2 per kg
   - Clothing: 5-20 kg CO2 per item
   - Electronics: 50-200 kg CO2 per item
4. Total CO2 shown with itemized breakdown
5. Click "Add to Footprint" to save

### Passive Intelligence Extension
The extension runs silently in background:
- Detects products on e-commerce sites
- Auto-calculates CO2 based on category
- User clicks green chip to add to queue
- Queue stored in Chrome local storage
- Opens dashboard → syncs items automatically

### Database Schema
- `user` - User accounts (Better Auth)
- `session` - Active sessions
- `account` - OAuth accounts
- `verification` - Email verification
- `carbon_footprints` - Individual emission records
- `receipts` - OCR receipt metadata & analysis
- `user_badges` - Achievement tracking
- `carbon_trends` - Weekly/monthly aggregates

### Achievement Badges
- **First Step**: Scan first receipt
- **Eco Warrior**: Track 10 emissions entries (progress: 10%)
- **Carbon Conscious**: Keep daily emissions under 5 kg
- **Scanner Pro**: Scan 50 receipts
- **Weekly Leader**: Lowest emissions in a week
- **Green Champion**: Reach 1000 tracked days

## Usage Examples

### Tracking a Purchase
1. Browse Amazon.com
2. Green "🌱 X.XX kg CO₂" chip appears near price
3. Click chip → added to extension queue
4. Open TERRA dashboard → click "Sync to Dashboard"
5. Item appears in Today's Footprint timeline

### Tracking a Flight
1. Visit Booking.com and search flights
2. Blue "✈ X kg CO₂" chip shows for each flight
3. Click to add to queue
4. Dashboard syncs automatically

### Tracking a Meal
1. Add items to Uber Eats cart
2. Orange "🍽 Order: X kg CO₂" chip appears
3. Click to queue for tracking
4. Dashboard records food delivery emissions

### Scanning a Receipt
1. Go to dashboard
2. Click "Scan Receipt" button
3. Upload photo of grocery receipt
4. DeepSeek analyzes and breaks down CO2 per item
5. Review itemized emissions
6. Click "Add to Footprint" to save

## Design Highlights

### Color System (5 colors)
- **Primary**: Eco-green (#22c55e) - for main actions and highlights
- **Secondary**: Light sage (#95f98e) - for accents
- **Accent**: Emerald (#10b981) - for secondary elements
- **Neutral**: Various grays (light-dark hierarchy)
- **Chart colors**: Multiple greens/teals for category differentiation

### Typography
- **Font**: Inter (system fonts as fallback)
- **Headings**: Bold weights (600-700)
- **Body**: Regular weights (400-500)
- **Sizes**: Semantic hierarchy from h1 down

### Layout
- Flexbox for dynamic layouts
- CSS Grid for the 12-week chart
- Mobile-first responsive design
- Sidebar navigation on desktop
- Stacked layout on mobile

## Performance Optimizations
- Recharts stacked area chart with virtualization
- Lazy-loaded content scripts in extension
- Chrome storage for offline-first queue system
- Server-side aggregation for trends
- Optimistic UI updates in dashboard

## Future Enhancements
- OAuth social logins
- Apple Health / Google Fit integration
- Public leaderboards
- Carbon offset marketplace
- Household sharing & family tracking
- Mobile app (iOS/Android)
- API for third-party integrations
- Webhook syncing from extension to dashboard

## Privacy & Security
- All Chrome extension data stored locally
- Optional sync to dashboard (user controls)
- No tracking of personal data beyond emissions
- HTTPS only for all APIs
- Better Auth handles secure sessions
- Row-level security on database queries

## Support
For issues or feature requests, visit [GitHub Issues](https://github.com/terra-carbon/tracker)

---

**TERRA**: Making carbon tracking effortless. Every tracked item is a step toward a sustainable future.
