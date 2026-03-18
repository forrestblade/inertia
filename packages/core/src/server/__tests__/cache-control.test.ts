import { describe, it, expect } from 'vitest'
import type { ServerResponse } from 'node:http'
import { cacheControl, setCacheHeaders, versionedUrl } from '../cache-control.js'

function mockRes (): ServerResponse & { _headers: Record<string, string> } {
  const res = {
    _headers: {} as Record<string, string>,
    setHeader (name: string, value: string) {
      res._headers[name] = value
    }
  }
  return res as unknown as ServerResponse & { _headers: Record<string, string> }
}

describe('cacheControl', () => {
  it('returns immutable header string', () => {
    expect(cacheControl('immutable')).toBe('public, max-age=31536000, immutable')
  })

  it('returns revalidate header string', () => {
    expect(cacheControl('revalidate')).toBe('public, max-age=60, stale-while-revalidate=300')
  })

  it('returns private header string', () => {
    expect(cacheControl('private')).toBe('private, no-cache')
  })

  it('returns island header with default TTL', () => {
    expect(cacheControl('island')).toBe('public, max-age=60, stale-while-revalidate=30')
  })

  it('returns island header with custom maxAge', () => {
    expect(cacheControl('island', { maxAge: 120 })).toBe('public, max-age=120, stale-while-revalidate=60')
  })

  it('returns island stale-while-revalidate as half of maxAge', () => {
    expect(cacheControl('island', { maxAge: 200 })).toBe('public, max-age=200, stale-while-revalidate=100')
  })
})

describe('setCacheHeaders', () => {
  it('sets Cache-Control header on response for immutable', () => {
    const res = mockRes()
    setCacheHeaders(res, 'immutable')
    expect(res._headers['Cache-Control']).toBe('public, max-age=31536000, immutable')
  })

  it('sets Cache-Control header for revalidate', () => {
    const res = mockRes()
    setCacheHeaders(res, 'revalidate')
    expect(res._headers['Cache-Control']).toBe('public, max-age=60, stale-while-revalidate=300')
  })

  it('sets Cache-Control header for private', () => {
    const res = mockRes()
    setCacheHeaders(res, 'private')
    expect(res._headers['Cache-Control']).toBe('private, no-cache')
  })

  it('passes options through for island profile', () => {
    const res = mockRes()
    setCacheHeaders(res, 'island', { maxAge: 90 })
    expect(res._headers['Cache-Control']).toBe('public, max-age=90, stale-while-revalidate=45')
  })
})

describe('versionedUrl', () => {
  it('appends version query parameter', () => {
    expect(versionedUrl('/assets/app.js', 'abc123')).toBe('/assets/app.js?v=abc123')
  })

  it('appends to existing query string', () => {
    expect(versionedUrl('/assets/app.js?theme=dark', 'abc123')).toBe('/assets/app.js?theme=dark&v=abc123')
  })

  it('returns url unchanged when version is empty', () => {
    expect(versionedUrl('/assets/app.js', '')).toBe('/assets/app.js')
  })
})
