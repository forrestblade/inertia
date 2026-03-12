import { describe, it, expect } from 'vitest'
import { signPayload, verifySignature, HmacErrorCode } from '../hmac.js'

describe('signPayload', () => {
  it('returns a hex string', () => {
    const sig = signPayload('secret', '{"test":true}')
    expect(typeof sig).toBe('string')
    expect(sig).toMatch(/^[0-9a-f]+$/)
  })

  it('returns consistent signatures for same input', () => {
    const body = '{"site_id":"test"}'
    const sig1 = signPayload('secret', body)
    const sig2 = signPayload('secret', body)
    expect(sig1).toBe(sig2)
  })

  it('returns different signatures for different secrets', () => {
    const body = '{"site_id":"test"}'
    const sig1 = signPayload('secret-a', body)
    const sig2 = signPayload('secret-b', body)
    expect(sig1).not.toBe(sig2)
  })

  it('returns different signatures for different bodies', () => {
    const sig1 = signPayload('secret', '{"a":1}')
    const sig2 = signPayload('secret', '{"b":2}')
    expect(sig1).not.toBe(sig2)
  })

  it('produces a 64-char hex string (SHA-256)', () => {
    const sig = signPayload('secret', 'body')
    expect(sig.length).toBe(64)
  })
})

describe('verifySignature', () => {
  it('returns Ok for valid signature', () => {
    const body = '{"site_id":"test"}'
    const sig = signPayload('secret', body)
    const result = verifySignature('secret', body, sig)
    expect(result.isOk()).toBe(true)
  })

  it('returns Err for wrong signature', () => {
    const result = verifySignature('secret', '{"site_id":"test"}', 'deadbeef'.repeat(8))
    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr().code).toBe(HmacErrorCode.INVALID_SIGNATURE)
  })

  it('returns Err for empty signature', () => {
    const result = verifySignature('secret', '{"site_id":"test"}', '')
    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr().code).toBe(HmacErrorCode.MISSING_SIGNATURE)
  })

  it('returns Err for wrong-length signature', () => {
    const result = verifySignature('secret', '{"site_id":"test"}', 'abc')
    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr().code).toBe(HmacErrorCode.INVALID_SIGNATURE)
  })

  it('returns Err for tampered body', () => {
    const sig = signPayload('secret', '{"site_id":"test"}')
    const result = verifySignature('secret', '{"site_id":"tampered"}', sig)
    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr().code).toBe(HmacErrorCode.INVALID_SIGNATURE)
  })

  it('returns Err for wrong secret', () => {
    const sig = signPayload('secret-a', '{"site_id":"test"}')
    const result = verifySignature('secret-b', '{"site_id":"test"}', sig)
    expect(result.isErr()).toBe(true)
  })
})

describe('HmacErrorCode', () => {
  it('has INVALID_SIGNATURE code', () => {
    expect(HmacErrorCode.INVALID_SIGNATURE).toBe('INVALID_SIGNATURE')
  })

  it('has MISSING_SIGNATURE code', () => {
    expect(HmacErrorCode.MISSING_SIGNATURE).toBe('MISSING_SIGNATURE')
  })
})
