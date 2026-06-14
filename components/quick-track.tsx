'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Zap, Bike, Apple, Lightbulb, Leaf } from 'lucide-react'
import type { ReactNode } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QuickAction {
  id: string
  icon: ReactNode
  label: string
  description: string
  /** CO₂ savings in kg when this action is performed. */
  kgCO2: number
  color: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'bike',
    icon: <Bike className="size-6" aria-hidden="true" />,
    label: 'Biked to Work',
    description: 'Instead of driving',
    kgCO2: 2.5,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  {
    id: 'vegetarian',
    icon: <Apple className="size-6" aria-hidden="true" />,
    label: 'Vegetarian Meal',
    description: 'Skip the meat',
    kgCO2: 1.2,
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  {
    id: 'reusable',
    icon: <Leaf className="size-6" aria-hidden="true" />,
    label: 'Used Reusables',
    description: 'No single-use items',
    kgCO2: 0.8,
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  {
    id: 'energy',
    icon: <Lightbulb className="size-6" aria-hidden="true" />,
    label: 'Saved Energy',
    description: 'Lights off unused rooms',
    kgCO2: 0.3,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * QuickTrack
 *
 * Allows users to log common low-carbon actions with a single click,
 * accumulating CO₂ savings for the day.
 */
export default function QuickTrack() {
  const [trackedToday, setTrackedToday] = useState<string[]>([])

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleQuickTrack = (actionId: string) => {
    if (!trackedToday.includes(actionId)) {
      setTrackedToday((prev) => [...prev, actionId])
    }
  }

  const handleClear = () => {
    setTrackedToday([])
  }

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  const totalSaved = trackedToday.reduce((sum, actionId) => {
    const action = QUICK_ACTIONS.find((a) => a.id === actionId)
    return sum + (action?.kgCO2 ?? 0)
  }, 0)

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Card className="p-6 bg-card border-border">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-1">Quick Track Actions</h3>
        <p className="text-sm text-muted-foreground">
          Simple daily actions with immediate carbon impact
        </p>
      </div>

      {/* Savings summary */}
      {trackedToday.length > 0 && (
        <div
          className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="text-sm font-semibold text-green-800 dark:text-green-400">
            Great work! You&apos;ve saved{' '}
            <span className="text-lg">{totalSaved.toFixed(1)}</span> kg CO₂ today
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3" role="group" aria-label="Quick track actions">
        {QUICK_ACTIONS.map((action) => {
          const isTracked = trackedToday.includes(action.id)
          return (
            <Button
              key={action.id}
              onClick={() => handleQuickTrack(action.id)}
              disabled={isTracked}
              className={`h-auto flex flex-col items-start p-4 rounded-lg border transition ${
                isTracked
                  ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-900/50 opacity-75'
                  : `${action.color} border-transparent hover:opacity-80`
              }`}
              aria-pressed={isTracked}
              aria-label={`Log ${action.label}: ${action.description}, saves ${action.kgCO2} kg CO₂`}
              type="button"
            >
              <div className="flex items-start gap-3 w-full">
                <div>{action.icon}</div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-sm">{action.label}</p>
                  <p className="text-xs opacity-75">{action.description}</p>
                </div>
                {isTracked && (
                  <span className="text-lg" aria-hidden="true">
                    ✓
                  </span>
                )}
              </div>
              <p className="text-xs font-medium mt-2 opacity-75">-{action.kgCO2} kg</p>
            </Button>
          )
        })}
      </div>

      {/* Clear button */}
      <button
        onClick={handleClear}
        type="button"
        className="mt-4 text-sm text-muted-foreground hover:text-foreground underline"
        aria-label="Clear all tracked actions for today"
      >
        Clear tracked actions
      </button>
    </Card>
  )
}
