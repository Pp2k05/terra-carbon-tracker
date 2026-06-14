'use client'

import { BarChart3, Calendar, Trophy, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'timeline', label: 'Today', icon: Calendar },
    { id: 'trends', label: 'Trends', icon: BarChart3 },
    { id: 'badges', label: 'Badges', icon: Trophy },
  ]

  return (
    <div className="w-64 border-r border-border bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
            T
          </div>
          <div>
            <p className="font-bold text-foreground">TERRA</p>
            <p className="text-xs text-muted-foreground">Carbon Tracker</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
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
            >
              <Icon className="size-5" />
              <span>{item.label}</span>
            </Button>
          )
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-border bg-sidebar-accent/50">
        <p className="text-xs text-muted-foreground text-center">
          Every scan makes a difference
        </p>
      </div>
    </div>
  )
}
