Run integration tests against a real PostgreSQL database.

## Steps

1. Ensure PostgreSQL is running locally (`pg_isready`)
2. Run `pnpm build` to compile all packages
3. Run `pnpm test:integration` to execute integration tests
4. If tests fail, analyze the output and suggest fixes
5. Report results: pass count, fail count, and any errors

## Notes

- Integration tests use a real database (`valence_integration_test`)
- The test DB is created/migrated/torn down automatically
- Tests run sequentially in a single fork (not parallel)
- Timeout is 30s per test, 60s for setup
