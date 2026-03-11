import { describe, it, expect } from 'vitest'
import { validateDbConfig, createPool } from '../connection.js'
import type { DbConfig } from '../types.js'

const validConfig: DbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'inertia',
  username: 'app',
  password: 'secret',
  max: 10,
  idle_timeout: 30,
  connect_timeout: 5
}

describe('validateDbConfig', () => {
  it('returns Ok for valid config', () => {
    const result = validateDbConfig(validConfig)
    expect(result.isOk()).toBe(true)
    expect(result._unsafeUnwrap().host).toBe('localhost')
  })

  it('returns Ok for port 1', () => {
    const result = validateDbConfig({ ...validConfig, port: 1 })
    expect(result.isOk()).toBe(true)
  })

  it('returns Ok for port 65535', () => {
    const result = validateDbConfig({ ...validConfig, port: 65535 })
    expect(result.isOk()).toBe(true)
  })

  it('returns Err for missing host', () => {
    const { host: _, ...noHost } = validConfig
    const result = validateDbConfig(noHost)
    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr().code).toBe('INVALID_CONFIG')
  })

  it('returns Err for empty host', () => {
    const result = validateDbConfig({ ...validConfig, host: '' })
    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr().code).toBe('INVALID_CONFIG')
  })

  it('returns Err for port 0', () => {
    const result = validateDbConfig({ ...validConfig, port: 0 })
    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr().code).toBe('INVALID_CONFIG')
  })

  it('returns Err for port 65536', () => {
    const result = validateDbConfig({ ...validConfig, port: 65536 })
    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr().code).toBe('INVALID_CONFIG')
  })

  it('returns Err for empty database', () => {
    const result = validateDbConfig({ ...validConfig, database: '' })
    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr().code).toBe('INVALID_CONFIG')
  })

  it('returns Err for non-positive max', () => {
    const result = validateDbConfig({ ...validConfig, max: 0 })
    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr().code).toBe('INVALID_CONFIG')
  })

  it('returns Err for negative idle_timeout', () => {
    const result = validateDbConfig({ ...validConfig, idle_timeout: -1 })
    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr().code).toBe('INVALID_CONFIG')
  })

  it('returns Err for negative connect_timeout', () => {
    const result = validateDbConfig({ ...validConfig, connect_timeout: -1 })
    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr().code).toBe('INVALID_CONFIG')
  })

  it('error message describes validation issues', () => {
    const result = validateDbConfig({ ...validConfig, port: -5 })
    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr().message.length).toBeGreaterThan(0)
  })
})

describe('createPool', () => {
  it('returns a DbPool with sql property', () => {
    const pool = createPool(validConfig)
    expect(pool.sql).toBeDefined()
    expect(typeof pool.sql).toBe('function')
  })
})
