import { describe, it, expect, vi, afterEach } from 'vitest'
import { pushDailySummary } from '../server/push-client.js'
import type { DailySummaryRow } from '@inertia/db'

afterEach(() => {
  vi.restoreAllMocks()
})

const mockRow: DailySummaryRow = {
  id: 1,
  site_id: 'site_acme',
  date: new Date('2026-03-10'),
  business_type: 'barbershop',
  schema_version: 1,
  session_count: 247,
  pageview_count: 1200,
  conversion_count: 45,
  top_referrers: [{ referrer: 'google', count: 120 }],
  top_pages: [{ path: '/', count: 500 }],
  intent_counts: { CLICK: 800 },
  avg_flush_ms: 2.8,
  rejection_count: 5,
  synced_at: null,
  created_at: new Date()
}

const pushConfig = {
  studioEndpoint: 'https://studio.example.com/api/aggregation',
  siteSecret: 'test-secret-key'
}

describe('pushDailySummary', () => {
  it('is a function', () => {
    expect(typeof pushDailySummary).toBe('function')
  })

  it('returns a ResultAsync', () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status: 200 }))
    const result = pushDailySummary(pushConfig, mockRow)
    expect(typeof result.andThen).toBe('function')
  })

  it('sends POST with X-Inertia-Signature header', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status: 200 }))
    await pushDailySummary(pushConfig, mockRow)

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const call = fetchSpy.mock.calls[0]
    const url = call?.[0]
    const opts = call?.[1] as RequestInit
    expect(url).toBe('https://studio.example.com/api/aggregation')
    expect(opts.method).toBe('POST')
    expect((opts.headers as Record<string, string>)['X-Inertia-Signature']).toBeDefined()
    expect((opts.headers as Record<string, string>)['Content-Type']).toBe('application/json')
  })

  it('returns Ok on successful push', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status: 200 }))
    const result = await pushDailySummary(pushConfig, mockRow)
    expect(result.isOk()).toBe(true)
  })

  it('returns Err on network failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'))
    const result = await pushDailySummary(pushConfig, mockRow)
    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr().code).toBe('PUSH_FAILED')
  })

  it('serializes DailySummaryRow to payload with ISO date', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status: 200 }))
    await pushDailySummary(pushConfig, mockRow)

    const body = fetchSpy.mock.calls[0]?.[1]?.body as string
    const parsed = JSON.parse(body) as Record<string, unknown>
    expect(typeof parsed.date).toBe('string')
    expect(parsed.site_id).toBe('site_acme')
    expect(parsed.schema_version).toBe(1)
  })
})
