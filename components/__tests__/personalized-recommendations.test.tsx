import { render, screen } from '@testing-library/react'
import PersonalizedRecommendations from '@/components/personalized-recommendations'

describe('PersonalizedRecommendations Component', () => {
  it('renders recommendations heading', () => {
    render(<PersonalizedRecommendations />)
    expect(screen.getByText('Personalized Recommendations')).toBeInTheDocument()
  })

  it('displays all recommendations', () => {
    render(<PersonalizedRecommendations />)
    expect(screen.getByText('Reduce Food Waste')).toBeInTheDocument()
    expect(screen.getByText('Carpool More Often')).toBeInTheDocument()
    expect(screen.getByText('Buy Second-Hand')).toBeInTheDocument()
  })

  it('shows difficulty levels', () => {
    render(<PersonalizedRecommendations />)
    expect(screen.getByText('Easy')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('Hard')).toBeInTheDocument()
  })

  it('displays impact for each recommendation', () => {
    render(<PersonalizedRecommendations />)
    expect(screen.getByText(/2-3 kg CO₂\/month/)).toBeInTheDocument()
    expect(screen.getByText(/5-8 kg CO₂\/month/)).toBeInTheDocument()
  })

  it('has learn more buttons', () => {
    render(<PersonalizedRecommendations />)
    const buttons = screen.getAllByText('Learn More')
    expect(buttons.length).toBe(3)
  })

  it('has accessible article structure', () => {
    const { container } = render(<PersonalizedRecommendations />)
    const articles = container.querySelectorAll('[role="article"]')
    expect(articles.length).toBe(3)
  })

  it('includes helpful tip section', () => {
    render(<PersonalizedRecommendations />)
    expect(screen.getByText(/Small actions compound/)).toBeInTheDocument()
  })

  it('has accessible learn more buttons', () => {
    render(<PersonalizedRecommendations />)
    const buttons = screen.getAllByLabelText(/Learn more about:/)
    expect(buttons.length).toBe(3)
  })
})
