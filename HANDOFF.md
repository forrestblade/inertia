# Studio Site v1.1 — Session Handoff

## Goal

Complete remaining Linear issues for the Valence Studio Site v1.1 project (team: INE). All work follows strict TDD (RED/GREEN/REFACTOR micro-commits), conventional commit format, and the Four Pillars (no try/catch, no switch, no enum, no dynamic alloc at runtime).

## Current Progress

### Completed (this session + prior)

| Issue | Priority | Summary |
|-------|----------|---------|
| INE-5 | Urgent | Fleet dashboard: aggregation cron now calls `generateDailySummary` |
| INE-6 | Urgent | Mobile nav overflow: scrollable container, flex-shrink, white-space |
| INE-7 | Urgent | "hand you a Pi" → "deliver your server" in ownership copy |
| INE-8 | Urgent | Hero CTA `/contact` → `/about#contact` |
| INE-9 | Urgent | Contact subjects updated to current service tiers |
| INE-10 | Urgent | "Monthly hosting invoices" → "Overpriced shared hosting" |
| INE-11 | High | Unique meta descriptions on all 5 pages via `seo/config/page-meta.ts` |
| INE-12 | High | OG + Twitter Card meta tags in shell |
| INE-16 | High | Performance-aware CTA after audit results (< 90 = strong copy) |

### Deployed

- **Master merged and pushed** — all 8 issues above are live
- **Pi rebuilt** — `agent@192.168.1.34`, service restarted, 200 OK confirmed
- **Live site**: https://valencets.com (200 OK, OG tags confirmed)
- **991 tests passing** across monorepo

### Auth

- Admin token: `dea38ffa302a2618ba88cd86ba0595e6`
- HUD: `https://valencets.com/admin/hud?token=dea38ffa302a2618ba88cd86ba0595e6`
- Fleet: `https://valencets.com/admin/fleet?token=dea38ffa302a2618ba88cd86ba0595e6`
- Pi SSH: `agent@192.168.1.34` (password: `node`)
- Secrets file: `~/.inertia-secrets`

## Remaining Issues (priority order)

### 1. INE-22 — Dual-Layer Copy (High) — THE BIG ONE

Backtick easter egg already toggles Glass Box telemetry. Extend it to also swap all page copy from plain language (default) to technical jargon.

**Implementation plan:**

#### Phase A: Copy config (TDD, ~4 commits)
- Create `features/<page>/config/<page>-copy-map.ts` for each page (home, services, about)
- Each exports a `CopyMapEntry[]` with `{ selector, default, technical }` tuples
- The issue has a complete copy map table for every page — use it verbatim
- RED: test that copy maps exist, entries are non-empty, no hardware brand names in defaults
- GREEN: create the configs

#### Phase B: Template data attributes (TDD, ~4 commits)
- Update `renderHome`, `renderServices`, `renderAbout` templates to emit `data-copy-default` and `data-copy-technical` on swappable elements
- RED: test that rendered HTML contains `data-copy-default` and `data-copy-technical` attributes
- GREEN: add attributes to template literals
- The `textContent` of each element should match `data-copy-default` on initial render

#### Phase C: Client-side swap logic (TDD, ~3 commits)
- Find the existing backtick handler in `features/client/` — it already toggles Glass Box
- Extend it: when backtick activates, `querySelectorAll('[data-copy-technical]')` and swap `textContent`
- When deactivates, revert to `data-copy-default`
- Add "ENGINEER MODE" indicator to buffer strip
- AV Rule 206: no new DOM nodes — mutate existing `textContent` in-place
- Must respect router `afterSwap` lifecycle — re-apply swap on fragment navigation if mode is active

#### Phase D: Subsumed issues
- After INE-22 ships, close INE-18 (uptime ∞ claim) and INE-20 (PostgreSQL plain language) — both are solved by the default copy being plain language
- Also update homepage copy per the issue's copy map: "∞ Uptime without us" → "24/7 Your site runs with or without us"

**Key files:**
- `sites/studio/features/client/` — backtick handler, boot.js bundle
- `sites/studio/features/glass-box/` — existing toggle pattern to follow
- `sites/studio/features/home/templates/home.ts` — template to add data attributes
- `sites/studio/features/services/templates/services.ts`
- `sites/studio/features/about/templates/about.ts`

### 2. INE-13 — Verify Favicon (Medium, ~5 min)

Shell already has `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`. Verify the file exists at `sites/studio/public/favicon.svg`. If it does, write a test and close. If not, create from mark SVG.

