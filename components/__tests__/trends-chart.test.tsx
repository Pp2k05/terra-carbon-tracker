import { render, screen } from '@testing-library/react'
import TrendsChart from '@/components/trends-chart'

describe('TrendsChart Component', () => {
  it('renders trends chart heading', () => {
    render(<TrendsChart />)
    expect(screen.getByText('Emissions Trends (Past 12 Weeks)')).toBeInTheDocument()
  })

  it('displays category statistics', () => {
    render(<TrendsChart />)
    expect(screen.getByText('Food & Drink')).toBeInTheDocument()
    expect(screen.getByText('Transport')).toBeInTheDocument()
    expect(screen.getByText('Clothing')).toBeInTheDocument()
    expect(screen.getByText('Electronics')).toBeInTheDocument()
  })

  it('shows CO2 totals for each category', () => {
    render(<TrendsChart />)
    const kgLabels = screen.getAllByText(/kg/)
    expect(kgLabels.length).toBeGreaterThan(0)
  })

  it('renders chart container', () => {
    const { container } = render(<TrendsChart />)
    const chartContainer = container.querySelector('.w-full.h-80')
    expect(chartContainer).toBeInTheDocument()
  })

  it('has semantic heading hierarchy', () => {
    render(<TrendsChart />)
    const heading = screen.getByText('Emissions Trends (Past 12 Weeks)')
    expect(heading.tagName).toBe('H3')
  })

  it('displays descriptive subtitle', () => {
    render(<TrendsChart />)
    expect(screen.getByText(/Track your carbon footprint over time/)).toBeInTheDocument()
  })

  it('has accessible statistics grid', () => {
    const { container } = render(<TrendsChart />)
    const grid = container.querySelector('.grid.grid-cols-4')
    expect(grid).toBeInTheDocument()
  })

  it('uses proper color coding for categories', () => {
    const { container } = render(<TrendsChart />)
    const stats = container.querySelectorAll('[class*="bg-"]')
    expect(stats.length).toBeGreaterThan(0)
  })
})
