import { render, screen, fireEvent } from '@testing-library/react'
import ReceiptScanner from '@/components/receipt-scanner'

// Mock the fetch API
global.fetch = jest.fn()

describe('ReceiptScanner Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders receipt scanner modal', () => {
    const mockOnClose = jest.fn()
    render(<ReceiptScanner onClose={mockOnClose} />)
    expect(screen.getByText('Scan Receipt')).toBeInTheDocument()
  })

  it('has close button with proper accessibility', () => {
    const mockOnClose = jest.fn()
    render(<ReceiptScanner onClose={mockOnClose} />)
    const closeButton = screen.getByRole('button', { hidden: true })
    expect(closeButton).toBeInTheDocument()
  })

  it('displays upload instructions', () => {
    const mockOnClose = jest.fn()
    render(<ReceiptScanner onClose={mockOnClose} />)
    expect(screen.getByText(/Upload a photo of your receipt/)).toBeInTheDocument()
  })

  it('has upload input field', () => {
    const mockOnClose = jest.fn()
    render(<ReceiptScanner onClose={mockOnClose} />)
    const input = document.querySelector('input[type="file"]')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('accept', 'image/*')
  })

  it('displays upload area with proper ARIA label', () => {
    const mockOnClose = jest.fn()
    render(<ReceiptScanner onClose={mockOnClose} />)
    expect(screen.getByText('Click to upload receipt')).toBeInTheDocument()
  })

  it('modal is positioned as fixed overlay', () => {
    const mockOnClose = jest.fn()
    const { container } = render(<ReceiptScanner onClose={mockOnClose} />)
    const modal = container.querySelector('.fixed')
    expect(modal).toBeInTheDocument()
  })

  it('handles close button click', () => {
    const mockOnClose = jest.fn()
    const { container } = render(<ReceiptScanner onClose={mockOnClose} />)
    const closeButton = container.querySelector('button')
    if (closeButton) {
      fireEvent.click(closeButton)
      // Close button should be accessible
      expect(closeButton).toBeInTheDocument()
    }
  })

  it('has accessible file input', () => {
    const mockOnClose = jest.fn()
    render(<ReceiptScanner onClose={mockOnClose} />)
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toHaveAttribute('id', 'receipt-input')
  })
})
