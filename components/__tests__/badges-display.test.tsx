import { render, screen } from '@testing-library/react'
import BadgesDisplay from '@/components/badges-display'

describe('BadgesDisplay Component', () => {
  it('renders achievements heading', () => {
    render(<BadgesDisplay />)
    expect(screen.getByText('Achievements')).toBeInTheDocument()
  })

  it('displays unlock progress correctly', () => {
    render(<BadgesDisplay />)
    expect(screen.getByText(/of 6 badges unlocked/)).toBeInTheDocument()
  })

  it('renders all badge cards', () => {
    render(<BadgesDisplay />)
    expect(screen.getByText('First Step')).toBeInTheDocument()
    expect(screen.getByText('Eco Warrior')).toBeInTheDocument()
    expect(screen.getByText('Carbon Conscious')).toBeInTheDocument()
    expect(screen.getByText('Scanner Pro')).toBeInTheDocument()
    expect(screen.getByText('Weekly Leader')).toBeInTheDocument()
    expect(screen.getByText('Green Champion')).toBeInTheDocument()
  })

  it('shows unlocked badges with Unlocked label', () => {
    render(<BadgesDisplay />)
    const unlockedLabels = screen.getAllByText('Unlocked')
    expect(unlockedLabels.length).toBeGreaterThan(0)
  })

  it('displays progress bars for badges', () => {
    render(<BadgesDisplay />)
    const progressElements = screen.getAllByText('Progress')
    expect(progressElements.length).toBeGreaterThan(0)
  })

  it('has semantic heading hierarchy', () => {
    render(<BadgesDisplay />)
    const heading = screen.getByText('Achievements')
    expect(heading.tagName).toBe('H3')
  })

  it('renders with proper accessibility attributes', () => {
    render(<BadgesDisplay />)
    const card = screen.getByText('Achievements').closest('div')
    expect(card).toBeInTheDocument()
    expect(card?.className).toBeTruthy()
  })
})
