import { describe, it, expect, vi } from 'vitest'
import { generateDailySummary } from '../daily-summary-aggregation.js'
import type { DbPool } from '../connection.js'

function makeMockPool (returnValues: Record<string, unknown[]>): DbPool {
  let callIndex = 0
  const keys = Object.keys(returnValues)
  const sql = vi.fn(() => {
    const key = keys[callIndex] ?? keys[keys.length - 1]
    const result = returnValues[key ?? ''] ?? []
    callIndex++
    return Promise.resolve(result)
  }) as unknown as DbPool['sql']
  return { sql }
}

function makeErrorPool (error: Error): DbPool {
  const sql = vi.fn(() => Promise.reject(error)) as unknown as DbPool['sql']
  return { sql }
}

describe('generateDailySummary', () => {
  it('is a function', () => {
    expect(typeof generateDailySummary).toBe('function')
  })

  it('returns a ResultAsync', () => {
    const pool = makeMockPool({
      sessions: [{ total_sessions: 10 }],
      pageviews: [{ pageview_count: 50 }],
      conversions: [{ conversion_count: 3 }],
      referrers: [],
      pages: [],
      intents: [],
      health: [{ avg_flush_ms: 1.5, rejection_count: 0 }],
      upsert: [{
        id: 1,
        site_id: 'studio',
        date: new Date('2026-03-10'),
        business_type: 'studio',
        schema_version: 1,
        session_count: 10,
        pageview_count: 50,
        conversion_count: 3,
        top_referrers: [],
        top_pages: [],
        intent_counts: {},
        avg_flush_ms: 1.5,
        rejection_count: 0,
        synced_at: null,
        created_at: new Date()
      }]
    })
    const result = generateDailySummary(pool, 'studio', 'studio', new Date('2026-03-10'))
    expect(typeof result.andThen).toBe('function')
  })

  it('returns error on database failure', async () => {
    const pool = makeErrorPool(new Error('connection refused'))
    const result = await generateDailySummary(pool, 'studio', 'studio', new Date('2026-03-10'))
    expect(result.isErr()).toBe(true)
  })

  it('accepts siteId, businessType, and date parameters', () => {
    const pool = makeMockPool({
      q1: [{ total_sessions: 0 }],
      q2: [{ pageview_count: 0 }],
      q3: [{ conversion_count: 0 }],
      q4: [],
      q5: [],
      q6: [],
      q7: [{ avg_flush_ms: 0, rejection_count: 0 }],
      q8: [{
        id: 1,
        site_id: 'site_acme',
        date: new Date('2026-03-10'),
        business_type: 'barbershop',
        schema_version: 1,
        session_count: 0,
        pageview_count: 0,
        conversion_count: 0,
        top_referrers: [],
        top_pages: [],
        intent_counts: {},
        avg_flush_ms: 0,
        rejection_count: 0,
        synced_at: null,
        created_at: new Date()
      }]
    })
    const result = generateDailySummary(pool, 'site_acme', 'barbershop', new Date('2026-03-10'))
    expect(typeof result.andThen).toBe('function')
  })
})
