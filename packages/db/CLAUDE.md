# packages/db

Framework-level database toolkit. Provides connection pooling, error mapping, and a migration runner. Does NOT contain application schemas, queries, or migrations -- those belong in consuming packages (e.g., telemetry) or apps (e.g., studio).

## Module Map

```
src/
├── types.ts              # DbErrorCode (const object + type), DbError, DbConfig
├── connection.ts         # validateDbConfig, createPool, closePool, mapPostgresError, DbPool
├── migration-runner.ts   # loadMigrations, runMigrations, getMigrationStatus, parseMigrationFilename, sortMigrations, validateMigrations, MigrationFile
├── index.ts              # Barrel exports
└── __tests__/
    ├── types.test.ts          # 10 tests
    ├── connection.test.ts     # 13 tests
    └── migration-runner.test.ts # 15 tests
```

38 total tests.

## Driver

`postgres` (porsager/postgres). Native ESM, tagged template SQL (parameterized by default), zero deps, TypeScript-first. Import as `import postgres from 'postgres'` -- default import (third-party API, not our export convention).

## No Cross-Package Imports

DB defines its own types (`DbConfig`, `DbPool`, `DbError`). Wiring happens at the app layer. Never import from `@valencets/core` or `@valencets/ingestion`.

## Dependencies

- `@valencets/neverthrow` (workspace:*) -- Result monads
- `postgres` (^3.4.8) -- PostgreSQL driver
- `zod` (^4.3.6) -- Config validation via `.safeParse()` only

## TDD Protocol

Write tests BEFORE implementation. Every feature follows red-green-refactor:

1. Write a failing test that specifies the behavior
2. Write the minimum code to make it pass
3. Refactor while keeping tests green

## Development Order

Build schema-first: types -> connection -> migration runner -> barrel exports. Each module is test-driven and merged only when all tests pass.
