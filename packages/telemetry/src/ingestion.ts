import { ResultAsync } from 'neverthrow'
import { mapPostgresError } from '@valencets/db'
import type { DbError, DbPool } from '@valencets/db'
import type { BeaconEvent } from './beacon-types.js'

export interface IngestResult {
  readonly eventsInserted: number
  readonly sessionId: string
}

export function ingestBeacon (
  pool: DbPool,
  events: ReadonlyArray<BeaconEvent>
): ResultAsync<IngestResult, DbError> {
  return ResultAsync.fromPromise(
    (async () => {
      const firstEvent = events[0]!

      // Create a new session from beacon metadata
      const sessionRows = await pool.sql<Array<{ session_id: string }>>`
        INSERT INTO sessions (device_type, referrer, operating_system)
        VALUES ('beacon', ${firstEvent.referrer}, ${firstEvent.business_type})
        RETURNING session_id
      `
      const sessionId = sessionRows[0]!.session_id

      // Batch-insert all events
      const values = events.map((e) => ({
        session_id: sessionId,
        event_category: e.type,
        dom_target: e.targetDOMNode,
        payload: pool.sql.json({
          path: e.path,
          x_coord: e.x_coord,
          y_coord: e.y_coord,
          site_id: e.site_id,
          schema_version: e.schema_version,
          business_type: e.business_type,
          beacon_id: e.id,
          beacon_timestamp: e.timestamp
        }),
        created_at: new Date(e.timestamp)
      }))

      await pool.sql`
        INSERT INTO events ${pool.sql(values, 'session_id', 'event_category', 'dom_target', 'payload', 'created_at')}
      `

      return { eventsInserted: events.length, sessionId }
    })(),
    mapPostgresError
  )
}
