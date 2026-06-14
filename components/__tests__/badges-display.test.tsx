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

  it('displays progress bars for locked badges', () => {
    render(<BadgesDisplay />)
    const progressElements = screen.getAllByText('Progress')
    expect(progressElements.length).toBeGreaterThan(0)
  })

  it('overall progress bar has correct ARIA attributes', () => {
    render(<BadgesDisplay />)
    const progressbars = screen.getAllByRole('progressbar')
    // First progressbar is the overall one
    const overall = progressbars[0]
    expect(overall).toHaveAttribute('aria-valuenow')
    expect(overall).toHaveAttribute('aria-valuemin', '0')
    expect(overall).toHaveAttribute('aria-valuemax', '100')
    expect(overall).toHaveAttribute('aria-label')
  })

  it('per-badge progress bars have correct ARIA attributes', () => {
    render(<BadgesDisplay />)
    const progressbars = screen.getAllByRole('progressbar')
    // There should be more than 1 progressbar (overall + per-badge)
    expect(progressbars.length).toBeGreaterThan(1)
    progressbars.forEach((bar) => {
      expect(bar).toHaveAttribute('aria-valuenow')
      expect(bar).toHaveAttribute('aria-valuemin', '0')
      expect(bar).toHaveAttribute('aria-valuemax', '100')
    })
  })

  it('has semantic heading hierarchy', () => {
    render(<BadgesDisplay />)
    const heading = screen.getByText('Achievements')
    expect(heading.tagName).toBe('H3')
  })

  it('renders badge grid as a list with correct ARIA label', () => {
    render(<BadgesDisplay />)
    const badgeList = screen.getByRole('list', { name: /achievement badges/i })
    expect(badgeList).toBeInTheDocument()
  })

  it('each badge card has an accessible listitem role', () => {
    render(<BadgesDisplay />)
    const items = screen.getAllByRole('listitem')
    expect(items.length).toBe(6)
  })
})
