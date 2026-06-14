'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, Upload, Loader2 } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Shape of a single item returned by the receipt analysis API. */
interface ReceiptItem {
  item: string
  quantity: number
  price: number
  estimatedCO2: number
}

/** Shape of the full analysis result returned by /api/analyze-receipt. */
interface ReceiptAnalysisResult {
  store: string
  date: string
  items: ReceiptItem[]
  totalPrice: number
  totalEstimatedCO2: number
  category: string
}

interface ReceiptScannerProps {
  onClose: () => void
  onAnalysisComplete?: (data: ReceiptAnalysisResult) => void
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum allowed file size: 10 MB */
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

/** Accepted image MIME types */
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * ReceiptScanner
 *
 * A modal dialog that allows users to upload a receipt image for AI-powered
 * carbon-footprint analysis. Validates file type and size client-side before
 * sending to the server.
 */
export default function ReceiptScanner({ onClose, onAnalysisComplete }: ReceiptScannerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ReceiptAnalysisResult | null>(null)

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  /** Validates, previews, and dispatches analysis for the selected image file. */
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side validation: file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('Image must be 10 MB or smaller. Please choose a smaller file.')
      return
    }

    // Client-side validation: file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError('Only JPEG, PNG, GIF, and WebP images are supported.')
      return
    }

    setError(null)
    setIsLoading(true)

    const reader = new FileReader()

    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      // Strip the "data:image/…;base64," prefix to get the raw base64 string
      const base64 = dataUrl.split(',')[1]
      setPreviewUrl(dataUrl)
      analyzeReceipt(base64)
    }

    reader.onerror = () => {
      setError('Failed to read the image file. Please try again.')
      setIsLoading(false)
    }

    reader.readAsDataURL(file)
  }

  /** Sends the base64-encoded image to the analysis API and updates state. */
  const analyzeReceipt = async (imageBase64: string): Promise<void> => {
    try {
      const response = await fetch('/api/analyze-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 }),
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        throw new Error(data.error ?? 'Analysis failed')
      }

      const data = (await response.json()) as ReceiptAnalysisResult
      setResult(data)
      onAnalysisComplete?.(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyse receipt.'
      setError(`${message} Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  /** Resets the scanner back to the initial upload state. */
  const handleReset = () => {
    setPreviewUrl(null)
    setError(null)
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-scanner-title"
    >
      <Card className="w-full max-w-md bg-card border-border max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 id="receipt-scanner-title" className="text-xl font-bold">
            Scan Receipt
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="size-8 p-0"
            aria-label="Close receipt scanner"
            type="button"
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!result && (
            <>
              {!previewUrl ? (
                <>
                  <p className="text-sm text-muted-foreground" id="receipt-upload-description">
                    Upload a photo of your receipt to analyse its carbon footprint
                  </p>

                  {/* Accessible upload zone: <label> wraps the hidden input so
                      both mouse clicks and keyboard Enter/Space activate it. */}
                  <label
                    htmlFor="receipt-input"
                    className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center gap-3 bg-sidebar-accent/20 cursor-pointer hover:bg-sidebar-accent/30 transition"
                    aria-describedby="receipt-upload-description"
                  >
                    <Upload className="size-8 text-primary" aria-hidden="true" />
                    <div className="text-center">
                      <p className="font-medium text-foreground">Click to upload receipt</p>
                      <p className="text-xs text-muted-foreground">JPEG, PNG, WebP — up to 10 MB</p>
                    </div>
                  </label>

                  <input
                    id="receipt-input"
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(',')}
                    onChange={handleImageSelect}
                    disabled={isLoading}
                    className="sr-only"
                    aria-label="Upload receipt image"
                  />
                </>
              ) : (
                <>
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={previewUrl}
                      alt="Preview of uploaded receipt"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {isLoading ? (
                    <div
                      className="flex items-center justify-center gap-2 text-primary"
                      aria-live="polite"
                      aria-label="Analysing receipt, please wait"
                    >
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      <span className="text-sm">Analysing receipt…</span>
                    </div>
                  ) : (
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      className="w-full"
                      type="button"
                    >
                      Try Another Receipt
                    </Button>
                  )}
                </>
              )}

              {error && (
                <div
                  className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive"
                  role="alert"
                  aria-live="assertive"
                >
                  {error}
                </div>
              )}
            </>
          )}

          {result && (
            <>
              {/* Results */}
              <div className="space-y-3" aria-label="Receipt analysis results">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Store</p>
                  <p className="text-lg font-semibold">{result.store || 'Unknown'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <p className="text-lg">{result.date || 'Not found'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="text-lg capitalize">{result.category || 'Other'}</p>
                </div>

                <div className="pt-3 border-t border-border">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Items</p>
                  <ul className="space-y-2 max-h-32 overflow-y-auto" aria-label="Itemised carbon breakdown">
                    {result.items?.map((receiptItem, idx) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <span className="text-foreground">
                          {receiptItem.item} ×{receiptItem.quantity}
                        </span>
                        <span className="text-primary font-medium">
                          {receiptItem.estimatedCO2} kg CO₂
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-border bg-primary/10 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Total Carbon Footprint</p>
                  <p className="text-2xl font-bold text-primary" aria-live="polite">
                    {result.totalEstimatedCO2} kg CO₂
                  </p>
                </div>
              </div>

              <Button
                onClick={() => {
                  setResult(null)
                  setPreviewUrl(null)
                  onClose()
                }}
                className="w-full bg-primary hover:bg-primary/90"
                type="button"
              >
                Add to Footprint
              </Button>

              <Button
                onClick={() => {
                  setResult(null)
                  setPreviewUrl(null)
                }}
                variant="outline"
                className="w-full"
                type="button"
              >
                Scan Another
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
