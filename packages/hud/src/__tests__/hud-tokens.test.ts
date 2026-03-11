import { describe, it, expect } from 'vitest'
import { HUD_COLORS, HUD_TYPOGRAPHY, HUD_SPACING, HUD_CHART } from '../tokens/hud-tokens.js'

describe('HUD_COLORS', () => {
  it('defines all foundation colors', () => {
    expect(HUD_COLORS.bg).toBeDefined()
    expect(HUD_COLORS.surface).toBeDefined()
    expect(HUD_COLORS.border).toBeDefined()
    expect(HUD_COLORS.textPrimary).toBeDefined()
    expect(HUD_COLORS.textSecondary).toBeDefined()
    expect(HUD_COLORS.textMuted).toBeDefined()
  })

  it('defines all functional colors', () => {
    expect(HUD_COLORS.positive).toBeDefined()
    expect(HUD_COLORS.negative).toBeDefined()
    expect(HUD_COLORS.warning).toBeDefined()
    expect(HUD_COLORS.accent).toBeDefined()
    expect(HUD_COLORS.neutral).toBeDefined()
  })

  it('uses valid HSL values', () => {
    const hslPattern = /^hsl\(\d+,\s*\d+%,\s*\d+%\)$/
    for (const value of Object.values(HUD_COLORS)) {
      expect(value).toMatch(hslPattern)
    }
  })
})

describe('HUD_TYPOGRAPHY', () => {
  it('defines primary and mono font stacks', () => {
    expect(HUD_TYPOGRAPHY.fontPrimary).toContain('system-ui')
    expect(HUD_TYPOGRAPHY.fontMono).toContain('monospace')
  })

  it('has a 5-size type scale', () => {
    const sizes = Object.keys(HUD_TYPOGRAPHY.scale)
    expect(sizes).toHaveLength(5)
    expect(sizes).toContain('xs')
    expect(sizes).toContain('sm')
    expect(sizes).toContain('base')
    expect(sizes).toContain('lg')
    expect(sizes).toContain('xl')
  })

  it('defines line height values', () => {
    expect(HUD_TYPOGRAPHY.lineHeight.body).toBeDefined()
    expect(HUD_TYPOGRAPHY.lineHeight.heading).toBeDefined()
    expect(HUD_TYPOGRAPHY.lineHeight.metric).toBeDefined()
  })
})

describe('HUD_SPACING', () => {
  it('defines spacing tokens', () => {
    expect(HUD_SPACING.xs).toBeDefined()
    expect(HUD_SPACING.sm).toBeDefined()
    expect(HUD_SPACING.md).toBeDefined()
    expect(HUD_SPACING.lg).toBeDefined()
    expect(HUD_SPACING.xl).toBeDefined()
    expect(HUD_SPACING.xxl).toBeDefined()
  })
})

describe('HUD_CHART', () => {
  it('defines sparkline dimensions', () => {
    expect(HUD_CHART.sparkline.width).toBeGreaterThan(0)
    expect(HUD_CHART.sparkline.height).toBeGreaterThan(0)
    expect(HUD_CHART.sparkline.strokeWidth).toBeGreaterThan(0)
  })
})
