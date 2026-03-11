import { execSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import postgres from 'postgres'
import type { Sql } from 'postgres'
import { createPool, closePool } from '../../connection.js'
import { loadMigrations, runMigrations } from '../../migration-runner.js'
import type { DbPool } from '../../connection.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MIGRATIONS_DIR = join(__dirname, '..', '..', '..', 'migrations')
const TEST_DB = 'inertia_test'

let superuserSql: Sql
let appPool: DbPool
let superuserPool: DbPool

function isPostgresRunning (): boolean {
  const result = execSync('pg_isready 2>&1 || true', { encoding: 'utf-8' })
  return result.includes('accepting connections')
}

export function getAppPool (): DbPool {
  return appPool
}

export function getSuperuserPool (): DbPool {
  return superuserPool
}

export async function setupTestDatabase (): Promise<void> {
  if (!isPostgresRunning()) {
    throw new Error('PostgreSQL is not running. Start it before running integration tests.')
  }

  superuserSql = postgres({
    database: 'postgres',
    max: 2
  })

  const existing = await superuserSql`
    SELECT 1 FROM pg_database WHERE datname = ${TEST_DB}
  `
  if (existing.length > 0) {
    // Terminate existing connections before dropping
    await superuserSql`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = ${TEST_DB} AND pid <> pg_backend_pid()
    `
    await superuserSql.unsafe(`DROP DATABASE ${TEST_DB}`)
  }

  await superuserSql.unsafe(`CREATE DATABASE ${TEST_DB}`)
  await superuserSql.end()

  superuserPool = createPool({
    host: 'localhost',
    port: 5432,
    database: TEST_DB,
    username: '',
    password: '',
    max: 5,
    idle_timeout: 10,
    connect_timeout: 5
  })

  const migrationsResult = await loadMigrations(MIGRATIONS_DIR)
  if (migrationsResult.isErr()) {
    throw new Error(`Failed to load migrations: ${migrationsResult.error.message}`)
  }

  const runResult = await runMigrations(superuserPool, migrationsResult.value)
  if (runResult.isErr()) {
    throw new Error(`Failed to run migrations: ${runResult.error.message}`)
  }

  appPool = createPool({
    host: 'localhost',
    port: 5432,
    database: TEST_DB,
    username: 'inertia_app',
    password: 'changeme',
    max: 5,
    idle_timeout: 10,
    connect_timeout: 5
  })
}

export async function teardownTestDatabase (): Promise<void> {
  await closePool(appPool)
  await closePool(superuserPool)

  const adminSql = postgres({
    database: 'postgres',
    max: 2
  })

  await adminSql`
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE datname = ${TEST_DB} AND pid <> pg_backend_pid()
  `
  await adminSql.unsafe(`DROP DATABASE IF EXISTS ${TEST_DB}`)
  await adminSql.end()
}
