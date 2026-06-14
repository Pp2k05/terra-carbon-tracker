'use client'

import { BarChart3, Calendar, Trophy, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'timeline', label: 'Today', icon: Calendar },
  { id: 'trends', label: 'Trends', icon: BarChart3 },
  { id: 'badges', label: 'Badges', icon: Trophy },
] as const

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Sidebar
 *
 * Primary navigation panel. Highlights the active tab and communicates the
 * current page to assistive technologies via `aria-current="page"`.
 */
export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside
      className="w-64 border-r border-border bg-sidebar flex flex-col"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div
            className="size-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold"
            aria-hidden="true"
          >
            T
          </div>
          <div>
            <p className="font-bold text-foreground">TERRA</p>
            <p className="text-xs text-muted-foreground">Carbon Tracker</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2" aria-label="Dashboard sections">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <Button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              variant={isActive ? 'default' : 'ghost'}
              className={`w-full justify-start gap-3 ${
                isActive
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'text-foreground hover:bg-sidebar-accent'
              }`}
              aria-current={isActive ? 'page' : undefined}
              type="button"
            >
              <Icon className="size-5" aria-hidden="true" />
              <span>{item.label}</span>
            </Button>
          )
        })}
      </nav>

      {/* Footer hint */}
      <div className="p-4 border-t border-border bg-sidebar-accent/50">
        <p className="text-xs text-muted-foreground text-center">
          Every scan makes a difference
        </p>
      </div>
    </aside>
  )
}
