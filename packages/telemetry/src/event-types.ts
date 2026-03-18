// Raw event query types — migrated from stale @valencets/db dist artifacts (VAL-77)

export interface SessionRow {
  readonly session_id: string
  readonly referrer: string | null
  readonly device_type: string
  readonly operating_system: string | null
  readonly created_at: Date
}

export interface EventRow {
  readonly event_id: number
  readonly session_id: string
  readonly event_category: string
  readonly dom_target: string | null
  readonly payload: Record<string, string | number | boolean>
  readonly created_at: Date
}

export interface InsertableSession {
  readonly referrer: string | null
  readonly device_type: string
  readonly operating_system: string | null
}

export interface InsertableEvent {
  readonly session_id: string
  readonly event_category: string
  readonly dom_target: string | null
  readonly payload: Record<string, string | number | boolean>
}
