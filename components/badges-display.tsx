'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Award, Zap, Leaf, Flame, Star, TrendingDown } from 'lucide-react'
import type { ReactNode } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AchievementBadge {
  id: string
  name: string
  description: string
  icon: ReactNode
  unlocked: boolean
  /**
   * Completion percentage (0–100). Omit for badges with no measurable progress
   * or for fully unlocked badges where progress is implicitly 100.
   */
  progress?: number
  /** Human-readable max for aria-label purposes (e.g. "10 entries"). */
  progressLabel?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * BadgesDisplay
 *
 * Shows all achievement badges the user can earn, with a progress bar for
 * each in-progress badge. Fully unlocked badges are highlighted and labelled.
 */
export default function BadgesDisplay() {
  const badges: AchievementBadge[] = [
    {
      id: 'first-scan',
      name: 'First Step',
      description: 'Scan your first receipt',
      icon: <Leaf className="size-6" aria-hidden="true" />,
      unlocked: true,
    },
    {
      id: 'eco-warrior',
      name: 'Eco Warrior',
      description: 'Track 10 emissions entries',
      icon: <Flame className="size-6" aria-hidden="true" />,
      unlocked: true,
      progress: 100,
      progressLabel: '10 / 10 entries',
    },
    {
      id: 'carbon-conscious',
      name: 'Carbon Conscious',
      description: 'Keep daily emissions under 5 kg',
      icon: <TrendingDown className="size-6" aria-hidden="true" />,
      unlocked: false,
      progress: 3,
      progressLabel: '3 / 100 days',
    },
    {
      id: 'scanner-pro',
      name: 'Scanner Pro',
      description: 'Scan 50 receipts',
      icon: <Zap className="size-6" aria-hidden="true" />,
      unlocked: false,
      progress: 24,
      progressLabel: '12 / 50 receipts',
    },
    {
      id: 'weekly-leader',
      name: 'Weekly Leader',
      description: 'Lowest emissions in a week',
      icon: <Star className="size-6" aria-hidden="true" />,
      unlocked: false,
      progress: 1,
      progressLabel: '1 qualifying week',
    },
    {
      id: 'green-champion',
      name: 'Green Champion',
      description: 'Reach 1 000 tracked days',
      icon: <Award className="size-6" aria-hidden="true" />,
      unlocked: false,
      progress: 1,
      progressLabel: '1 / 1000 days',
    },
  ]

  const unlockedCount = badges.filter((b) => b.unlocked).length
  const totalCount = badges.length
  const overallProgress = Math.round((unlockedCount / totalCount) * 100)

  return (
    <Card className="p-6 bg-card border-border">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Achievements</h3>
        <p className="text-sm text-muted-foreground mt-1" aria-live="polite">
          {unlockedCount} of {totalCount} badges unlocked
        </p>

        {/* Overall progress bar */}
        <div
          className="w-full bg-muted rounded-full h-2 mt-2"
          role="progressbar"
          aria-valuenow={overallProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Overall badge progress: ${unlockedCount} of ${totalCount} unlocked`}
        >
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-2 gap-3" role="list" aria-label="Achievement badges">
        {badges.map((badge) => (
          <div
            key={badge.id}
            role="listitem"
            aria-label={`${badge.name}: ${badge.description}${badge.unlocked ? ' — Unlocked' : ''}`}
            className={`rounded-lg p-4 border transition ${
              badge.unlocked
                ? 'bg-primary/10 border-primary/30 cursor-pointer hover:bg-primary/15'
                : 'bg-muted/50 border-border/50 opacity-60'
            }`}
          >
            <div className="flex items-start gap-3 mb-2">
              <div className={badge.unlocked ? 'text-primary' : 'text-muted-foreground'}>
                {badge.icon}
              </div>
              {badge.unlocked && (
                <Badge variant="secondary" className="ml-auto">
                  Unlocked
                </Badge>
              )}
            </div>

            <h4 className="font-semibold text-sm text-foreground">{badge.name}</h4>
            <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>

            {/* Per-badge progress bar */}
            {badge.progress !== undefined && !badge.unlocked && (
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">Progress</span>
                  <span className="text-xs font-semibold text-foreground">{badge.progress}%</span>
                </div>
                <div
                  className="w-full bg-muted rounded-full h-1.5"
                  role="progressbar"
                  aria-valuenow={badge.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${badge.name} progress: ${badge.progressLabel ?? `${badge.progress}%`}`}
                >
                  <div
                    className="h-1.5 rounded-full transition-all bg-muted-foreground"
                    style={{ width: `${badge.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
