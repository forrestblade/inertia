import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { themeManager, ThemeMode, createTokenSheet } from '../tokens/index.js'
import { themeManager as coreThemeManager } from '../core/index.js'
import { darkTokenSheet } from '../tokens/token-sheets.js'

describe('token exports', () => {
  it('themeManager is re-exported from tokens/index', () => {
    expect(themeManager).toBeDefined()
    expect(typeof themeManager.setTheme).toBe('function')
  })

  it('ThemeMode is re-exported from tokens/index', () => {
    expect(ThemeMode).toBeDefined()
    expect(ThemeMode.Light).toBe('light')
  })

  it('createTokenSheet is re-exported from tokens/index', () => {
    expect(createTokenSheet).toBeDefined()
    expect(typeof createTokenSheet).toBe('function')
  })

  it('themeManager is re-exported from core/index', () => {
    expect(coreThemeManager).toBeDefined()
    expect(coreThemeManager).toBe(themeManager)
  })
})

describe('system preference auto-switch', () => {
  let mockMql: { matches: boolean, listeners: Array<(e: MediaQueryListEvent) => void> }
  let originalMatchMedia: typeof globalThis.matchMedia

  beforeEach(() => {
    originalMatchMedia = globalThis.matchMedia
    mockMql = { matches: false, listeners: [] }
    globalThis.matchMedia = (query: string) => ({
      matches: mockMql.matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: (_: string, handler: EventListenerOrEventListenerObject) => {
        mockMql.listeners.push(handler as (e: MediaQueryListEvent) => void)
      },
      removeEventListener: (_: string, handler: EventListenerOrEventListenerObject) => {
        mockMql.listeners = mockMql.listeners.filter(h => h !== handler)
      },
      dispatchEvent: () => false,
    }) as MediaQueryList
    // Reset after matchMedia override so the manager picks up the mock
    themeManager._reset()
  })

  afterEach(() => {
    themeManager._reset()
    globalThis.matchMedia = originalMatchMedia
  })

  it('system preference change auto-switches when mode is "system"', () => {
    themeManager.setTheme(ThemeMode.System)

    // Simulate system dark mode change
    mockMql.matches = true
    for (const listener of mockMql.listeners) {
      listener({ matches: true } as MediaQueryListEvent)
    }

    expect(themeManager.getActiveSheet()).toBe(darkTokenSheet)
  })
})
