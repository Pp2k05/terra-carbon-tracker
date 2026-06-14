'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, Check, X } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FootprintType = 'receipt' | 'manual' | 'passive'
type FootprintStatus = 'marked' | 'skipped'

interface Footprint {
  id: string
  type: FootprintType
  category: string
  kgCO2: number
  description: string
  timestamp: Date
  status?: FootprintStatus
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Tailwind class sets for each emission category badge. */
const CATEGORY_COLORS: Record<string, string> = {
  food: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  transport: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  clothing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  electronics: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  household: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
}

// ---------------------------------------------------------------------------
// Seed data (demo mode)
// ---------------------------------------------------------------------------

const INITIAL_FOOTPRINTS: Footprint[] = [
  {
    id: '1',
    type: 'receipt',
    category: 'food',
    kgCO2: 2.5,
    description: 'Grocery store purchase',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '2',
    type: 'passive',
    category: 'transport',
    kgCO2: 1.2,
    description: 'Car trip detected',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * TodayFootprint
 *
 * Displays a timeline of today's tracked carbon-emission entries. Each entry
 * can be marked as acknowledged, skipped (excluded from the total), or deleted.
 */
export default function TodayFootprint() {
  const [footprints, setFootprints] = useState<Footprint[]>(INITIAL_FOOTPRINTS)

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleMark = (id: string) => {
    setFootprints((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'marked' } : f)),
    )
  }

  const handleSkip = (id: string) => {
    setFootprints((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'skipped' } : f)),
    )
  }

  const handleDelete = (id: string) => {
    setFootprints((prev) => prev.filter((f) => f.id !== id))
  }

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  /** Sum of kgCO2 for all non-skipped entries. */
  const totalCO2 = footprints
    .filter((f) => f.status !== 'skipped')
    .reduce((sum, f) => sum + f.kgCO2, 0)

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Card className="p-6 bg-card border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Today's Emissions</h3>
          <p
            className="text-2xl font-bold text-primary mt-1"
            aria-live="polite"
            aria-atomic="true"
            aria-label={`Today's total: ${totalCO2.toFixed(1)} kilograms CO2`}
          >
            {totalCO2.toFixed(1)} kg CO₂
          </p>
        </div>
      </div>

      {footprints.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No emissions tracked yet today
        </p>
      ) : (
        <ul className="space-y-3" aria-label="Today's emission entries">
          {footprints.map((footprint) => (
            <li
              key={footprint.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition ${
                footprint.status === 'skipped'
                  ? 'bg-muted/50 border-border/50 opacity-50'
                  : 'bg-sidebar-accent/50 border-border'
              }`}
              aria-label={`${footprint.description}, ${footprint.kgCO2} kg CO₂${footprint.status === 'skipped' ? ', skipped' : footprint.status === 'marked' ? ', marked' : ''}`}
            >
              {/* Entry details */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant="secondary"
                    className={CATEGORY_COLORS[footprint.category] ?? 'bg-gray-100'}
                  >
                    {footprint.category}
                  </Badge>
                  {footprint.type === 'receipt' && (
                    <Badge variant="outline">Receipt</Badge>
                  )}
                  {footprint.type === 'passive' && (
                    <Badge variant="outline">Passive</Badge>
                  )}
                </div>
                <p className="text-sm font-medium text-foreground">{footprint.description}</p>
                <time
                  className="text-xs text-muted-foreground mt-1 block"
                  dateTime={footprint.timestamp.toISOString()}
                >
                  {footprint.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
              </div>

              {/* CO2 value + action buttons */}
              <div className="flex items-center gap-2 ml-4">
                <p className="font-semibold text-primary" aria-hidden="true">
                  {footprint.kgCO2} kg CO₂
                </p>

                <div className="flex gap-1" role="group" aria-label={`Actions for ${footprint.description}`}>
                  {footprint.status !== 'marked' && (
                    <Button
                      onClick={() => handleMark(footprint.id)}
                      size="sm"
                      variant="ghost"
                      className="size-8 p-0"
                      aria-label={`Mark "${footprint.description}" as acknowledged`}
                      type="button"
                    >
                      <Check className="size-4 text-green-600" aria-hidden="true" />
                    </Button>
                  )}
                  {footprint.status !== 'skipped' && (
                    <Button
                      onClick={() => handleSkip(footprint.id)}
                      size="sm"
                      variant="ghost"
                      className="size-8 p-0"
                      aria-label={`Skip "${footprint.description}" from today's total`}
                      type="button"
                    >
                      <X className="size-4 text-gray-400" aria-hidden="true" />
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDelete(footprint.id)}
                    size="sm"
                    variant="ghost"
                    className="size-8 p-0"
                    aria-label={`Delete "${footprint.description}"`}
                    type="button"
                  >
                    <Trash2 className="size-4 text-destructive" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
