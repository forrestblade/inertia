import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { setupTestDatabase, teardownTestDatabase, getAppPool, getSuperuserPool } from './setup.js'
import { createSession, getSessionById, insertEvent, insertEvents, getEventsBySession, getEventsByTimeRange } from '../../queries.js'
import type { DbPool } from '../../connection.js'
import type { InsertableSession, InsertableEvent } from '../../types.js'

let appPool: DbPool
let superPool: DbPool

const sampleSession: InsertableSession = {
  referrer: 'https://google.com',
  device_type: 'desktop',
  operating_system: 'Linux'
}

beforeAll(async () => {
  await setupTestDatabase()
  appPool = getAppPool()
  superPool = getSuperuserPool()
}, 30000)

afterAll(async () => {
  // Clean all test data with superuser
  await superPool.sql`DELETE FROM events`
  await superPool.sql`DELETE FROM sessions`
  await teardownTestDatabase()
}, 10000)

describe('session CRUD round-trip', () => {
  it('createSession returns a valid SessionRow', async () => {
    const result = await createSession(appPool, sampleSession)
    expect(result.isOk()).toBe(true)
    const row = result._unsafeUnwrap()
    expect(row.session_id).toBeTruthy()
    expect(row.device_type).toBe('desktop')
    expect(row.referrer).toBe('https://google.com')
    expect(row.operating_system).toBe('Linux')
    expect(row.created_at).toBeInstanceOf(Date)
  })

  it('getSessionById retrieves the created session', async () => {
    const createResult = await createSession(appPool, {
      referrer: null,
      device_type: 'mobile',
      operating_system: 'iOS'
    })
    const created = createResult._unsafeUnwrap()

    const getResult = await getSessionById(appPool, created.session_id)
    expect(getResult.isOk()).toBe(true)
    const retrieved = getResult._unsafeUnwrap()
    expect(retrieved.session_id).toBe(created.session_id)
    expect(retrieved.device_type).toBe('mobile')
    expect(retrieved.referrer).toBeNull()
  })

  it('getSessionById returns error for nonexistent session', async () => {
    const result = await getSessionById(appPool, '00000000-0000-0000-0000-000000000000')
    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr().code).toBe('QUERY_FAILED')
  })

  it('session with null referrer and os', async () => {
    const result = await createSession(appPool, {
      referrer: null,
      device_type: 'tablet',
      operating_system: null
    })
    expect(result.isOk()).toBe(true)
    const row = result._unsafeUnwrap()
    expect(row.referrer).toBeNull()
    expect(row.operating_system).toBeNull()
  })
})

describe('event insert and read round-trip', () => {
  it('insertEvent returns a valid EventRow', async () => {
    const session = await createSession(appPool, sampleSession)
    const sessionId = session._unsafeUnwrap().session_id

    const event: InsertableEvent = {
      session_id: sessionId,
      event_category: 'CLICK',
      dom_target: '#submit-btn',
      payload: { page: '/contact' }
    }

    const result = await insertEvent(appPool, event)
    expect(result.isOk()).toBe(true)
    const row = result._unsafeUnwrap()
    expect(row.session_id).toBe(sessionId)
    expect(row.event_category).toBe('CLICK')
    expect(row.dom_target).toBe('#submit-btn')
    expect(row.created_at).toBeInstanceOf(Date)
  })

  it('batch insert count matches', async () => {
    const session = await createSession(appPool, sampleSession)
    const sessionId = session._unsafeUnwrap().session_id

    const events: InsertableEvent[] = Array.from({ length: 5 }, (_, i) => ({
      session_id: sessionId,
      event_category: 'SCROLL',
      dom_target: `#section-${i}`,
      payload: { depth: i * 20 }
    }))

    const result = await insertEvents(appPool, events)
    expect(result.isOk()).toBe(true)
    expect(result._unsafeUnwrap()).toBe(5)
  })

  it('JSONB payload survives round-trip', async () => {
    const session = await createSession(appPool, sampleSession)
    const sessionId = session._unsafeUnwrap().session_id

    const payload = { action: 'form_submit', fields: ['name', 'email'], meta: { source: 'organic' } }
    await insertEvent(appPool, {
      session_id: sessionId,
      event_category: 'FORM_INPUT',
      dom_target: '#contact-form',
      payload
    })

    const result = await getEventsBySession(appPool, sessionId)
    expect(result.isOk()).toBe(true)
    const events = result._unsafeUnwrap()
    const found = events.find((e) => e.event_category === 'FORM_INPUT')
    expect(found).toBeTruthy()
    expect(found!.payload).toEqual(payload)
  })

  it('FK violation produces CONSTRAINT_VIOLATION error', async () => {
    const result = await insertEvent(appPool, {
      session_id: '00000000-0000-0000-0000-000000000000',
      event_category: 'CLICK',
      dom_target: null,
      payload: {}
    })
    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr().code).toBe('CONSTRAINT_VIOLATION')
  })
})

describe('query by session', () => {
  it('getEventsBySession returns events for the session', async () => {
    const session = await createSession(appPool, sampleSession)
    const sessionId = session._unsafeUnwrap().session_id

    await insertEvent(appPool, {
      session_id: sessionId,
      event_category: 'CLICK',
      dom_target: '#a',
      payload: {}
    })
    await insertEvent(appPool, {
      session_id: sessionId,
      event_category: 'SCROLL',
      dom_target: '#b',
      payload: {}
    })

    const result = await getEventsBySession(appPool, sessionId)
    expect(result.isOk()).toBe(true)
    expect(result._unsafeUnwrap().length).toBe(2)
  })

  it('empty session has no events', async () => {
    const session = await createSession(appPool, sampleSession)
    const sessionId = session._unsafeUnwrap().session_id

    const result = await getEventsBySession(appPool, sessionId)
    expect(result.isOk()).toBe(true)
    expect(result._unsafeUnwrap().length).toBe(0)
  })
})

describe('query by time range', () => {
  it('time range query filters correctly', async () => {
    const session = await createSession(appPool, sampleSession)
    const sessionId = session._unsafeUnwrap().session_id

    await insertEvent(appPool, {
      session_id: sessionId,
      event_category: 'TIME_TEST',
      dom_target: null,
      payload: {}
    })

    const now = new Date()
    const oneMinuteAgo = new Date(now.getTime() - 60000)
    const oneMinuteAhead = new Date(now.getTime() + 60000)

    const inRange = await getEventsByTimeRange(appPool, oneMinuteAgo, oneMinuteAhead)
    expect(inRange.isOk()).toBe(true)
    const timeTestEvents = inRange._unsafeUnwrap().filter((e) => e.event_category === 'TIME_TEST')
    expect(timeTestEvents.length).toBeGreaterThanOrEqual(1)

    const outOfRange = await getEventsByTimeRange(
      appPool,
      new Date('2020-01-01'),
      new Date('2020-01-02')
    )
    expect(outOfRange.isOk()).toBe(true)
    expect(outOfRange._unsafeUnwrap().length).toBe(0)
  })
})
