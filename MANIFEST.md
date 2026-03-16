# Valence Framework -- Agent Manifest

Comprehensive onboarding reference for any agent working in this codebase. Read this before writing a single line of code.

---

## What Is Valence?

Valence is a deterministic web framework that applies JSF (Joint Strike Fighter) aerospace coding standards to TypeScript, Web Components, and PostgreSQL. It provides the foundational packages for building HTML-over-the-wire web applications with first-party telemetry, monadic error handling, and strict runtime safety guarantees.

The framework is organized as a pnpm monorepo. Applications consume Valence packages as workspace dependencies.

---

## The Four Pillars (Non-Negotiable)

These are hard rules. Violating any of them will fail code review. No exceptions, no shortcuts, no "just this once."

### AV Rule 206 -- No Dynamic Memory Allocation After Init

In C++, heap allocation causes fragmentation. In JavaScript, it causes GC pauses that drop frames. Pre-allocate all structures at boot. Mutate in-place. Never create/destroy during runtime.

- **Telemetry**: `TelemetryObjectPool` pre-allocates intent slots. `TelemetryRingBuffer` uses fixed-capacity circular buffer with modulo arithmetic.
- `new Date()` in route handlers is tolerated. `new BusinessObject()` per request is not.

### AV Rule 208 -- No Exceptions

The Ariane 5 exploded because of an unhandled exception. Every function returns `Result<Ok, Err>` via the `neverthrow` library. The compiler forces explicit handling of both branches.

- **Zero `try/catch/throw`** in business logic.
- When you need to signal failure inside `ResultAsync.fromPromise()`, use `return Promise.reject(new Error(...))` -- never `throw`.

### AV Rule 3 -- Cyclomatic Complexity < 20

Formula: `V(G) = E - N + 2P`. Every `if`, `for`, `while`, `&&`, `||` adds a decision path. Above 20, exhaustive testing is mathematically impossible.

- Use early returns, static dictionary maps, and micro-componentization.
- **No `switch` statements.** Use dictionary maps: `const handlers: Record<Key, Handler> = { ... }`.
- **No `enum` keyword.** Use const unions: `const Foo = ['a', 'b'] as const; type Foo = typeof Foo[number]`.

### 14kB Protocol Limit

Critical shell (inline CSS + initial DOM) must fit in the first 10 TCP packets (~14kB compressed). No external stylesheets in the critical path. This is a framework-level design constraint that consuming applications must respect.

---

## Banned Patterns

These will fail code review. Memorize them.

| Pattern | Why | Use Instead |
|---------|-----|-------------|
| `try { } catch { }` | AV Rule 208 | `Result<Ok, Err>` monads |
| `switch (x) { }` | AV Rule 3 | Static dictionary maps |
| `enum Foo { }` | No enums | `const Foo = [...] as const` |
| `new TelemetryObj()` at runtime | AV Rule 206 | Pre-allocate at boot |
| `Record<string, any>` | Loose typing | Explicit interfaces |
| `.parse()` on Zod | Throws on failure | `.safeParse()` only |
| `import React` | No VDOM frameworks | Native Web Components |
| `localStorage`/`sessionStorage` | Fragile state | Server-delivered HTML |
| `process.env` outside config module | Scattered config | Centralized `loadConfig()` |
| Third-party analytics | Self-hosted only | Valence telemetry engine |
| `throw new Error(...)` | AV Rule 208 | `err(...)` or `Promise.reject(...)` |

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Language | TypeScript (strict mode, zero `any`) | ES2022 target, ESNext modules |
| UI | Native Web Components | Light DOM, `connectedMoveCallback` lifecycle |
| Routing | HTML-over-the-wire | `history.pushState()`, DOMParser fragment swaps |
| Server | Node.js (http module) | No Express, no Fastify |
| Database | PostgreSQL | Immutable append-only ledger, INSERT+SELECT only |
| Validation | Zod 4.x | `.safeParse()` exclusively |
| Error handling | neverthrow | `Result<Ok, Err>`, `ResultAsync`, `.andThen()`, `.map()` |
| Linting | Neostandard (ESLint 9) | Pre-commit hook enforced |
| Testing | Vitest 4.x + happy-dom | 315 tests across the monorepo |
| Package mgr | pnpm 10.x workspaces | Monorepo, `node >= 22` |
| Build | TypeScript compiler (`tsc`) | Per-package, outputs to `dist/` |
| DB driver | `postgres` (porsager/postgres) | Tagged template SQL, parameterized by default |

---

## Project Structure

