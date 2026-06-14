import { generateObject } from 'ai'
import { deepinfra } from '@ai-sdk/deepinfra'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

// ---------------------------------------------------------------------------
// Schema definitions
// ---------------------------------------------------------------------------

/** Schema for a single line-item on a receipt. */
const ReceiptItemSchema = z.object({
  item: z.string().describe('Name of the purchased item'),
  quantity: z.number().describe('Quantity purchased'),
  price: z.number().describe('Price per unit in the receipt currency'),
  estimatedCO2: z.number().describe('Estimated CO₂ emissions in kg'),
})

/** Full schema returned by the AI vision model for a scanned receipt. */
const ReceiptAnalysisSchema = z.object({
  store: z.string().describe('Name of the store or merchant'),
  date: z.string().describe('Purchase date as printed on the receipt'),
  items: z.array(ReceiptItemSchema),
  totalPrice: z.number().describe('Total amount paid'),
  totalEstimatedCO2: z.number().describe('Sum of CO₂ emissions for all items in kg'),
  category: z
    .string()
    .describe('Primary purchase category: food, clothing, electronics, household, etc.'),
})

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Maximum allowed base64 payload length.
 * A 10 MB binary image becomes ≈ 13.7 MB in base64; 14 MB gives a safe margin.
 */
const MAX_BASE64_LENGTH = 14_000_000

/**
 * Allowed MIME type prefixes derived from the first bytes of the decoded data.
 * Checked via magic-byte signatures in the base64 prefix.
 */
const ALLOWED_IMAGE_PREFIXES = [
  '/9j/',          // JPEG (FFD8FF)
  'iVBORw0KGgo',  // PNG (89504E47)
  'R0lGOD',       // GIF
  'UklGR',        // WEBP (RIFF)
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns true if the base64 string starts with a known image magic-byte sequence.
 * This prevents non-image files from being forwarded to the AI model.
 */
function isValidImageBase64(base64: string): boolean {
  return ALLOWED_IMAGE_PREFIXES.some((prefix) => base64.startsWith(prefix))
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

/**
 * POST /api/analyze-receipt
 *
 * Accepts a base64-encoded receipt image, forwards it to the DeepSeek Vision
 * model via Deep Infra, and returns a structured carbon-footprint breakdown.
 *
 * Security:
 *  - Requires a valid authenticated session (401 otherwise).
 *  - Rejects payloads exceeding 14 MB in base64 length.
 *  - Validates image magic bytes to block non-image uploads.
 *  - Returns generic error messages in production to prevent information leakage.
 */
export async function POST(request: Request) {
  // ------ 1. Authentication guard ----------------------------------------
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return Response.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    // ------ 2. Parse and validate input ----------------------------------
    const body: unknown = await request.json()

    if (
      typeof body !== 'object' ||
      body === null ||
      !('imageBase64' in body) ||
      typeof (body as Record<string, unknown>).imageBase64 !== 'string'
    ) {
      return Response.json({ error: 'Missing or invalid image data' }, { status: 400 })
    }

    const { imageBase64 } = body as { imageBase64: string }

    // ------ 3. Payload size guard ----------------------------------------
    if (imageBase64.length > MAX_BASE64_LENGTH) {
      return Response.json(
        { error: 'Image exceeds the 10 MB size limit' },
        { status: 413 },
      )
    }

    // ------ 4. Magic-byte / mime-type validation -------------------------
    if (!isValidImageBase64(imageBase64)) {
      return Response.json(
        { error: 'Only JPEG, PNG, GIF, and WebP images are supported' },
        { status: 415 },
      )
    }

    // ------ 5. Call DeepSeek Vision via AI SDK ---------------------------
    const result = await generateObject({
      model: deepinfra('deepseek-ai/deepseek-vision-7b'),
      schema: ReceiptAnalysisSchema,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              image: Buffer.from(imageBase64, 'base64'),
            },
            {
              type: 'text',
              text: `Analyze this receipt image and extract the following information:
1. Store name
2. Purchase date
3. All items purchased (name, quantity, price)
4. Total price
5. Primary category (food, clothing, electronics, etc)

Then estimate the carbon footprint for each item based on typical emissions data:
- Food items: ~0.5–2 kg CO₂ per kg of food
- Clothing: ~5–20 kg CO₂ per item
- Electronics: ~50–200 kg CO₂ per item
- Household: ~1–5 kg CO₂ per item

Return the analysis in JSON format with estimated CO₂ values in kilograms.`,
            },
          ],
        },
      ],
    })

    return Response.json(result.object)
  } catch (error) {
    // Log full error server-side for debugging
    console.error('[TERRA] Receipt analysis error:', error)

    // Return a generic message to the client — never leak internal details
    return Response.json({ error: 'Failed to analyse receipt. Please try again.' }, { status: 500 })
  }
}
