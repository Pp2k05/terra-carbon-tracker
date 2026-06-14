import { render, screen } from '@testing-library/react'
import TrendsChart from '@/components/trends-chart'

/**
 * Expected 12-week totals derived from the component's seed data.
 * food:        15+12+18+14+16+13+17+15+14+16+18+15 = 183
 * transport:   10+12+8+14+11+9+13+10+12+11+9+13  = 132
 * clothing:    5+3+6+4+7+5+6+4+5+6+7+5           = 63
 * electronics: 2+1+3+2+1+2+3+1+2+1+2+3           = 23
 */
const EXPECTED_TOTALS = {
  food: 183,
  transport: 132,
  clothing: 63,
  electronics: 23,
}

describe('TrendsChart Component', () => {
  it('renders trends chart heading', () => {
    render(<TrendsChart />)
    expect(screen.getByText('Emissions Trends (Past 12 Weeks)')).toBeInTheDocument()
  })

  it('has semantic heading hierarchy (h3)', () => {
    render(<TrendsChart />)
    const heading = screen.getByText('Emissions Trends (Past 12 Weeks)')
    expect(heading.tagName).toBe('H3')
  })

  it('displays a descriptive subtitle', () => {
    render(<TrendsChart />)
    expect(screen.getByText(/Track your carbon footprint over time/)).toBeInTheDocument()
  })

  it('displays all category labels', () => {
    render(<TrendsChart />)
    expect(screen.getByText('Food & Drink')).toBeInTheDocument()
    expect(screen.getByText('Transport')).toBeInTheDocument()
    expect(screen.getByText('Clothing')).toBeInTheDocument()
    expect(screen.getByText('Electronics')).toBeInTheDocument()
  })

  it('shows correct total for food category', () => {
    render(<TrendsChart />)
    expect(screen.getByText(`${EXPECTED_TOTALS.food} kg`)).toBeInTheDocument()
  })

  it('shows correct total for transport category', () => {
    render(<TrendsChart />)
    expect(screen.getByText(`${EXPECTED_TOTALS.transport} kg`)).toBeInTheDocument()
  })

  it('shows correct total for clothing category', () => {
    render(<TrendsChart />)
    expect(screen.getByText(`${EXPECTED_TOTALS.clothing} kg`)).toBeInTheDocument()
  })

  it('shows correct total for electronics category', () => {
    render(<TrendsChart />)
    expect(screen.getByText(`${EXPECTED_TOTALS.electronics} kg`)).toBeInTheDocument()
  })

  it('renders chart container with expected dimensions class', () => {
    const { container } = render(<TrendsChart />)
    const chartContainer = container.querySelector('.w-full.h-80')
    expect(chartContainer).toBeInTheDocument()
  })

  it('renders statistics grid', () => {
    const { container } = render(<TrendsChart />)
    const grid = container.querySelector('.grid.grid-cols-4')
    expect(grid).toBeInTheDocument()
  })

  it('uses colour-coded background classes for each category stat', () => {
    const { container } = render(<TrendsChart />)
    // Each stat tile has a bg-* colour class
    const tiles = container.querySelectorAll('[class*="bg-"][class*="/10"]')
    expect(tiles.length).toBeGreaterThanOrEqual(4)
  })
})
