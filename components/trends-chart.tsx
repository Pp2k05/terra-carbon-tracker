'use client'

import { Card } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// ---------------------------------------------------------------------------
// Seed data (demo — replace with DB query in production)
// ---------------------------------------------------------------------------

/** 12 weeks of sample emissions data by category, in kg CO₂. */
const WEEKLY_EMISSIONS_DATA = [
  { week: 'Week 1',  food: 15, transport: 10, clothing: 5, electronics: 2 },
  { week: 'Week 2',  food: 12, transport: 12, clothing: 3, electronics: 1 },
  { week: 'Week 3',  food: 18, transport: 8,  clothing: 6, electronics: 3 },
  { week: 'Week 4',  food: 14, transport: 14, clothing: 4, electronics: 2 },
  { week: 'Week 5',  food: 16, transport: 11, clothing: 7, electronics: 1 },
  { week: 'Week 6',  food: 13, transport: 9,  clothing: 5, electronics: 2 },
  { week: 'Week 7',  food: 17, transport: 13, clothing: 6, electronics: 3 },
  { week: 'Week 8',  food: 15, transport: 10, clothing: 4, electronics: 1 },
  { week: 'Week 9',  food: 14, transport: 12, clothing: 5, electronics: 2 },
  { week: 'Week 10', food: 16, transport: 11, clothing: 6, electronics: 1 },
  { week: 'Week 11', food: 18, transport: 9,  clothing: 7, electronics: 2 },
  { week: 'Week 12', food: 15, transport: 13, clothing: 5, electronics: 3 },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * TrendsChart
 *
 * Renders a stacked area chart of the user's CO₂ emissions broken down by
 * category over the past 12 weeks, alongside a summary stats grid.
 */
export default function TrendsChart() {
  const totalByCategory = {
    food:        WEEKLY_EMISSIONS_DATA.reduce((sum, d) => sum + d.food, 0),
    transport:   WEEKLY_EMISSIONS_DATA.reduce((sum, d) => sum + d.transport, 0),
    clothing:    WEEKLY_EMISSIONS_DATA.reduce((sum, d) => sum + d.clothing, 0),
    electronics: WEEKLY_EMISSIONS_DATA.reduce((sum, d) => sum + d.electronics, 0),
  }

  return (
    <Card className="p-6 bg-card border-border">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-1">Emissions Trends (Past 12 Weeks)</h3>
        <p className="text-sm text-muted-foreground">Track your carbon footprint over time by category</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="rounded-lg bg-primary/10 p-3">
          <p className="text-xs text-muted-foreground">Food &amp; Drink</p>
          <p className="text-lg font-semibold text-primary">{totalByCategory.food} kg</p>
        </div>
        <div className="rounded-lg bg-chart-2/10 p-3">
          <p className="text-xs text-muted-foreground">Transport</p>
          <p className="text-lg font-semibold text-chart-2">{totalByCategory.transport} kg</p>
        </div>
        <div className="rounded-lg bg-chart-3/10 p-3">
          <p className="text-xs text-muted-foreground">Clothing</p>
          <p className="text-lg font-semibold text-chart-3">{totalByCategory.clothing} kg</p>
        </div>
        <div className="rounded-lg bg-chart-4/10 p-3">
          <p className="text-xs text-muted-foreground">Electronics</p>
          <p className="text-lg font-semibold text-chart-4">{totalByCategory.electronics} kg</p>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={WEEKLY_EMISSIONS_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorFood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--chart-1)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTransport" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--chart-2)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorClothing" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--chart-3)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorElectronics" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--chart-4)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--chart-4)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="week" stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
            <YAxis stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: `1px solid var(--border)`,
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'var(--foreground)' }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="food"
              stackId="1"
              stroke="var(--chart-1)"
              fillOpacity={1}
              fill="url(#colorFood)"
              name="Food & Drink"
            />
            <Area
              type="monotone"
              dataKey="transport"
              stackId="1"
              stroke="var(--chart-2)"
              fillOpacity={1}
              fill="url(#colorTransport)"
              name="Transport"
            />
            <Area
              type="monotone"
              dataKey="clothing"
              stackId="1"
              stroke="var(--chart-3)"
              fillOpacity={1}
              fill="url(#colorClothing)"
              name="Clothing"
            />
            <Area
              type="monotone"
              dataKey="electronics"
              stackId="1"
              stroke="var(--chart-4)"
              fillOpacity={1}
              fill="url(#colorElectronics)"
              name="Electronics"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
