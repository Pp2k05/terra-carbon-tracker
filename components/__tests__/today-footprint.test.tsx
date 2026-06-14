import { render, screen, fireEvent } from '@testing-library/react'
import TodayFootprint from '@/components/today-footprint'

describe('TodayFootprint Component', () => {
  it('renders the component with title', () => {
    render(<TodayFootprint />)
    expect(screen.getByText("Today's Emissions")).toBeInTheDocument()
  })

  it('displays total CO2 correctly', () => {
    render(<TodayFootprint />)
    // 2.5 (food, not skipped) + 1.2 (transport, not skipped) = 3.7
    expect(screen.getByText('3.7 kg CO₂')).toBeInTheDocument()
  })

  it('renders footprint items as a list', () => {
    render(<TodayFootprint />)
    const list = screen.getByRole('list', { name: /today's emission entries/i })
    expect(list).toBeInTheDocument()
  })

  it('renders footprint items with categories', () => {
    render(<TodayFootprint />)
    expect(screen.getByText('Grocery store purchase')).toBeInTheDocument()
    expect(screen.getByText('food')).toBeInTheDocument()
  })

  it('has accessible mark buttons with aria-label', () => {
    render(<TodayFootprint />)
    const markButtons = screen.getAllByRole('button', { name: /mark.*as acknowledged/i })
    expect(markButtons.length).toBeGreaterThan(0)
  })

  it('has accessible skip buttons with aria-label', () => {
    render(<TodayFootprint />)
    const skipButtons = screen.getAllByRole('button', { name: /skip.*from today's total/i })
    expect(skipButtons.length).toBeGreaterThan(0)
  })

  it('has accessible delete buttons with aria-label', () => {
    render(<TodayFootprint />)
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    expect(deleteButtons.length).toBeGreaterThan(0)
  })

  it('properly displays time information via <time> elements', () => {
    render(<TodayFootprint />)
    // Timestamps are formatted as HH:MM, e.g. "02:00" or "10:00 AM"
    const timeElements = document.querySelectorAll('time')
    expect(timeElements.length).toBeGreaterThan(0)
    timeElements.forEach((el) => {
      expect(el).toHaveAttribute('dateTime')
    })
  })

  it('marks a footprint as acknowledged when mark button is clicked', () => {
    render(<TodayFootprint />)
    // Initial: two mark buttons visible
    const markButtons = screen.getAllByRole('button', { name: /mark.*as acknowledged/i })
    expect(markButtons.length).toBe(2)
    fireEvent.click(markButtons[0])
    // After marking, that button disappears → only 1 remains
    expect(screen.getAllByRole('button', { name: /mark.*as acknowledged/i })).toHaveLength(1)
  })

  it('skips a footprint when skip button is clicked', () => {
    render(<TodayFootprint />)
    const skipButtons = screen.getAllByRole('button', { name: /skip.*from today's total/i })
    fireEvent.click(skipButtons[0])
    // After skipping, that button disappears → only 1 remains
    expect(screen.getAllByRole('button', { name: /skip.*from today's total/i })).toHaveLength(1)
  })

  it('deletes a footprint when delete button is clicked', () => {
    render(<TodayFootprint />)
    const initialCount = screen.getAllByRole('listitem').length
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    fireEvent.click(deleteButtons[0])
    expect(screen.getAllByRole('listitem')).toHaveLength(initialCount - 1)
  })

  it('shows empty state message when all footprints are deleted', () => {
    render(<TodayFootprint />)
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    deleteButtons.forEach((btn) => fireEvent.click(btn))
    expect(screen.getByText(/No emissions tracked yet today/i)).toBeInTheDocument()
  })
})
