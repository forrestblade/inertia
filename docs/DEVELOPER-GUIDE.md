# Developer Guide

Day-to-day patterns for working in the Valence codebase.

## Project Structure

```
valencets/
├── packages/
│   ├── core/           Telemetry engine, client router, event delegation
│   ├── components/     Shared Web Component primitives
│   ├── tokens/         Design token engine (OKLCh color space)
│   ├── ingestion/      Server-side monadic pipeline + HMAC verification
│   ├── db/             PostgreSQL schema, migrations, RBAC
│   ├── neverthrow/     Vendored Result monads (v8.2.0, MIT)
│   └── hud/            Analytics dashboard components
├── sites/
│   └── studio/         Studio website (first Valence deployment)
│       ├── features/   Feature modules (see "Adding a Feature")
│       ├── server/     Entry point, config, route registration
│       ├── public/     Generated CSS/JS (not committed)
│       └── pages/      Page composition
├── tools/
│   ├── audit/          Banned pattern scanner
│   ├── build/          Build tooling
│   └── lighthouse/     Lighthouse audit runner
└── docs/               You are here
```

Each package has its own `CLAUDE.md` with detailed rules and context.

## The Four Pillars

These are non-negotiable. Code that violates them will fail the pre-commit hook.

1. **AV Rule 206** — No dynamic memory allocation after init. Pre-allocate buffers and pools at boot, mutate in place at runtime.
2. **AV Rule 208** — No exceptions. Zero `try/catch/throw` in business logic. One permitted boundary: `safeJsonParse()`. Everything else uses `Result<Ok, Err>` monads from `@valencets/neverthrow`.
3. **AV Rule 3** — Cyclomatic complexity < 20. Early returns, static dictionary maps, micro-componentization. No `switch` statements.
4. **14kB Protocol Limit** — Critical shell (inline CSS + initial DOM) fits in the first 10 TCP packets (~14kB compressed).

See [ARCHITECTURE.md](./ARCHITECTURE.md) § Engineering Philosophy for the full rationale.

## Adding a Feature

Features live in `sites/<site>/features/<feature-name>/`. Only create the subdirectories you need.

```
features/<feature-name>/
  components/    Web Components (Custom Elements)
  templates/     HTML fragments returned by server routes
  server/        Route handlers (return HTML, not JSON)
  types/         TypeScript interfaces (monomorphic, explicit)
  schemas/       Zod schemas (.safeParse() only)
  telemetry/     IntentType definitions and data-* contracts
  config/        Constants and static dictionary maps
  __tests__/     Vitest tests
```

### Step-by-step

1. **Create the directory**: `sites/studio/features/my-feature/`

2. **Add a template** (`templates/my-feature-section.ts`):
   ```ts
   export function myFeatureSection (): string {
     return `<section class="my-feature">...</section>`
   }
   ```

3. **Add a route handler** (`server/my-feature-handler.ts`):
   ```ts
   import type { RouteContext } from '../../../server/types.js'
   import { myFeatureSection } from '../templates/my-feature-section.js'

   export function myFeatureHandler (ctx: RouteContext): string {
     return myFeatureSection()
   }
   ```

4. **Wire into the router** — edit `sites/studio/server/register-routes.ts`:
   ```ts
   import { myFeatureHandler } from '../features/my-feature/server/my-feature-handler.js'
   // ...
   router.get('/my-feature', (req, res) => myFeatureHandler(ctx))
   ```

5. **Add a Zod schema** if the feature accepts input (`schemas/my-feature-schema.ts`):
   ```ts
   import { z } from 'zod'
   export const myFeatureSchema = z.object({ /* ... */ })
   // Always .safeParse(), never .parse()
   ```

6. **Add a Web Component** if the feature has client-side behavior (`components/MyFeature.ts`):
   ```ts
   export class MyFeature extends HTMLElement {
     static observedAttributes = ['data-value']
     connectedCallback () { /* ... */ }
   }
   customElements.define('my-feature', MyFeature)
   ```

7. **Write tests** in `__tests__/` following the patterns below.

### Real examples in the codebase

| Feature | Has | Notable files |
|---------|-----|--------------|
| `home` | config, server, templates, tests | Landing page with manifesto |
| `contact` | schemas, server, templates, tests | Form with Zod validation |
| `audit` | schemas, server, templates, types, tests | Live Lighthouse audit tool |
| `admin` | server, templates, tests | HUD, fleet dashboard, auth |
| `glass-box` | components, config, types, tests | `GlassBoxInspector`, `GlassBoxStrip` |
| `client` | components, tests | `CacheIndicator`, `SpeedShowcase`, boot/bundle entry |

## Design Token Pipeline

End-to-end flow for the token system in `packages/tokens/`:

```
ColorSet interface → ThemeConfig → Zod schema validation
    → resolveTheme(clientOverride, baseTheme) → generateCSS(config) → CSS variables
```

### Key types

