import { getFleetSites, getFleetComparison, getFleetAggregates, getFleetAlerts } from '@inertia/db'
import type { RouteHandler } from '../../../server/types.js'
import { sendJson } from '../../../server/router.js'
import { parsePeriodRange } from './period-utils.js'

const EMPTY_AGGREGATES = { total_sites: 0, total_sessions: 0, total_conversions: 0 }

export const fleetSitesHandler: RouteHandler = async (req, res, ctx) => {
  const { start, end } = parsePeriodRange(req)
  const result = await getFleetSites(ctx.pool, start, end)
  if (result.isOk()) {
    sendJson(res, result.value)
    return
  }
  sendJson(res, [], 500)
}

export const fleetAggregatesHandler: RouteHandler = async (req, res, ctx) => {
  const { start, end } = parsePeriodRange(req)
  const result = await getFleetAggregates(ctx.pool, start, end)
  if (result.isOk()) {
    sendJson(res, result.value)
    return
  }
  sendJson(res, EMPTY_AGGREGATES, 500)
}

export const fleetAlertsHandler: RouteHandler = async (_req, res, ctx) => {
  const result = await getFleetAlerts(ctx.pool)
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
