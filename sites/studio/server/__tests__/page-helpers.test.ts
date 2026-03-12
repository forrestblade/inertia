import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { RouteContext } from '../types.js'
import type { CriticalCSSCache } from '../../features/budget/critical-css-pipeline.js'

function makeReq (headers: Record<string, string> = {}): IncomingMessage {
  return { headers } as unknown as IncomingMessage
}

function makeRes (): ServerResponse & { writtenData: string; writtenStatus: number; writtenHeaders: Record<string, string | number> } {
  const state = {
    writtenData: '',
    writtenStatus: 200,
    writtenHeaders: {} as Record<string, string | number>
  }
  const res = Object.assign(state, {
    setHeader: vi.fn(),
    writeHead: vi.fn((code: number, headers?: Record<string, string | number>) => {
      state.writtenStatus = code
      if (headers) Object.assign(state.writtenHeaders, headers)
    }),
    end: vi.fn((data: string) => {
      state.writtenData = data
    })
  })
  return res as unknown as ServerResponse & { writtenData: string; writtenStatus: number; writtenHeaders: Record<string, string | number> }
}

function makeCtx (criticalCSS?: string): RouteContext {
  const pipeline: CriticalCSSCache = {
    getCriticalCSS: () => criticalCSS,
    getDeferredCSS: () => undefined
  }
  return {
    pool: {} as RouteContext['pool'],
    config: {} as RouteContext['config'],
    cssPipeline: pipeline
  }
}

describe('respondWithPage', () => {
  let respondWithPage: typeof import('../page-helpers.js').respondWithPage

  beforeEach(async () => {
    vi.resetModules()
    const mod = await import('../page-helpers.js')
    respondWithPage = mod.respondWithPage
  })

  it('sends fragment when X-Inertia-Fragment header is set', () => {
    const req = makeReq({ 'x-inertia-fragment': '1' })
    const res = makeRes()
    const ctx = makeCtx()

    respondWithPage(req, res, ctx, {
      title: 'Test',
      description: 'desc',
      deferredCSSPath: '/css/studio.css',
      mainContent: '<p>hello</p>',
      currentPath: '/'
    })

    expect(res.writtenData).toBe('<p>hello</p>')
  })

  it('sends full shell with critical CSS injected', () => {
    const req = makeReq({})
    const res = makeRes()
    const ctx = makeCtx('body{color:red}')

    respondWithPage(req, res, ctx, {
      title: 'Test',
      description: 'desc',
      deferredCSSPath: '/css/studio.css',
      mainContent: '<p>hello</p>',
      currentPath: '/'
    })

    expect(res.writtenData).toContain('<style>body{color:red}</style>')
    expect(res.writtenData).toContain('<p>hello</p>')
  })

  it('respects custom status code', () => {
    const req = makeReq({})
    const res = makeRes()
    const ctx = makeCtx()

    respondWithPage(req, res, ctx, {
      title: 'Not Found',
      description: 'desc',
      deferredCSSPath: '/css/studio.css',
      mainContent: '<p>404</p>',
      currentPath: ''
    }, 404)

    expect(res.writtenStatus).toBe(404)
  })

  it('includes X-Inertia-Version header on full page response', () => {
    const req = makeReq({})
    const res = makeRes()
    const ctx = makeCtx()

    respondWithPage(req, res, ctx, {
      title: 'Test',
      description: 'desc',
      deferredCSSPath: '/css/studio.css',
      mainContent: '<p>hello</p>',
      currentPath: '/'
    })

    expect(res.writtenHeaders['X-Inertia-Version']).toBeDefined()
    expect(typeof res.writtenHeaders['X-Inertia-Version']).toBe('string')
    expect((res.writtenHeaders['X-Inertia-Version'] as string).length).toBeGreaterThan(0)
  })

  it('includes X-Inertia-Title header on full page response', () => {
    const req = makeReq({})
    const res = makeRes()
    const ctx = makeCtx()

    respondWithPage(req, res, ctx, {
      title: 'About',
      description: 'desc',
      deferredCSSPath: '/css/studio.css',
      mainContent: '<p>about</p>',
      currentPath: '/about'
    })

    expect(res.writtenHeaders['X-Inertia-Title']).toBe('About | Inertia Web Solutions')
  })

  it('includes version and title headers on fragment response', () => {
    const req = makeReq({ 'x-inertia-fragment': '1' })
    const res = makeRes()
    const ctx = makeCtx()

    respondWithPage(req, res, ctx, {
      title: 'Home',
      description: 'desc',
      deferredCSSPath: '/css/studio.css',
      mainContent: '<p>home</p>',
      currentPath: '/'
    })

    expect(res.writtenHeaders['X-Inertia-Version']).toBeDefined()
    expect(res.writtenHeaders['X-Inertia-Title']).toBe('Home | Inertia Web Solutions')
  })

  it('uses empty string when pipeline has no CSS for route', () => {
    const req = makeReq({})
    const res = makeRes()
    const pipeline: CriticalCSSCache = {
      getCriticalCSS: () => undefined,
      getDeferredCSS: () => undefined
    }
    const ctx: RouteContext = {
      pool: {} as RouteContext['pool'],
      config: {} as RouteContext['config'],
      cssPipeline: pipeline
    }

    respondWithPage(req, res, ctx, {
      title: 'Test',
      description: 'desc',
      deferredCSSPath: '/css/studio.css',
      mainContent: '<p>hi</p>',
      currentPath: '/unknown'
    })

    expect(res.writtenData).toContain('<style></style>')
  })
})
