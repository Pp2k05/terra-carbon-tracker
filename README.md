# TERRA - Carbon Footprint Tracker

## Vertical: Climate Tech / Sustainability Intelligence

TERRA is a dual-interface carbon footprint tracking platform combining a web dashboard and Chrome extension. It surfaces the environmental cost of purchases **at the moment of decision** using AI-powered receipt analysis and passive intelligence.

---

## Problem & Approach

**The Challenge:**
Most people are unaware of the carbon emissions embedded in their everyday purchases. Carbon footprint tracking apps require manual logging, making them tedious. There's a gap between purchase intent and carbon awareness.

**Our Solution:**
1. **Passive Intelligence via Chrome Extension**: Automatically detect purchases on e-commerce, flight booking, and food delivery sites, injecting real-time carbon cost indicators
2. **Active Tracking via Receipt Scanner**: Use AI (DeepSeek Vision) to OCR receipts and instantly estimate carbon emissions by item
3. **Gamification & Insights**: Track daily/weekly emissions, unlock badges, and visualize trends over time

**Why This Works:**
- **Frictionless**: Users don't manually log purchases; data flows automatically
- **Actionable**: Real-time carbon indicators at purchase moments enable immediate decisions
- **Empowering**: Visual trends and achievements motivate sustained behavior change

---

## How the Solution Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    TERRA System                      │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────────────┐              ┌──────────────┐   │
│  │  Web Dashboard  │◄────────────►│ Neon Postgres│   │
│  │  (Next.js 16)   │              │   + Drizzle  │   │
│  └─────────────────┘              └──────────────┘   │
│         ▲                                    ▲         │
│         │                                    │         │
│         └─────────────────┬──────────────────┘         │
│                           │                            │
│                  ┌────────▼────────┐                   │
│                  │  API Routes     │                   │
│                  │ /api/analyze... │                   │
│                  │ /api/footprint..│                   │
│                  └────────┬────────┘                   │
│                           │                            │
│           ┌───────────────┴───────────────┐            │
│           │                               │            │
│    ┌──────▼─────────┐           ┌────────▼────────┐   │
│    │  DeepSeek      │           │ Chrome Extension│   │
│    │  Vision API    │           │  (MV3)          │   │
│    │  (Receipt OCR) │           │  Content Scripts│   │
│    └────────────────┘           │  Service Worker │   │
│                                 │  Popup UI       │   │
│                                 └─────────────────┘   │
│                                                       │
└─────────────────────────────────────────────────────┘
```

### Component Breakdown

#### 1. **Web Dashboard** (`/app` directory)
```
Pages:
├── page.tsx                    # Main dashboard (Overview + Timeline + Trends + Badges)
├── sign-in/page.tsx            # Authentication
└── sign-up/page.tsx            # User registration

API Routes:
├── api/auth/[...all]/route.ts  # Better Auth handler
└── api/analyze-receipt/route.ts # DeepSeek Vision receipt OCR endpoint

Components:
├── dashboard-layout.tsx         # Main layout with sidebar
├── sidebar.tsx                  # Navigation
├── receipt-scanner.tsx          # Image upload + analysis modal
├── today-footprint.tsx          # Timeline with mark/skip controls
├── trends-chart.tsx             # 12-week stacked area chart (Recharts)
└── badges-display.tsx           # Achievement badges with progress

Library:
├── lib/auth.ts                  # Better Auth configuration
├── lib/auth-client.ts           # Client-side auth helpers
├── lib/db/index.ts              # Drizzle ORM client
└── lib/db/schema.ts             # Database schema (Better Auth + app tables)
```

#### 2. **Chrome Extension** (`/extension` directory)
```
MV3 Manifest:
├── manifest.json                # Extension configuration, permissions, hosts
└── icons/                       # Extension icons (16x16, 48x48, 128x128)

Background:
└── service-worker.js            # Background event listener, queue management

Content Scripts:
├── content-ecommerce.js         # Amazon, eBay, Walmart, Best Buy, Target
├── content-flights.js           # Booking.com, Expedia, Kayak, Google Flights
└── content-food.js              # Uber Eats, DoorDash, Grubhub, Instacart

UI:
├── popup.html                   # Popup interface
├── popup.js                     # Popup logic (queue display, sync, open dashboard)
└── content-styles.css           # Styles for carbon chips injected into pages

Utils:
├── carbon-calculator.js         # CO2 estimation formulas (production + packaging + transport)
└── storage.js                   # Chrome Storage API wrapper for offline queueing
```

### Data Flow

#### Receipt Scanning Flow
```
1. User uploads receipt image
   ↓
