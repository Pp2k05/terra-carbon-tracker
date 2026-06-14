import { render, screen, fireEvent, within } from '@testing-library/react'
import QuickTrack from '@/components/quick-track'

describe('QuickTrack Component', () => {
  it('renders quick track heading', () => {
    render(<QuickTrack />)
    expect(screen.getByText('Quick Track Actions')).toBeInTheDocument()
  })

  it('renders all four quick action buttons', () => {
    render(<QuickTrack />)
    expect(screen.getByLabelText(/Biked to Work/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Vegetarian Meal/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Used Reusables/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Saved Energy/)).toBeInTheDocument()
  })

  it('tracks a clicked action and shows savings summary', () => {
    render(<QuickTrack />)
    const bikeButton = screen.getByLabelText(/Biked to Work/)
    fireEvent.click(bikeButton)

    const status = screen.getByRole('status')
    expect(within(status).getByText(/You've saved/)).toBeInTheDocument()
    expect(within(status).getByText(/2\.5/)).toBeInTheDocument()
  })

  it('accumulates CO2 savings across multiple actions', () => {
    render(<QuickTrack />)
    fireEvent.click(screen.getByLabelText(/Biked to Work/))
    fireEvent.click(screen.getByLabelText(/Vegetarian Meal/))

    // 2.5 + 1.2 = 3.7
    expect(screen.getByText(/3\.7/)).toBeInTheDocument()
  })

  it('shows checkmark indicator on tracked action button', () => {
    render(<QuickTrack />)
    const bikeButton = screen.getByLabelText(/Biked to Work/)
    fireEvent.click(bikeButton)
    // The ✓ character appears inside the button
    expect(screen.getByText('✓')).toBeInTheDocument()
  })

  it('disables a button once the action is tracked', () => {
    render(<QuickTrack />)
    const bikeButton = screen.getByLabelText(/Biked to Work/)
    fireEvent.click(bikeButton)
    expect(bikeButton).toBeDisabled()
  })

  it('sets aria-pressed=true on a tracked button', () => {
    render(<QuickTrack />)
    const bikeButton = screen.getByLabelText(/Biked to Work/)
    fireEvent.click(bikeButton)
    expect(bikeButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('each action button has a descriptive aria-label', () => {
    render(<QuickTrack />)
    const actionGroup = screen.getByRole('group', { name: /quick track actions/i })
    const buttons = within(actionGroup).getAllByRole('button')
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('aria-label')
    })
  })

  it('clears tracked actions when clear button is clicked', () => {
    render(<QuickTrack />)
    fireEvent.click(screen.getByLabelText(/Biked to Work/))
    expect(screen.getByRole('status')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /clear all tracked actions/i }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('clear button has a descriptive aria-label', () => {
    render(<QuickTrack />)
    const clearButton = screen.getByRole('button', { name: /clear all tracked actions/i })
    expect(clearButton).toBeInTheDocument()
  })
})
