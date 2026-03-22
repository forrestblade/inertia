import { describe, it, expect } from 'vitest'
import { KM_PALETTE, getKmPageStyles, getKmTokenOverrides, getCriticalCss, getDeferredCss } from '../admin/km-theme.js'

describe('km-theme (Kinetic Monolith)', () => {
  describe('KM_PALETTE', () => {
    it('defines all surface hierarchy levels', () => {
      expect(KM_PALETTE.surface).toBe('#131313')
      expect(KM_PALETTE.surfaceLow).toBe('#1c1b1b')
      expect(KM_PALETTE.surfaceContainer).toBe('#201f1f')
      expect(KM_PALETTE.surfaceHigh).toBe('#2a2a2a')
      expect(KM_PALETTE.surfaceHighest).toBe('#353534')
    })

    it('defines on-surface text colors', () => {
      expect(KM_PALETTE.onSurface).toBe('#e5e2e1')
      expect(KM_PALETTE.onSurfaceVariant).toBe('#bacbbc')
    })

    it('defines primary as oklch green', () => {
      expect(KM_PALETTE.primary).toContain('oklch')
    })
  })

  describe('getKmPageStyles', () => {
    const css = getKmPageStyles()

    it('returns a non-empty CSS string', () => {
      expect(css.length).toBeGreaterThan(0)
    })

    it('defines KM surface custom properties', () => {
      expect(css).toContain('--km-surface')
      expect(css).toContain('--km-on-surface')
    })

    it('includes kinetic background and card styles', () => {
      expect(css).toContain('.km-kinetic-bg')
      expect(css).toContain('.km-card')
    })

    it('does NOT contain ValElement token overrides', () => {
      expect(css).not.toContain('--val-color-primary')
      expect(css).not.toContain('--val-color-bg-elevated')
      expect(css).not.toContain('--val-color-border')
    })
  })

  describe('getKmTokenOverrides', () => {
    const css = getKmTokenOverrides()

    it('returns CSS with :host, :root selector', () => {
      expect(css).toMatch(/:host,\s*:root/)
    })

    it('sets --val-color-primary to a gradient', () => {
      expect(css).toMatch(/--val-color-primary:\s*linear-gradient/)
    })

    it('sets --val-color-border to match background', () => {
      expect(css).toContain('--val-color-border')
    })

    it('sets --val-color-bg-elevated for dark inputs', () => {
      expect(css).toContain('--val-color-bg-elevated')
    })

    it('does NOT contain page layout classes', () => {
      expect(css).not.toContain('.km-card')
      expect(css).not.toContain('.km-kinetic-bg')
    })
  })

  describe('getCriticalCss', () => {
    const css = getCriticalCss()

    it('is under 14KB', () => {
      expect(Buffer.byteLength(css)).toBeLessThan(14_000)
    })

    it('contains KM surface tokens', () => {
      expect(css).toContain('--km-surface')
      expect(css).toContain('--km-on-surface')
    })

    it('contains reset styles', () => {
      expect(css).toContain('box-sizing: border-box')
    })

    it('contains layout skeleton (sidebar + main)', () => {
      expect(css).toContain('.sidebar')
      expect(css).toContain('.main')
    })

    it('contains FOUC prevention', () => {
      expect(css).toContain(':not(:defined)')
    })

    it('does NOT contain form or editor styles', () => {
      expect(css).not.toContain('.form-field')
      expect(css).not.toContain('.richtext-toolbar')
      expect(css).not.toContain('.blocks-field')
    })
  })

  describe('getDeferredCss', () => {
    const css = getDeferredCss()

    it('contains component styles', () => {
      expect(css).toContain('.dashboard')
      expect(css).toContain('table')
    })

    it('contains form field styles', () => {
      expect(css).toContain('.form-field')
      expect(css).toContain('.form-input')
    })

    it('contains editor styles', () => {
      expect(css).toContain('.richtext-toolbar')
    })

    it('does NOT contain layout skeleton', () => {
      expect(css).not.toContain('.sidebar')
    })

    it('does NOT duplicate critical tokens', () => {
      expect(css).not.toContain('--km-surface:')
    })
  })
})
