import { describe, it, expect, vi, beforeAll } from 'vitest'

let registerRoutes: typeof import('../register-routes.js').registerRoutes

beforeAll(async () => {
  const mod = await import('../register-routes.js')
  registerRoutes = mod.registerRoutes
})

describe('registerRoutes', () => {
  it('registers all expected route paths', () => {
    const registered: string[] = []
    const mockRouter = {
      register: vi.fn((path: string) => { registered.push(path) })
    }

    registerRoutes(mockRouter as unknown as Parameters<typeof registerRoutes>[0])

    const expectedPaths = [
      // Infrastructure
      '/health', '/sitemap.xml', '/robots.txt',
      // Content pages
      '/', '/how-it-works', '/about', '/pricing', '/contact', '/free-site-audit',
      // 301 redirects
      '/principles', '/services', '/audit',
      // Admin
      '/admin/hud', '/admin/fleet', '/admin/fleet/compare',
      // Fleet APIs
      '/api/fleet/sites', '/api/fleet/aggregates', '/api/fleet/alerts', '/api/fleet/compare',
      // Aggregation
      '/api/aggregation',
      // Breakdowns
      '/api/breakdowns/pages', '/api/breakdowns/sources', '/api/breakdowns/actions',
      // Trend + Summaries
      '/api/summaries/trend',
      '/api/summaries/sessions', '/api/summaries/events', '/api/summaries/conversions',
      '/api/diagnostics/ingestion',
      // Telemetry
      '/api/telemetry', '/api/session',
      // 404
      '/404'
    ]

    for (const path of expectedPaths) {
      expect(registered).toContain(path)
    }
  })

  it('registers GET handlers for all content pages', () => {
    const routes: Record<string, Record<string, unknown>> = {}
    const mockRouter = {
      register: vi.fn((path: string, handlers: Record<string, unknown>) => {
        routes[path] = handlers
      })
    }

    registerRoutes(mockRouter as unknown as Parameters<typeof registerRoutes>[0])

    const getPages = ['/', '/how-it-works', '/about', '/pricing', '/free-site-audit']
    for (const path of getPages) {
      expect(routes[path]).toBeDefined()
      expect(typeof routes[path]?.['GET']).toBe('function')
    }
  })

  it('registers POST handlers for contact and audit', () => {
    const routes: Record<string, Record<string, unknown>> = {}
    const mockRouter = {
      register: vi.fn((path: string, handlers: Record<string, unknown>) => {
        routes[path] = handlers
      })
    }

    registerRoutes(mockRouter as unknown as Parameters<typeof registerRoutes>[0])

    expect(typeof routes['/contact']?.['POST']).toBe('function')
    expect(typeof routes['/free-site-audit']?.['POST']).toBe('function')
  })

  it('registers the 404 fallback route', () => {
    const registered: string[] = []
    const mockRouter = {
      register: vi.fn((path: string) => { registered.push(path) })
    }

    registerRoutes(mockRouter as unknown as Parameters<typeof registerRoutes>[0])
    expect(registered).toContain('/404')
  })
})