```
valence/
├── packages/
│   ├── core/           # Telemetry engine + HTML-over-the-wire router + server utilities
│   ├── db/             # PostgreSQL connection pool, config, migration runner, error mapping
│   ├── telemetry/      # Summary queries, daily aggregation, fleet data types
│   ├── ui/             # Web Component primitives (scaffolded)
│   ├── cms/            # Content management (scaffolded)
│   └── neverthrow/     # Vendored Result monads (v8.2.0, MIT, not published)
├── docs/
│   ├── ARCHITECTURE.md # Full architectural reference
│   ├── DEVELOPER-GUIDE.md
│   ├── GETTING-STARTED.md
│   └── TROUBLESHOOTING.md
├── .husky/
│   └── pre-commit      # Runs: pnpm lint
├── CLAUDE.md           # AI agent instructions
├── CONTRIBUTING.md     # Human contributor guide
├── MANIFEST.md         # You are here
├── package.json        # Root monorepo config
├── pnpm-workspace.yaml # Workspace: packages/*
├── tsconfig.json       # Root TypeScript config (strict)
└── eslint.config.js    # Neostandard config
```

---

## Workspace Packages

### @valencets/core

**Status**: Built, 216 tests.

**Purpose**: Client-side telemetry engine, HTML-over-the-wire router, and server utilities.

Two subsystems:
- **Telemetry**: `GlobalTelemetryIntent` monomorphic interface, `TelemetryObjectPool` (pre-allocated slots), `TelemetryRingBuffer` (circular buffer), event delegation via `data-*` attributes, `sendBeacon` flush.
- **Router**: `history.pushState()` navigation, `DOMParser` fragment extraction, `replaceChildren()` swap, `Element.moveBefore()` for persistent Web Components, hover-intent prefetch with velocity calculation.

**Dependencies**: `@valencets/neverthrow`

**Exports**: Two entry points -- `.` (client telemetry + router) and `./server` (server utilities).

### @valencets/db

**Status**: Built, 38 tests.

**Purpose**: Framework-level PostgreSQL primitives -- connection pool management, config validation, migration runner, and error mapping.

**Driver**: `postgres` (porsager/postgres) -- tagged template SQL, parameterized by default, zero transitive deps. Import as `import postgres from 'postgres'` (default import, third-party API).

**Dependencies**: `@valencets/neverthrow`, `postgres`, `zod`

**Key exports**: `createPool`, `closePool`, `validateDbConfig`, `runMigrations`, `mapPostgresError`

### @valencets/telemetry

**Status**: Built, 59 tests.

**Purpose**: Server-side telemetry aggregation -- summary queries, daily aggregation pipelines, and fleet data types.

**Dependencies**: `@valencets/db`, `@valencets/neverthrow`, `postgres`

### @valencets/ui

**Status**: Scaffolded only (no implementation yet).

**Purpose**: Will contain shared Web Component primitives for Valence applications. Native Custom Elements, light DOM, no framework dependencies.

**Dependencies**: None (dev only: happy-dom, typescript, vitest)

### @valencets/cms

**Status**: Scaffolded only (no implementation yet).

**Purpose**: Will contain content management functionality for Valence applications.

**Dependencies**: `@valencets/core`, `@valencets/db`, `@valencets/ui`, `zod`

### @valencets/neverthrow

**Status**: Vendored, stable.

**Purpose**: Vendored neverthrow v8.2.0 -- `Result<Ok, Err>` and `ResultAsync` monads. Internal to the workspace, not published to npm.

**Dependencies**: None.

---

## Dependency Graph

```
neverthrow          (standalone -- no deps)
    ^
    |
    +--- core       (neverthrow)
    |
    +--- db         (neverthrow, postgres, zod)
    |      ^
    |      |
    +------+--- telemetry  (db, neverthrow, postgres)
    |
    +--- ui         (standalone -- no deps)
    |
    +--- cms        (core, db, ui, zod)
```

Build order (topological): neverthrow -> core, db, ui (parallel) -> telemetry -> cms

---

## Cross-Package Import Rules

| Package | Can Import From | Cannot Import From |
|---------|----------------|-------------------|
| `@valencets/neverthrow` | Nothing | All others |
| `@valencets/core` | `neverthrow` | db, telemetry, ui, cms |
| `@valencets/db` | `neverthrow`, `postgres`, `zod` | core, telemetry, ui, cms |
| `@valencets/telemetry` | `db`, `neverthrow`, `postgres` | core, ui, cms |
| `@valencets/ui` | Nothing | All others |
| `@valencets/cms` | `core`, `db`, `ui`, `zod` | telemetry |

**Key rule**: Follow the dependency graph strictly. Circular dependencies are forbidden. Wiring across packages that don't share a dependency edge happens at the consuming application layer.

---

## Error Handling Patterns

### Error Type Convention

Every domain uses the const union + interface pattern:

