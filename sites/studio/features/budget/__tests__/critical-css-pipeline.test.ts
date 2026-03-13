import { describe, it, expect, beforeAll } from 'vitest'
import type { CriticalCSSCache } from '../critical-css-pipeline.js'

let createCriticalCSSPipeline: typeof import('../critical-css-pipeline.js').createCriticalCSSPipeline

beforeAll(async () => {
  const mod = await import('../critical-css-pipeline.js')
  createCriticalCSSPipeline = mod.createCriticalCSSPipeline
})

describe('createCriticalCSSPipeline', () => {
  let cache: CriticalCSSCache

  beforeAll(() => {
    cache = createCriticalCSSPipeline()
  })

  it('returns an object with getCriticalCSS function', () => {
    expect(typeof cache.getCriticalCSS).toBe('function')
  })

  it('returns an object with getDeferredCSS function', () => {
    expect(typeof cache.getDeferredCSS).toBe('function')
  })

  it('getCriticalCSS returns a non-empty string for /', () => {
    const css = cache.getCriticalCSS('/')
    expect(css).toBeDefined()
    expect(typeof css).toBe('string')
    expect(css!.length).toBeGreaterThan(0)
  })

  it('getDeferredCSS returns a non-empty string for /', () => {
    const css = cache.getDeferredCSS('/')
    expect(css).toBeDefined()
    expect(typeof css).toBe('string')
    expect(css!.length).toBeGreaterThan(0)
  })

  it('getCriticalCSS returns undefined for unknown routes', () => {
    const css = cache.getCriticalCSS('/unknown-route')
    expect(css).toBeUndefined()
  })

  it('getDeferredCSS returns undefined for unknown routes', () => {
    const css = cache.getDeferredCSS('/unknown-route')
    expect(css).toBeUndefined()
  })

  it('produces critical CSS for all 5 public pages', () => {
    const pages = ['/', '/how-it-works', '/pricing', '/about', '/contact']
    for (const page of pages) {
      expect(cache.getCriticalCSS(page)).toBeDefined()
    }
  })

  it('critical CSS and deferred CSS are different strings', () => {
    const critical = cache.getCriticalCSS('/')!
    const deferred = cache.getDeferredCSS('/')!
    expect(critical).not.toBe(deferred)
  })
})
