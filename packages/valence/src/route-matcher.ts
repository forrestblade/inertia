/**
 * Match a URL pathname against a route pattern with optional `:param` segments.
 * Returns a Record of extracted params on match, or null if no match.
 */
export function matchCustomRoute (pattern: string, pathname: string): Record<string, string> | null {
  const patternParts = pattern.split('/')
  const pathParts = pathname.split('/')
  if (patternParts.length !== pathParts.length) return null

  const params: Record<string, string> = {}
  for (let i = 0; i < patternParts.length; i++) {
    const pp = patternParts[i]
    const up = pathParts[i]
    if (pp !== undefined && pp.startsWith(':')) {
      params[pp.slice(1)] = up ?? ''
    } else if (pp !== up) {
      return null
    }
  }
  return params
}
