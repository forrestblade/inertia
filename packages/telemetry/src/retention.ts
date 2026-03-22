// Telemetry data retention — delete raw events and sessions older than a configurable period

import { ResultAsync } from 'neverthrow'
import { mapPostgresError } from '@valencets/db'
import type { DbError, DbPool } from '@valencets/db'

const DEFAULT_RETENTION_DAYS = 90

export interface RetentionConfig {
  /** Number of days to retain raw telemetry data. Defaults to 90. */
  readonly retentionDays?: number
}

export interface RetentionResult {
  readonly eventsDeleted: number
  readonly sessionsDeleted: number
}

/**
 * Compute the cutoff date by subtracting retentionDays from the current time.
 * Exported for testing.
 */
export function computeCutoffDate (retentionDays: number, now: Date): Date {
  const cutoff = new Date(now.getTime())
  cutoff.setUTCDate(cutoff.getUTCDate() - retentionDays)
  return cutoff
}

/**
 * Delete raw events older than the retention period.
 * Returns the number of deleted rows.
 */
export function deleteExpiredEvents (
  pool: DbPool,
  cutoff: Date
): ResultAsync<number, DbError> {
  return ResultAsync.fromPromise(
    pool.sql`
      DELETE FROM events
      WHERE created_at < ${cutoff}
    `.then((result) => result.count),
    mapPostgresError
  )
}

/**
 * Delete sessions older than the retention period that have no remaining events.
 * Events are deleted first, so this cleans up the now-orphaned session rows.
 * Returns the number of deleted rows.
 */
export function deleteExpiredSessions (
  pool: DbPool,
  cutoff: Date
): ResultAsync<number, DbError> {
  return ResultAsync.fromPromise(
    pool.sql`
      DELETE FROM sessions
      WHERE created_at < ${cutoff}
        AND NOT EXISTS (
          SELECT 1 FROM events WHERE events.session_id = sessions.session_id
        )
    `.then((result) => result.count),
    mapPostgresError
  )
}

/**
 * Run the full retention cleanup: delete expired events, then expired sessions.
 * Returns the total counts of deleted rows.
 */
export function cleanupExpiredTelemetry (
  pool: DbPool,
  config: RetentionConfig = {}
): ResultAsync<RetentionResult, DbError> {
  const retentionDays = config.retentionDays ?? DEFAULT_RETENTION_DAYS
  const cutoff = computeCutoffDate(retentionDays, new Date())

  return deleteExpiredEvents(pool, cutoff)
    .andThen((eventsDeleted) =>
      deleteExpiredSessions(pool, cutoff)
        .map((sessionsDeleted) => ({ eventsDeleted, sessionsDeleted }))
    )
}
