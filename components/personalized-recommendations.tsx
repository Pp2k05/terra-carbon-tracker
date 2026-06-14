'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Zap, Lightbulb, TrendingDown } from 'lucide-react'

interface Recommendation {
  id: string
  title: string
  description: string
  impact: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
}

export default function PersonalizedRecommendations() {
  // Based on user's data patterns
  const recommendations: Recommendation[] = [
    {
      id: '1',
      title: 'Reduce Food Waste',
      description: 'Your food category has the highest emissions. Try meal planning to reduce waste by 20-30%.',
      impact: '2-3 kg CO₂/month',
      difficulty: 'easy',
      category: 'food',
    },
    {
      id: '2',
      title: 'Carpool More Often',
      description: 'Share rides 2x per week to cut transport emissions in half.',
      impact: '5-8 kg CO₂/month',
      difficulty: 'medium',
      category: 'transport',
    },
    {
      id: '3',
      title: 'Buy Second-Hand',
      description: 'Purchasing used clothing reduces manufacturing emissions by 85%.',
      impact: '10-15 kg CO₂/month',
      difficulty: 'hard',
      category: 'clothing',
    },
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'hard':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Lightbulb className="size-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Personalized Recommendations</h3>
          <p className="text-sm text-muted-foreground">Based on your carbon patterns</p>
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.map(rec => (
          <div
            key={rec.id}
            className="rounded-lg border border-border bg-sidebar-accent/30 p-4 hover:bg-sidebar-accent/50 transition"
            role="article"
            aria-labelledby={`rec-title-${rec.id}`}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 id={`rec-title-${rec.id}`} className="font-semibold text-foreground">
                {rec.title}
              </h4>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(rec.difficulty)}`}>
                {rec.difficulty.charAt(0).toUpperCase() + rec.difficulty.slice(1)}
              </span>
            </div>

            <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-primary font-medium">
                <TrendingDown className="size-4" />
                {rec.impact}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                aria-label={`Learn more about: ${rec.title}`}
              >
                Learn More
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-sm text-foreground">
          <span className="font-semibold">💡 Tip:</span> Small actions compound. Adopting just one easy recommendation could save 2-3 kg CO₂ per month!
        </p>
      </div>
    </Card>
  )
}
