import { describe, it, expect, vi } from 'vitest'
import { safeQuery } from '../db/safe-query.js'
import { CmsErrorCode } from '../schema/types.js'
import type { DbPool } from '@valencets/db'

function makeMockPool (returnValue: readonly Record<string, string | number | null>[] = []): DbPool {
  const unsafe = vi.fn(() => Promise.resolve(returnValue))
  const sql = Object.assign(
    vi.fn(() => Promise.resolve(returnValue)),
    { unsafe }
  ) as unknown as DbPool['sql']
  return { sql }
}

function makeErrorPool (error: Error): DbPool {
  const unsafe = vi.fn(() => Promise.reject(error))
  const sql = Object.assign(
    vi.fn(() => Promise.reject(error)),
    { unsafe }
  ) as unknown as DbPool['sql']
  return { sql }
}

describe('safeQuery()', () => {
  it('calls sql.unsafe with query string and params array', async () => {
    const rows = [{ id: '1', title: 'Hello' }]
    const pool = makeMockPool(rows)
    const result = await safeQuery<Array<{ id: string, title: string }>>(pool, 'SELECT * FROM "posts" WHERE id = $1', ['abc'])
    expect(result.isOk()).toBe(true)
    expect(result._unsafeUnwrap()).toEqual(rows)
    expect(pool.sql.unsafe).toHaveBeenCalledWith('SELECT * FROM "posts" WHERE id = $1', ['abc'])
  })

  it('returns Err on db failure', async () => {
    const pool = makeErrorPool(new Error('connection refused'))
    const result = await safeQuery(pool, 'SELECT 1', [])
    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr().code).toBe(CmsErrorCode.INTERNAL)
  })

  it('passes empty params array when no params', async () => {
    const pool = makeMockPool([{ count: '5' }])
    await safeQuery(pool, 'SELECT COUNT(*) FROM "posts"', [])
    expect(pool.sql.unsafe).toHaveBeenCalledWith('SELECT COUNT(*) FROM "posts"', [])
  })
})
