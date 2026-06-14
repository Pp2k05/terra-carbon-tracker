/**
 * Unit tests for /api/analyze-receipt route.
 *
 * We mock:
 *  - `next/headers` (returns request headers)
 *  - `@/lib/auth` (session validation)
 *  - `ai` (generateObject)
 *  - `@ai-sdk/deepinfra` (model factory)
 *
 * This test file uses @jest-environment node (not jsdom) so the global
 * Fetch API (Request, Response, Headers) is available from Node.js 18+.
 *
 * @jest-environment node
 */

import { POST } from '@/app/api/analyze-receipt/route'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('next/headers', () => ({
  headers: jest.fn().mockResolvedValue(new Headers()),
}))

const mockGetSession = jest.fn()
jest.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
  },
}))

const mockGenerateObject = jest.fn()
jest.mock('ai', () => ({
  generateObject: (...args: unknown[]) => mockGenerateObject(...args),
}))

jest.mock('@ai-sdk/deepinfra', () => ({
  deepinfra: jest.fn().mockReturnValue('mock-model'),
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a Request with a JSON body for testing. */
function buildRequest(body: unknown): Request {
  return new Request('http://localhost/api/analyze-receipt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

/**
 * A minimal valid JPEG base64 prefix (starts with /9j/ — JPEG magic bytes).
 * Padded to a non-trivial but small size for testing.
 */
const VALID_JPEG_BASE64 = '/9j/' + 'A'.repeat(100)

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/analyze-receipt', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ------ Authentication ---------------------------------------------------

  it('returns 401 when no session is present', async () => {
    mockGetSession.mockResolvedValue(null)
    const req = buildRequest({ imageBase64: VALID_JPEG_BASE64 })
    const res = await POST(req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toMatch(/unauthorised/i)
  })

  it('proceeds when a valid session exists', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'u1' } })
    mockGenerateObject.mockResolvedValue({ object: { store: 'Test', items: [], totalEstimatedCO2: 0 } })
    const req = buildRequest({ imageBase64: VALID_JPEG_BASE64 })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })

  // ------ Input validation -------------------------------------------------

  it('returns 400 when imageBase64 is missing', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'u1' } })
    const req = buildRequest({})
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when imageBase64 is not a string', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'u1' } })
    const req = buildRequest({ imageBase64: 12345 })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 413 when base64 payload exceeds size limit', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'u1' } })
    // Generate a string longer than 14_000_000 chars
    const oversized = 'A'.repeat(14_000_001)
    const req = buildRequest({ imageBase64: oversized })
    const res = await POST(req)
    expect(res.status).toBe(413)
  })

  it('returns 415 when base64 does not match a known image format', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'u1' } })
    // A PDF magic byte in base64 would start with 'JVBER…' — not a known image prefix
    const req = buildRequest({ imageBase64: 'JVBERi0xLjQ=' })
    const res = await POST(req)
    expect(res.status).toBe(415)
  })

  // ------ Successful response ---------------------------------------------

  it('returns the AI analysis result on success', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'u1' } })
    const mockResult = {
      store: 'Whole Foods',
      date: '2024-06-01',
      items: [{ item: 'Milk', quantity: 1, price: 3.5, estimatedCO2: 0.5 }],
      totalPrice: 3.5,
      totalEstimatedCO2: 0.5,
      category: 'food',
    }
    mockGenerateObject.mockResolvedValue({ object: mockResult })

    const req = buildRequest({ imageBase64: VALID_JPEG_BASE64 })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.store).toBe('Whole Foods')
    expect(body.totalEstimatedCO2).toBe(0.5)
  })

  // ------ Error handling --------------------------------------------------

  it('returns 500 with generic message when AI SDK throws', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'u1' } })
    mockGenerateObject.mockRejectedValue(new Error('Internal AI failure'))

    const req = buildRequest({ imageBase64: VALID_JPEG_BASE64 })
    const res = await POST(req)
    expect(res.status).toBe(500)
    const body = await res.json()
    // Must NOT expose the internal error message
    expect(body.error).not.toContain('Internal AI failure')
    expect(body.error).toBeTruthy()
  })
})
