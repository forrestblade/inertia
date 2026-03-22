import { describe, it, expect } from 'vitest'
import {
  computeCutoffDate,
  deleteExpiredEvents,
  deleteExpiredSessions,
  cleanupExpiredTelemetry
} from '../retention.js'
import { makeMockPool, makeErrorPool } from './test-helpers.js'

describe('computeCutoffDate', () => {
  it('subtracts the specified number of days from now', () => {
    const now = new Date('2026-03-21T12:00:00Z')
    const cutoff = computeCutoffDate(90, now)
    expect(cutoff.toISOString()).toBe('2025-12-21T12:00:00.000Z')
  })

  it('handles 0 days retention (cutoff equals now)', () => {
    const now = new Date('2026-03-21T00:00:00Z')
    const cutoff = computeCutoffDate(0, now)
    expect(cutoff.toISOString()).toBe('2026-03-21T00:00:00.000Z')
  })

  it('handles 1 day retention', () => {
    const now = new Date('2026-03-21T00:00:00Z')
    const cutoff = computeCutoffDate(1, now)
    expect(cutoff.toISOString()).toBe('2026-03-20T00:00:00.000Z')
  })

  it('handles 365 days retention', () => {
    const now = new Date('2026-03-21T00:00:00Z')
    const cutoff = computeCutoffDate(365, now)
    expect(cutoff.toISOString()).toBe('2025-03-21T00:00:00.000Z')
  })

  it('does not mutate the input date', () => {
    const now = new Date('2026-03-21T12:00:00Z')
    const originalTime = now.getTime()
    computeCutoffDate(90, now)
    expect(now.getTime()).toBe(originalTime)
  })
})

describe('deleteExpiredEvents', () => {
  it('returns the number of deleted rows on success', async () => {
    const pool = makeMockPool({ count: 42 })
    const result = await deleteExpiredEvents(pool, new Date('2025-12-21T00:00:00Z'))
    expect(result.isOk()).toBe(true)
    expect(result._unsafeUnwrap()).toBe(42)
  })

  it('returns 0 when no rows match', async () => {
    const pool = makeMockPool({ count: 0 })
    const result = await deleteExpiredEvents(pool, new Date('2025-12-21T00:00:00Z'))
    expect(result.isOk()).toBe(true)
    expect(result._unsafeUnwrap()).toBe(0)
  })

  it('returns error on database failure', async () => {
    const pool = makeErrorPool(new Error('connection refused'))
    const result = await deleteExpiredEvents(pool, new Date('2025-12-21T00:00:00Z'))
    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr().code).toBe('QUERY_FAILED')
  })
})

describe('deleteExpiredSessions', () => {
  it('returns the number of deleted rows on success', async () => {
    const pool = makeMockPool({ count: 15 })
    const result = await deleteExpiredSessions(pool, new Date('2025-12-21T00:00:00Z'))
    expect(result.isOk()).toBe(true)
    expect(result._unsafeUnwrap()).toBe(15)
  })

  it('returns 0 when no rows match', async () => {
    const pool = makeMockPool({ count: 0 })
    const result = await deleteExpiredSessions(pool, new Date('2025-12-21T00:00:00Z'))
    expect(result.isOk()).toBe(true)
    expect(result._unsafeUnwrap()).toBe(0)
  })

  it('returns error on database failure', async () => {
    const pool = makeErrorPool(new Error('timeout'))
    const result = await deleteExpiredSessions(pool, new Date('2025-12-21T00:00:00Z'))
    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr().code).toBe('QUERY_FAILED')
  })
})

describe('cleanupExpiredTelemetry', () => {
  it('deletes events then sessions and returns combined counts', async () => {
    let callIndex = 0
    const sql = (() => {
      const fn = (() => {
        const counts = [{ count: 100 }, { count: 25 }]
        return () => {
          const result = counts[callIndex] ?? { count: 0 }
          callIndex++
          return Promise.resolve(result)
        }
      })()
      return fn
    })()
    const pool = { sql } as never

    const result = await cleanupExpiredTelemetry(pool)
    expect(result.isOk()).toBe(true)
    const value = result._unsafeUnwrap()
    expect(value.eventsDeleted).toBe(100)
    expect(value.sessionsDeleted).toBe(25)
  })

  it('defaults to 90 days retention', async () => {
    const pool = makeMockPool({ count: 0 })
    const result = await cleanupExpiredTelemetry(pool)
    expect(result.isOk()).toBe(true)
  })

  it('accepts custom retention days', async () => {
    const pool = makeMockPool({ count: 0 })
    const result = await cleanupExpiredTelemetry(pool, { retentionDays: 30 })
    expect(result.isOk()).toBe(true)
  })

  it('returns error if event deletion fails', async () => {
    const pool = makeErrorPool(new Error('disk full'))
    const result = await cleanupExpiredTelemetry(pool)
    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr().code).toBe('QUERY_FAILED')
  })

  it('returns error if session deletion fails after events succeed', async () => {
    let callIndex = 0
    const sql = (() => {
      return () => {
        if (callIndex === 0) {
          callIndex++
          return Promise.resolve({ count: 10 })
        }
        return Promise.reject(new Error('constraint violation'))
      }
    })()
    const pool = { sql } as never

    const result = await cleanupExpiredTelemetry(pool)
    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr().code).toBe('QUERY_FAILED')
  })
})
