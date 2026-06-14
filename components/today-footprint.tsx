'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, Check, X } from 'lucide-react'

interface Footprint {
  id: string
  type: 'receipt' | 'manual' | 'passive'
  category: string
  kgCO2: number
  description: string
  timestamp: Date
  status?: 'marked' | 'skipped'
}

export default function TodayFootprint() {
  const [footprints, setFootprints] = useState<Footprint[]>([
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
  ])

  const handleMark = (id: string) => {
    setFootprints(prev =>
      prev.map(f => f.id === id ? { ...f, status: 'marked' } : f)
    )
  }

  const handleSkip = (id: string) => {
    setFootprints(prev =>
      prev.map(f => f.id === id ? { ...f, status: 'skipped' } : f)
    )
  }

  const handleDelete = (id: string) => {
    setFootprints(prev => prev.filter(f => f.id !== id))
  }

  const totalCO2 = footprints
    .filter(f => f.status !== 'skipped')
    .reduce((sum, f) => sum + f.kgCO2, 0)

  const categoryColors: Record<string, string> = {
    food: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    transport: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    clothing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    electronics: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    household: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
  }

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Today's Emissions</h3>
          <p className="text-2xl font-bold text-primary mt-1">{totalCO2.toFixed(1)} kg CO₂</p>
        </div>
      </div>

      {footprints.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No emissions tracked yet today</p>
      ) : (
        <div className="space-y-3">
          {footprints.map(footprint => (
            <div
              key={footprint.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition ${
                footprint.status === 'skipped'
                  ? 'bg-muted/50 border-border/50 opacity-50'
                  : 'bg-sidebar-accent/50 border-border'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant="secondary"
                    className={categoryColors[footprint.category] || 'bg-gray-100'}
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
                <p className="text-xs text-muted-foreground mt-1">
                  {footprint.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <div className="text-right">
                  <p className="font-semibold text-primary">{footprint.kgCO2} kg CO₂</p>
                </div>

                <div className="flex gap-1">
                  {footprint.status !== 'marked' && (
                    <Button
                      onClick={() => handleMark(footprint.id)}
                      size="sm"
                      variant="ghost"
                      className="size-8 p-0"
                      title="Mark as important"
                    >
                      <Check className="size-4 text-green-600" />
                    </Button>
                  )}
                  {footprint.status !== 'skipped' && (
                    <Button
                      onClick={() => handleSkip(footprint.id)}
                      size="sm"
                      variant="ghost"
                      className="size-8 p-0"
                      title="Skip this entry"
                    >
                      <X className="size-4 text-gray-400" />
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDelete(footprint.id)}
                    size="sm"
                    variant="ghost"
                    className="size-8 p-0"
                    title="Delete"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
