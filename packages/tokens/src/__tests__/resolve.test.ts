import { describe, it, expect } from 'vitest'
import { resolveTheme } from '../resolve.js'
import type { ThemeConfig, PartialTheme } from '../token-types.js'

function makeBaseTheme (): ThemeConfig {
  const colors = {
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
  } as ThemeConfig['colors']['light']

  return {
    colors: { light: colors, dark: colors },
    fonts: { sans: 'Inter, sans-serif', serif: 'Lora, serif', mono: 'IBM Plex Mono, monospace' },
    radius: '0.5rem',
    spacing: '0.25rem',
    shadows: {
      '2xs': '0px 2px 3px hsl(0 0% 10% / 0.08)',
      xs: '0px 2px 3px hsl(0 0% 10% / 0.08)',
      sm: '0px 2px 3px hsl(0 0% 10% / 0.16)',
      DEFAULT: '0px 2px 3px hsl(0 0% 10% / 0.16)',
      md: '0px 2px 3px hsl(0 0% 10% / 0.16)',
      lg: '0px 4px 6px hsl(0 0% 10% / 0.16)',
      xl: '0px 8px 10px hsl(0 0% 10% / 0.16)',
      '2xl': '0px 2px 3px hsl(0 0% 10% / 0.40)'
    },
    tracking: '-0.025em'
  }
}

describe('resolveTheme', () => {
  it('merges client light colors over base', () => {
    const base = makeBaseTheme()
    const client: PartialTheme = {
      colors: { light: { primary: 'oklch(0.5 0.2 270)' } }
    }
    const resolved = resolveTheme(client, base)
    expect(resolved.colors.light.primary).toBe('oklch(0.5 0.2 270)')
    expect(resolved.colors.light.background).toBe('oklch(0.99 0 0)')
  })

  it('merges client dark colors over base', () => {
    const base = makeBaseTheme()
    const client: PartialTheme = {
      colors: { dark: { background: 'oklch(0.15 0 0)' } }
    }
    const resolved = resolveTheme(client, base)
    expect(resolved.colors.dark.background).toBe('oklch(0.15 0 0)')
    expect(resolved.colors.dark.primary).toBe(base.colors.dark.primary)
  })

  it('merges client fonts over base', () => {
    const base = makeBaseTheme()
    const client: PartialTheme = {
      fonts: { sans: 'Poppins, sans-serif' }
    }
    const resolved = resolveTheme(client, base)
    expect(resolved.fonts.sans).toBe('Poppins, sans-serif')
    expect(resolved.fonts.serif).toBe('Lora, serif')
  })

  it('preserves base values when client omits them', () => {
    const base = makeBaseTheme()
    const client: PartialTheme = {}
    const resolved = resolveTheme(client, base)
    expect(resolved.radius).toBe('0.5rem')
    expect(resolved.tracking).toBe('-0.025em')
    expect(resolved.fonts.mono).toBe('IBM Plex Mono, monospace')
  })

  it('client radius overrides base radius', () => {
    const base = makeBaseTheme()
    const client: PartialTheme = { radius: '1rem' }
    const resolved = resolveTheme(client, base)
    expect(resolved.radius).toBe('1rem')
  })

  it('client shadows merge with base shadows', () => {
    const base = makeBaseTheme()
    const client: PartialTheme = {
      shadows: { lg: '0px 6px 12px hsl(0 0% 0% / 0.25)' }
    }
    const resolved = resolveTheme(client, base)
    expect(resolved.shadows.lg).toBe('0px 6px 12px hsl(0 0% 0% / 0.25)')
    expect(resolved.shadows.sm).toBe(base.shadows.sm)
  })

  it('empty client override returns base unchanged', () => {
    const base = makeBaseTheme()
    const resolved = resolveTheme({}, base)
    expect(resolved).toEqual(base)
  })

  it('full merge produces valid ThemeConfig shape', () => {
    const base = makeBaseTheme()
    const client: PartialTheme = {
      colors: { light: { primary: 'oklch(0.5 0.2 270)' } },
      fonts: { sans: 'Poppins, sans-serif' },
      radius: '1rem',
      spacing: '0.3rem',
      shadows: { md: '0px 4px 8px hsl(0 0% 0% / 0.2)' },
      tracking: '-0.01em'
    }
    const resolved = resolveTheme(client, base)
    expect(resolved.colors.light.primary).toBe('oklch(0.5 0.2 270)')
    expect(resolved.colors.light.background).toBe('oklch(0.99 0 0)')
    expect(resolved.fonts.sans).toBe('Poppins, sans-serif')
    expect(resolved.fonts.serif).toBe('Lora, serif')
    expect(resolved.radius).toBe('1rem')
    expect(resolved.spacing).toBe('0.3rem')
    expect(resolved.shadows.md).toBe('0px 4px 8px hsl(0 0% 0% / 0.2)')
    expect(resolved.tracking).toBe('-0.01em')
  })
})
