import { describe, it, expect } from 'vitest'
import { loadConfig } from '../config.js'

describe('loadConfig', () => {
  it('returns a config object with defaults', () => {
    const config = loadConfig()
    expect(config.port).toBe(3000)
    expect(config.host).toBe('0.0.0.0')
    expect(config.db.database).toBe('inertia_studio')
    expect(config.db.port).toBe(5432)
  })

  it('has contact email configured', () => {
    const config = loadConfig()
    expect(config.contactEmail).toBe('mail@forrestblade.com')
  })

  it('has db config with reasonable defaults', () => {
    const config = loadConfig()
    expect(config.db.max).toBe(10)
    expect(config.db.idle_timeout).toBe(20)
    expect(config.db.connect_timeout).toBe(10)
  })
})
