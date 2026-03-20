import { describe, it, expect } from 'vitest'
import { camelCase } from '../codegen/naming.js'

describe('camelCase', () => {
  it('converts hyphenated slug to camelCase', () => {
    expect(camelCase('chat-messages')).toBe('chatMessages')
  })

  it('converts multi-hyphenated slug to camelCase', () => {
    expect(camelCase('audit-logs')).toBe('auditLogs')
  })

  it('returns single-word slug unchanged', () => {
    expect(camelCase('users')).toBe('users')
  })

  it('handles underscore-separated slugs', () => {
    expect(camelCase('game_sessions')).toBe('gameSessions')
  })
})
