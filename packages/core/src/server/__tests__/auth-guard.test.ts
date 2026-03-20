import { describe, it, expect } from 'vitest'
import { hasRole, DefaultRoleHierarchy } from '../auth-guard.js'

describe('hasRole', () => {
  it('returns true when user role outranks required role', () => {
    expect(hasRole('admin', 'editor', DefaultRoleHierarchy)).toBe(true)
  })

  it('returns false when user role is below required role', () => {
    expect(hasRole('editor', 'admin', DefaultRoleHierarchy)).toBe(false)
  })

  it('returns true when user role equals required role', () => {
    expect(hasRole('editor', 'editor', DefaultRoleHierarchy)).toBe(true)
  })

  it('returns false when user role is unknown', () => {
    expect(hasRole('unknown', 'admin', DefaultRoleHierarchy)).toBe(false)
  })

  it('supports custom hierarchy', () => {
    const custom = { editor: 1, admin: 2, superadmin: 3 } as const
    expect(hasRole('superadmin', 'admin', custom)).toBe(true)
  })
})
