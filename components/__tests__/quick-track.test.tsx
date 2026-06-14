import { render, screen, fireEvent } from '@testing-library/react'
import QuickTrack from '@/components/quick-track'

describe('QuickTrack Component', () => {
  it('renders quick track actions', () => {
    render(<QuickTrack />)
    expect(screen.getByText('Quick Track Actions')).toBeInTheDocument()
    expect(screen.getByText('Biked to Work')).toBeInTheDocument()
    expect(screen.getByText('Vegetarian Meal')).toBeInTheDocument()
  })

  it('tracks clicked actions', () => {
    render(<QuickTrack />)
    const bikeButton = screen.getByLabelText(/Biked to Work/)
    fireEvent.click(bikeButton)
    
    expect(screen.getByText(/You've saved/)).toBeInTheDocument()
    const savedAmounts = screen.getAllByText(/2.5/)
    expect(savedAmounts.length).toBeGreaterThan(0)
  })

  it('accumulates CO2 savings', () => {
    render(<QuickTrack />)
    const bikeButton = screen.getByLabelText(/Biked to Work/)
    const vegetarianButton = screen.getByLabelText(/Vegetarian Meal/)
    
    fireEvent.click(bikeButton)
    fireEvent.click(vegetarianButton)
    
    expect(screen.getByText(/You've saved/)).toBeInTheDocument()
    // 2.5 + 1.2 = 3.7
    expect(screen.getByText(/3.7/)).toBeInTheDocument()
  })

  it('shows checkmark on tracked actions', () => {
    render(<QuickTrack />)
    const bikeButton = screen.getByLabelText(/Biked to Work/)
    fireEvent.click(bikeButton)
    
    expect(screen.getByText('✓')).toBeInTheDocument()
  })

  it('has accessible action buttons', () => {
    render(<QuickTrack />)
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-label') || expect(button).toHaveAttribute('aria-pressed')
    })
  })

  it('clear tracked actions', () => {
    render(<QuickTrack />)
    const bikeButton = screen.getByLabelText(/Biked to Work/)
    fireEvent.click(bikeButton)
    
    expect(screen.getByText(/You've saved/)).toBeInTheDocument()
    
    const clearButton = screen.getByLabelText(/Clear tracked actions/)
    fireEvent.click(clearButton)
    
    expect(screen.queryByText(/You've saved/)).not.toBeInTheDocument()
  })
})
