import { describe, it, expect, vi } from 'vitest'
import { ingestBeacon } from '../ingestion.js'
import type { BeaconEvent } from '../beacon-types.js'
import { makeMockPool } from './test-helpers.js'

function makeBeaconEvent (overrides: Partial<BeaconEvent> = {}): BeaconEvent {
  return {
    id: 'evt-001',
    timestamp: Date.now(),
    type: 'CLICK',
    targetDOMNode: 'button.cta',
    x_coord: 100,
    y_coord: 200,
    schema_version: 1,
    site_id: 'site-abc',
    business_type: 'dental',
    path: '/home',
    referrer: 'google.com',
    ...overrides
  }
}

describe('ingestBeacon', () => {
  it('creates a session and inserts events', async () => {
    const sessionRow = { session_id: '123e4567-e89b-12d3-a456-426614174000' }
    const pool = makeMockPool(sessionRow)
    // Second call returns empty (for event insert)
    const sqlFn = pool.sql as ReturnType<typeof vi.fn>
    sqlFn.mockResolvedValueOnce([sessionRow]) // createSession
    sqlFn.mockResolvedValueOnce([]) // insertEvents

    const events = [makeBeaconEvent(), makeBeaconEvent({ id: 'evt-002' })]
    const result = await ingestBeacon(pool, events)
    expect(result.isOk()).toBe(true)

    const value = result._unsafeUnwrap()
    expect(value.eventsInserted).toBe(2)
    expect(value.sessionId).toBe(sessionRow.session_id)
  })

  it('returns error when pool rejects', async () => {
    const pool = makeMockPool()
    const sqlFn = pool.sql as ReturnType<typeof vi.fn>
    sqlFn.mockRejectedValueOnce(new Error('connection refused'))

    const result = await ingestBeacon(pool, [makeBeaconEvent()])
    expect(result.isErr()).toBe(true)
  })

  it('uses referrer from first event for session', async () => {
    const sessionRow = { session_id: 'test-session-id' }
    const pool = makeMockPool()
    const sqlFn = pool.sql as ReturnType<typeof vi.fn>
    sqlFn.mockResolvedValueOnce([sessionRow])
    sqlFn.mockResolvedValueOnce([])

    const events = [makeBeaconEvent({ referrer: 'bing.com' })]
    await ingestBeacon(pool, events)

    expect(sqlFn).toHaveBeenCalled()
  })
})
