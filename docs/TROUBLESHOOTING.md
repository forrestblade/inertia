# Troubleshooting

Common issues and fixes. This document grows over time.

## `import.meta.dirname` in compiled code

**Symptom**: Server crashes on boot with a path resolution error, or static assets return 404.

**Cause**: When TypeScript compiles to `dist/server/`, `import.meta.dirname` points to the compiled location, not the source root. File paths resolved relative to it break.

**Fix**: The server uses a package.json walk-up pattern — it walks up from `import.meta.dirname` until it finds a `package.json`, then resolves paths from that root. This works in both dev (`tsx --watch`) and production (`node dist/server/entry.js`).

If you see path-related errors, check that `package.json` exists at the expected level and that the walk-up in `entry.ts` hasn't been broken.

## CSS contrast / Lighthouse failures

**Symptom**: Lighthouse accessibility score drops below 100, citing insufficient color contrast.

**Cause**: A color token pair (e.g., `primary` text on `background`) doesn't meet WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text).

**Fix**:
1. Identify which token pair failed from the Lighthouse report
2. Check the color values in your site's theme config
3. Use the `primary-text` and `accent-text` tokens — these are specifically designed for WCAG-accessible text on primary/accent backgrounds
4. Run `pnpm audit:lighthouse` to verify the fix

## Pre-commit hook failures

**Symptom**: `git commit` is rejected with a banned pattern violation.

**Cause**: The Husky pre-commit hook runs `pnpm audit:patterns`, which scans for violations of the Four Pillars.

**Fix**:
1. Read the error message — it tells you which rule was violated, in which file, at which line
2. Fix the violation using the alternative listed in the [banned patterns table](./DEVELOPER-GUIDE.md#banned-patterns)
3. If the usage is legitimate (e.g., a file that genuinely needs `.parse()`), add an allowlist entry in `tools/audit/banned-patterns.ts`

### Common violations

| You wrote | Fix |
|-----------|-----|
| `try { ... } catch { ... }` | Use `Result` monads from `@valencets/neverthrow` |
| `switch (x) { case ... }` | Use a static dictionary map: `const handlers = { a: () => ..., b: () => ... }` |
| `throw new Error(...)` | Return `err({ code: '...', message: '...' })` |
| `.parse(input)` | `.safeParse(input)` — check `.success` on the result |
| `export default function` | `export function myFunction` (named export) |

## Database connection issues

**Symptom**: Server crashes on boot with a PostgreSQL connection error.

**Checks**:
1. Is PostgreSQL running? `systemctl status postgresql`
2. Do the env vars match? Check `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` against your PostgreSQL setup
3. Does the database exist? `psql -U inertia_app -d inertia_studio -c 'SELECT 1'`
4. Connection pool exhaustion? Default `DB_MAX_CONNECTIONS` is 10. Check if another process is holding connections: `SELECT count(*) FROM pg_stat_activity WHERE datname = 'inertia_studio'`
5. Timeouts? Hard-coded `connect_timeout: 10s`, `idle_timeout: 20s`. If the DB is slow to respond, check PostgreSQL logs.

## Static asset 404s

**Symptom**: CSS or JS files return 404, page renders without styles.

**Checks**:
1. Did the server boot successfully? Check logs for the budget report — if it printed, CSS/JS generation completed
2. Are files in `sites/studio/public/css/` and `sites/studio/public/js/`?
3. The server resolves `STATIC_ROOT` via the package.json walk-up pattern. If the walk-up fails, static file serving breaks. See the `import.meta.dirname` section above.
4. Check the MIME map — the server uses a static dictionary map for content types. If you added a new file type, ensure it has an entry.

## Build order issues

**Symptom**: TypeScript errors referencing types from another package, or missing module errors at runtime.

**Cause**: Packages have a dependency graph. If package A depends on package B, B must build first.

**Fix**: `pnpm build` runs `pnpm -r run build`, which respects workspace dependency order. If you're building a single package, ensure its dependencies are built first:

```bash
# Build a specific package and its dependencies
pnpm build --filter=@valencets/tokens
```

The dependency graph (simplified):
```
neverthrow ← db, ingestion, core
tokens (standalone)
components (standalone)
core ← (depends on neverthrow)
ingestion ← (depends on neverthrow)
db ← (depends on neverthrow)
hud ← (depends on tokens)
studio ← (depends on all packages)
```

## Migration failures

**Symptom**: Server boot fails during "running migrations" step.

**Checks**:
1. Is the SQL valid? Run the migration manually: `psql -U inertia_app -d inertia_studio -f packages/db/migrations/NNN-your-migration.sql`
2. Is it idempotent? Use `IF NOT EXISTS` / `IF EXISTS` guards
3. The migration runner returns `Result` — check server logs for the error code and message

## Lighthouse audit hangs

**Symptom**: `pnpm audit:lighthouse` runs indefinitely.

**Checks**:
1. Is Chrome installed? The audit needs headless Chrome
2. Is the dev server running? Lighthouse audits hit `localhost:3000` — start the server first
3. Check for port conflicts — another process might be on port 3000
