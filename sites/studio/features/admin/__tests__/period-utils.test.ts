import { describe, it, expect, beforeAll } from 'vitest'
import type { IncomingMessage } from 'node:http'

let PERIOD_DAYS: typeof import('../server/period-utils.js').PERIOD_DAYS
let parsePeriodRange: typeof import('../server/period-utils.js').parsePeriodRange

beforeAll(async () => {
  const mod = await import('../server/period-utils.js')
  PERIOD_DAYS = mod.PERIOD_DAYS
  parsePeriodRange = mod.parsePeriodRange
})

function mockReq (url: string): IncomingMessage {
  return { url, headers: { host: 'localhost:3000' } } as unknown as IncomingMessage
}

describe('PERIOD_DAYS', () => {
  it('maps TODAY to 1 day', () => {
    expect(PERIOD_DAYS['TODAY']).toBe(1)
  })

  it('maps 7D to 7 days', () => {
    expect(PERIOD_DAYS['7D']).toBe(7)
  })

  it('maps 30D to 30 days', () => {
    expect(PERIOD_DAYS['30D']).toBe(30)
  })

  it('maps 90D to 90 days', () => {
    expect(PERIOD_DAYS['90D']).toBe(90)
  })
})

describe('parsePeriodRange', () => {
  function daysBetween (start: Date, end: Date): number {
    // Count calendar days: end date minus start date
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate())
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate())
    return Math.round((endDay.getTime() - startDay.getTime()) / 86_400_000)
  }

  it('defaults to 7D when no period param', () => {
    const { start, end } = parsePeriodRange(mockReq('/api/summaries/sessions'))
    expect(daysBetween(start, end)).toBe(7)
  })

  it('defaults to 7D for unknown period param', () => {
    const { start, end } = parsePeriodRange(mockReq('/api/summaries/sessions?period=UNKNOWN'))
    expect(daysBetween(start, end)).toBe(7)
  })

  it('returns 1-day window for TODAY', () => {
    const { start, end } = parsePeriodRange(mockReq('/api/summaries/sessions?period=TODAY'))
    expect(daysBetween(start, end)).toBe(1)
  })

  it('returns 30-day window for 30D', () => {
    const { start, end } = parsePeriodRange(mockReq('/api/summaries/sessions?period=30D'))
    expect(daysBetween(start, end)).toBe(30)
  })

  it('sets start time to midnight (00:00:00.000)', () => {
    const { start } = parsePeriodRange(mockReq('/api/summaries/sessions?period=7D'))
    expect(start.getHours()).toBe(0)
    expect(start.getMinutes()).toBe(0)
    expect(start.getSeconds()).toBe(0)
    expect(start.getMilliseconds()).toBe(0)
  })

  it('sets end time to 23:59:59.999', () => {
    const { end } = parsePeriodRange(mockReq('/api/summaries/sessions?period=7D'))
    expect(end.getHours()).toBe(23)
    expect(end.getMinutes()).toBe(59)
    expect(end.getSeconds()).toBe(59)
    expect(end.getMilliseconds()).toBe(999)
  })
})
