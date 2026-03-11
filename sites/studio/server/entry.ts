import { createServer } from 'node:http'
import { join } from 'node:path'
import { createPool, closePool, loadMigrations, runMigrations } from '@inertia/db'
import type { DbPool } from '@inertia/db'
import { loadConfig } from './config.js'
import { createRouter } from './router.js'
import type { RouteContext } from './types.js'
import { applySecurityHeaders, tryServeStatic } from './middleware.js'
import { registerRoutes } from './register-routes.js'

const config = loadConfig()

let pool: DbPool | null = null

async function boot (): Promise<void> {
  // Init DB pool
  pool = createPool(config.db)

  // Run migrations
  const migrationsDir = join(import.meta.dirname ?? '.', '..', '..', '..', 'packages', 'db', 'migrations')
  const migrationsResult = await loadMigrations(migrationsDir)

  if (migrationsResult.isOk()) {
    const runResult = await runMigrations(pool, migrationsResult.value)
    runResult.match(
      (count) => {
        if (count > 0) {
          console.log(`Applied ${count} migration(s)`)
        }
      },
      (dbErr) => console.error('Migration error:', dbErr.message)
    )
  } else {
    console.error('Failed to load migrations:', migrationsResult.error.message)
  }

  // Build router
  const router = createRouter()
  const ctx: RouteContext = { pool, config }

  registerRoutes(router)

  // HTTP server
  const server = createServer(async (req, res) => {
    applySecurityHeaders(res)

    // Try static files first
    const served = await tryServeStatic(req, res)
    if (served) return

    await router.handle(req, res, ctx)
  })

  server.listen(config.port, config.host, () => {
    console.log(`Studio server listening on http://${config.host}:${config.port}`)
  })

  // Graceful shutdown
  const shutdown = async (): Promise<void> => {
    console.log('Shutting down...')
    server.close()
    if (pool) {
      await closePool(pool)
    }
    process.exit(0)
  }

  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
}

boot().catch((e) => {
  console.error('Fatal boot error:', e)
  process.exit(1)
})
