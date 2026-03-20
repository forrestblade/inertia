export interface RateLimitConfig {
  readonly maxRequests: number
  readonly windowMs: number
}

export interface RateLimitResult {
  readonly allowed: boolean
  readonly remaining: number
  readonly resetMs: number
  readonly limit: number
}

export interface TokenBucket {
  consume(key: string): RateLimitResult
  reset(key: string): void
  destroy(): void
}

interface BucketEntry {
  tokens: number
  lastRefill: number
  windowStart: number
}

const CLEANUP_INTERVAL_MS = 300_000

export function createTokenBucket (config: RateLimitConfig): TokenBucket {
  const { maxRequests, windowMs } = config
  const buckets = new Map<string, BucketEntry>()
  const refillRate = maxRequests / windowMs

  const cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of buckets) {
      const elapsed = now - entry.lastRefill
      if (elapsed >= windowMs) {
        buckets.delete(key)
      }
    }
  }, CLEANUP_INTERVAL_MS)

  function refill (entry: BucketEntry, now: number): void {
    const elapsed = now - entry.lastRefill
    if (elapsed > 0) {
      const tokensToAdd = elapsed * refillRate
      entry.tokens = Math.min(maxRequests, entry.tokens + tokensToAdd)
      entry.lastRefill = now
    }
  }

  function consume (key: string): RateLimitResult {
    const now = Date.now()
    let entry = buckets.get(key)
    if (entry === undefined) {
      entry = { tokens: maxRequests, lastRefill: now, windowStart: now }
      buckets.set(key, entry)
    } else {
      refill(entry, now)
    }

    const elapsed = now - entry.windowStart
    const resetMs = elapsed >= windowMs
      ? windowMs
      : windowMs - elapsed

    if (entry.tokens < 1) {
      return { allowed: false, remaining: 0, resetMs, limit: maxRequests }
    }

    entry.tokens -= 1
    return {
      allowed: true,
      remaining: Math.floor(entry.tokens),
      resetMs,
      limit: maxRequests
    }
  }

  function reset (key: string): void {
    buckets.delete(key)
  }

  function destroy (): void {
    clearInterval(cleanupTimer)
    buckets.clear()
  }

  return { consume, reset, destroy }
}
