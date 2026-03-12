import { describe, it, expect } from 'vitest'
import type { ServerResponse, IncomingMessage } from 'node:http'
import { sendHtml, isFragmentRequest } from '../http-helpers.js'

function mockRes (): ServerResponse & { _status: number; _headers: Record<string, string | number>; _body: string } {
  const res = {
    _status: 0,
    _headers: {} as Record<string, string | number>,
    _body: '',
    writeHead (status: number, headers?: Record<string, string | number>) {
      res._status = status
      if (headers) Object.assign(res._headers, headers)
      return res
    },
    end (body?: string) {
      if (body) res._body = body
    }
  }
  return res as unknown as ServerResponse & { _status: number; _headers: Record<string, string | number>; _body: string }
}

describe('sendHtml', () => {
  it('sends html with Content-Type header', () => {
    const res = mockRes()
    sendHtml(res, '<p>Hello</p>')
    expect(res._status).toBe(200)
    expect(res._headers['Content-Type']).toBe('text/html; charset=utf-8')
    expect(res._body).toBe('<p>Hello</p>')
  })

  it('sends with custom status code', () => {
    const res = mockRes()
    sendHtml(res, '<p>Not Found</p>', 404)
    expect(res._status).toBe(404)
  })

  it('merges extra headers when provided', () => {
    const res = mockRes()
    sendHtml(res, '<p>Test</p>', 200, {
      'X-Inertia-Version': 'abc123',
      'X-Inertia-Title': 'Test Page'
    })
    expect(res._headers['X-Inertia-Version']).toBe('abc123')
    expect(res._headers['X-Inertia-Title']).toBe('Test Page')
    expect(res._headers['Content-Type']).toBe('text/html; charset=utf-8')
  })

  it('works without extra headers (backward compatible)', () => {
    const res = mockRes()
    sendHtml(res, '<p>No extras</p>')
    expect(res._headers['Content-Type']).toBe('text/html; charset=utf-8')
    expect(res._body).toBe('<p>No extras</p>')
  })
})

describe('isFragmentRequest', () => {
  it('returns true when X-Inertia-Fragment is 1', () => {
    const req = { headers: { 'x-inertia-fragment': '1' } } as unknown as IncomingMessage
    expect(isFragmentRequest(req)).toBe(true)
  })

  it('returns false when header is missing', () => {
    const req = { headers: {} } as unknown as IncomingMessage
    expect(isFragmentRequest(req)).toBe(false)
  })
})
