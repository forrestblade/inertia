import { describe, it, expect } from 'vitest'
import { parseTheme, parsePartialTheme } from '../schema.js'
import type { ThemeConfig, PartialTheme } from '../token-types.js'

function makeValidColorSet (): Record<string, string> {
  return {
    background: 'oklch(0.99 0 0)',
    foreground: 'oklch(0 0 0)',
    card: 'oklch(0.99 0 0)',
    'card-foreground': 'oklch(0 0 0)',
    popover: 'oklch(0.99 0 0)',
    'popover-foreground': 'oklch(0 0 0)',
    primary: 'oklch(0.62 0.18 319)',
    'primary-foreground': 'oklch(1 0 0)',
    secondary: 'oklch(0.91 0.01 293)',
    'secondary-foreground': 'oklch(0.13 0 0)',
    muted: 'oklch(0.97 0 0)',
    'muted-foreground': 'oklch(0.44 0 0)',
    accent: 'oklch(0.89 0.04 294)',
    'accent-foreground': 'oklch(0.47 0.14 284)',
    destructive: 'oklch(0.68 0.08 63)',
    'destructive-foreground': 'oklch(1 0 0)',
    border: 'oklch(0.90 0.01 308)',
    input: 'oklch(0.94 0 0)',
    ring: 'oklch(0 0 0)',
    overlay: 'oklch(0 0 0 / 0.5)',
    'chart-1': 'oklch(0.67 0.07 193)',
    'chart-2': 'oklch(0.62 0.18 319)',
    'chart-3': 'oklch(0.78 0.13 104)',
    'chart-4': 'oklch(0.51 0.14 285)',
    'chart-5': 'oklch(0.56 0 0)',
    sidebar: 'oklch(0.93 0.01 286)',
    'sidebar-foreground': 'oklch(0 0 0)',
    'sidebar-primary': 'oklch(0 0 0)',
    'sidebar-primary-foreground': 'oklch(1 0 0)',
    'sidebar-accent': 'oklch(0.94 0 0)',
    'sidebar-accent-foreground': 'oklch(0 0 0)',
    'sidebar-border': 'oklch(0.94 0 0)',
    'sidebar-ring': 'oklch(0 0 0)'
  }
}

function makeValidShadowSet (): Record<string, string> {
  return {
    '2xs': '0px 2px 3px 0px hsl(0 0% 10% / 0.08)',
    xs: '0px 2px 3px 0px hsl(0 0% 10% / 0.08)',
    sm: '0px 2px 3px 0px hsl(0 0% 10% / 0.16)',
    DEFAULT: '0px 2px 3px 0px hsl(0 0% 10% / 0.16)',
    md: '0px 2px 3px 0px hsl(0 0% 10% / 0.16)',
    lg: '0px 2px 3px 0px hsl(0 0% 10% / 0.16)',
    xl: '0px 2px 3px 0px hsl(0 0% 10% / 0.16)',
    '2xl': '0px 2px 3px 0px hsl(0 0% 10% / 0.40)'
  }
}

function makeValidThemeConfig (): ThemeConfig {
  return {
    colors: { light: makeValidColorSet() as ThemeConfig['colors']['light'], dark: makeValidColorSet() as ThemeConfig['colors']['dark'] },
    fonts: { sans: 'Inter, sans-serif', serif: 'Lora, serif', mono: 'IBM Plex Mono, monospace' },
    radius: '0.5rem',
    spacing: '0.25rem',
    shadows: makeValidShadowSet() as ThemeConfig['shadows'],
    tracking: '-0.025em'
  }
}

describe('parseTheme', () => {
  it('validates a complete theme config', () => {
    const result = parseTheme(makeValidThemeConfig())
    expect(result.isOk()).toBe(true)
  })

  it('rejects missing required color tokens', () => {
    const config = makeValidThemeConfig()
    const broken = { ...config, colors: { light: { background: 'oklch(0.99 0 0)' }, dark: makeValidColorSet() } }
    const result = parseTheme(broken)
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.code).toBe('INVALID_SCHEMA')
    }
  })

  it('rejects non-string color values', () => {
    const config = makeValidThemeConfig()
    const colors = makeValidColorSet()
    colors.background = 42 as unknown as string
    const broken = { ...config, colors: { light: colors, dark: makeValidColorSet() } }
    const result = parseTheme(broken)
    expect(result.isErr()).toBe(true)
  })

  it('validates font family strings', () => {
    const config = makeValidThemeConfig()
    const result = parseTheme(config)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.fonts.sans).toBe('Inter, sans-serif')
    }
  })

  it('validates radius and spacing strings', () => {
    const config = makeValidThemeConfig()
    const result = parseTheme(config)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.radius).toBe('0.5rem')
      expect(result.value.spacing).toBe('0.25rem')
    }
  })

  it('validates shadow strings', () => {
    const config = makeValidThemeConfig()
    const result = parseTheme(config)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.shadows['2xs']).toBe('0px 2px 3px 0px hsl(0 0% 10% / 0.08)')
    }
  })

  it('validates tracking string', () => {
    const config = makeValidThemeConfig()
    const result = parseTheme(config)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.tracking).toBe('-0.025em')
    }
  })

  it('returns TokenError with INVALID_SCHEMA code on failure', () => {
    const result = parseTheme({ garbage: true })
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.code).toBe('INVALID_SCHEMA')
      expect(typeof result.error.message).toBe('string')
    }
  })

  it('rejects null input', () => {
    const result = parseTheme(null)
    expect(result.isErr()).toBe(true)
  })
})

describe('parsePartialTheme', () => {
  it('validates a partial theme config', () => {
    const partial: PartialTheme = {
      colors: { light: { primary: 'oklch(0.5 0.2 270)' } },
      radius: '1rem'
    }
    const result = parsePartialTheme(partial)
    expect(result.isOk()).toBe(true)
  })

  it('type extraction matches ThemeConfig interface', () => {
    const config = makeValidThemeConfig()
    const result = parseTheme(config)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      const theme: ThemeConfig = result.value
      expect(theme.colors.light.primary).toBe('oklch(0.62 0.18 319)')
    }
  })
})