2. Image sent to /api/analyze-receipt as base64
   ↓
3. DeepSeek Vision API processes image
   ↓
4. AI extracts: store, date, items, prices
   ↓
5. Carbon calculator estimates CO2 per item based on:
   - Product category (food, clothing, electronics, etc)
   - Item characteristics (weight, material, complexity)
   - Supply chain emissions (production, transport, packaging)
   ↓
6. Results displayed with itemized breakdown
   ↓
7. User clicks "Add to Footprint"
   ↓
8. Entry stored in carbon_footprints table + trends aggregated
```

#### Passive Detection Flow
```
1. Extension content script loads on supported site
   ↓
2. Script detects product/flight/meal cards
   ↓
3. Extract price, distance, or meal info
   ↓
4. Calculate CO2 using embedded formulas:
   - E-commerce: price × $0.1 per kg CO2 (proxy for production)
   - Flights: distance × 0.255 kg CO2/km × 1.9x RFI multiplier
   - Food: fixed ~3 kg per meal + delivery multiplier
   ↓
5. Inject green/blue/orange chip above price
   ↓
6. User clicks chip → queued in Chrome Storage
   ↓
7. When popup opened, sync queue to dashboard
   ↓
8. Dashboard pulls from carbon_footprints table
```

#### Dashboard Sync Flow
```
1. User opens extension popup
   ↓
2. Service Worker retrieves queued items from Chrome Storage
   ↓
3. POST to /api/carbon-footprints with user session
   ↓
4. Server validates user ID, stores in DB
   ↓
5. Trends table updated (weekly/monthly aggregation)
   ↓
6. Badges checked for unlocking
   ↓
