# API Reference

Complete route and endpoint reference for the studio site. All routes are registered in `sites/studio/server/register-routes.ts`.

## Public Pages

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Home — manifesto, pillars, ownership thesis, proof |
| GET | `/how-it-works` | The Four Pillars — detailed engineering philosophy |
| GET | `/pricing` | Appliance model, three pricing tiers, ownership list |
| GET | `/about` | Bio, philosophy, proof, links to contact |
| GET | `/contact` | Contact form (GET renders form) |
| POST | `/contact` | Contact form submission |
| GET | `/free-site-audit` | Live Lighthouse audit tool (lead generation) |
| POST | `/free-site-audit` | Submit URL for audit |

### 301 Redirects (old routes)

| Old Path | Redirects To |
|----------|-------------|
| `/principles` | `/how-it-works` |
| `/services` | `/pricing` |
| `/audit` | `/free-site-audit` |

## Infrastructure Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Returns `'OK'` — used for uptime monitoring |
| GET | `/sitemap.xml` | Auto-generated XML sitemap |
| GET | `/robots.txt` | Robots directives |
| GET | `/404` | Custom 404 page |

## Admin Routes

Protected by cookie auth via `ADMIN_TOKEN` env var.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/hud` | Analytics dashboard (renders login form if unauthenticated) |
| POST | `/admin/hud` | Login submission |
| GET | `/admin/fleet` | Fleet dashboard — all client sites in one view |
| GET | `/admin/fleet/compare` | Side-by-side fleet comparison |

## Telemetry Endpoints

### Client telemetry (no auth — public-facing)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/telemetry` | Ingest telemetry events from the client ring buffer |
| POST | `/api/session` | Register a new session |

The telemetry endpoint accepts a JSON array of `ValidatedIntent` objects. See the ingestion pipeline section below for the payload contract.

### Fleet aggregation (HMAC-verified)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/aggregation` | Receive daily summary push from client appliances |

Requires `X-Signature` header with HMAC-SHA256 of the request body, signed with `SITE_SECRET`.

## Analytics API Endpoints

All require admin cookie auth.

### Summary data

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/summaries/sessions` | Session summary data |
| GET | `/api/summaries/events` | Event summary data |
| GET | `/api/summaries/conversions` | Conversion summary data |
| GET | `/api/summaries/trend` | Trend data over time |

### Breakdowns

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/breakdowns/pages` | Page-level breakdown |
| GET | `/api/breakdowns/sources` | Traffic source breakdown |
| GET | `/api/breakdowns/actions` | User action breakdown |

### Diagnostics

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/diagnostics/ingestion` | Ingestion health and metrics |

### Fleet APIs

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/fleet/sites` | List all registered fleet sites |
| GET | `/api/fleet/aggregates` | Aggregated fleet metrics |
| GET | `/api/fleet/alerts` | Fleet-wide alert conditions |
| GET | `/api/fleet/compare` | Comparative fleet data |

## Fragment Protocol

Partial page loads use the `X-Inertia-Fragment` header.

When a request includes `X-Inertia-Fragment: 1`, the server returns only the content fragment (no page shell, no `<html>`/`<head>`). The client router swaps this fragment into the DOM using `DOMParser`.

Flow:
1. User clicks a link
2. Client router intercepts, adds `X-Inertia-Fragment: 1` header
3. Server detects the header, returns HTML fragment only
4. Router parses fragment, swaps into target container
5. `beforeSwap` / `afterSwap` lifecycle hooks fire
6. Web Components in the new fragment run `connectedCallback`

See [ARCHITECTURE.md](./ARCHITECTURE.md) § HTML-over-the-Wire Router for full details.

## Telemetry Ingestion Pipeline

The ingestion pipeline (`packages/ingestion/`) processes telemetry using a monadic chain with no exceptions.

### Pipeline stages

```
raw JSON string
  → safeJsonParse()        Result<unknown, ParseFailure>
  → validateTelemetryPayload()  Result<ValidatedTelemetryPayload, ValidationFailure>
  → persist()              Result<number, PersistFailure>
  → PipelineResult { persisted: number }
```

### The Black Hole Strategy

The ingestion endpoint **always returns HTTP 200**, even on failure. Telemetry must never break the user's experience. Failures are logged via an audit function, not surfaced to the client.

### Intent types

The telemetry schema recognizes these intent types:

`CLICK`, `SCROLL`, `VIEWPORT_INTERSECT`, `FORM_INPUT`, `INTENT_NAVIGATE`, `INTENT_CALL`, `INTENT_BOOK`, `INTENT_LEAD`, `LEAD_PHONE`, `LEAD_EMAIL`, `LEAD_FORM`

### ValidatedIntent payload

```ts
{
  id: string
  timestamp: number
  type: IntentTypeValue       // one of the intent types above
  targetDOMNode: string
  x_coord: number             // finite number
  y_coord: number             // finite number
  schema_version: 1           // literal 1
  path?: string
  referrer?: string
}
```

### HMAC verification

Fleet aggregation requests are verified via HMAC-SHA256:

- **Signing**: `createHmac('sha256', secret).update(body).digest('hex')`
- **Verification**: constant-time comparison via `timingSafeEqual`
- **Header**: `X-Signature`

See [ARCHITECTURE.md](./ARCHITECTURE.md) § Ingestion Node for the full design rationale.
