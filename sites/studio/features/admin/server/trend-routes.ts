import { getDailyTrend } from '@inertia/db'
import type { RouteHandler } from '../../../server/types.js'
import { sendJson } from '../../../server/router.js'
import { parsePeriodRange } from './period-utils.js'

interface TrendDay {
  readonly date: string
  readonly session_count: number | null
  readonly pageview_count: number | null
  readonly conversion_count: number | null
}

function formatDate (d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function fillGaps (start: Date, end: Date, rows: ReadonlyArray<TrendDay>): ReadonlyArray<TrendDay> {
  const dataMap = new Map<string, TrendDay>()
  for (const row of rows) {
    dataMap.set(row.date, row)
  }

  const startMs = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
  const endMs = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime()
  const dayMs = 86_400_000
  const totalDays = Math.floor((endMs - startMs) / dayMs) + 1

  const filled: TrendDay[] = []
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startMs + i * dayMs)
    const key = formatDate(d)
    const existing = dataMap.get(key)
    if (existing !== undefined) {
      filled.push(existing)
    } else {
      filled.push({ date: key, session_count: 0, pageview_count: 0, conversion_count: 0 })
    }
  }

  return filled
}

export const trendHandler: RouteHandler = async (req, res, ctx) => {
  const { start, end } = parsePeriodRange(req)
  const result = await getDailyTrend(ctx.pool, ctx.config.siteId, start, end)
  if (result.isOk()) {
    const rows: TrendDay[] = result.value.map(row => ({
      date: row.date instanceof Date ? formatDate(row.date) : String(row.date ?? ''),
      session_count: row.session_count,
      pageview_count: row.pageview_count,
      conversion_count: row.conversion_count
    }))
    const days = fillGaps(start, end, rows)
    sendJson(res, { days })
    return
  }
  sendJson(res, { days: [] }, 500)
}
