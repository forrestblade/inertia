# Inertia

Deterministic web framework applying JSF aerospace coding standards to TypeScript, Web Components, and PostgreSQL. Proprietary engine for a solo web studio targeting local service businesses.

## The Four Pillars

| Rule | Principle | In Practice |
|------|-----------|-------------|
| **AV Rule 206** | No dynamic memory allocation after init | Pre-allocated circular buffers, monomorphic interfaces, in-place mutation only |
| **AV Rule 208** | No exceptions | Zero `try/catch/throw` in business logic. `Result<Ok, Err>` monads everywhere |
| **AV Rule 3** | Cyclomatic complexity < 20 per function | Early returns, static dictionary maps, micro-componentization |
| **14kB Protocol** | Critical shell fits first 10 TCP packets | Inline CSS + initial DOM under ~14kB compressed |

## Tech Stack

- **Language**: TypeScript (strict mode, zero `any`)
- **UI**: Native Web Components (Custom Elements) -- no React, Angular, or Vue
- **Styling**: PostCSS + Tailwind CSS (design token driven)
- **Routing**: HTML-over-the-wire, `history.pushState()`, DOMParser fragment swaps
- **Server**: Node.js or Bun
- **Database**: PostgreSQL (client-owned, immutable ledger)
- **Validation**: Zod (`.safeParse()` only)
- **Error handling**: neverthrow (`Result` monads)
- **Package manager**: pnpm workspaces

## Packages

```
packages/
  core/          Telemetry engine (ring buffer, event delegation) + HTML-over-the-wire router
  ingestion/     Server-side monadic pipeline (safeJsonParse, Zod validation, Black Hole strategy)
  db/            PostgreSQL schema, migrations, RBAC immutability enforcement
  components/    Web Component primitives with moveBefore() lifecycle preservation
  tokens/        Design token engine driving PostCSS/Tailwind
  hud/           Self-hosted analytics dashboard (pure SVG/CSS, no charting libraries)

sites/
  studio/        Studio website -- first production deployment

tools/
  critical-css/  Server-side CSS extraction for 14kB compliance
  build/         Build tooling
```

## Getting Started

Prerequisites: Node.js >= 22, pnpm 10.x

```bash
git clone https://github.com/forrestblade/inertia.git
cd inertia
pnpm install
```

### Commands

```bash
pnpm build              # Build all packages
pnpm test               # Run tests across all workspaces
pnpm lint               # Neostandard lint check
pnpm dev --filter=studio # Dev server for studio site
```

## Architecture

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for full architectural details covering:

- Telemetry engine (circular buffer, object pool, flush mechanics)
- Ingestion node (monadic pipeline, Black Hole strategy)
- Router (anticipatory prefetch, fragment swap, Web Component lifecycle preservation)
- Database schema (sessions/events tables, JSONB optimization, 1/80th rule)
- Offline conversion tracking (DNI, promo codes, proxy actions)

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for development workflow, code rules, and commit conventions.

## License

Proprietary. All rights reserved.
