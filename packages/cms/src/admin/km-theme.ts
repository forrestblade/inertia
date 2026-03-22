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

/** Critical CSS shell — inlined in <style> for first paint (<14KB).
 *  Contains KM tokens, reset, body, sidebar/main layout skeleton, and FOUC prevention. */
export function getCriticalCss (): string {
  return `
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

/* Reset */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* Base */
body {
  font-family: var(--km-font-body);
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--km-on-surface);
  background: var(--km-surface);
  display: flex;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

a { color: ${KM_PALETTE.primary}; text-decoration: none; }
a:hover { color: var(--km-on-surface); }

/* FOUC prevention */
val-input:not(:defined),
val-button:not(:defined),
val-select:not(:defined),
val-textarea:not(:defined) {
  visibility: hidden;
}

/* Sidebar */
.sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--km-surface-low);
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-brand {
  font-family: var(--km-font-headline);
  font-size: 1.125rem;
  font-weight: 800;
  color: var(--km-on-surface);
  text-decoration: none;
  letter-spacing: -0.02em;
}
.sidebar-brand:hover { color: ${KM_PALETTE.primary}; }

.sidebar ul { list-style: none; display: flex; flex-direction: column; gap: 0.25rem; }

.nav-group-heading {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--km-on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.75rem 0.75rem 0.25rem;
  margin-top: 0.5rem;
}

.sidebar a {
  display: block;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  color: var(--km-on-surface-variant);
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 100ms cubic-bezier(0.4, 0, 0.2, 1),
              color 100ms cubic-bezier(0.4, 0, 0.2, 1);
}
.sidebar a:hover {
  background: var(--km-surface-container);
  color: var(--km-on-surface);
}

/* Main */
.main {
  flex: 1;
  padding: 2rem 2.5rem;
  min-width: 0;
}

.main > h1 {
  font-family: var(--km-font-headline);
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
}

/* Responsive */
@media (max-width: 768px) {
  body { flex-direction: column; }
  .sidebar {
    width: 100%;
    padding: 1rem;
  }
  .sidebar ul { flex-direction: row; flex-wrap: wrap; gap: 0.5rem; }
  .main { padding: 1.5rem 1rem; }
}
`
}

/** Deferred CSS — served as /admin/_assets/admin.css (cacheable).
 *  Contains component, form, editor, toast, blocks, media, and edit page styles. */
