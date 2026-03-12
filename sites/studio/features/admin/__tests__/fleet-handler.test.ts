import { describe, it, expect, vi } from 'vitest'
import { createFleetOverviewHandler, createFleetCompareHandler } from '../server/fleet-handler.js'

function mockReq (headers: Record<string, string> = {}): unknown {
  return {
    headers: { host: 'localhost', ...headers },
    url: '/admin/fleet'
  }
}

function mockRes (): { writeHead: ReturnType<typeof vi.fn>; end: ReturnType<typeof vi.fn>; html: () => string; statusCode: () => number } {
  let raw = ''
  let status = 200
  return {
    writeHead: vi.fn((code: number) => { status = code }),
    end: vi.fn((data: string) => { raw = data }),
    html: () => raw,
    statusCode: () => status
  }
}

describe('fleet handler auth', () => {
  it('returns login form HTML on 401 instead of bare text', async () => {
    const handler = createFleetOverviewHandler('secret-token')
    const req = mockReq()
    const res = mockRes()
    await handler(req as never, res as never)
    expect(res.statusCode()).toBe(401)
    expect(res.html()).toContain('Admin Login')
    expect(res.html()).toContain('<form')
    expect(res.html()).toContain('name="token"')
  })

  it('returns login form for compare handler on 401', async () => {
    const handler = createFleetCompareHandler('secret-token')
    const req = mockReq()
    const res = mockRes()
    await handler(req as never, res as never)
    expect(res.statusCode()).toBe(401)
    expect(res.html()).toContain('<form')
  })

  it('returns fleet page on valid cookie auth', async () => {
    const handler = createFleetOverviewHandler('secret-token')
    const req = mockReq({ cookie: 'admin_token=secret-token' })
    const res = mockRes()
    await handler(req as never, res as never)
    expect(res.statusCode()).toBe(200)
    expect(res.html()).toContain('hud-fleet-dashboard')
  })
})
