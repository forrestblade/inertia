import { describe, it, expect } from 'vitest'
import { ADMIN_THEME_CSS, getAdminStyles } from '../admin/admin-styles.js'

describe('admin-styles (Kinetic Monolith)', () => {
  describe('getAdminStyles', () => {
    it('returns the ADMIN_THEME_CSS string', () => {
      expect(getAdminStyles()).toBe(ADMIN_THEME_CSS)
    })
  })

  describe('KM surface tokens', () => {
    it('defines --km-surface custom properties', () => {
      expect(ADMIN_THEME_CSS).toContain('--km-surface:')
      expect(ADMIN_THEME_CSS).toContain('--km-surface-low:')
      expect(ADMIN_THEME_CSS).toContain('--km-surface-highest:')
    })

    it('defines --km-on-surface text colors', () => {
      expect(ADMIN_THEME_CSS).toContain('--km-on-surface:')
      expect(ADMIN_THEME_CSS).toContain('--km-on-surface-variant:')
    })

    it('defines Manrope and Inter font stacks', () => {
      expect(ADMIN_THEME_CSS).toContain('--km-font-headline:')
      expect(ADMIN_THEME_CSS).toContain('Manrope')
      expect(ADMIN_THEME_CSS).toContain('--km-font-body:')
      expect(ADMIN_THEME_CSS).toContain('Inter')
    })
  })

  describe('val-button gradient override', () => {
    it('overrides val-button primary color via custom property', () => {
      expect(ADMIN_THEME_CSS).toContain('val-button.km-gradient-btn')
    })

    it('sets --val-color-primary to the gradient for shadow DOM button', () => {
      expect(ADMIN_THEME_CSS).toMatch(/val-button\.km-gradient-btn\s*\{[^}]*--val-color-primary:\s*linear-gradient/)
    })

    it('does NOT use ::part(button) for background', () => {
      // CSS custom properties pierce shadow DOM — no ::part needed for colors
      expect(ADMIN_THEME_CSS).not.toMatch(/::part\(button\).*background:\s*linear-gradient/)
    })
  })

  describe('val-input overrides', () => {
    it('overrides val-input colors via custom properties', () => {
      expect(ADMIN_THEME_CSS).toContain('val-input')
      expect(ADMIN_THEME_CSS).toMatch(/val-input\s*\{[^}]*--val-color-bg-elevated/)
    })
  })

  describe('KM components', () => {
    it('defines km-kinetic-bg background', () => {
      expect(ADMIN_THEME_CSS).toContain('.km-kinetic-bg')
    })

    it('defines km-card glassmorphism', () => {
      expect(ADMIN_THEME_CSS).toContain('.km-card')
      expect(ADMIN_THEME_CSS).toContain('backdrop-filter')
    })

    it('defines km-accent-line gradient', () => {
      expect(ADMIN_THEME_CSS).toContain('.km-accent-line')
    })

    it('defines km-error with left border', () => {
      expect(ADMIN_THEME_CSS).toContain('.km-error')
      expect(ADMIN_THEME_CSS).toContain('border-left')
    })

    it('defines km-status-dot with pulse animation', () => {
      expect(ADMIN_THEME_CSS).toContain('.km-status-dot')
      expect(ADMIN_THEME_CSS).toContain('km-pulse')
    })
  })
})
