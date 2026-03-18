// Design token re-exports for @valencets/ui.
// CSS files are available as direct package exports:
//   @valencets/ui/tokens/primitives.css
//   @valencets/ui/tokens/semantic.css
// Components reference semantic tokens via var(--val-*) custom properties.
// CSS custom properties pierce shadow DOM — no adoption needed.

export const TOKEN_PREFIX = 'val' as const

export {
  THEME_TOKENS_REQUIRED,
  THEME_TOKENS_DARK,
  validateTheme,
} from './theme-contract.js'
export type { ThemeToken, DarkThemeToken } from './theme-contract.js'
