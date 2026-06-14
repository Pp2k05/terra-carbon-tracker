'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, Upload, Loader2 } from 'lucide-react'

interface ReceiptScannerProps {
  onClose: () => void
  onAnalysisComplete?: (data: any) => void
}

export default function ReceiptScanner({ onClose, onAnalysisComplete }: ReceiptScannerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any | null>(null)

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setIsLoading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = (event.target?.result as string)?.split(',')[1]
        setPreviewUrl(event.target?.result as string)

        // Send to API
        analyzeReceipt(base64)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError('Failed to load image')
      setIsLoading(false)
    }
  }

  const analyzeReceipt = async (imageBase64: string) => {
    try {
      const response = await fetch('/api/analyze-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 }),
      })

      if (!response.ok) throw new Error('Analysis failed')

      const data = await response.json()
      setResult(data)
      onAnalysisComplete?.(data)
    } catch (err) {
      setError('Failed to analyze receipt. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md bg-card border-border max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold">Scan Receipt</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="size-8 p-0"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!result && (
            <>
              {!previewUrl ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Upload a photo of your receipt to analyze its carbon footprint
                  </p>

                  <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center gap-3 bg-sidebar-accent/20 cursor-pointer hover:bg-sidebar-accent/30 transition"
                    onClick={() => document.getElementById('receipt-input')?.click()}>
                    <Upload className="size-8 text-primary" />
                    <div className="text-center">
                      <p className="font-medium text-foreground">Click to upload receipt</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                    </div>
                  </div>

                  <input
                    id="receipt-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    disabled={isLoading}
                    className="hidden"
                  />
                </>
              ) : (
                <>
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={previewUrl}
                      alt="Receipt preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <Loader2 className="size-4 animate-spin" />
                      <span className="text-sm">Analyzing receipt...</span>
                    </div>
                  ) : (
                    <>
                      <Button
                        onClick={() => {
                          setPreviewUrl(null)
                          setError(null)
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        Try Another Receipt
                      </Button>
                    </>
                  )}
                </>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
                  {error}
                </div>
              )}
            </>
          )}

          {result && (
            <>
              <div className="space-y-3">
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
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {result.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-foreground">{item.item} ×{item.quantity}</span>
                        <span className="text-primary font-medium">{item.estimatedCO2} kg CO₂</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-border bg-primary/10 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Total Carbon Footprint</p>
                  <p className="text-2xl font-bold text-primary">{result.totalEstimatedCO2} kg CO₂</p>
                </div>
              </div>

              <Button
                onClick={() => {
                  setResult(null)
                  setPreviewUrl(null)
                  onClose()
                }}
                className="w-full bg-primary hover:bg-primary/90"
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
