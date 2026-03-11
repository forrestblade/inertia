# Contributing to Inertia

## Development Setup

```bash
git clone https://github.com/forrestblade/inertia.git
cd inertia
pnpm install
pnpm test   # Verify everything passes
pnpm lint   # Verify lint is clean
```

Requires Node.js >= 22 and pnpm 10.x. The `packageManager` field in `package.json` enforces the exact pnpm version.

## Code Rules

### Non-Negotiable

These will fail code review. No exceptions.

- **No `try/catch/throw`** in business logic. Use `Result<Ok, Err>` monads from neverthrow. The ONE permitted boundary is `safeJsonParse()` in `packages/ingestion/`.
- **No `switch` statements.** Use static dictionary maps.
- **No `new` keyword** for telemetry objects at runtime. Pre-allocate at boot.
- **No `Record<string, any>`** or any loose typing. TypeScript strict mode is enforced.
- **No framework imports** (React, Angular, Vue). UI is native Web Components.
- **No `.parse()`** on Zod schemas. Use `.safeParse()` only.
- **No third-party analytics scripts** (Google Analytics, Adobe, etc.).
- **No `localStorage`/`sessionStorage`** for critical application state.

### Style

- **Barrel exports** for all module directories (`index.ts`)
- **Named exports only.** No default exports (except Web Component class registrations).
- **Explicit interfaces.** No inferred return types on public functions.
- **File naming**: `kebab-case.ts` for modules, `PascalCase.ts` for Web Component classes.
- **Comments** explain WHY, not WHAT.
- **Linter**: Neostandard. Run `pnpm lint` before committing.

### TypeScript

The project uses strict mode with the following compiler options enforced:

- `noImplicitAny`
- `noImplicitReturns`
- `strictNullChecks`
- `noUncheckedIndexedAccess`
- `exactOptionalPropertyTypes`

## Commit Convention

Logical semantic micro-commits using conventional format:

```
feat(telemetry): implement ring buffer flush mechanics
fix(ingestion): handle empty payload edge case
refactor(router): extract fragment swap to dedicated module
test(hud): add malformed JSON fallback tests for HudTable
ci: add GitHub Actions lint and test pipeline
chore: sync pnpm-lock.yaml
```

Scope is the package or subsystem name: `telemetry`, `ingestion`, `db`, `router`, `components`, `tokens`, `hud`, `critical-css`, `studio`.

Commits are enforced via Husky pre-commit hooks that run lint before each commit.

## Pull Requests

1. Create a feature branch from `master`.
2. Make your changes following the code rules above.
3. Ensure `pnpm test` and `pnpm lint` both pass.
4. Write tests for new functionality. Follow the existing pattern: happy-dom environment, `beforeAll` dynamic import, `createElement`/`attach` helpers.
5. Open a PR against `master`. CI will run lint and tests automatically.

## Project Structure

Features for deployed sites live in `sites/<site-name>/features/<feature-name>/`:

```
features/<feature-name>/
  components/    Web Components (Custom Elements)
  templates/     HTML fragments returned by server routes
  server/        Server-side route handlers (return HTML, not JSON)
  types/         TypeScript interfaces (monomorphic, explicit)
  schemas/       Zod schemas (.safeParse() only)
  telemetry/     Feature-specific IntentType definitions
  config/        Constants and static dictionary maps
```

Only create directories you actually use. Not every feature needs all of these.

## Architecture Guidelines

- **AV Rule 206**: No dynamic memory allocation after init. Pre-allocate buffers and pools at boot.
- **AV Rule 208**: No exceptions. Return `Result<Ok, Err>` monads. Handle both branches explicitly.
- **AV Rule 3**: Keep cyclomatic complexity under 20. Use early returns and dictionary maps instead of branching.
- **14kB Protocol**: Critical shell (inline CSS + initial DOM) must fit in first 10 TCP packets (~14kB compressed).

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for full details.

## File Boundaries

- **Safe to edit**: `packages/`, `sites/`, `tools/`, `docs/`
- **Never touch**: `node_modules/`, `.husky/` (edit via config only), any `dist/` output
