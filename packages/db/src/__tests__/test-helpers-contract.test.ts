import { describe, expect, it } from 'vitest'
import { makeErrorPool, makeMockPool, makeSequentialPool } from '../test-helpers.js'

describe('db test helper surface', () => {
  it('makeMockPool exposes the minimal shared sql surface', async () => {
    const pool = makeMockPool([{ id: 1 }])

    expect(typeof pool.sql).toBe('function')
    expect(typeof pool.sql.unsafe).toBe('function')
    expect(typeof pool.sql.begin).toBe('function')
    expect(typeof pool.sql.array).toBe('function')

    await expect(pool.sql()).resolves.toEqual([{ id: 1 }])
    await expect(pool.sql.unsafe('SELECT 1')).resolves.toEqual([{ id: 1 }])
  })

  it('makeErrorPool exposes the same minimal shared sql surface', async () => {
    const pool = makeErrorPool({ code: 'QUERY_FAILED', message: 'boom' })

    expect(typeof pool.sql).toBe('function')
    expect(typeof pool.sql.unsafe).toBe('function')
    expect(typeof pool.sql.begin).toBe('function')
    expect(typeof pool.sql.array).toBe('function')

    await expect(pool.sql()).rejects.toEqual({ code: 'QUERY_FAILED', message: 'boom' })
    await expect(pool.sql.unsafe('SELECT 1')).rejects.toEqual({ code: 'QUERY_FAILED', message: 'boom' })
  })

  it('makeSequentialPool exposes the same minimal shared sql surface', async () => {
    const pool = makeSequentialPool([[{ id: 1 }], [{ id: 2 }]])

    expect(typeof pool.sql).toBe('function')
    expect(typeof pool.sql.unsafe).toBe('function')
    expect(typeof pool.sql.begin).toBe('function')
    expect(typeof pool.sql.array).toBe('function')

    await expect(pool.sql()).resolves.toEqual([{ id: 1 }])
    await expect(pool.sql.unsafe('SELECT 1')).resolves.toEqual([{ id: 2 }])
  })
})
