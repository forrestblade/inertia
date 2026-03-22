// Kinetic Monolith theme — single source of truth.
// Surface palette, page-level CSS, and ValElement token overrides.
//
// Page CSS (getKmPageStyles) → injected into <style> on admin pages.
// Token overrides (getKmTokenOverrides) → passed to themeManager.applyOverrides() in admin-client.ts.
// Palette (KM_PALETTE) → shared constants for both layers.

/** Kinetic Monolith surface palette — the tonal layering hierarchy. */
export const KM_PALETTE = {
  surface: '#131313',
  surfaceDim: '#0e0e0e',
  surfaceLow: '#1c1b1b',
  surfaceContainer: '#201f1f',
  surfaceHigh: '#2a2a2a',
  surfaceHighest: '#353534',
  surfaceBright: '#3a3939',
  surfaceTint: '#1ce388',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#bacbbc',
  outlineVariant: '#3c4a3f',
  primary: 'oklch(0.90 0.19 159.5)',
  primaryContainer: 'oklch(0.80 0.19 159.5)',
  onPrimary: '#00391d',
  fontHeadline: "'Manrope', system-ui, sans-serif",
  fontBody: "'Inter', system-ui, sans-serif"
} as const

/** ValElement token overrides for the Kinetic Monolith theme.
 *  Applied via themeManager.applyOverrides() in admin-client.ts.
 *  These go INTO shadow DOM via adopted stylesheets. */
export function getKmTokenOverrides (): string {
  return `:host, :root {
  --val-color-primary: linear-gradient(135deg, ${KM_PALETTE.primary}, ${KM_PALETTE.primaryContainer});
  --val-color-primary-hover: linear-gradient(135deg, oklch(0.92 0.17 159.5), oklch(0.83 0.19 159.5));
  --val-color-primary-text: ${KM_PALETTE.onPrimary};
  --val-color-bg: ${KM_PALETTE.surface};
  --val-color-bg-elevated: ${KM_PALETTE.surfaceHighest};
  --val-color-bg-muted: ${KM_PALETTE.surfaceContainer};
  --val-color-text: ${KM_PALETTE.onSurface};
  --val-color-text-muted: ${KM_PALETTE.onSurfaceVariant};
  --val-color-border: ${KM_PALETTE.surfaceHighest};
  --val-color-border-focus: ${KM_PALETTE.primary};
  --val-focus-ring: inset 0 0 0 1px oklch(0.90 0.19 159.5 / 0.1);
}`
}

/** Page-level CSS for Kinetic Monolith admin pages.
 *  Injected into <style> tags. Contains layout, cards, backgrounds —
 *  NO ValElement token overrides (those go in getKmTokenOverrides). */
export function getKmPageStyles (): string {
  return `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&family=Inter:wght@400;500;600&display=swap');

:root {
  --km-surface: ${KM_PALETTE.surface};
  --km-surface-dim: ${KM_PALETTE.surfaceDim};
  --km-surface-low: ${KM_PALETTE.surfaceLow};
  --km-surface-container: ${KM_PALETTE.surfaceContainer};
  --km-surface-high: ${KM_PALETTE.surfaceHigh};
  --km-surface-highest: ${KM_PALETTE.surfaceHighest};
  --km-surface-bright: ${KM_PALETTE.surfaceBright};
  --km-surface-tint: ${KM_PALETTE.surfaceTint};
  --km-on-surface: ${KM_PALETTE.onSurface};
  --km-on-surface-variant: ${KM_PALETTE.onSurfaceVariant};
  --km-outline-variant: ${KM_PALETTE.outlineVariant};
  --km-font-headline: ${KM_PALETTE.fontHeadline};
  --km-font-body: ${KM_PALETTE.fontBody};
}

*, *::before, *::after { box-sizing: border-box; margin: 0; }

body {
  background: var(--km-surface);
  color: var(--km-on-surface);
  font-family: var(--km-font-body);
  font-size: 0.875rem;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

::selection {
  background: ${KM_PALETTE.primary};
  color: ${KM_PALETTE.onPrimary};
}

/* FOUC prevention: hide unregistered custom elements until JS upgrades them */
val-input:not(:defined),
val-button:not(:defined),
val-select:not(:defined),
val-textarea:not(:defined) {
  visibility: hidden;
}

/* --- Kinetic Background --- */
.km-kinetic-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(circle at 0% 0%, var(--km-surface-low) 0%, transparent 50%),
    radial-gradient(circle at 100% 100%, var(--km-surface) 0%, transparent 50%);
  z-index: -2;
}

.km-glow {
  position: fixed;
  border-radius: 9999px;
  filter: blur(120px);
  z-index: -1;
  pointer-events: none;
}

.km-glow-primary {
  top: 5rem; right: 15%;
  width: 400px; height: 400px;
  background: oklch(0.90 0.19 159.5 / 0.05);
}

.km-glow-tertiary {
  bottom: 5rem; left: 10%;
  width: 300px; height: 300px;
  background: oklch(0.89 0.06 264.05 / 0.05);
}

/* --- Accent Line --- */
.km-accent-line {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 2px;
  background: linear-gradient(to right, transparent, ${KM_PALETTE.surfaceTint}, transparent);
  opacity: 0.5;
}

/* --- Card (Level 2 surface) --- */
.km-card {
  position: relative;
  background: var(--km-surface-container);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 25px 60px -10px oklch(0 0 0 / 0.6), 0 10px 20px -5px oklch(0 0 0 / 0.3);
  overflow: hidden;
}

/* --- Labels (uppercase tracked) --- */
.km-label {
  font-family: var(--km-font-body);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--km-on-surface-variant);
}

/* --- Field Header (label + forgot link) --- */
.login-field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.km-forgot-link {
  font-size: 0.75rem;
  font-weight: 600;
  color: ${KM_PALETTE.primary};
  text-decoration: none;
}

.km-forgot-link:hover {
  text-decoration: underline;
}

/* --- Error --- */
.km-error {
  margin-bottom: 1.5rem;
  padding: 0.75rem 1rem;
  background: oklch(0.40 0.13 25.72 / 0.15);
  border-left: 2px solid oklch(0.64 0.21 25.33);
  color: oklch(0.81 0.10 19.57);
  font-size: 0.875rem;
}

/* --- Button typography overrides (layout handled by block attribute) --- */
val-button.km-gradient-btn {
  --val-font-sans: var(--km-font-headline);
  --val-weight-medium: 800;
  --val-text-sm: 0.875rem;
  --val-radius-md: 0.125rem;
  --val-space-2: 1rem;
  --val-space-4: 1rem;
}

/* --- Status Dot --- */
.km-status-dot {
  width: 6px; height: 6px;
  border-radius: 9999px;
  background: ${KM_PALETTE.primary};
  animation: km-pulse 2s ease-in-out infinite;
}

@keyframes km-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
`
}