- **`ColorSet`** — 38 color tokens (background, foreground, primary, accent, chart-1..5, sidebar-*, etc.)
- **`ShadowSet`** — 8 shadow levels (2xs through 2xl)
- **`ThemeConfig`** — `{ colors: { light, dark }, fonts: { sans, serif, mono }, radius, spacing, shadows, tracking }`
- **`PartialTheme`** — deep partial of ThemeConfig for site-level overrides

### Pipeline stages

1. **`parseTheme(input)`** — validates a full ThemeConfig via Zod `.safeParse()`, returns `Result<ThemeConfig, TokenError>`
2. **`parsePartialTheme(input)`** — validates a partial override
3. **`resolveTheme(client, base)`** — merges client overrides onto the base theme (shallow spread for objects, nullish coalescing for scalars)
4. **`generateCSS(config)`** — produces CSS with `:root` (light), `.dark` (dark), `@theme inline`, and `@layer base` blocks

### Adding a new token

1. Add the property to `ColorSet` in `token-types.ts`
2. Add the corresponding CSS variable mapping in `generateCSS()` in `generate.ts`
3. Update the Zod schema in `schema.ts`
4. Set values in both `light` and `dark` color sets in your site's theme config

## Database Migrations

Migrations live in `packages/db/migrations/` and run automatically on server boot.

### Naming convention

```
NNN-kebab-description.sql
```

Zero-padded 3-digit sequence number. Current migrations:

| File | Purpose |
|------|---------|
| `001-init.sql` | `sessions`, `events` tables |
| `002-rbac.sql` | Roles and permissions |
| `003-summary-tables.sql` | `session_summaries`, `event_summaries`, `conversion_summaries`, `ingestion_health` |
| `004-contact.sql` | `contact_submissions` |
| `005-daily-summaries.sql` | `daily_summaries` |
| `006-summary-upsert-constraints.sql` | Upsert constraints |
| `007-sites-table.sql` | `sites` table for fleet |

### Creating a new migration

1. Create `packages/db/migrations/008-your-description.sql`
2. Write idempotent SQL (`CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`)
3. The migration runner uses neverthrow Result monads — migrations that fail return `Err`, not exceptions

## Testing Patterns

Tests use **Vitest** with **happy-dom** environment. No database or network required.

### Dynamic import pattern

Web Component tests use `beforeAll` with dynamic import to ensure the component registers in the happy-dom environment:

```ts
let MyComponent: typeof import('../components/MyComponent.js').MyComponent

beforeAll(async () => {
  const mod = await import('../components/MyComponent.js')
  MyComponent = mod.MyComponent
})
```

### createElement / attach helpers

```ts
function createElement (): HTMLElement {
  const el = document.createElement('my-component')
  document.body.appendChild(el)
  return el
}
```

### TDD commit convention

Commits during TDD are tagged in the message:

- `test(feature): RED — add test for new behavior` (test written, failing)
- `feat(feature): GREEN — implement behavior` (test passing)
- `refactor(feature): REFACTOR — extract helper` (same tests, cleaner code)

## Banned Patterns

These fail the pre-commit hook. Run `pnpm audit:patterns` to check.

| Pattern | Why | Alternative |
|---------|-----|-------------|
| `throw new Error` | AV Rule 208: no exceptions | `err()` / `errAsync()` from neverthrow |
| `try { }` | AV Rule 208: no try/catch | Result monads. Exception: `safeJsonParse()` |
| `switch (` | AV Rule 3: complexity | Static dictionary maps |
| `enum Foo` | Banned keyword | `const Foo = [...] as const` |
| `.parse(` | Zod footgun | `.safeParse()` only |
| `import React` | No VDOM in public code | Native Web Components |
| `export default` | Named exports only | `export function/class/const` |
| `Record<string, any>` | Loose typing | Explicit interfaces |
| `localStorage` / `sessionStorage` | No critical state in web storage | Server-side state, cookies |
| Empty `criticalCSS: ''` | Pillar 4 violation | `ctx.cssPipeline.getCriticalCSS()` |

Some patterns have allowlisted files (e.g., `.safeParse()` callers that chain `.parse()` internally). See `tools/audit/banned-patterns.ts` for the full allowlist.

## Code Rules Quick Reference

- **Named exports only** — no default exports (except Web Component class registrations via `customElements.define`)
- **Barrel exports** — every module directory has an `index.ts`
- **File naming** — `kebab-case.ts` for modules, `PascalCase.ts` for Web Component classes
- **No inferred return types** on public functions — always explicit
- **Comments explain WHY**, not WHAT
- **Error types** — const union + interface pattern: `const FooErrorCode = [...] as const` + `interface FooError { code, message }`
- **Fetchers** — `ResultAsync.fromPromise()` from neverthrow
- **Commit format** — `type(scope): description` (see [GETTING-STARTED.md](./GETTING-STARTED.md))

## Further Reading

- [ARCHITECTURE.md](./ARCHITECTURE.md) — full system design and engineering philosophy
- [HUD_SPEC.md](./HUD_SPEC.md) — analytics dashboard design specification
- [API-REFERENCE.md](./API-REFERENCE.md) — complete route and endpoint reference
- [DEPLOYMENT.md](./DEPLOYMENT.md) — build pipeline and deployment guide
