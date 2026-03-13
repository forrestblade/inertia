import { describe, it, expect, beforeAll } from 'vitest'
import type { IncomingMessage, ServerResponse } from 'node:http'

let sitemapHandler: typeof import('../seo-handlers.js').sitemapHandler
let robotsHandler: typeof import('../seo-handlers.js').robotsHandler

beforeAll(async () => {
  const mod = await import('../seo-handlers.js')
  sitemapHandler = mod.sitemapHandler
  robotsHandler = mod.robotsHandler
})

function mockReq (): IncomingMessage {
  return { url: '/', headers: { host: 'localhost:3000' } } as unknown as IncomingMessage
}

function mockRes (): ServerResponse & { _body: string; _status: number; _headers: Record<string, string> } {
  const res = {
    _body: '',
    _status: 200,
    _headers: {} as Record<string, string>,
    writeHead (status: number, headers?: Record<string, string | number>) {
      res._status = status
      if (headers) {
        for (const [k, v] of Object.entries(headers)) {
          res._headers[k] = String(v)
        }
      }
    },
    end (body?: string) { res._body = body ?? '' },
    setHeader (key: string, value: string) { res._headers[key] = value }
  }
  return res as unknown as ServerResponse & { _body: string; _status: number; _headers: Record<string, string> }
}

const mockCtx = {} as Parameters<typeof sitemapHandler>[2]

describe('sitemapHandler', () => {
  it('returns application/xml content type', async () => {
    const res = mockRes()
    await sitemapHandler(mockReq(), res, mockCtx)
    expect(res._headers['Content-Type']).toBe('application/xml; charset=utf-8')
  })

  it('returns valid XML with urlset root', async () => {
    const res = mockRes()
    await sitemapHandler(mockReq(), res, mockCtx)
    expect(res._body).toContain('<?xml version="1.0"')
    expect(res._body).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
  })

  it('includes all 6 public pages', async () => {
    const res = mockRes()
    await sitemapHandler(mockReq(), res, mockCtx)
    const pages = ['/', '/how-it-works', '/pricing', '/about', '/contact', '/free-site-audit']
    for (const page of pages) {
      expect(res._body).toContain(`<loc>https://inertiawebsolutions.com${page}</loc>`)
    }
  })

  it('does not include admin routes', async () => {
    const res = mockRes()
    await sitemapHandler(mockReq(), res, mockCtx)
    expect(res._body).not.toContain('/admin')
  })

  it('includes lastmod with ISO date format', async () => {
    const res = mockRes()
    await sitemapHandler(mockReq(), res, mockCtx)
    expect(res._body).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/)
  })

  it('sets pricing priority to 0.9', async () => {
    const res = mockRes()
    await sitemapHandler(mockReq(), res, mockCtx)
    // Find the <url> block containing /pricing
    const pricingBlock = res._body.split('<url>').find(b => b.includes('/pricing'))
    expect(pricingBlock).toContain('<priority>0.9</priority>')
  })

  it('sets Cache-Control to public max-age 86400', async () => {
    const res = mockRes()
    await sitemapHandler(mockReq(), res, mockCtx)
    expect(res._headers['Cache-Control']).toBe('public, max-age=86400')
  })
})

describe('robotsHandler', () => {
  it('returns text/plain content type', async () => {
    const res = mockRes()
    await robotsHandler(mockReq(), res, mockCtx)
    expect(res._headers['Content-Type']).toBe('text/plain; charset=utf-8')
  })

  it('disallows /admin/', async () => {
    const res = mockRes()
    await robotsHandler(mockReq(), res, mockCtx)
    expect(res._body).toContain('Disallow: /admin/')
  })

  it('disallows /api/', async () => {
    const res = mockRes()
    await robotsHandler(mockReq(), res, mockCtx)
    expect(res._body).toContain('Disallow: /api/')
  })

  it('allows root', async () => {
    const res = mockRes()
    await robotsHandler(mockReq(), res, mockCtx)
    expect(res._body).toContain('Allow: /')
  })

  it('includes sitemap URL', async () => {
    const res = mockRes()
    await robotsHandler(mockReq(), res, mockCtx)
    expect(res._body).toContain('Sitemap: https://inertiawebsolutions.com/sitemap.xml')
  })

  it('sets Cache-Control to public max-age 86400', async () => {
    const res = mockRes()
    await robotsHandler(mockReq(), res, mockCtx)
    expect(res._headers['Cache-Control']).toBe('public, max-age=86400')
  })
})
