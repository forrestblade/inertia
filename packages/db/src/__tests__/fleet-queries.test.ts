import { describe, it, expect, vi } from 'vitest'
import { getFleetSites, getFleetComparison, getFleetSiteHistory } from '../fleet-queries.js'
import type { DbPool } from '../connection.js'

function makeMockPool (returnValue: unknown = []): DbPool {
  const sql = vi.fn(() => Promise.resolve(returnValue)) as unknown as DbPool['sql']
  return { sql }
}

function makeErrorPool (error: Error): DbPool {
  const sql = vi.fn(() => Promise.reject(error)) as unknown as DbPool['sql']
  return { sql }
}

describe('getFleetSites', () => {
  it('is a function', () => {
    expect(typeof getFleetSites).toBe('function')
  })

  it('returns a ResultAsync', () => {
    const pool = makeMockPool()
    const result = getFleetSites(pool)
    expect(typeof result.andThen).toBe('function')
  })

  it('returns empty array for no data', async () => {
    const pool = makeMockPool([])
    const result = await getFleetSites(pool)
    expect(result.isOk()).toBe(true)
    expect(result._unsafeUnwrap()).toEqual([])
  })

  it('returns error on database failure', async () => {
    const pool = makeErrorPool(new Error('connection refused'))
    const result = await getFleetSites(pool)
    expect(result.isErr()).toBe(true)
  })
})

describe('getFleetComparison', () => {
  it('is a function', () => {
    expect(typeof getFleetComparison).toBe('function')
  })

  it('returns empty array for no data', async () => {
    const pool = makeMockPool([])
    const result = await getFleetComparison(pool, 'barbershop')
    expect(result.isOk()).toBe(true)
    expect(result._unsafeUnwrap()).toEqual([])
  })

  it('returns error on database failure', async () => {
    const pool = makeErrorPool(new Error('connection refused'))
    const result = await getFleetComparison(pool, 'barbershop')
    expect(result.isErr()).toBe(true)
  })
})

describe('getFleetSiteHistory', () => {
  it('is a function', () => {
    expect(typeof getFleetSiteHistory).toBe('function')
  })

  it('returns empty array for no data', async () => {
    const pool = makeMockPool([])
    const result = await getFleetSiteHistory(pool, 'site_acme', 30)
    expect(result.isOk()).toBe(true)
    expect(result._unsafeUnwrap()).toEqual([])
  })

  it('returns error on database failure', async () => {
    const pool = makeErrorPool(new Error('connection refused'))
    const result = await getFleetSiteHistory(pool, 'site_acme', 30)
    expect(result.isErr()).toBe(true)
  })
})
