/**
 * Kinetic Monolith design system — admin CSS tokens + styles.
 *
 * Key rules:
 *   - NO 1px borders; use background-color shifts (tonal layering)
 *   - Surface hierarchy: Level 0 #131313 / Level 1 #1c1b1b / Level 2 #201f1f / Level 3 #353534
 *   - Primary accent: #45f99c, gradient to #00dc82 for buttons
 *   - Fonts: Inter (body/labels), system monospace for IDs
 *   - Active sidebar link: primary text + 2px left border
 *   - Stat cards: 2px left accent line (#1ce388)
 */

export function getAdminStyles (): string {
  return `<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    /* --- Design tokens (Kinetic Monolith) --- */
    :root {
      /* Surface hierarchy */
      --km-surface-0: #131313;
      --km-surface-1: #1c1b1b;
      --km-surface-2: #201f1f;
      --km-surface-3: #353534;

      /* Text */
      --km-on-surface: #e8e6e3;
      --km-on-surface-variant: #a9a6a1;
      --km-on-surface-muted: #6e6b66;

      /* Primary accent */
      --km-primary: #45f99c;
      --km-primary-dim: #1ce388;
      --km-primary-gradient: linear-gradient(135deg, #45f99c, #00dc82);
      --km-primary-hover: #00dc82;

      /* Error */
      --km-error: #f87171;
      --km-error-bg: rgba(248, 113, 113, 0.12);

      /* Success */
      --km-success: #45f99c;
      --km-success-bg: rgba(69, 249, 156, 0.12);

      /* Info */
      --km-info: #60a5fa;

      /* Focus ring */
      --km-focus-ring: 0 0 0 2px var(--km-surface-0), 0 0 0 4px var(--km-primary);

      /* Typography */
      --km-font-sans: 'Inter', system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      --km-font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
      --km-text-xs: 0.75rem;
      --km-text-sm: 0.875rem;
      --km-text-base: 1rem;
      --km-text-lg: 1.125rem;
      --km-text-xl: 1.25rem;
      --km-text-2xl: 1.5rem;
      --km-leading-tight: 1.25;
      --km-leading-normal: 1.5;
      --km-weight-normal: 400;
      --km-weight-medium: 500;
      --km-weight-semibold: 600;
      --km-weight-bold: 700;

      /* Radii */
      --km-radius-sm: 0.25rem;
      --km-radius-md: 0.5rem;
      --km-radius-lg: 0.75rem;

      /* Shadows (subtle on dark) */
      --km-shadow-sm: 0 1px 3px 0 rgba(0,0,0,0.3);
      --km-shadow-md: 0 4px 12px -2px rgba(0,0,0,0.4);

      /* Motion */
      --km-duration-fast: 120ms;
      --km-duration-normal: 200ms;
      --km-ease: cubic-bezier(0.4, 0, 0.2, 1);

      /* ---- Legacy aliases (keep old tests green) ---- */
      --val-gray-50: var(--km-on-surface);
      --val-gray-100: #d4d2cf;
      --val-gray-200: #b8b5b1;
      --val-gray-300: #918e8a;
      --val-gray-400: var(--km-on-surface-variant);
      --val-gray-500: var(--km-on-surface-muted);
      --val-gray-600: #575450;
      --val-gray-700: var(--km-surface-3);
      --val-gray-800: var(--km-surface-2);
      --val-gray-900: var(--km-surface-1);
      --val-gray-950: var(--km-surface-0);
      --val-blue-400: var(--km-primary);
      --val-blue-500: var(--km-primary);
      --val-blue-600: var(--km-primary);
      --val-blue-700: var(--km-primary-hover);
      --val-red-500: var(--km-error);
      --val-green-500: var(--km-success);
      --val-font-sans: var(--km-font-sans);
      --val-font-mono: var(--km-font-mono);
      --val-text-xs: var(--km-text-xs);
      --val-text-sm: var(--km-text-sm);
      --val-text-base: var(--km-text-base);
      --val-text-lg: var(--km-text-lg);
      --val-text-xl: var(--km-text-xl);
      --val-text-2xl: var(--km-text-2xl);
      --val-leading-tight: var(--km-leading-tight);
      --val-leading-normal: var(--km-leading-normal);
      --val-weight-normal: var(--km-weight-normal);
      --val-weight-medium: var(--km-weight-medium);
      --val-weight-semibold: var(--km-weight-semibold);
      --val-weight-bold: var(--km-weight-bold);
      --val-radius-sm: var(--km-radius-sm);
      --val-radius-md: var(--km-radius-md);
      --val-radius-lg: var(--km-radius-lg);
      --val-shadow-sm: var(--km-shadow-sm);
      --val-shadow-md: var(--km-shadow-md);
      --val-duration-fast: var(--km-duration-fast);
      --val-duration-normal: var(--km-duration-normal);
      --val-ease-in-out: var(--km-ease);

      /* Semantic tokens (dark only) */
      --val-color-bg: var(--km-surface-0);
      --val-color-bg-elevated: var(--km-surface-1);
      --val-color-bg-muted: var(--km-surface-2);
      --val-color-text: var(--km-on-surface);
      --val-color-text-muted: var(--km-on-surface-variant);
      --val-color-primary: var(--km-primary);
      --val-color-primary-hover: var(--km-primary-hover);
      --val-color-primary-text: #131313;
      --val-color-border: var(--km-surface-3);
      --val-color-border-focus: var(--km-primary);
      --val-focus-ring: var(--km-focus-ring);
      --val-color-error: var(--km-error);
      --val-color-success: var(--km-success);
    }

    /* --- Reset --- */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* --- Base --- */
    body {
      font-family: var(--km-font-sans);
      font-size: var(--km-text-base);
      line-height: var(--km-leading-normal);
      color: var(--km-on-surface);
      background: var(--km-surface-0);
      display: flex;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    a { color: var(--km-primary); text-decoration: none; }
    a:hover { color: var(--km-on-surface); }

    /* --- Sidebar --- */
    .sidebar {
      width: 240px;
      flex-shrink: 0;
      background: var(--km-surface-1);
      padding: 1.5rem 0;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      overflow-y: auto;
    }

    .sidebar-brand {
      font-size: var(--km-text-lg);
      font-weight: var(--km-weight-bold);
      color: var(--km-on-surface);
      text-decoration: none;
      letter-spacing: -0.03em;
      padding: 0 1.25rem;
    }
    .sidebar-brand:hover { color: var(--km-primary); }

    .sidebar ul { list-style: none; display: flex; flex-direction: column; gap: 0.125rem; }

    .nav-group-heading {
      font-size: var(--km-text-xs);
      font-weight: var(--km-weight-semibold);
      color: var(--km-on-surface-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 0.75rem 1.25rem 0.375rem;
      margin-top: 0.5rem;
    }

    .sidebar a {
      display: block;
      padding: 0.5rem 1.25rem;
      color: var(--km-on-surface-variant);
      font-size: var(--km-text-sm);
      font-weight: var(--km-weight-medium);
      border-left: 2px solid transparent;
      transition: color var(--km-duration-fast) var(--km-ease),
                  background var(--km-duration-fast) var(--km-ease),
                  border-color var(--km-duration-fast) var(--km-ease);
    }
    .sidebar a:hover {
      background: var(--km-surface-2);
      color: var(--km-on-surface);
    }
    .sidebar a.active {
      color: var(--km-primary);
      border-left-color: var(--km-primary);
      background: rgba(69, 249, 156, 0.06);
    }

    .sidebar-logout-btn {
      display: block;
      width: 100%;
      padding: 0.5rem 1.25rem;
      color: var(--km-on-surface-variant);
      font-size: var(--km-text-sm);
      font-weight: var(--km-weight-medium);
      background: none;
      border: none;
      border-left: 2px solid transparent;
      cursor: pointer;
      text-align: left;
      font-family: var(--km-font-sans);
      transition: color var(--km-duration-fast) var(--km-ease),
                  background var(--km-duration-fast) var(--km-ease);
    }
    .sidebar-logout-btn:hover {
      background: var(--km-surface-2);
      color: var(--km-on-surface);
    }

    .sidebar-divider {
      margin: 0.5rem 1.25rem;
      height: 1px;
      background: var(--km-surface-3);
    }

    /* --- Main --- */
    .main {
      flex: 1;
      padding: 2rem 2.5rem;
      min-width: 0;
    }

    .main > h1 {
      font-size: var(--km-text-2xl);
      font-weight: var(--km-weight-bold);
      margin-bottom: 1.5rem;
      letter-spacing: -0.03em;
      color: var(--km-on-surface);
    }

    /* --- Cards --- */
    .dashboard { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
    .card {
      background: var(--km-surface-1);
      border-radius: var(--km-radius-lg);
      padding: 1.25rem;
      box-shadow: var(--km-shadow-sm);
      transition: background var(--km-duration-fast) var(--km-ease),
                  box-shadow var(--km-duration-fast) var(--km-ease);
    }
    .card:hover { background: var(--km-surface-2); box-shadow: var(--km-shadow-md); }
    .card a { color: var(--km-on-surface); text-decoration: none; display: block; }
    .card h3 { font-size: var(--km-text-lg); font-weight: var(--km-weight-semibold); }

    .stat-card {
      background: var(--km-surface-1);
      border-radius: var(--km-radius-lg);
      padding: 1.25rem 1.25rem 1.25rem 1.5rem;
      position: relative;
      overflow: hidden;
      transition: background var(--km-duration-fast) var(--km-ease);
    }
    .stat-card::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--km-primary-dim);
    }
    .stat-card:hover { background: var(--km-surface-2); }
    .stat-card a { color: var(--km-on-surface); text-decoration: none; display: block; }
    .stat-card h3 {
      font-size: var(--km-text-sm);
      font-weight: var(--km-weight-medium);
      color: var(--km-on-surface-variant);
      margin-bottom: 0.375rem;
    }
    .stat-count {
      font-size: var(--km-text-2xl);
      font-weight: var(--km-weight-bold);
      color: var(--km-on-surface);
      letter-spacing: -0.02em;
    }

    /* --- Tables --- */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--km-text-sm);
      margin-top: 1rem;
    }
    th {
      text-align: left;
      padding: 0.625rem 0.75rem;
      font-weight: var(--km-weight-semibold);
      color: var(--km-on-surface-muted);
      font-size: var(--km-text-xs);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      background: var(--km-surface-1);
    }
    td {
      padding: 0.625rem 0.75rem;
      background: var(--km-surface-0);
    }
    tr:hover td { background: var(--km-surface-1); }
    /* Separator between rows via tonal shift — no borders */
    tbody tr + tr td { box-shadow: inset 0 1px 0 var(--km-surface-2); }

    /* --- Forms --- */
    .admin-form { max-width: 640px; display: flex; flex-direction: column; gap: 1.25rem; }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }
    .form-field > span {
      font-size: var(--km-text-sm);
      font-weight: var(--km-weight-medium);
      color: var(--km-on-surface-variant);
    }

    .form-input, .form-select, .form-textarea {
      background: var(--km-surface-2);
      border: 2px solid transparent;
      border-radius: var(--km-radius-md);
      padding: 0.5rem 0.75rem;
      color: var(--km-on-surface);
      font-family: var(--km-font-sans);
      font-size: var(--km-text-sm);
      transition: border-color var(--km-duration-fast) var(--km-ease),
                  box-shadow var(--km-duration-fast) var(--km-ease);
    }
    .form-input:focus, .form-select:focus, .form-textarea:focus {
      outline: none;
      border-color: var(--km-primary);
      box-shadow: var(--km-focus-ring);
    }
    .form-textarea { min-height: 120px; resize: vertical; }
    .form-select { appearance: none; cursor: pointer; }

    .form-checkbox {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: var(--km-text-sm);
      color: var(--km-on-surface);
      cursor: pointer;
    }
    .form-checkbox input[type="checkbox"] {
      width: 1rem;
      height: 1rem;
      accent-color: var(--km-primary);
      cursor: pointer;
    }

    fieldset {
      border: 2px solid var(--km-surface-3);
      border-radius: var(--km-radius-lg);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    fieldset legend {
      font-size: var(--km-text-sm);
      font-weight: var(--km-weight-semibold);
      color: var(--km-on-surface-variant);
      padding: 0 0.5rem;
    }

    /* --- Buttons --- */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem 1rem;
      font-size: var(--km-text-sm);
      font-weight: var(--km-weight-semibold);
      font-family: var(--km-font-sans);
      border-radius: var(--km-radius-md);
      border: none;
      cursor: pointer;
      text-decoration: none;
      transition: background var(--km-duration-fast) var(--km-ease),
                  transform var(--km-duration-fast) var(--km-ease);
    }
    .btn:active { transform: scale(0.97); }
    .btn-primary {
      background: var(--km-primary-gradient);
      color: var(--km-surface-0);
    }
    .btn-primary:hover { background: var(--km-primary-hover); color: var(--km-surface-0); }
    .btn-danger {
      background: var(--km-error);
      color: #fff;
    }
    .btn-danger:hover { background: #ef4444; }

    .empty-state {
      color: var(--km-on-surface-variant);
      padding: 2rem 0;
    }
    .empty-state a { color: var(--km-primary); }

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
      border-radius: var(--km-radius-md);
      box-shadow: var(--km-shadow-md);
      font-size: var(--km-text-sm);
      font-weight: var(--km-weight-medium);
      color: #fff;
      z-index: 1000;
      transition: opacity var(--km-duration-normal) var(--km-ease);
    }
    .toast-error { background: var(--km-error); }
    .toast-success { background: var(--km-success); color: var(--km-surface-0); }
    .toast-info { background: var(--km-info); }
    .toast-dismiss {
      background: none;
      border: none;
      color: inherit;
      font-size: var(--km-text-lg);
      cursor: pointer;
      padding: 0;
      line-height: 1;
      opacity: 0.8;
    }
    .toast-dismiss:hover { opacity: 1; }
    .toast-fade { opacity: 0; }

    /* --- Richtext Editor --- */
    .richtext-wrap {
      border: 2px solid var(--km-surface-3);
      border-radius: var(--km-radius-md);
      overflow: hidden;
    }
    .richtext-toolbar {
      display: flex;
      gap: 0.25rem;
      padding: 0.375rem 0.5rem;
      background: var(--km-surface-2);
    }
    .richtext-toolbar-btn {
      background: none;
      border: 2px solid transparent;
      border-radius: var(--km-radius-sm);
      color: var(--km-on-surface-variant);
      font-size: var(--km-text-sm);
      font-weight: var(--km-weight-bold);
      padding: 0.25rem 0.5rem;
      cursor: pointer;
      font-family: var(--km-font-sans);
    }
    .richtext-toolbar-btn:hover {
      background: var(--km-surface-1);
      color: var(--km-on-surface);
    }
    .richtext-toolbar-btn--active {
      background: var(--km-surface-1);
      color: var(--km-on-surface);
      border-color: var(--km-surface-3);
    }
    .richtext-editor {
      min-height: 200px;
    }
    .ProseMirror {
      min-height: 200px;
      padding: 0.75rem;
      background: var(--km-surface-2);
      color: var(--km-on-surface);
      font-family: var(--km-font-sans);
      font-size: var(--km-text-sm);
      line-height: var(--km-leading-normal);
      outline: none;
    }
    .ProseMirror:focus {
      box-shadow: inset 0 0 0 2px var(--km-primary);
    }
    .ProseMirror p { margin-bottom: 0.5rem; }
    .ProseMirror h2 { font-size: var(--km-text-xl); font-weight: var(--km-weight-bold); margin: 1rem 0 0.5rem; }
    .ProseMirror h3 { font-size: var(--km-text-lg); font-weight: var(--km-weight-semibold); margin: 0.75rem 0 0.5rem; }
    .ProseMirror ul, .ProseMirror ol { padding-left: 1.5rem; margin-bottom: 0.5rem; }
    .ProseMirror blockquote {
      border-left: 3px solid var(--km-surface-3);
      padding-left: 0.75rem;
      color: var(--km-on-surface-variant);
      margin: 0.5rem 0;
    }
    .ProseMirror a { color: var(--km-primary); text-decoration: underline; }
    .ProseMirror code {
      background: var(--km-surface-1);
      padding: 0.125rem 0.375rem;
      border-radius: var(--km-radius-sm);
      font-family: var(--km-font-mono);
      font-size: 0.85em;
    }
    .ProseMirror hr {
      border: none;
      border-top: 2px solid var(--km-surface-3);
      margin: 1rem 0;
    }
    .ProseMirror pre {
      background: var(--km-surface-1);
      padding: 0.75rem;
      border-radius: var(--km-radius-md);
      font-family: var(--km-font-mono);
      font-size: 0.85em;
      overflow-x: auto;
      margin: 0.5rem 0;
    }
    .ProseMirror pre code {
      background: none;
      padding: 0;
      border-radius: 0;
    }
    .form-json {
      min-height: 120px;
      resize: vertical;
      background: var(--km-surface-2);
      border: 2px solid transparent;
      border-radius: var(--km-radius-md);
      padding: 0.5rem 0.75rem;
      color: var(--km-on-surface);
      font-family: var(--km-font-mono);
      font-size: var(--km-text-sm);
      line-height: var(--km-leading-normal);
    }
    .form-json:focus {
      outline: none;
      border-color: var(--km-primary);
      box-shadow: var(--km-focus-ring);
    }
    .array-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .array-add {
      align-self: flex-start;
      background: var(--km-surface-2);
      border: 2px dashed var(--km-surface-3);
      border-radius: var(--km-radius-md);
      padding: 0.375rem 0.75rem;
      color: var(--km-on-surface-variant);
      font-size: var(--km-text-sm);
      cursor: pointer;
    }
    .array-add:hover {
      border-color: var(--km-primary);
      color: var(--km-on-surface);
    }

    /* --- Blocks field --- */
    .blocks-field {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .blocks-item {
      border: 2px solid var(--km-surface-3);
      border-radius: var(--km-radius-lg);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .blocks-item legend {
      font-size: var(--km-text-sm);
      font-weight: var(--km-weight-semibold);
      color: var(--km-on-surface-variant);
      padding: 0 0.5rem;
    }
    .blocks-remove {
      align-self: flex-end;
      background: none;
      border: 2px solid var(--km-error);
      border-radius: var(--km-radius-md);
      padding: 0.25rem 0.5rem;
      color: var(--km-error);
      font-size: var(--km-text-xs);
      cursor: pointer;
    }
    .blocks-remove:hover {
      background: var(--km-error);
      color: #fff;
    }
    .blocks-add {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    .blocks-type-select {
      background: var(--km-surface-2);
      border: 2px solid transparent;
      border-radius: var(--km-radius-md);
      padding: 0.375rem 0.75rem;
      color: var(--km-on-surface);
      font-size: var(--km-text-sm);
    }
    .blocks-add-btn {
      background: var(--km-surface-2);
      border: 2px dashed var(--km-surface-3);
      border-radius: var(--km-radius-md);
      padding: 0.375rem 0.75rem;
      color: var(--km-on-surface-variant);
      font-size: var(--km-text-sm);
      cursor: pointer;
    }
    .blocks-add-btn:hover {
      border-color: var(--km-primary);
      color: var(--km-on-surface);
    }

    /* --- Edit meta + revisions --- */
    .edit-meta {
      margin-top: 1rem;
      padding-top: 0.75rem;
    }
    .diff-table .diff-changed td {
      background: rgba(255, 200, 50, 0.1);
    }
    /* --- Media upload / drop zone --- */
    .media-drop-zone {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .media-preview {
      font-size: var(--km-text-sm);
      color: var(--km-on-surface-variant);
    }
    .media-preview img {
      max-width: 200px;
      max-height: 150px;
      border-radius: var(--km-radius-md);
    }
    .drop-zone-text {
      font-size: var(--km-text-sm);
      color: var(--km-on-surface-variant);
      text-align: center;
      padding: 1rem;
    }
    .focal-point-selector {
      position: relative;
      display: inline-block;
      cursor: crosshair;
    }
    .focal-point-image {
      max-width: 400px;
      max-height: 300px;
      border-radius: var(--km-radius-md);
    }
    .focal-point-marker {
      position: absolute;
      width: 20px;
      height: 20px;
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5);
      transform: translate(-50%, -50%);
      pointer-events: none;
    }
    .variant-thumbnails {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }
    .variant-thumb {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }
    .variant-thumb img {
      border-radius: var(--km-radius-sm);
    }
    .variant-label {
      font-size: var(--km-text-xs);
      color: var(--km-on-surface-variant);
    }
    /* --- Edit page container --- */
    .edit-container {
      max-width: 640px;
    }
    .edit-danger-zone {
      margin-top: 2rem;
      padding-top: 1.5rem;
    }
    .btn-ghost-danger {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.375rem 0.75rem;
      font-size: var(--km-text-sm);
      font-weight: var(--km-weight-medium);
      font-family: var(--km-font-sans);
      border-radius: var(--km-radius-md);
      border: 2px solid var(--km-error);
      background: transparent;
      color: var(--km-error);
      cursor: pointer;
      transition: background var(--km-duration-fast) var(--km-ease);
    }
    .btn-ghost-danger:hover {
      background: var(--km-error);
      color: #fff;
    }

    /* --- List view actions --- */
    .actions-cell {
      white-space: nowrap;
    }
    .action-link {
      font-size: var(--km-text-xs);
      padding: 0.25rem 0.5rem;
      border-radius: var(--km-radius-sm);
      color: var(--km-on-surface-variant);
    }
    .action-link:hover {
      background: var(--km-surface-2);
      color: var(--km-on-surface);
    }

    /* --- Responsive --- */
    @media (max-width: 768px) {
      body { flex-direction: column; }
      .sidebar {
        width: 100%;
        padding: 1rem 0;
      }
      .sidebar ul { flex-direction: row; flex-wrap: wrap; gap: 0.5rem; padding: 0 1rem; }
      .sidebar a { border-left: none; }
      .main { padding: 1.5rem 1rem; }
    }
  </style>`
}
