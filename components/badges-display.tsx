'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Award, Zap, Leaf, Flame, Star, TrendingDown } from 'lucide-react'

interface AchievementBadge {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  unlocked: boolean
  progress?: number
}

export default function BadgesDisplay() {
  const badges: AchievementBadge[] = [
    {
      id: 'first-scan',
      name: 'First Step',
      description: 'Scan your first receipt',
      icon: <Leaf className="size-6" />,
      unlocked: true,
    },
    {
      id: 'eco-warrior',
      name: 'Eco Warrior',
      description: 'Track 10 emissions entries',
      icon: <Flame className="size-6" />,
      unlocked: true,
      progress: 10,
    },
    {
      id: 'carbon-conscious',
      name: 'Carbon Conscious',
      description: 'Keep daily emissions under 5 kg',
      icon: <TrendingDown className="size-6" />,
      unlocked: false,
      progress: 3,
    },
    {
      id: 'scanner-pro',
      name: 'Scanner Pro',
      description: 'Scan 50 receipts',
      icon: <Zap className="size-6" />,
      unlocked: false,
      progress: 12,
    },
    {
      id: 'weekly-leader',
      name: 'Weekly Leader',
      description: 'Lowest emissions in a week',
      icon: <Star className="size-6" />,
      unlocked: false,
      progress: 1,
    },
    {
      id: 'green-champion',
      name: 'Green Champion',
      description: 'Reach 1000 tracked days',
      icon: <Award className="size-6" />,
      unlocked: false,
      progress: 1,
    },
  ]

  const unlockedCount = badges.filter(b => b.unlocked).length
  const totalCount = badges.length

  return (
    <Card className="p-6 bg-card border-border">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Achievements</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {unlockedCount} of {totalCount} badges unlocked
        </p>
        <div className="w-full bg-muted rounded-full h-2 mt-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {badges.map(badge => (
          <div
            key={badge.id}
            className={`rounded-lg p-4 border transition ${
              badge.unlocked
                ? 'bg-primary/10 border-primary/30 cursor-pointer hover:bg-primary/15'
                : 'bg-muted/50 border-border/50 opacity-60'
            }`}
          >
            <div className="flex items-start gap-3 mb-2">
              <div className={`${badge.unlocked ? 'text-primary' : 'text-muted-foreground'}`}>
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

            {badge.progress !== undefined && (
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">Progress</span>
                  <span className="text-xs font-semibold text-foreground">{badge.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      badge.unlocked ? 'bg-primary' : 'bg-muted-foreground'
                    }`}
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
