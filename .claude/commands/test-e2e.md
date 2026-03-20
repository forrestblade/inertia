Run Playwright E2E tests against the CMS admin interface.

## Steps

1. Run `pnpm build` to compile all packages
2. Run `pnpm test:e2e` to execute Playwright tests
3. If tests fail, check `playwright-report/` for traces and screenshots
4. Report results: pass count, fail count, and any errors

## Notes

- E2E tests auto-start the dev server via `webServer` config
- Auth state is saved to `tests/e2e/.auth/user.json` and reused
- Tests run on Chromium only by default
- On CI: retries=2, workers=1, traces on first retry
- Locally: no retries, parallel workers, traces on-first-retry
