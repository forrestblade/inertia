import { getFleetSites, getFleetComparison } from '@inertia/db'
import type { RouteHandler } from '../../../server/types.js'
import { sendJson } from '../../../server/router.js'

export const fleetSitesHandler: RouteHandler = async (_req, res, ctx) => {
  const result = await getFleetSites(ctx.pool)
  if (result.isOk()) {
    sendJson(res, result.value)
    return
  }
  sendJson(res, [], 500)
}

export const fleetComparisonHandler: RouteHandler = async (req, res, ctx) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
  const businessType = url.searchParams.get('type') ?? ''
  const result = await getFleetComparison(ctx.pool, businessType)
  if (result.isOk()) {
    sendJson(res, result.value)
    return
  }
  sendJson(res, [], 500)
}
