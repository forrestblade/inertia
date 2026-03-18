// Theme contract for @valencets/ui.
// A valid Valence theme must define all required semantic tokens.
// Primitives are optional — a theme can define its own palette or reuse defaults.

/** All semantic token names a valid theme must define */
export const THEME_TOKENS_REQUIRED = Object.freeze([
  'color-bg',
  'color-bg-elevated',
  'color-bg-muted',
  'color-text',
  'color-text-muted',
  'color-text-inverted',
  'color-primary',
  'color-primary-hover',
  'color-primary-text',
  'color-error',
  'color-success',
  'color-warning',
  'color-border',
  'color-border-focus',
  'focus-ring',
] as const)

/** Dark mode tokens a theme should override */
export const THEME_TOKENS_DARK = Object.freeze([
  'color-bg',
  'color-bg-elevated',
  'color-bg-muted',
  'color-text',
  'color-text-muted',
  'color-border',
] as const)

export type ThemeToken = typeof THEME_TOKENS_REQUIRED[number]
export type DarkThemeToken = typeof THEME_TOKENS_DARK[number]

/**
 * Validate a loaded stylesheet defines all required tokens.
 * Reads computed styles from :root and checks each required token is set.
 * Returns missing token names, or empty frozen array if valid.
 */
export function validateTheme (): ReadonlyArray<string> {
  const style = getComputedStyle(document.documentElement)
  const missing: Array<string> = []
  for (const token of THEME_TOKENS_REQUIRED) {
    const value = style.getPropertyValue(`--val-${token}`).trim()
    if (value === '') missing.push(token)
  }
  return Object.freeze(missing)
}