```typescript
// 1. Define error codes as const object
export const FooErrorCode = {
  NOT_FOUND: 'NOT_FOUND',
  INVALID_INPUT: 'INVALID_INPUT'
} as const

// 2. Derive the union type
export type FooErrorCode = typeof FooErrorCode[keyof typeof FooErrorCode]

// 3. Define the error interface
export interface FooError {
  readonly code: FooErrorCode
  readonly message: string
}
```

### Result Monad Usage

```typescript
import { ok, err, Result, ResultAsync } from '@valencets/neverthrow'

// Synchronous
function validate (input: string): Result<ValidData, FooError> {
  if (input.length === 0) return err({ code: FooErrorCode.INVALID_INPUT, message: 'empty' })
  return ok(parseData(input))
}

// Asynchronous (DB, HTTP)
function fetchThing (pool: DbPool, id: string): ResultAsync<Thing, DbError> {
  return ResultAsync.fromPromise(
    pool.sql`SELECT * FROM things WHERE id = ${id}`.then(rows => rows[0]),
    mapPostgresError
  )
}

// Chaining
const result = validateInput(body)
  .andThen(transform)
  .map(format)
```

---

## Testing

### Environment

- **Framework**: Vitest 4.x
- **DOM**: happy-dom (not jsdom)
- **Pattern**: `src/__tests__/*.test.ts` within each package

### TDD Discipline

All development follows strict RED -> GREEN -> REFACTOR:

1. **RED**: Write a failing test specifying the behavior. Commit: `test(scope): RED -- description`
2. **GREEN**: Write minimum code to pass. Commit: `feat(scope): GREEN -- description`
3. **REFACTOR**: Improve without changing behavior. Commit: `refactor(scope): REFACTOR -- description`

### Test Patterns

```typescript
import { describe, it, expect, beforeAll } from 'vitest'

// Dynamic import pattern for modules that need happy-dom
let MyComponent: typeof import('../my-component.js').MyComponent
beforeAll(async () => {
  const mod = await import('../my-component.js')
  MyComponent = mod.MyComponent
})

// Web Component testing
function createElement (): HTMLElement {
  const el = document.createElement('my-component')
  document.body.appendChild(el)
  return el
}
```

### Running Tests

```bash
pnpm test              # All workspaces
pnpm test -- --run     # Without watch mode
pnpm test --filter=@valencets/db  # Single package
```

### Current Test Count

315 tests across the monorepo, all passing.

---

## Commit Convention

Conventional format with semantic micro-commits:

```
feat(scope): description        # New feature
fix(scope): description         # Bug fix
refactor(scope): description    # Code improvement, no behavior change
test(scope): description        # Adding/modifying tests
docs(scope): description        # Documentation
chore(scope): description       # Dependencies, config, tooling
```

**Scopes**: `core`, `db`, `telemetry`, `ui`, `cms`, `router`, `docs`

**TDD tags**: RED, GREEN, REFACTOR must appear in the commit message for TDD commits.

**Pre-commit hook**: `pnpm lint` runs automatically. Lint must pass before commit.

---

## Build System

```bash
pnpm install           # Install all workspace dependencies
pnpm build             # Build all packages (tsc in each)
pnpm lint              # Neostandard lint check
pnpm validate          # Typecheck + lint
```

**Build order** matters -- packages with cross-workspace dependencies must build after their dependencies. `pnpm -r run build` handles this via topological sort.

**Output**: Each package emits to `dist/` with `.js`, `.d.ts`, `.d.ts.map`, `.js.map`. Never edit `dist/` directly.

---

## Key Architectural Decisions

1. **No framework runtime on public pages.** Public-facing UI is vanilla Web Components + HTML-over-the-wire. No React, Angular, or Vue in client bundles.

2. **Server routes return HTML, not JSON.** The router fetches HTML fragments and swaps them into the DOM. JSON APIs exist only for telemetry ingestion and summary queries.

3. **Fragment protocol**: Client sends `X-Inertia-Fragment: 1` header. Server responds with just the `<main>` content (no shell). Without the header, server sends the full HTML shell.

4. **Web Component lifecycle preservation**: `Element.moveBefore()` preserves component state across router swaps. Components implement `connectedMoveCallback()` as a no-op to signal they support this.

5. **Immutable database**: Application user has INSERT + SELECT only. No UPDATE, no DELETE. Corrections are compensating events, never mutations.

6. **Vendored neverthrow**: The `@valencets/neverthrow` package is a vendored copy of neverthrow v8.2.0. It is internal to the workspace and not published to npm.

---

## File Boundaries

- **Safe to edit**: `packages/`, `docs/`
- **Never touch**: `node_modules/`, `.husky/` (edit via config only), any `dist/` output
- **Read for context**: `docs/ARCHITECTURE.md`, package-level `CLAUDE.md` files
