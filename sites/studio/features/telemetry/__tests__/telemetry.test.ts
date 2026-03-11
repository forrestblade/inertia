import { describe, it, expect } from 'vitest'
import { TELEMETRY_CONFIG } from '../config/telemetry-config.js'

describe('TELEMETRY_CONFIG', () => {
  it('has buffer capacity of 1024', () => {
    expect(TELEMETRY_CONFIG.bufferCapacity).toBe(1024)
  })

  it('has 30s flush interval', () => {
    expect(TELEMETRY_CONFIG.flushIntervalMs).toBe(30000)
  })

  it('has correct endpoint', () => {
    expect(TELEMETRY_CONFIG.endpoint).toBe('/api/telemetry')
  })

  it('has session endpoint', () => {
    expect(TELEMETRY_CONFIG.sessionEndpoint).toBe('/api/session')
  })
})
