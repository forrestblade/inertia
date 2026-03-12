import { describe, it, expect, vi } from 'vitest'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { createServerRouter } from '../server-router.js'
import type { RouteHandler, ServerRouter } from '../server-types.js'

function mockReq (url: string, method: string = 'GET'): IncomingMessage {
  return { url, method, headers: { host: 'localhost' } } as unknown as IncomingMessage
}

function mockRes (): ServerResponse & { _body: string; _status: number; _headers: Record<string, string> } {
  const res = {
    _body: '',
    _status: 0,
    _headers: {} as Record<string, string>,
    headersSent: false,
    writeHead (status: number, headers?: Record<string, string>) {
      res._status = status
      if (headers) Object.assign(res._headers, headers)
      res.headersSent = true
      return res
    },
    end (body?: string) {
      if (body) res._body = body
    }
  }
  return res as unknown as ServerResponse & { _body: string; _status: number; _headers: Record<string, string> }
}

type Ctx = { readonly label: string }
const ctx: Ctx = { label: 'test' }

describe('createServerRouter', () => {
  it('dispatches GET handler for registered route', async () => {
    const router: ServerRouter<Ctx> = createServerRouter<Ctx>()
    const handler = vi.fn<RouteHandler<Ctx>>(async (_req, res) => {
      res.writeHead(200)
      res.end('ok')
    })

    router.register('/hello', { GET: handler })
    const req = mockReq('/hello')
    const res = mockRes()
    await router.handle(req, res, ctx)

    expect(handler).toHaveBeenCalledOnce()
    expect(res._body).toBe('ok')
  })

  it('dispatches POST handler for registered route', async () => {
    const router = createServerRouter<Ctx>()
    const handler = vi.fn<RouteHandler<Ctx>>(async (_req, res) => {
      res.writeHead(201)
      res.end('created')
    })

    router.register('/submit', { POST: handler })
    const req = mockReq('/submit', 'POST')
    const res = mockRes()
    await router.handle(req, res, ctx)

    expect(handler).toHaveBeenCalledOnce()
    expect(res._body).toBe('created')
  })

  it('returns 404 for unknown route', async () => {
    const router = createServerRouter<Ctx>()
    const req = mockReq('/nope')
    const res = mockRes()
    await router.handle(req, res, ctx)

    expect(res._status).toBe(404)
    expect(res._body).toContain('Not found')
  })

  it('returns 405 for wrong method', async () => {
    const router = createServerRouter<Ctx>()
    router.register('/only-get', { GET: async (_req, res) => { res.end('ok') } })

    const req = mockReq('/only-get', 'POST')
    const res = mockRes()
    await router.handle(req, res, ctx)

    expect(res._status).toBe(405)
    expect(res._body).toContain('not allowed')
  })

  it('calls 404 fallback handler when registered', async () => {
    const router = createServerRouter<Ctx>()
    const fallback = vi.fn<RouteHandler<Ctx>>(async (_req, res) => {
      res.writeHead(404)
      res.end('custom 404')
    })

    router.register('/404', { GET: fallback })
    const req = mockReq('/missing')
    const res = mockRes()
    await router.handle(req, res, ctx)

    expect(fallback).toHaveBeenCalledOnce()
    expect(res._body).toBe('custom 404')
  })

  it('error boundary: handler that rejects returns 500, server stays alive', async () => {
    const router = createServerRouter<Ctx>()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    router.register('/boom', {
      GET: async () => {
        return Promise.reject(new Error('db connection lost'))
      }
    })

    const req = mockReq('/boom')
    const res = mockRes()
    await router.handle(req, res, ctx)

    expect(res._status).toBe(500)
    expect(res._body).toContain('Internal server error')
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[server-router]'),
      expect.stringContaining('db connection lost')
    )

    consoleSpy.mockRestore()
  })

  it('error boundary: handler that throws sync returns 500, server stays alive', async () => {
    const router = createServerRouter<Ctx>()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    router.register('/crash', {
      GET: async () => {
        throw new Error('null reference')
      }
    })

    const req = mockReq('/crash')
    const res = mockRes()
    await router.handle(req, res, ctx)

    expect(res._status).toBe(500)
    expect(res._body).toContain('Internal server error')

    consoleSpy.mockRestore()
  })

  it('does not send 500 if handler already sent headers', async () => {
    const router = createServerRouter<Ctx>()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    router.register('/partial', {
      GET: async (_req, res) => {
        res.writeHead(200)
        throw new Error('mid-stream failure')
      }
    })

    const req = mockReq('/partial')
    const res = mockRes()
    await router.handle(req, res, ctx)

    // Headers already sent, so status should remain 200 (not overwritten to 500)
    expect(res._status).toBe(200)
    // Error should still be logged
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })
})
