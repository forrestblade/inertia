export const TELEMETRY_CONFIG = {
  bufferCapacity: 1024,
  flushIntervalMs: 10000,
  highWaterMark: 64,
  endpoint: '/api/telemetry',
  sessionEndpoint: '/api/session'
} as const
