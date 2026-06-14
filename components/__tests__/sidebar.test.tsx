import { render, screen, fireEvent } from '@testing-library/react'
import Sidebar from '@/components/sidebar'

describe('Sidebar Component', () => {
  const mockOnTabChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the TERRA brand name', () => {
    render(<Sidebar activeTab="overview" onTabChange={mockOnTabChange} />)
    expect(screen.getByText('TERRA')).toBeInTheDocument()
  })

  it('renders all four navigation items', () => {
    render(<Sidebar activeTab="overview" onTabChange={mockOnTabChange} />)
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByText('Trends')).toBeInTheDocument()
    expect(screen.getByText('Badges')).toBeInTheDocument()
  })

  it('renders as an <aside> landmark element', () => {
    render(<Sidebar activeTab="overview" onTabChange={mockOnTabChange} />)
    expect(screen.getByRole('complementary')).toBeInTheDocument()
  })

  it('has accessible aria-label on the landmark', () => {
    render(<Sidebar activeTab="overview" onTabChange={mockOnTabChange} />)
    const aside = screen.getByRole('complementary')
    expect(aside).toHaveAttribute('aria-label', 'Main navigation')
  })

  it('sets aria-current="page" on the active tab', () => {
    render(<Sidebar activeTab="trends" onTabChange={mockOnTabChange} />)
    const trendsButton = screen.getByRole('button', { name: /trends/i })
    expect(trendsButton).toHaveAttribute('aria-current', 'page')
  })

  it('does NOT set aria-current on inactive tabs', () => {
    render(<Sidebar activeTab="overview" onTabChange={mockOnTabChange} />)
    const todayButton = screen.getByRole('button', { name: /today/i })
    expect(todayButton).not.toHaveAttribute('aria-current')
  })

  it('calls onTabChange with the correct tab id when a nav button is clicked', () => {
    render(<Sidebar activeTab="overview" onTabChange={mockOnTabChange} />)
    fireEvent.click(screen.getByRole('button', { name: /badges/i }))
    expect(mockOnTabChange).toHaveBeenCalledWith('badges')
  })

  it('renders the motivational footer message', () => {
    render(<Sidebar activeTab="overview" onTabChange={mockOnTabChange} />)
    expect(screen.getByText(/every scan makes a difference/i)).toBeInTheDocument()
  })
})
