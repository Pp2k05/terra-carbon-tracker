import { render, screen, fireEvent } from '@testing-library/react'
import ReceiptScanner from '@/components/receipt-scanner'

// Mock the fetch API
global.fetch = jest.fn()

describe('ReceiptScanner Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders receipt scanner modal with dialog role', () => {
    const mockOnClose = jest.fn()
    render(<ReceiptScanner onClose={mockOnClose} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Scan Receipt')).toBeInTheDocument()
  })

  it('has a labelled dialog with aria-labelledby', () => {
    const mockOnClose = jest.fn()
    render(<ReceiptScanner onClose={mockOnClose} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-labelledby', 'receipt-scanner-title')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('close button has a descriptive aria-label', () => {
    const mockOnClose = jest.fn()
    render(<ReceiptScanner onClose={mockOnClose} />)
    const closeButton = screen.getByRole('button', { name: /close receipt scanner/i })
    expect(closeButton).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const mockOnClose = jest.fn()
    render(<ReceiptScanner onClose={mockOnClose} />)
    const closeButton = screen.getByRole('button', { name: /close receipt scanner/i })
    fireEvent.click(closeButton)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('displays upload instructions', () => {
    const mockOnClose = jest.fn()
    render(<ReceiptScanner onClose={mockOnClose} />)
    expect(screen.getByText(/Upload a photo of your receipt/)).toBeInTheDocument()
  })

  it('upload area is a label element linked to the file input', () => {
    const mockOnClose = jest.fn()
    const { container } = render(<ReceiptScanner onClose={mockOnClose} />)
    const label = container.querySelector('label[for="receipt-input"]')
    expect(label).toBeInTheDocument()
  })

  it('file input has the correct id, accept and aria-label attributes', () => {
    const mockOnClose = jest.fn()
    render(<ReceiptScanner onClose={mockOnClose} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('id', 'receipt-input')
    expect(input).toHaveAttribute('accept')
    expect(input).toHaveAttribute('aria-label', 'Upload receipt image')
  })

  it('file input only accepts image types', () => {
    const mockOnClose = jest.fn()
    render(<ReceiptScanner onClose={mockOnClose} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const accept = input.getAttribute('accept') ?? ''
    expect(accept).toContain('image/')
  })

  it('modal is positioned as fixed overlay', () => {
    const mockOnClose = jest.fn()
    const { container } = render(<ReceiptScanner onClose={mockOnClose} />)
    const modal = container.querySelector('.fixed')
    expect(modal).toBeInTheDocument()
  })

  it('shows file size error when an oversized file is selected', () => {
    const mockOnClose = jest.fn()
    render(<ReceiptScanner onClose={mockOnClose} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    // Create a mock file that exceeds 10 MB
    const oversizedFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    })
    Object.defineProperty(input, 'files', {
      value: [oversizedFile],
      configurable: true,
    })
    fireEvent.change(input)

    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    // The error message (not the upload hint) should reference the size limit
    expect(alert.textContent).toMatch(/10 MB/i)
  })


  it('shows mime type error when a non-image file is selected', () => {
    const mockOnClose = jest.fn()
    render(<ReceiptScanner onClose={mockOnClose} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const pdfFile = new File(['%PDF-1.4'], 'receipt.pdf', { type: 'application/pdf' })
    Object.defineProperty(input, 'files', {
      value: [pdfFile],
      configurable: true,
    })
    fireEvent.change(input)

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/supported/i)).toBeInTheDocument()
  })
})
