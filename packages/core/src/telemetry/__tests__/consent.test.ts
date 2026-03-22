import { describe, it, expect, vi, afterEach } from 'vitest'
import { shouldTrack } from '../consent.js'

describe('shouldTrack', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    // Clean up the consent flag
    delete (globalThis as Record<string, unknown>).__valence_telemetry_consent
  })

  it('returns true when no privacy signals are set', () => {
    vi.stubGlobal('navigator', {})
    expect(shouldTrack()).toBe(true)
  })

  it('returns false when navigator.doNotTrack is "1"', () => {
    vi.stubGlobal('navigator', { doNotTrack: '1' })
    expect(shouldTrack()).toBe(false)
  })

  it('returns true when navigator.doNotTrack is "0"', () => {
    vi.stubGlobal('navigator', { doNotTrack: '0' })
    expect(shouldTrack()).toBe(true)
  })

  it('returns true when navigator.doNotTrack is null', () => {
    vi.stubGlobal('navigator', { doNotTrack: null })
    expect(shouldTrack()).toBe(true)
  })

  it('returns true when navigator.doNotTrack is "unspecified"', () => {
    vi.stubGlobal('navigator', { doNotTrack: 'unspecified' })
    expect(shouldTrack()).toBe(true)
  })

  it('returns false when navigator.globalPrivacyControl is true', () => {
    vi.stubGlobal('navigator', { globalPrivacyControl: true })
    expect(shouldTrack()).toBe(false)
  })

  it('returns true when navigator.globalPrivacyControl is false', () => {
    vi.stubGlobal('navigator', { globalPrivacyControl: false })
    expect(shouldTrack()).toBe(true)
  })

  it('returns true when navigator.globalPrivacyControl is undefined', () => {
    vi.stubGlobal('navigator', {})
    expect(shouldTrack()).toBe(true)
  })

  it('returns false when window.__valence_telemetry_consent is false', () => {
    vi.stubGlobal('navigator', {});
    (globalThis as Record<string, unknown>).__valence_telemetry_consent = false
    expect(shouldTrack()).toBe(false)
  })

  it('returns true when window.__valence_telemetry_consent is true', () => {
    vi.stubGlobal('navigator', {});
    (globalThis as Record<string, unknown>).__valence_telemetry_consent = true
    expect(shouldTrack()).toBe(true)
  })

  it('returns true when window.__valence_telemetry_consent is undefined', () => {
    vi.stubGlobal('navigator', {})
    expect(shouldTrack()).toBe(true)
  })

  it('returns false when both DNT and GPC are set', () => {
    vi.stubGlobal('navigator', {
      doNotTrack: '1',
      globalPrivacyControl: true
    })
    expect(shouldTrack()).toBe(false)
  })

  it('returns false when DNT is set but GPC is false', () => {
    vi.stubGlobal('navigator', {
      doNotTrack: '1',
      globalPrivacyControl: false
    })
    expect(shouldTrack()).toBe(false)
  })

  it('returns false when consent is false but DNT/GPC are not set', () => {
    vi.stubGlobal('navigator', {});
    (globalThis as Record<string, unknown>).__valence_telemetry_consent = false
    expect(shouldTrack()).toBe(false)
  })

  it('returns false when all three deny signals are set', () => {
    vi.stubGlobal('navigator', {
      doNotTrack: '1',
      globalPrivacyControl: true
    });
    (globalThis as Record<string, unknown>).__valence_telemetry_consent = false
    expect(shouldTrack()).toBe(false)
  })
})
