import { describe, it, expect } from 'vitest'
import { extractTokenFromCookie, authenticateRequest } from '../server/auth-helpers.js'

describe('extractTokenFromCookie', () => {
  it('returns undefined for undefined cookie header', () => {
    expect(extractTokenFromCookie(undefined)).toBeUndefined()
  })

  it('returns undefined for empty cookie header', () => {
    expect(extractTokenFromCookie('')).toBeUndefined()
  })

  it('extracts admin_token from simple cookie', () => {
    expect(extractTokenFromCookie('admin_token=abc123')).toBe('abc123')
  })

  it('extracts admin_token from multiple cookies', () => {
    expect(extractTokenFromCookie('session_id=xyz; admin_token=abc123; other=val')).toBe('abc123')
  })

  it('returns undefined when admin_token is missing', () => {
    expect(extractTokenFromCookie('session_id=xyz; other=val')).toBeUndefined()
  })
})

describe('authenticateRequest', () => {
  const adminToken = 'secret-token'

  it('returns Ok when Authorization header matches', () => {
    const headers = { authorization: 'Bearer secret-token', cookie: undefined }
    const result = authenticateRequest(headers, adminToken)
    expect(result.isOk()).toBe(true)
  })

  it('falls back to cookie when Authorization header missing', () => {
    const headers = { authorization: undefined, cookie: 'admin_token=secret-token' }
    const result = authenticateRequest(headers, adminToken)
    expect(result.isOk()).toBe(true)
  })

  it('falls back to cookie when Authorization header invalid', () => {
    const headers = { authorization: 'Bearer wrong-token', cookie: 'admin_token=secret-token' }
    const result = authenticateRequest(headers, adminToken)
    expect(result.isOk()).toBe(true)
  })

  it('returns Err when both header and cookie fail', () => {
    const headers = { authorization: 'Bearer wrong', cookie: 'admin_token=also-wrong' }
    const result = authenticateRequest(headers, adminToken)
    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr().code).toBe('AUTH_FAILED')
  })

  it('returns Err when no auth credentials provided', () => {
    const headers = { authorization: undefined, cookie: undefined }
    const result = authenticateRequest(headers, adminToken)
    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr().code).toBe('AUTH_FAILED')
  })
})
