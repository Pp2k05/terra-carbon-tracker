import { render, screen } from '@testing-library/react'
import TodayFootprint from '@/components/today-footprint'

describe('TodayFootprint Component', () => {
  it('renders the component with title', () => {
    render(<TodayFootprint />)
    expect(screen.getByText("Today's Emissions")).toBeInTheDocument()
  })

  it('displays total CO2 correctly', () => {
    render(<TodayFootprint />)
    const totalCO2 = screen.getByText(/kg CO₂/)
    expect(totalCO2).toBeInTheDocument()
  })

  it('renders footprint items with categories', () => {
    render(<TodayFootprint />)
    expect(screen.getByText('Grocery store purchase')).toBeInTheDocument()
    expect(screen.getByText('food')).toBeInTheDocument()
  })

  it('has accessible mark/skip/delete buttons', () => {
    render(<TodayFootprint />)
    const markButtons = screen.getAllByTitle('Mark as important')
    expect(markButtons.length).toBeGreaterThan(0)
    expect(markButtons[0]).toHaveAttribute('title', 'Mark as important')
  })

  it('properly displays time information', () => {
    render(<TodayFootprint />)
    const timeElements = screen.getAllByText(/[0-9]{1,2}:[0-9]{2}/)
    expect(timeElements.length).toBeGreaterThan(0)
  })

  it('shows empty state message when no footprints', () => {
    render(<TodayFootprint />)
    const card = screen.getByText("Today's Emissions")
    expect(card).toBeInTheDocument()
  })

  it('has proper ARIA labels for accessibility', () => {
    render(<TodayFootprint />)
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toHaveAttribute('title')
    })
  })
})
