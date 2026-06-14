# TERRA — Carbon Footprint Tracker

TERRA is a dual-interface carbon footprint tracking platform: a **Next.js web dashboard** combined with a **Chrome extension** that surfaces the CO₂ cost of purchases at the exact moment a user is deciding to buy.

---

## 1. Chosen Vertical

**Climate Tech / Consumer Sustainability**

Carbon emissions from individual consumption — food, transport, shopping, travel — account for roughly 60% of global greenhouse gas output. Yet most people have no feedback mechanism connecting their daily spending to its environmental cost. TERRA operates in the intersection of **consumer behaviour technology** and **climate intelligence**: making carbon data as visible and immediate as price data.

---

## 2. Approach & Logic

### The Core Problem

Every existing carbon tracking tool shares the same fatal flaw: they require users to log emissions **after the fact**. By the time someone opens a tracker app, the purchase decision has already been made. The feedback loop is broken.

The critical window for behaviour change is **at the point of purchase** — the moment a person sees a price is the moment they are most open to alternative information.

### The Logic

TERRA's approach is built on one insight:

> **Carbon data injected at the price = a genuine decision point. Carbon data logged afterward = guilt with no action.**

This leads to a two-pronged architecture:

**Prong 1 — Passive Intelligence (Chrome Extension)**
Rather than asking users to log anything, the extension runs silently on e-commerce, flight, and food delivery sites. It detects product listings and injects a colour-coded carbon chip directly next to the price. No app-switching. No manual entry. The carbon cost appears *before* the user clicks "Buy".

**Prong 2 — Active Tracking (Web Dashboard)**
For purchases that happen offline or outside extension-supported sites, users can photograph any receipt. DeepSeek Vision AI (a multimodal vision-language model) reads the receipt and returns an itemised CO₂ breakdown — no typing required. The dashboard then provides 12-week trend charts, daily timelines, quick-log actions, and an achievement badge system to sustain long-term engagement through progress framing rather than guilt.

### Why This Combination Works

| Moment | TERRA's Response |
|---|---|
| Browsing Amazon | Green carbon chip appears next to price |
| Booking a flight | Blue chip shows kg CO₂ per route |
| Ordering food delivery | Orange chip shows meal + delivery footprint |
| Bought something offline | Scan receipt → AI extracts itemised CO₂ |
| Reviewing weekly habits | 12-week stacked trend chart by category |
| Maintaining motivation | Badge unlocks, daily streaks, quick-track wins |

The logic chain: **awareness → decision → tracking → reflection → habit change**.

---

## 3. How the Solution Works

### Chrome Extension (Passive Detection)

The extension uses Chrome MV3 with three content scripts, each scoped to specific domains in `manifest.json`:

| Script | Platforms | CO₂ Formula |
|---|---|---|
| `content-ecommerce.js` | Amazon, eBay, Walmart, Best Buy, Target | `price × $0.10 per kg CO₂` (price proxy for embedded carbon) |
| `content-flights.js` | Booking.com, Expedia, Kayak, Google Flights | `distance (km) × 0.255 × 1.9 (ICAO + RFI multiplier)` |
| `content-food.js` | Uber Eats, DoorDash, Grubhub, Instacart | `~3.0 kg CO₂ per meal + delivery multiplier` |

Each script uses `MutationObserver` to watch for dynamic DOM changes (single-page app renders). When a product card, flight result, or meal item is detected, the CO₂ is calculated entirely **client-side** (no API call) and a chip is injected adjacent to the price element.

Clicked chips are queued in **Chrome Storage** (offline-first, private to the device). When the user opens the extension popup, a service worker flushes the queue to the dashboard API using the user's session.

**Flow:**
```
Site loads → content script detects product cards
→ CO₂ calculated locally (no API)
→ chip injected next to price
→ user clicks chip → queued in Chrome Storage
→ popup opened → service worker syncs queue to dashboard
→ item appears in Today's Timeline
```

### Web Dashboard (Active Tracking + Insights)

Built with **Next.js 16** (App Router), **Drizzle ORM** on **Neon PostgreSQL**, and **Better Auth** for session management.

**Receipt Scanner:**
1. User uploads a receipt photo in the modal dialog
2. Client validates: file ≤ 10 MB, MIME type is an image
3. Base64 image POSTed to `/api/analyze-receipt`
4. Server validates the session (401 if unauthenticated), payload size (413 if >14 MB), and file magic bytes (415 if not a real image)
5. **DeepSeek Vision** (via Deep Infra) reads the image and returns structured JSON:
   `{ store, date, items: [{ item, quantity, price, estimatedCO2 }], totalEstimatedCO2, category }`
