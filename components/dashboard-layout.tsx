'use client'

import { useState } from 'react'
import { LogOut, Plus, TrendingUp, Award } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Sidebar from '@/components/sidebar'
import TodayFootprint from '@/components/today-footprint'
import TrendsChart from '@/components/trends-chart'
import BadgesDisplay from '@/components/badges-display'
import ReceiptScanner from '@/components/receipt-scanner'

export default function DashboardLayout() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showScanner, setShowScanner] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await authClient.signOut()
    router.push('/sign-in')
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border bg-card p-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">TERRA</h1>
            <p className="text-sm text-muted-foreground">Carbon Footprint Tracker</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowScanner(true)}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Plus className="size-4" />
              Scan Receipt
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <LogOut className="size-4" />
              Sign Out
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {showScanner && (
            <ReceiptScanner onClose={() => setShowScanner(false)} />
          )}

          {!showScanner && activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6 bg-card border-border">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Today's Emissions</p>
                      <p className="text-3xl font-bold text-primary mt-2">0 kg</p>
                    </div>
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="size-5 text-primary" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-card border-border">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Weekly Average</p>
                      <p className="text-3xl font-bold text-accent mt-2">0 kg</p>
                    </div>
                    <div className="size-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <TrendingUp className="size-5 text-accent" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-card border-border">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Badges Earned</p>
                      <p className="text-3xl font-bold text-secondary mt-2">0</p>
                    </div>
                    <div className="size-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Award className="size-5 text-secondary" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Main Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <TodayFootprint />
                </div>
                <div>
                  <BadgesDisplay />
                </div>
              </div>

              {/* Trends */}
              <div>
                <TrendsChart />
              </div>
            </div>
          )}

          {!showScanner && activeTab === 'timeline' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Today's Footprint</h2>
              <TodayFootprint />
            </div>
          )}

          {!showScanner && activeTab === 'trends' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Trends & Analytics</h2>
              <TrendsChart />
            </div>
          )}

          {!showScanner && activeTab === 'badges' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Achievements</h2>
              <BadgesDisplay />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