### 3. INE-14 — /contact 301 Redirect (Medium, ~15 min)

Verify `GET /contact` returns 301 (not 302) to `/about#contact`. Check the contact handler or register-routes.ts. If it's a 302 or client-side redirect, fix to 301. RED: test asserts 301 status code. GREEN: fix handler.

**Verify live:** `curl -I https://valencets.com/contact` — check status code.

### 4. INE-15 — GitHub Link Audit (Medium, manual)

Footer links to `https://github.com/forrestblade/inertia`. Check if repo is public. If 404, remove the link from `server/shell.ts` footer. This requires user judgment — ask the user.

### 5. INE-17 — Audit Context Sentence (Medium, ~10 min)

Add one sentence below audit description: "We measure performance, accessibility, best practices, and SEO against industry standards and show you exactly where your current site falls short."

RED: test audit form contains "industry standards". GREEN: add to `features/audit/templates/audit.ts`.

### 6. INE-21 — Contact Link Telemetry (Medium, ~10 min)

Verify phone/email links on /about have telemetry attributes. They likely already do (added in earlier sessions). Check and close, or add if missing.

### 7. INE-19 — Shorten About Appliance Section (Low, ~15 min)

Shorten "The Appliance Model" section on /about to 2-3 sentences, link to /services. Remove the hardware spec definition list (that detail belongs on /services page).

### 8. INE-18, INE-20 — Subsumed by INE-22

Close these after INE-22 ships. If INE-22 is deprioritized:
- INE-18: Replace "∞ Uptime without us" with "24/7 — Your site runs with or without us"
- INE-20: Replace "PostgreSQL" with "private database" on public pages

### 9. OG Card Image (not a Linear issue)

INE-12 added `og:image` pointing to `/img/og-card.png` but the image doesn't exist yet. Need to create a 1200x630 PNG with Valence mark centered on dark bg, "VALENCE" wordmark, "valencets.com" muted text. Save to `sites/studio/public/img/og-card.png`.

## What Worked

- **Budget test fix**: Changed from raw `totalBytes` to `withinBudget` (gzip compressed). OG tags barely register compressed. No more copy trimming battles.
- **Centralized SEO config**: `seo/config/page-meta.ts` with `PageKey` literal type — all handlers import from one source.
- **Aggregation cron fix**: The root cause of INE-5 was that `startAggregationCron` only ran intermediate aggregations, never `generateDailySummary`. Adding the call + passing `siteId`/`businessType` from server config fixed it.

## What Didn't Work / Watch Out For

- **Budget test was checking raw bytes** — caught us multiple times. Now fixed to check compressed, but be aware the `auditBudget` function returns both `totalBytes` and `compressedBytes`.
- **pnpm filter syntax**: `pnpm --filter=studio test` (filter BEFORE script name), not `pnpm test --filter=studio`.
- **dist/ path offsets**: `import.meta.dirname` resolves to `dist/server/` after tsc build, so relative paths need extra `..` segments. This was already fixed but be careful if adding new path references.
- **`BUSINESS_TYPE=other`** for studio (not `studio`) — studio isn't a client business type.
- **TDD discipline**: User will call you out if you skip RED tests. Always write failing test first, commit it, then fix.

## Workflow Rules

1. Branch per issue: `fix/` or `feat/` prefix, from `development`
2. RED commit → GREEN commit → REFACTOR commit (optional)
3. Commit format: `test(scope): RED — INE-X description` / `fix(scope): GREEN — INE-X description`
4. All commits end with `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`
5. Merge to `development`, then `development` → `master` for deploy
6. Post-commit: `mcp__jcodemunch__index_folder` + `mcp__jdocmunch__index_local` with `incremental: true`
7. Update Linear issue status: Backlog → In Progress → Done
8. Deploy: SSH to Pi, `git pull`, `pnpm install --frozen-lockfile`, `pnpm build`, `sudo systemctl restart inertia-studio`

## Suggested Session Order

Quick wins first to build momentum, then the big feature:

1. INE-21 (verify telemetry — likely already done, just close it)
2. INE-13 (verify favicon — likely already done)
3. INE-14 (301 redirect — small fix)
4. INE-17 (audit context sentence — one line of copy)
5. INE-15 (GitHub link audit — ask user)
6. INE-22 (dual-layer copy — the big one, Phases A→D)
7. INE-19 (shorten about section)
8. Close INE-18, INE-20 (subsumed by INE-22)
9. Create OG card image
10. Final merge to master + deploy to Pi
