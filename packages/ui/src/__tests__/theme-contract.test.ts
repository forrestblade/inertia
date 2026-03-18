import { describe, it, expect, beforeEach } from 'vitest'
import {
  THEME_TOKENS_REQUIRED,
  THEME_TOKENS_DARK,
  validateTheme,
} from '../tokens/theme-contract.js'
import type { ThemeToken, DarkThemeToken } from '../tokens/theme-contract.js'

describe('THEME_TOKENS_REQUIRED', () => {
  it('contains all 15 required semantic tokens', () => {
    expect(THEME_TOKENS_REQUIRED).toContain('color-bg')
    expect(THEME_TOKENS_REQUIRED).toContain('color-bg-elevated')
    expect(THEME_TOKENS_REQUIRED).toContain('color-bg-muted')
    expect(THEME_TOKENS_REQUIRED).toContain('color-text')
    expect(THEME_TOKENS_REQUIRED).toContain('color-text-muted')
    expect(THEME_TOKENS_REQUIRED).toContain('color-text-inverted')
    expect(THEME_TOKENS_REQUIRED).toContain('color-primary')
    expect(THEME_TOKENS_REQUIRED).toContain('color-primary-hover')
    expect(THEME_TOKENS_REQUIRED).toContain('color-primary-text')
    expect(THEME_TOKENS_REQUIRED).toContain('color-error')
    expect(THEME_TOKENS_REQUIRED).toContain('color-success')
    expect(THEME_TOKENS_REQUIRED).toContain('color-warning')
    expect(THEME_TOKENS_REQUIRED).toContain('color-border')
    expect(THEME_TOKENS_REQUIRED).toContain('color-border-focus')
    expect(THEME_TOKENS_REQUIRED).toContain('focus-ring')
    expect(THEME_TOKENS_REQUIRED).toHaveLength(15)
  })

  it('is readonly', () => {
    expect(Object.isFrozen(THEME_TOKENS_REQUIRED)).toBe(true)
  })
})

describe('THEME_TOKENS_DARK', () => {
  it('contains the 6 dark mode override tokens', () => {
    expect(THEME_TOKENS_DARK).toContain('color-bg')
    expect(THEME_TOKENS_DARK).toContain('color-bg-elevated')
    expect(THEME_TOKENS_DARK).toContain('color-bg-muted')
    expect(THEME_TOKENS_DARK).toContain('color-text')
    expect(THEME_TOKENS_DARK).toContain('color-text-muted')
    expect(THEME_TOKENS_DARK).toContain('color-border')
    expect(THEME_TOKENS_DARK).toHaveLength(6)
  })

  it('is a subset of THEME_TOKENS_REQUIRED', () => {
    for (const token of THEME_TOKENS_DARK) {
      expect(THEME_TOKENS_REQUIRED).toContain(token)
    }
  })
})

describe('ThemeToken type', () => {
  it('accepts valid token names', () => {
    const token: ThemeToken = 'color-bg'
    expect(token).toBe('color-bg')
  })
})

describe('DarkThemeToken type', () => {
  it('accepts valid dark token names', () => {
    const token: DarkThemeToken = 'color-border'
    expect(token).toBe('color-border')
  })
})

describe('validateTheme', () => {
  beforeEach(() => {
    // Clear any inline styles from previous tests
    document.documentElement.removeAttribute('style')
  })

  it('returns all 15 token names when none are defined', () => {
    const missing = validateTheme()
    expect(missing).toHaveLength(15)
    expect(missing).toContain('color-bg')
    expect(missing).toContain('focus-ring')
  })

  it('returns empty array when all tokens are defined', () => {
    for (const token of THEME_TOKENS_REQUIRED) {
      document.documentElement.style.setProperty(`--val-${token}`, 'test-value')
    }
    const missing = validateTheme()
    expect(missing).toHaveLength(0)
  })

  it('returns only the missing tokens', () => {
    // Set all except color-error and focus-ring
    for (const token of THEME_TOKENS_REQUIRED) {
      if (token !== 'color-error' && token !== 'focus-ring') {
        document.documentElement.style.setProperty(`--val-${token}`, 'test-value')
      }
    }
    const missing = validateTheme()
    expect(missing).toHaveLength(2)
    expect(missing).toContain('color-error')
    expect(missing).toContain('focus-ring')
  })

  it('returns a readonly array', () => {
    const missing = validateTheme()
    expect(Object.isFrozen(missing)).toBe(true)
  })
})