6. Itemised breakdown rendered; user clicks "Add to Footprint" to save

**Dashboard Modules:**

| Module | Function |
|---|---|
| **Today's Timeline** | Real-time list of all tracked emissions; total CO₂ updates live; mark / skip / delete per entry |
| **12-Week Trends** | Stacked area chart (Recharts) broken down by category — Food, Transport, Clothing, Electronics |
| **Achievement Badges** | 6 unlockable badges with progress bars (First Step, Eco Warrior, Carbon Conscious, Scanner Pro, Weekly Leader, Green Champion) |
| **Quick Track** | One-tap logging of common low-carbon actions — biked to work, vegetarian meal, used reusables, saved energy |

### Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS v4 (CSS-first config) + shadcn/ui |
| Charts | Recharts |
| Database | Neon PostgreSQL + Drizzle ORM |
| Auth | Better Auth (email + password, CSRF protection) |
| AI / Vision | DeepSeek Vision API via Deep Infra |
| Extension | Chrome MV3 (content scripts + service worker) |
| Testing | Jest + React Testing Library (92 tests, 9 suites) |

### Database Tables

- `carbon_footprints` — individual emission records (type, category, kgCO₂, source, userId)
- `receipts` — OCR metadata and parsed items (JSONB) from DeepSeek
- `carbon_trends` — weekly/monthly pre-aggregated totals per category (for fast chart queries)
- `user_badges` — unlocked badge records per user
- `user`, `session`, `account` — managed by Better Auth

---

## 4. Assumptions Made

### Carbon Estimation

| Category | Assumption | Justification |
|---|---|---|
| **E-commerce** | Price × $0.10 ≈ kg CO₂ embedded | Price correlates with production intensity at a category level (DEFRA LCA data); suitable for relative comparison |
| **Flights** | ICAO distance formula × 1.9 Radiative Forcing Index | Standard methodology; RFI accounts for high-altitude warming effects beyond CO₂ alone |
| **Food delivery** | ~3.0 kg CO₂ per meal | Average lifecycle analysis across cuisines and delivery distances; consistent with published food system LCA research |
| **Receipt items** | AI-estimated per product category | DeepSeek Vision classifies items (food, clothing, electronics) and applies category-weighted emission factors; accuracy ±30% |

> These figures are **directionally accurate for consumer awareness**, not for regulatory or corporate accounting. The goal is behaviour change, not precision reporting — relative comparisons between choices are what matter.

### User Behaviour

- Users abandon apps that require manual logging within days — passive detection (zero friction) is essential for retention
- The moment of purchase is when users are most receptive to carbon information; post-purchase tracking has no decision-making value
- Progress framing (badges, trends, savings accumulation) sustains engagement better than guilt or raw numbers
- Users value privacy: the extension must work offline-first and only sync when explicitly requested

### Technical

- **Tailwind CSS v4** is configured CSS-first via `@import 'tailwindcss'` in `globals.css` — there is no `tailwind.config.ts`; this is the intended v4 approach
- **Demo mode**: the dashboard runs fully without a Neon database connection — all components render with seed data so the complete UI is explorable without infrastructure setup
- **Chrome MV3** service workers can be terminated by the browser at any time — all state is persisted in Chrome Storage, never held in memory
- **DeepSeek Vision** may occasionally misclassify items or miss prices on unusual receipt formats — errors are surfaced to the user gracefully with a retry option

### Privacy & Security

- Extension content scripts only activate on domains explicitly listed in `manifest.json` — no general browsing data is captured or transmitted
- Extension queue data lives in Chrome Storage on-device until the user initiates a sync — there is no background data exfiltration
- All server API routes validate the caller's session before processing any data; unauthenticated requests are rejected with HTTP 401
- Internal server errors are logged server-side only; clients receive sanitised generic messages — no stack traces or implementation details are exposed

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Configure environment variables (.env.local)
BETTER_AUTH_SECRET="$(openssl rand -base64 32)"
DEEPSEEK_API_KEY="sk-..."        # from Deep Infra
DATABASE_URL="postgres://..."    # from Neon (optional — demo mode works without it)

# Start development server
pnpm dev
# → http://localhost:3000
```

**Chrome Extension:**
1. Open `chrome://extensions/` → Enable Developer mode
2. Click **Load unpacked** → select the `/extension` directory
3. Visit Amazon, Booking.com, or Uber Eats — carbon chips appear automatically

**Tests:**
```bash
node node_modules/jest/bin/jest.js --forceExit
# → 92 passed, 9 suites
```

---

## Built with v0

[Continue working on v0 →](https://v0.app/chat/projects/prj_4hi4MCYvZABWybHUaTay1bYRe6pb)