export function getDeferredCss (): string {
  return `
/* --- Dashboard Cards --- */
.dashboard { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
.card {
  background: var(--km-surface-container);
  border-radius: 0.5rem;
  padding: 1.25rem;
  box-shadow: 0 25px 60px -10px oklch(0 0 0 / 0.3);
  transition: box-shadow 100ms cubic-bezier(0.4, 0, 0.2, 1);
}
.card:hover { box-shadow: 0 25px 60px -10px oklch(0 0 0 / 0.5); }
.card a { color: var(--km-on-surface); text-decoration: none; display: block; }
.card h3 { font-family: var(--km-font-headline); font-size: 1.125rem; font-weight: 700; }

/* --- Tables --- */
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  margin-top: 1rem;
}
th {
  text-align: left;
  padding: 0.625rem 0.75rem;
  font-weight: 600;
  color: var(--km-on-surface-variant);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
td {
  padding: 0.625rem 0.75rem;
}
tr:hover td { background: var(--km-surface-bright); }

/* --- Forms --- */
.admin-form { max-width: 640px; display: flex; flex-direction: column; gap: 1.25rem; }

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}
.form-field > span {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--km-on-surface-variant);
}

.form-input, .form-select, .form-textarea {
  background: var(--km-surface-highest);
  border: 1px solid transparent;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  color: var(--km-on-surface);
  font-family: var(--km-font-body);
  font-size: 0.875rem;
  transition: border-color 100ms cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 100ms cubic-bezier(0.4, 0, 0.2, 1);
}
.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: ${KM_PALETTE.primary};
  box-shadow: inset 0 0 0 1px oklch(0.90 0.19 159.5 / 0.1);
}
.form-textarea { min-height: 120px; resize: vertical; }
.form-select { appearance: none; cursor: pointer; }

.form-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--km-on-surface);
  cursor: pointer;
}
.form-checkbox input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  accent-color: ${KM_PALETTE.primary};
  cursor: pointer;
}

fieldset {
  border: 1px solid var(--km-outline-variant, oklch(0.37 0.03 151 / 0.15));
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
fieldset legend {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--km-on-surface-variant);
  padding: 0 0.5rem;
}

/* --- Buttons --- */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: var(--km-font-body);
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: background 100ms cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-primary {
  background: linear-gradient(135deg, ${KM_PALETTE.primary}, ${KM_PALETTE.primaryContainer});
  color: ${KM_PALETTE.onPrimary};
}
.btn-primary:hover { filter: brightness(1.1); }
.btn-danger {
  background: oklch(0.64 0.21 25.33);
  color: oklch(1 0 0);
}
.btn-danger:hover { background: oklch(0.55 0.22 25); }

.empty-state {
  color: var(--km-on-surface-variant);
  padding: 2rem 0;
}
.empty-state a { color: ${KM_PALETTE.primary}; }

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* --- Toast --- */
.toast {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  box-shadow: 0 20px 40px -5px oklch(0 0 0 / 0.4);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--km-on-surface);
  z-index: 1000;
  transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-error { background: oklch(0.64 0.21 25.33); }
.toast-success { background: oklch(0.63 0.17 149.21); }
.toast-info { background: oklch(0.55 0.22 262.88); }
.toast-dismiss {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.125rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  opacity: 0.8;
}
.toast-dismiss:hover { opacity: 1; }
.toast-fade { opacity: 0; }

/* --- Richtext Editor --- */
.richtext-wrap {
  border: 1px solid var(--km-outline-variant, oklch(0.37 0.03 151 / 0.15));
  border-radius: 0.375rem;
  overflow: hidden;
}
.richtext-toolbar {
  display: flex;
  gap: 0.25rem;
  padding: 0.375rem 0.5rem;
  background: var(--km-surface-container);
  border-bottom: 1px solid var(--km-outline-variant, oklch(0.37 0.03 151 / 0.15));
}
.richtext-toolbar-btn {
  background: none;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  color: var(--km-on-surface-variant);
  font-size: 0.875rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-family: var(--km-font-body);
}
.richtext-toolbar-btn:hover {
  background: var(--km-surface-high);
  color: var(--km-on-surface);
}
.richtext-toolbar-btn--active {
  background: var(--km-surface-high);
  color: var(--km-on-surface);
  border-color: var(--km-outline-variant);
}
.richtext-editor { min-height: 200px; }
.ProseMirror {
  min-height: 200px;
  padding: 0.75rem;
  background: var(--km-surface-highest);
  color: var(--km-on-surface);
  font-family: var(--km-font-body);
  font-size: 0.875rem;
  line-height: 1.5;
  outline: none;
}
.ProseMirror:focus {
  box-shadow: inset 0 0 0 1px oklch(0.90 0.19 159.5 / 0.1);
}
.ProseMirror p { margin-bottom: 0.5rem; }
.ProseMirror h2 { font-size: 1.25rem; font-weight: 700; margin: 1rem 0 0.5rem; }
.ProseMirror h3 { font-size: 1.125rem; font-weight: 600; margin: 0.75rem 0 0.5rem; }
.ProseMirror ul, .ProseMirror ol { padding-left: 1.5rem; margin-bottom: 0.5rem; }
.ProseMirror blockquote {
  border-left: 3px solid var(--km-outline-variant);
  padding-left: 0.75rem;
  color: var(--km-on-surface-variant);
  margin: 0.5rem 0;
}
.ProseMirror a { color: ${KM_PALETTE.primary}; text-decoration: underline; }
.ProseMirror code {
  background: var(--km-surface-high);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.85em;
}
.ProseMirror hr {
  border: none;
  border-top: 2px solid var(--km-outline-variant);
  margin: 1rem 0;
}
.ProseMirror pre {
  background: var(--km-surface-high);
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.85em;
  overflow-x: auto;
  margin: 0.5rem 0;
}
.ProseMirror pre code { background: none; padding: 0; border-radius: 0; }

/* --- JSON / Array fields --- */
.form-json {
  min-height: 120px;
  resize: vertical;
  background: var(--km-surface-highest);
  border: 1px solid transparent;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  color: var(--km-on-surface);
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}
.form-json:focus {
  outline: none;
  border-color: ${KM_PALETTE.primary};
  box-shadow: inset 0 0 0 1px oklch(0.90 0.19 159.5 / 0.1);
}
.array-field { display: flex; flex-direction: column; gap: 0.5rem; }
.array-add {
  align-self: flex-start;
  background: var(--km-surface-container);
  border: 1px dashed var(--km-outline-variant);
  border-radius: 0.375rem;
  padding: 0.375rem 0.75rem;
  color: var(--km-on-surface-variant);
  font-size: 0.875rem;
  cursor: pointer;
}
.array-add:hover { border-color: ${KM_PALETTE.primary}; color: var(--km-on-surface); }

/* --- Blocks field --- */
.blocks-field { display: flex; flex-direction: column; gap: 0.75rem; }
.blocks-item {
  border: 1px solid var(--km-outline-variant, oklch(0.37 0.03 151 / 0.15));
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.blocks-item legend {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--km-on-surface-variant);
  padding: 0 0.5rem;
}
.blocks-remove {
  align-self: flex-end;
  background: none;
  border: 1px solid oklch(0.64 0.21 25.33);
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
  color: oklch(0.64 0.21 25.33);
  font-size: 0.75rem;
  cursor: pointer;
}
.blocks-remove:hover { background: oklch(0.64 0.21 25.33); color: oklch(1 0 0); }
.blocks-add { display: flex; gap: 0.5rem; align-items: center; }
.blocks-type-select {
  background: var(--km-surface-container);
  border: 1px solid var(--km-outline-variant);
  border-radius: 0.375rem;
  padding: 0.375rem 0.75rem;
  color: var(--km-on-surface);
  font-size: 0.875rem;
}
.blocks-add-btn {
  background: var(--km-surface-container);
  border: 1px dashed var(--km-outline-variant);
  border-radius: 0.375rem;
  padding: 0.375rem 0.75rem;
  color: var(--km-on-surface-variant);
  font-size: 0.875rem;
  cursor: pointer;
}
.blocks-add-btn:hover { border-color: ${KM_PALETTE.primary}; color: var(--km-on-surface); }

/* --- Edit page --- */
.edit-container { max-width: 640px; }
.edit-meta { margin-top: 1rem; padding-top: 0.75rem; }
.edit-danger-zone {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--km-outline-variant, oklch(0.37 0.03 151 / 0.15));
}
.btn-ghost-danger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: var(--km-font-body);
  border-radius: 0.375rem;
  border: 1px solid oklch(0.64 0.21 25.33);
  background: transparent;
  color: oklch(0.64 0.21 25.33);
  cursor: pointer;
  transition: background 100ms cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-ghost-danger:hover { background: oklch(0.64 0.21 25.33); color: oklch(1 0 0); }
.diff-table .diff-changed td { background: oklch(0.3 0.05 80 / 0.3); }

/* --- Media upload --- */
.media-drop-zone { display: flex; flex-direction: column; gap: 0.5rem; }
.media-preview { font-size: 0.875rem; color: var(--km-on-surface-variant); }
.media-preview img {
  max-width: 200px;
  max-height: 150px;
  border-radius: 0.375rem;
}
.drop-zone-text {
  font-size: 0.875rem;
  color: var(--km-on-surface-variant);
  text-align: center;
  padding: 1rem;
}
.focal-point-selector { position: relative; display: inline-block; cursor: crosshair; }
.focal-point-image { max-width: 400px; max-height: 300px; border-radius: 0.375rem; }
.focal-point-marker {
  position: absolute;
  width: 20px; height: 20px;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 0 0 1px oklch(0 0 0 / 0.5);
  transform: translate(-50%, -50%);
  pointer-events: none;
}
.variant-thumbnails { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 0.5rem; }
.variant-thumb { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
.variant-thumb img { border-radius: 0.25rem; }
.variant-label { font-size: 0.75rem; color: var(--km-on-surface-variant); }

/* --- List view actions --- */
.actions-cell { white-space: nowrap; }
.action-link {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  color: var(--km-on-surface-variant);
}
.action-link:hover { background: var(--km-surface-container); color: var(--km-on-surface); }
`
}
