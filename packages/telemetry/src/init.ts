import { ok, err } from 'neverthrow'
import type { Result } from 'neverthrow'
import {
  TelemetryRingBuffer,
  initEventDelegation,
  scheduleAutoFlush
} from '@valencets/core'
import type { TelemetryError } from '@valencets/core'

export interface TelemetryConfig {
  readonly endpoint: string
  readonly siteId: string
  readonly bufferSize?: number | undefined
  readonly flushIntervalMs?: number | undefined
  readonly rootElement?: HTMLElement | undefined
}

export interface TelemetryHandle {
  readonly destroy: () => void
  readonly flushNow: () => Result<number, TelemetryError>
}

const DEFAULT_BUFFER_SIZE = 256
const DEFAULT_FLUSH_INTERVAL_MS = 10_000

export function initTelemetry (config: TelemetryConfig): Result<TelemetryHandle, TelemetryError> {
  const bufferSize = config.bufferSize ?? DEFAULT_BUFFER_SIZE
  const flushIntervalMs = config.flushIntervalMs ?? DEFAULT_FLUSH_INTERVAL_MS

  const bufferResult = TelemetryRingBuffer.create(bufferSize)
  if (bufferResult.isErr()) {
    return err(bufferResult.error)
  }
  const buffer = bufferResult.value

  const delegationResult = initEventDelegation(buffer, config.rootElement)
  if (delegationResult.isErr()) {
    return err(delegationResult.error)
  }
  const delegation = delegationResult.value

  const flush = scheduleAutoFlush(buffer, config.endpoint, flushIntervalMs)

  return ok({
    destroy: () => {
      flush.stop()
      delegation.destroy()
    },
    flushNow: () => flush.flushNow()
  })
}
