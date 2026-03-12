import { describe, it, expect, vi, beforeEach } from 'vitest'
import { logBudgetReport } from '../budget-logger.js'
import type { CriticalCSSCache } from '../critical-css-pipeline.js'

describe('logBudgetReport', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('logs route budget utilization for each route with CSS', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    const pipeline: CriticalCSSCache = {
      getCriticalCSS: (route: string) => {
        const css: Record<string, string> = {
          '/': 'body{margin:0}',
          '/how-it-works': 'h1{color:blue}'
        }
        return css[route]
      },
      getDeferredCSS: () => undefined
    }

    logBudgetReport(pipeline)

    const budgetCalls = logSpy.mock.calls.filter(
      (call) => typeof call[0] === 'string' && call[0].startsWith('[budget]')
    )
    expect(budgetCalls.length).toBeGreaterThanOrEqual(2)
    expect(budgetCalls[0]?.[0]).toContain('/')
    expect(budgetCalls[0]?.[0]).toMatch(/\d+B \/ 14336B/)
  })

  it('warns when pipeline has no CSS for a route', () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const pipeline: CriticalCSSCache = {
      getCriticalCSS: () => undefined,
      getDeferredCSS: () => undefined
    }

    logBudgetReport(pipeline)

    const warnCalls = warnSpy.mock.calls.filter(
      (call) => typeof call[0] === 'string' && call[0].startsWith('[budget]')
    )
    expect(warnCalls.length).toBeGreaterThan(0)
    expect(warnCalls[0]?.[0]).toContain('no critical CSS')
  })
})
