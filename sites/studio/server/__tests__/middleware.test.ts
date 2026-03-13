import { describe, it, expect, beforeAll } from 'vitest'
import type { IncomingMessage, ServerResponse } from 'node:http'

let applySecurityHeaders: typeof import('../middleware.js').applySecurityHeaders
let tryServeStatic: typeof import('../middleware.js').tryServeStatic

beforeAll(async () => {
  const mod = await import('../middleware.js')
  applySecurityHeaders = mod.applySecurityHeaders
  tryServeStatic = mod.tryServeStatic
})

function mockReq (url: string): IncomingMessage {
  return { url, headers: { host: 'localhost:3000' } } as unknown as IncomingMessage
}

function mockRes (): ServerResponse & { _headers: Record<string, string>; _status: number; _body: Buffer | string } {
  const res = {
    _headers: {} as Record<string, string>,
    _status: 200,
    _body: '' as Buffer | string,
    setHeader (key: string, value: string) { res._headers[key] = value },
    writeHead (status: number, headers?: Record<string, string | number>) {
      res._status = status
      if (headers) {
        for (const [k, v] of Object.entries(headers)) {
          res._headers[k] = String(v)
        }
      }
    },
    end (body?: Buffer | string) { res._body = body ?? '' }
  }
  return res as unknown as ServerResponse & { _headers: Record<string, string>; _status: number; _body: Buffer | string }
}

describe('applySecurityHeaders', () => {
  it('sets X-Content-Type-Options to nosniff', () => {
    const res = mockRes()
    applySecurityHeaders(res)
    expect(res._headers['X-Content-Type-Options']).toBe('nosniff')
  })

  it('sets X-Frame-Options to DENY', () => {
    const res = mockRes()
    applySecurityHeaders(res)
    expect(res._headers['X-Frame-Options']).toBe('DENY')
  })

  it('sets Strict-Transport-Security with preload', () => {
    const res = mockRes()
    applySecurityHeaders(res)
    expect(res._headers['Strict-Transport-Security']).toContain('preload')
  })

  it('sets Content-Security-Policy with frame-ancestors none', () => {
    const res = mockRes()
    applySecurityHeaders(res)
    expect(res._headers['Content-Security-Policy']).toContain("frame-ancestors 'none'")
  })

  it('sets Referrer-Policy', () => {
    const res = mockRes()
    applySecurityHeaders(res)
    expect(res._headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
  })

  it('sets all 6 security headers', () => {
    const res = mockRes()
    applySecurityHeaders(res)
    const expected = [
      'X-Content-Type-Options', 'X-Frame-Options', 'X-XSS-Protection',
      'Referrer-Policy', 'Strict-Transport-Security', 'Content-Security-Policy'
    ]
    for (const header of expected) {
      expect(res._headers[header]).toBeDefined()
    }
  })
})

describe('tryServeStatic', () => {
  it('returns false for extensionless paths (routes)', async () => {
    const result = await tryServeStatic(mockReq('/about'), mockRes())
    expect(result).toBe(false)
  })

  it('returns false for unknown extensions', async () => {
    const result = await tryServeStatic(mockReq('/malware.exe'), mockRes())
    expect(result).toBe(false)
  })

  it('blocks directory traversal via /../', async () => {
    const result = await tryServeStatic(mockReq('/../../../etc/passwd.js'), mockRes())
    expect(result).toBe(false)
  })

  it('blocks encoded directory traversal', async () => {
    const result = await tryServeStatic(mockReq('/%2e%2e/%2e%2e/etc/passwd.js'), mockRes())
    expect(result).toBe(false)
  })

  it('returns false when file does not exist', async () => {
    const result = await tryServeStatic(mockReq('/js/nonexistent.js'), mockRes())
    expect(result).toBe(false)
  })

  it('sets correct MIME type for .css files', async () => {
    const { writeFile, mkdir } = await import('node:fs/promises')
    const { join } = await import('node:path')
    const publicDir = join(process.cwd(), 'public', 'css')
    await mkdir(publicDir, { recursive: true })
    await writeFile(join(publicDir, '__test__.css'), 'body{}')

    const res = mockRes()
    const result = await tryServeStatic(mockReq('/css/__test__.css'), res)
    expect(result).toBe(true)
    expect(res._headers['Content-Type']).toBe('text/css')
    expect(res._headers['Cache-Control']).toBe('public, max-age=31536000, immutable')

    const { unlink } = await import('node:fs/promises')
    await unlink(join(publicDir, '__test__.css')).catch(() => {})
  })

  it('sets correct MIME type for .woff2 files', async () => {
    const { writeFile, mkdir } = await import('node:fs/promises')
    const { join } = await import('node:path')
    const fontsDir = join(process.cwd(), 'public', 'fonts')
    await mkdir(fontsDir, { recursive: true })
    await writeFile(join(fontsDir, '__test__.woff2'), Buffer.from([0]))

    const res = mockRes()
    const result = await tryServeStatic(mockReq('/fonts/__test__.woff2'), res)
    expect(result).toBe(true)
    expect(res._headers['Content-Type']).toBe('font/woff2')

    const { unlink } = await import('node:fs/promises')
    await unlink(join(fontsDir, '__test__.woff2')).catch(() => {})
  })
})
