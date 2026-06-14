'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Zap, Bike, Apple, Lightbulb, Leaf } from 'lucide-react'

interface QuickAction {
  id: string
  icon: React.ReactNode
  label: string
  description: string
  kgCO2: number
  color: string
}

export default function QuickTrack() {
  const [trackedToday, setTrackedToday] = useState<string[]>([])

  const quickActions: QuickAction[] = [
    {
      id: 'bike',
      icon: <Bike className="size-6" />,
      label: 'Biked to Work',
      description: 'Instead of driving',
      kgCO2: 2.5,
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      id: 'vegetarian',
      icon: <Apple className="size-6" />,
      label: 'Vegetarian Meal',
      description: 'Skip the meat',
      kgCO2: 1.2,
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      id: 'reusable',
      icon: <Leaf className="size-6" />,
      label: 'Used Reusables',
      description: 'No single-use items',
      kgCO2: 0.8,
      color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    {
      id: 'walk',
      icon: <Lightbulb className="size-6" />,
      label: 'Saved Energy',
      description: 'Lights off unused rooms',
      kgCO2: 0.3,
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
  ]

  const handleQuickTrack = (actionId: string) => {
    if (!trackedToday.includes(actionId)) {
      setTrackedToday([...trackedToday, actionId])
    }
  }

  const totalSaved = trackedToday.reduce((sum, actionId) => {
    const action = quickActions.find(a => a.id === actionId)
    return sum + (action?.kgCO2 || 0)
  }, 0)

  return (
    <Card className="p-6 bg-card border-border">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-1">Quick Track Actions</h3>
        <p className="text-sm text-muted-foreground">Simple daily actions with immediate carbon impact</p>
      </div>

      {trackedToday.length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30">
          <p className="text-sm font-semibold text-green-800 dark:text-green-400">
            Great work! You've saved <span className="text-lg">{totalSaved.toFixed(1)}</span> kg CO₂ today
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {quickActions.map(action => {
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
            >
              <div className="flex items-start gap-3 w-full">
                <div>{action.icon}</div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-sm">{action.label}</p>
                  <p className="text-xs opacity-75">{action.description}</p>
                </div>
                {isTracked && <span className="text-lg">✓</span>}
              </div>
              <p className="text-xs font-medium mt-2 opacity-75">-{action.kgCO2} kg</p>
            </Button>
          )
        })}
      </div>

      <button
        onClick={() => setTrackedToday([])}
        className="mt-4 text-sm text-muted-foreground hover:text-foreground underline"
        aria-label="Clear tracked actions for the day"
      >
        Clear tracked actions
      </button>
    </Card>
  )
}
