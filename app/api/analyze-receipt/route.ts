import { generateObject } from 'ai'
import { deepinfra } from '@ai-sdk/deepinfra'
import { z } from 'zod'

const ReceiptItemSchema = z.object({
  item: z.string(),
  quantity: z.number(),
  price: z.number(),
  estimatedCO2: z.number().describe('Estimated CO2 in kg'),
})

const ReceiptAnalysisSchema = z.object({
  store: z.string(),
  date: z.string(),
  items: z.array(ReceiptItemSchema),
  totalPrice: z.number(),
  totalEstimatedCO2: z.number().describe('Total CO2 emissions in kg'),
  category: z.string().describe('Primary category: food, clothing, electronics, etc'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { imageBase64 } = body

    if (!imageBase64) {
      return Response.json(
        { error: 'Missing image data' },
        { status: 400 }
      )
    }

    // Call DeepSeek Vision via Deep Infra using AI SDK
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
- Food items: ~0.5-2 kg CO2 per kg of food
- Clothing: ~5-20 kg CO2 per item
- Electronics: ~50-200 kg CO2 per item
- Household: ~1-5 kg CO2 per item

Return the analysis in JSON format with estimated CO2 values in kilograms.`,
            },
          ],
        },
      ],
    })

    return Response.json(result.object)
  } catch (error) {
    console.error('[v0] Receipt analysis error:', error)
    return Response.json(
      { error: 'Failed to analyze receipt' },
      { status: 500 }
    )
  }
}
