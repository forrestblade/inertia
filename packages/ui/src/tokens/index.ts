// Design token re-exports for @valencets/ui.
// CSS files are available as direct package exports:
//   @valencets/ui/tokens/primitives.css
//   @valencets/ui/tokens/semantic.css
// Components reference semantic tokens via var(--val-*) custom properties.
// CSS custom properties pierce shadow DOM — no adoption needed.

export const TOKEN_PREFIX = 'val' as const
