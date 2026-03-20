import { describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('token exports', () => {
  it('themeManager is re-exported from tokens/index', async () => {
    const tokens = await import('../tokens/index.js')
    expect(tokens.themeManager).toBeDefined()
    expect(typeof tokens.themeManager.setTheme).toBe('function')
  })

  it('ThemeMode is re-exported from tokens/index', async () => {
    const tokens = await import('../tokens/index.js')
    expect(tokens.ThemeMode).toBeDefined()
    expect(tokens.ThemeMode.Light).toBe('light')
  })

  it('createTokenSheet is re-exported from tokens/index', async () => {
    const tokens = await import('../tokens/index.js')
    expect(tokens.createTokenSheet).toBeDefined()
    expect(typeof tokens.createTokenSheet).toBe('function')
  })

  it('themeManager is re-exported from core/index', async () => {
    const core = await import('../core/index.js')
    expect(core.themeManager).toBeDefined()
  })

  it('themeManager is accessible from top-level index', async () => {
    const ui = await import('../index.js')
    expect(ui.themeManager).toBeDefined()
  })
})

describe('system preference auto-switch', () => {
  let mockMql: { matches: boolean, listeners: Array<(e: MediaQueryListEvent) => void> }

  beforeEach(() => {
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
  })

  afterEach(() => {
    // Restore basic matchMedia polyfill
    globalThis.matchMedia = (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
  })

  it('system preference change auto-switches when mode is "system"', async () => {
    // Need fresh module imports after matchMedia override
    // Reset modules to pick up new matchMedia
    const { ThemeMode } = await import('../tokens/theme-manager.js')
    const { themeManager } = await import('../tokens/theme-manager.js')
    const { darkTokenSheet } = await import('../tokens/token-sheets.js')

    themeManager._reset()
    themeManager.setTheme(ThemeMode.System)

    // Simulate system dark mode change
    mockMql.matches = true
    for (const listener of mockMql.listeners) {
      listener({ matches: true } as MediaQueryListEvent)
    }

    expect(themeManager.getActiveSheet()).toBe(darkTokenSheet)
    themeManager._reset()
  })
})
