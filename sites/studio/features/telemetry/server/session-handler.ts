import { createSession } from '@inertia/db'
import type { RouteHandler } from '../../../server/types.js'
import { sendJson } from '../../../server/router.js'

export const sessionHandler: RouteHandler = async (_req, res, ctx) => {
  // Detect device type from User-Agent
  const ua = _req.headers['user-agent'] ?? ''
  const deviceType = detectDeviceType(ua)

  const result = await createSession(ctx.pool, {
    referrer: _req.headers.referer ?? null,
    device_type: deviceType,
    operating_system: detectOS(ua)
  })

  result.match(
    (session) => {
      // Set session cookie (HttpOnly, SameSite=Lax, 24h expiry)
      res.setHeader('Set-Cookie', `session_id=${session.session_id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`)
      sendJson(res, { session_id: session.session_id })
    },
    (dbError) => {
      console.error('Session creation failed:', dbError.message)
      // Black hole: return 200 anyway
      sendJson(res, { ok: true })
    }
  )
}

const MOBILE_PATTERN = /mobile|android|iphone|ipad|ipod/i
const TABLET_PATTERN = /tablet|ipad/i

function detectDeviceType (ua: string): string {
  if (TABLET_PATTERN.test(ua)) return 'tablet'
  if (MOBILE_PATTERN.test(ua)) return 'mobile'
  return 'desktop'
}

const OS_PATTERNS: ReadonlyArray<{ readonly pattern: RegExp; readonly name: string }> = [
  { pattern: /windows/i, name: 'Windows' },
  { pattern: /macintosh|mac os/i, name: 'macOS' },
  { pattern: /linux/i, name: 'Linux' },
  { pattern: /android/i, name: 'Android' },
  { pattern: /iphone|ipad|ipod/i, name: 'iOS' }
]

function detectOS (ua: string): string | null {
  for (const entry of OS_PATTERNS) {
    if (entry.pattern.test(ua)) {
      return entry.name
    }
  }
  return null
}
