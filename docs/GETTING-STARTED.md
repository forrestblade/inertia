# Getting Started

Clone, install, run, verify — in under 10 minutes.

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | >= 22.0.0 | `node -v` |
| pnpm | 10.30.x | `pnpm -v` |
| PostgreSQL | 16+ | `psql --version` |
| Chrome | latest | Required for Lighthouse audits only |

## Install

```bash
git clone <repo-url> && cd inertia
pnpm install
```

## Database Setup

Create the database and role PostgreSQL expects:

```bash
sudo -u postgres psql <<SQL
CREATE ROLE inertia_app WITH LOGIN PASSWORD 'changeme';
CREATE DATABASE inertia_studio OWNER inertia_app;
SQL
```

Migrations run automatically on server boot — no manual step needed.

## Environment Variables

Create `sites/studio/.env` (all optional — defaults shown):

| Variable | Default | Description |
|----------|---------|-------------|
| `STUDIO_PORT` | `3000` | HTTP listen port |
| `STUDIO_HOST` | `'0.0.0.0'` | Bind address |
| `DB_HOST` | `'localhost'` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `'inertia_studio'` | Database name |
| `DB_USER` | `'inertia_app'` | Database role |
| `DB_PASSWORD` | `'changeme'` | Database password |
| `DB_MAX_CONNECTIONS` | `10` | Connection pool size |
| `ADMIN_TOKEN` | `''` | Cookie auth token for `/admin/*` routes |
| `SITE_ID` | `'studio'` | Identifies this site in fleet telemetry |
| `BUSINESS_TYPE` | `'other'` | Business category for aggregation |
| `SITE_SECRET` | `''` | HMAC key for telemetry signature verification |
| `STUDIO_ENDPOINT` | `''` | Fleet aggregation push target URL |
| `DEMO_DATA` | `''` | Set to `'1'` to seed demo summary data on boot |

Hard-coded values (not configurable): `contactEmail: 'mail@forrestblade.com'`, `idle_timeout: 20s`, `connect_timeout: 10s`.

## Run the Dev Server

```bash
pnpm dev --filter=studio
```

The boot sequence (defined in `sites/studio/server/entry.ts`):

1. Load config from env vars
2. Connect to PostgreSQL, run pending migrations
3. Start daily aggregation cron
4. Generate theme CSS → `public/css/studio.css`
5. Bundle client JS → `public/js/boot.js` + `public/js/admin.js`
6. Build critical CSS pipeline, log 14kB budget report
7. Register routes, start HTTP server

Visit `http://localhost:3000` to verify the home page loads.

## Run Tests

```bash
pnpm test              # all workspaces
pnpm test --filter=studio  # studio only
```

Tests use Vitest with happy-dom. No database or network required.

## Run Full Validation

```bash
pnpm validate
```

This runs, in order:
1. **Typecheck** — `tsc` across all packages (`pnpm build`)
2. **Lint** — Neostandard via ESLint
3. **Pattern audit** — scans for banned patterns (try/catch, switch, enum, etc.)
4. **Budget audit** — verifies 14kB critical path budget
5. **Lighthouse audit** — runs headless Chrome, fails on anything below 100

## All Root Scripts

| Script | What it does |
|--------|-------------|
| `pnpm build` | Build all packages (`tsc` across workspaces) |
| `pnpm test` | Run all tests |
| `pnpm test:ci` | Run tests with concurrency limit (CI) |
| `pnpm lint` | ESLint with Neostandard |
| `pnpm dev --filter=studio` | Dev server with file watching |
| `pnpm audit:patterns` | Banned pattern scanner |
| `pnpm audit:budget` | 14kB budget check |
| `pnpm audit:lighthouse` | Lighthouse performance audit |
| `pnpm typecheck` | Alias for `pnpm build` |
| `pnpm validate` | Full pipeline: typecheck + lint + patterns + budget + lighthouse |

## Next Steps

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) for the engineering philosophy and system design
- Read [DEVELOPER-GUIDE.md](./DEVELOPER-GUIDE.md) for day-to-day development patterns
- Read [API-REFERENCE.md](./API-REFERENCE.md) for the complete route and endpoint list