7. Popup closes, user can view in dashboard
```

---

## Technology Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 16 (App Router) | Full-stack framework, server components, streaming |
| **Styling** | Tailwind CSS v4 + shadcn/ui | Utility-first, design token system, accessible components |
| **Charts** | Recharts | Lightweight, responsive, dark mode support |
| **Database** | Neon PostgreSQL | Serverless, cold-start optimized, integrates with v0 |
| **ORM** | Drizzle ORM | Type-safe, minimal overhead, works with Neon |
| **Auth** | Better Auth | Email + password, sessions, CSRF protection built-in |
| **AI** | DeepSeek Vision API | Vision-language model via Deep Infra, multimodal (image + text) |
| **Extension** | Chrome MV3 | Modern, secure, content scripts + service worker |

---

## Database Schema

```sql
-- Better Auth Tables (auto-managed)
CREATE TABLE "user" (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  emailVerified BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "session" (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  expiresAt TIMESTAMP NOT NULL,
  FOREIGN KEY (userId) REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE "account" (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  password TEXT,
  FOREIGN KEY (userId) REFERENCES "user"(id) ON DELETE CASCADE
);

-- App Tables
CREATE TABLE "carbon_footprints" (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT NOT NULL,          -- 'receipt', 'passive', 'manual'
  category TEXT NOT NULL,       -- 'food', 'transport', 'clothing', etc
  kgCO2 DECIMAL NOT NULL,
  description TEXT,
  receiptId TEXT,
  source TEXT,                 -- extension source (amazon, uber-eats, etc)
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE "receipts" (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  imageUrl TEXT NOT NULL,
  rawText TEXT,                -- OCR'd text from DeepSeek
  parsedItems JSONB,           -- { item, quantity, price, estimatedCO2 }
  totalCO2 DECIMAL,
  store TEXT,
  date TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'processed', 'error'
  FOREIGN KEY (userId) REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE "carbon_trends" (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  period TEXT NOT NULL,         -- 'week' or 'month'
  periodStart DATE NOT NULL,
  category TEXT NOT NULL,
  totalKgCO2 DECIMAL NOT NULL,
  count INTEGER DEFAULT 0,
  FOREIGN KEY (userId) REFERENCES "user"(id) ON DELETE CASCADE,
  UNIQUE(userId, period, periodStart, category)
);

CREATE TABLE "user_badges" (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  badgeId TEXT NOT NULL,
  unlockedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "user"(id) ON DELETE CASCADE,
  UNIQUE(userId, badgeId)
);
```

---

## Key Features

### Dashboard Features

| Feature | Implementation |
|---------|-----------------|
| **Receipt Scanner** | File upload → DeepSeek Vision OCR → itemized CO2 breakdown |
| **Today's Timeline** | Real-time list of tracked emissions with mark/skip/delete controls |
| **Trends Chart** | 12-week stacked area chart by category (Recharts) |
| **Badge System** | 6 unlockable achievements (First Step, Eco Warrior, Carbon Conscious, etc) |
| **Authentication** | Email + password via Better Auth |
| **Responsive Design** | Mobile + desktop, dark mode support |

### Extension Features

| Site Type | Detection | CO2 Indicator |
|-----------|-----------|---------------|
| **E-commerce** (Amazon, eBay, Walmart, Best Buy, Target) | Product cards | Green chip showing $price × 0.1 kg CO2 |
| **Flights** (Booking.com, Expedia, Kayak, Google Flights) | Flight results | Blue chip showing distance × 0.255 × 1.9 kg CO2 |
| **Food Delivery** (Uber Eats, DoorDash, Grubhub, Instacart) | Meal cards | Orange chip showing ~3 kg CO2 per meal |

---

## Assumptions & Design Decisions

### Assumptions Made

1. **Carbon Estimation Accuracy**
   - E-commerce: Use price as proxy for carbon (assumes ~$0.10 per kg CO2 embedded)
   - Food: Fixed ~3 kg CO2 per meal (average across cuisines, delivery included)
   - Flights: Use ICAO formula (distance × 0.255 kg CO2/km × 1.9 RFI multiplier)
   - *Reality*: Varies by product, region, supply chain. Intended for relative comparison, not absolute accounting

2. **User Intent**
   - Users want **awareness**, not guilt. Design emphasizes empowerment (badges, trends) over blame
   - Passive detection is preferred over manual logging (inferred from user behavior)
   - Users will engage more with visual trends + achievements than raw numbers

3. **Privacy & Security**
   - Extension operates offline-first (Chrome Storage) to minimize data transmission
   - Only syncs when user explicitly opens popup
   - Session validation on every API call to prevent unauthorized access
   - No tracking of browsing history outside detected purchases

4. **Technical Constraints**
   - Chrome MV3 limitations: No persistent background scripts, service workers can be terminated
   - Solution: Queue in Chrome Storage, sync on demand via popup
   - DeepSeek Vision model errors handled gracefully with user feedback

5. **Data Retention**
   - All emissions permanently tied to userId for aggregation
   - Trends pre-computed weekly to avoid slow queries on large datasets
   - Badge system uses aggregates (count, total CO2) rather than querying all entries

### Design Decisions

| Decision | Why |
|----------|-----|
| **Client-side carbon calc** | Fast, offline, no API calls for passive detection |
| **Recharts for visualization** | Lightweight, responsive, dark mode native |
| **Chrome Storage API** | Native, privacy-respecting, no server dependency |
| **Better Auth** | Minimal setup, built for Next.js, CSRF/session secure by default |
| **Tailwind v4 design tokens** | Cohesive theme, 5-color system easy to reason about |
| **Demo mode** | Dashboard accessible without Neon integration (shows full UI) |
| **JSONB for receipt items** | Flexible schema for varying receipt formats |

---

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Chrome browser (for extension testing)
- DeepSeek API key (from Deep Infra)
- (Optional) Neon PostgreSQL database

### Web Dashboard

```bash
# Install dependencies
pnpm install

# Set environment variables (create .env.local)
BETTER_AUTH_SECRET="$(openssl rand -base64 32)"
DEEPSEEK_API_KEY="sk_..."  # From Deep Infra dashboard
DATABASE_URL="postgres://..."  # Optional: From Neon (demo mode works without)

# Start dev server
pnpm dev

# Open http://localhost:3000
```

**Demo Mode**: The dashboard runs without a database connection. To enable persistent storage and authentication, connect to Neon PostgreSQL.

### Chrome Extension

1. Open `chrome://extensions/`
2. Enable "Developer mode" (top-right)
3. Click "Load unpacked"
4. Select `/extension` directory from this project
5. Extension icon will appear in your toolbar

**Testing Passive Detection:**
- Navigate to Amazon.com, Booking.com, DoorDash, or similar
- Product/flight/meal cards will display green/blue/orange carbon chips
- Click a chip to queue it for tracking
- Open the extension popup to view queued items and sync to dashboard

---

## Project Structure

```
terra-carbon-tracker/
├── app/
│   ├── page.tsx                      # Main dashboard
│   ├── sign-in/page.tsx              # Sign-in page
│   ├── sign-up/page.tsx              # Sign-up page
│   ├── api/
│   │   ├── auth/[...all]/route.ts   # Better Auth handler
│   │   └── analyze-receipt/route.ts  # DeepSeek Vision receipt analysis
│   ├── layout.tsx                    # Root layout
│   └── globals.css                   # Global styles + design tokens
├── components/
│   ├── ui/                           # shadcn/ui components
│   ├── dashboard-layout.tsx          # Main dashboard layout
│   ├── sidebar.tsx                   # Navigation sidebar
│   ├── receipt-scanner.tsx           # Receipt OCR modal
│   ├── today-footprint.tsx           # Daily timeline
│   ├── trends-chart.tsx              # 12-week trends visualization
│   ├── badges-display.tsx            # Achievement badges
│   └── auth-form.tsx                 # Login/signup form
├── lib/
│   ├── auth.ts                       # Better Auth configuration
│   ├── auth-client.ts                # Client-side auth helpers
│   ├── db/
│   │   ├── index.ts                  # Drizzle client + pg Pool
│   │   └── schema.ts                 # Database schema
│   └── utils.ts                      # Utility functions
├── extension/
│   ├── manifest.json                 # MV3 manifest
│   ├── service-worker.js             # Background service worker
│   ├── content-ecommerce.js          # E-commerce detection
│   ├── content-flights.js            # Flight detection
│   ├── content-food.js               # Food delivery detection
│   ├── popup.html                    # Popup interface
│   ├── popup.js                      # Popup logic
│   ├── content-styles.css            # Injected styles
│   ├── carbon-calculator.js          # CO2 formula utilities
│   ├── storage.js                    # Chrome Storage wrapper
│   └── icons/                        # Extension icons
├── public/
│   └── favicon.ico
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── components.json                   # shadcn/ui config
└── README.md                         # This file
```

---

## Code Examples

### Receipt Analysis API

```typescript
// app/api/analyze-receipt/route.ts
export async function POST(req: Request) {
  const { imageBase64 } = await req.json()
  
  const result = await generateObject({
    model: deepinfra('deepseek-ai/deepseek-vision-7b'),
    schema: ReceiptAnalysisSchema,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', image: Buffer.from(imageBase64, 'base64') },
        { type: 'text', text: 'Analyze this receipt and extract items with CO2 estimates...' }
      ]
    }]
  })
  
  return Response.json(result)
}
```

### Content Script - E-commerce Detection

```javascript
// extension/content-ecommerce.js
function injectCarbonChips() {
  document.querySelectorAll('[data-component-type="s-search-result"]').forEach(item => {
    const priceText = item.querySelector('.a-price-whole')?.textContent
    const price = parseFloat(priceText?.replace(/[^\d.]/g, '') || 0)
    const co2 = (price * 0.1).toFixed(2)
    
    const chip = document.createElement('div')
    chip.className = 'terra-chip terra-chip-green'
    chip.textContent = `${co2} kg CO₂`
    chip.onclick = () => queueForTracking({ price, co2, source: 'amazon' })
    
    item.appendChild(chip)
  })
}
```

### Dashboard Component - Trends Chart

```tsx
// components/trends-chart.tsx
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts'

export default function TrendsChart() {
  const data = [
    { week: 'Week 1', food: 15, transport: 10, clothing: 5 },
    // ... more weeks
  ]
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data}>
        <Area type="monotone" dataKey="food" stackId="1" fill="var(--chart-1)" />
        <Area type="monotone" dataKey="transport" stackId="1" fill="var(--chart-2)" />
        <Area type="monotone" dataKey="clothing" stackId="1" fill="var(--chart-3)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
```

---

## Future Enhancements

1. **Real-time Sync**: WebSocket connection for instant dashboard updates
2. **API Integrations**: Bank/credit card APIs for auto-import of transactions
3. **Carbon Offsetting**: Partner with verified offset providers
4. **Social Features**: Share achievements, leaderboards with friends
5. **ML Personalization**: Predict emissions, suggest alternatives
6. **Mobile App**: React Native for iOS/Android
7. **Advanced Analytics**: Cohort analysis, impact of behavior changes
8. **Export & Reporting**: PDF reports for corporates/sustainability teams

---

## Assumptions Summary

✅ Users prefer **passive tracking** over manual logging
✅ Real-time carbon awareness influences purchase decisions
✅ Gamification (badges, trends) sustains engagement
✅ Price can proxy for embedded carbon in e-commerce
✅ Users value **privacy** (offline-first, on-demand sync)
✅ Relative accuracy sufficient for behavior change (not regulatory reporting)

---

## Built with v0

This repository is linked to a [v0](https://v0.app) project. Continue developing by visiting the link below.

[Continue working on v0 →](https://v0.app/chat/projects/prj_4hi4MCYvZABWybHUaTay1bYRe6pb)
