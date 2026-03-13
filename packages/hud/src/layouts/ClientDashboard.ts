import { HUD_COLORS, HUD_TYPOGRAPHY, HUD_SPACING, isMobile } from '../tokens/hud-tokens.js'
import { fetchSessionSummary, fetchEventSummary, fetchConversionSummary } from '../data/fetch-summaries.js'
import { fetchTopPages, fetchTrafficSources, fetchLeadActions } from '../data/fetch-breakdowns.js'
import { fetchTrendData } from '../data/fetch-trend.js'
import type { HudPeriod } from '../types.js'
import { formatNumber } from '../data/format-number.js'
import { formatDelta } from '../data/format-delta.js'

const LEAD_ACTION_LABELS: Record<string, string> = {
  LEAD_PHONE: 'Phone',
  LEAD_EMAIL: 'Email',
  LEAD_FORM: 'Form'
}

function toCsvRow (values: ReadonlyArray<string | number | null>): string {
  return values.map(v => {
    const s = v === null ? '' : String(v)
    return s.includes(',') ? `"${s}"` : s
  }).join(',')
}

function downloadCsv (filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function readSiteParam (): string {
  const params = new URLSearchParams(window.location.search)
  return params.get('site') ?? ''
}

export class ClientDashboard extends HTMLElement {
  private _initialized = false
  private _siteParam = ''
  private _visitorsMetric: HTMLElement | null = null
  private _leadsMetric: HTMLElement | null = null
  private _topPagesTable: HTMLElement | null = null
  private _actionsPanel: HTMLElement | null = null
  private _sourcesPanel: HTMLElement | null = null
  private _periodChangeHandler: ((e: Event) => void) | null = null
  private _headerEl: HTMLElement | null = null
  private _gridEl: HTMLElement | null = null
  private _bottomGridEl: HTMLElement | null = null
  private _resizeHandler: (() => void) | null = null
  private _currentPeriod: HudPeriod = 'TODAY'
  private _lastTrend: ReadonlyArray<{ date: string; session_count: number | null; pageview_count: number | null; conversion_count: number | null }> = []
  private _lastPages: ReadonlyArray<{ path: string; count: number }> = []
  private _lastSources: ReadonlyArray<{ category: string; count: number; percent: number }> = []
  private _lastActions: ReadonlyArray<{ action: string; count: number }> = []

  connectedCallback (): void {
    if (this._initialized) return
    this._initialized = true
    this.style.display = 'block'
    this.style.backgroundColor = HUD_COLORS.bg
    this.style.color = HUD_COLORS.textPrimary
    this.style.fontFamily = HUD_TYPOGRAPHY.fontPrimary
    this.style.padding = HUD_SPACING.lg

    // Header with title and time range
    const header = document.createElement('div')
    header.style.display = 'flex'
    header.style.justifyContent = 'space-between'
    header.style.alignItems = 'center'
    header.style.marginBottom = HUD_SPACING.lg

    const title = document.createElement('span')
    title.style.fontSize = HUD_TYPOGRAPHY.scale.lg
    title.style.fontWeight = '600'
    title.style.color = HUD_COLORS.textPrimary
    title.textContent = 'INERTIA HUD'

    const timerange = document.createElement('hud-timerange')
    timerange.setAttribute('period', 'TODAY')

    const exportBtn = document.createElement('button')
    exportBtn.textContent = 'Export CSV'
    exportBtn.style.cssText = `background:${HUD_COLORS.accent};color:${HUD_COLORS.bg};border:none;border-radius:4px;padding:${HUD_SPACING.xs} ${HUD_SPACING.sm};font-size:${HUD_TYPOGRAPHY.scale.sm};cursor:pointer;font-family:${HUD_TYPOGRAPHY.fontPrimary}`
    exportBtn.addEventListener('click', () => this._exportCsv())

    const headerRight = document.createElement('div')
    headerRight.style.display = 'flex'
    headerRight.style.alignItems = 'center'
    headerRight.style.gap = HUD_SPACING.sm

    headerRight.appendChild(exportBtn)
    headerRight.appendChild(timerange)

    header.appendChild(title)
    header.appendChild(headerRight)

    // Grid layout
    const grid = document.createElement('div')
    grid.style.display = 'grid'
    grid.style.gridTemplateColumns = '1fr 1fr 1fr'
    grid.style.gap = HUD_SPACING.md

    // Panel 1: Visitors
    const visitorsPanel = document.createElement('hud-panel')
    visitorsPanel.setAttribute('label', 'Visitors')
    const visitorsMetric = document.createElement('hud-metric')
    visitorsMetric.setAttribute('value', '--')
    visitorsMetric.setAttribute('delta', '')
    visitorsMetric.setAttribute('delta-direction', 'flat')
    visitorsPanel.appendChild(visitorsMetric)

    // Panel 2: Leads
    const leadsPanel = document.createElement('hud-panel')
    leadsPanel.setAttribute('label', 'Leads')
    const leadsMetric = document.createElement('hud-metric')
    leadsMetric.setAttribute('value', '--')
    leadsMetric.setAttribute('delta', '')
    leadsMetric.setAttribute('delta-direction', 'flat')
    leadsPanel.appendChild(leadsMetric)

    // Panel 3: Top Pages
    const topPagesPanel = document.createElement('hud-panel')
    topPagesPanel.setAttribute('label', 'Top Pages')
    const topPagesTable = document.createElement('hud-table')
    topPagesTable.setAttribute('columns', JSON.stringify([
      { label: 'Page', key: 'path', align: 'left' },
      { label: 'Views', key: 'count', align: 'right', numeric: true }
    ]))
    topPagesTable.setAttribute('rows', '[]')
    topPagesPanel.appendChild(topPagesTable)

    // Panel 4: Lead Actions (bars created dynamically from API response)
    const actionsPanel = document.createElement('hud-panel')
    actionsPanel.setAttribute('label', 'Lead Actions')
    const actionsPlaceholder = document.createElement('hud-bar')
    actionsPlaceholder.setAttribute('label', 'Loading')
    actionsPlaceholder.setAttribute('value', '--')
    actionsPlaceholder.setAttribute('percent', '0')
    actionsPanel.appendChild(actionsPlaceholder)

    // Panel 5: Traffic Sources
    const sourcesPanel = document.createElement('hud-panel')
    sourcesPanel.setAttribute('label', 'Traffic Sources')
    const sourceCategories = ['Search', 'Direct', 'Social', 'Other']
    for (const cat of sourceCategories) {
      const bar = document.createElement('hud-bar')
      bar.setAttribute('label', cat)
      bar.setAttribute('value', '--')
      bar.setAttribute('percent', '0')
      sourcesPanel.appendChild(bar)
    }

    grid.appendChild(visitorsPanel)
    grid.appendChild(leadsPanel)
    grid.appendChild(topPagesPanel)

    // Bottom row spans 2 columns
    const bottomGrid = document.createElement('div')
    bottomGrid.style.display = 'grid'
    bottomGrid.style.gridTemplateColumns = '1fr 1fr'
    bottomGrid.style.gap = HUD_SPACING.md
    bottomGrid.style.marginTop = HUD_SPACING.md

    bottomGrid.appendChild(actionsPanel)
    bottomGrid.appendChild(sourcesPanel)

    this.appendChild(header)
    this.appendChild(grid)
    this.appendChild(bottomGrid)

    // Store references for data updates and responsive layout
    this._visitorsMetric = visitorsMetric
    this._leadsMetric = leadsMetric
    this._topPagesTable = topPagesTable
    this._actionsPanel = actionsPanel
    this._sourcesPanel = sourcesPanel
    this._headerEl = header
    this._gridEl = grid
    this._bottomGridEl = bottomGrid

    // Responsive layout
    this._resizeHandler = () => this._applyResponsive()
    window.addEventListener('resize', this._resizeHandler)
    this._applyResponsive()

    // Listen for period changes
    this._periodChangeHandler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { period: string }
      this.refreshData(detail.period as HudPeriod)
    }
    this.addEventListener('hud-period-change', this._periodChangeHandler)

    // Read site param from URL for drill-down context
    this._siteParam = readSiteParam()

    // Initial data fetch
    this.refreshData('TODAY')
  }

  disconnectedCallback (): void {
    if (this._periodChangeHandler) {
      this.removeEventListener('hud-period-change', this._periodChangeHandler)
    }
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler)
    }
  }

  connectedMoveCallback (): void {
    // Intentional no-op — signals move-awareness to router
  }

  private _applyResponsive (): void {
    const mobile = isMobile()
    this.style.padding = mobile ? HUD_SPACING.md : HUD_SPACING.lg

    if (this._headerEl !== null) {
      this._headerEl.style.flexDirection = mobile ? 'column' : 'row'
      this._headerEl.style.gap = mobile ? HUD_SPACING.sm : '0'
      this._headerEl.style.alignItems = mobile ? 'flex-start' : 'center'
    }
    if (this._gridEl !== null) {
      this._gridEl.style.gridTemplateColumns = mobile ? '1fr' : '1fr 1fr 1fr'
    }
    if (this._bottomGridEl !== null) {
      this._bottomGridEl.style.gridTemplateColumns = mobile ? '1fr' : '1fr 1fr'
    }
  }

  private _exportCsv (): void {
    const lines: string[] = []

    // Trend section
    lines.push('# Daily Trend')
    lines.push(toCsvRow(['Date', 'Sessions', 'Pageviews', 'Conversions']))
    for (const d of this._lastTrend) {
      lines.push(toCsvRow([d.date, d.session_count, d.pageview_count, d.conversion_count]))
    }

    // Top pages
    lines.push('')
    lines.push('# Top Pages')
    lines.push(toCsvRow(['Page', 'Views']))
    for (const p of this._lastPages) {
      lines.push(toCsvRow([p.path, p.count]))
    }

    // Traffic sources
    lines.push('')
    lines.push('# Traffic Sources')
    lines.push(toCsvRow(['Source', 'Count', 'Percent']))
    for (const s of this._lastSources) {
      lines.push(toCsvRow([s.category, s.count, s.percent]))
    }

    // Lead actions
    lines.push('')
    lines.push('# Lead Actions')
    lines.push(toCsvRow(['Action', 'Count']))
    for (const a of this._lastActions) {
      lines.push(toCsvRow([LEAD_ACTION_LABELS[a.action] ?? a.action, a.count]))
    }

    const date = new Date().toISOString().split('T')[0]
    downloadCsv(`inertia-hud-${this._currentPeriod.toLowerCase()}-${date}.csv`, lines.join('\n'))
  }

  private refreshData (period: HudPeriod): void {
    this._currentPeriod = period
    const site = this._siteParam || undefined

    fetchSessionSummary('', period, site).match(
      (data) => {
        if (this._visitorsMetric && typeof data.total_sessions === 'number') {
          this._visitorsMetric.setAttribute('value', formatNumber(data.total_sessions))
        }
      },
      () => {} // Hold placeholders on error
    )

    fetchEventSummary('', period, site).match(
      () => {},
      () => {} // Hold placeholders on error
    )

    fetchConversionSummary('', period, site).match(
      () => {},
      () => {} // Hold placeholders on error
    )

    fetchTopPages('', period, site).match(
      (data) => {
        if (this._topPagesTable && Array.isArray(data.pages)) {
          this._lastPages = data.pages
          this._topPagesTable.setAttribute('rows', JSON.stringify(data.pages))
        }
      },
      () => {} // Hold placeholders on error
    )

    fetchTrafficSources('', period, site).match(
      (data) => {
        if (this._sourcesPanel && Array.isArray(data.sources)) {
          this._lastSources = data.sources
          this._updateBars(this._sourcesPanel, data.sources.map(s => ({
            label: s.category,
            value: String(s.count),
            percent: String(s.percent)
          })))
        }
      },
      () => {} // Hold placeholders on error
    )

    fetchLeadActions('', period, site).match(
      (data) => {
        if (this._actionsPanel && Array.isArray(data.actions)) {
          this._lastActions = data.actions
          const total = data.actions.reduce((sum, x) => sum + x.count, 0)
          this._updateBars(this._actionsPanel, data.actions.map(a => ({
            label: LEAD_ACTION_LABELS[a.action] ?? a.action,
            value: String(a.count),
            percent: String(total > 0 ? Math.round((a.count / total) * 100) : 0)
          })))
        }
      },
      () => {} // Hold placeholders on error
    )

    fetchTrendData('', period, site).match(
      (data) => {
        if (!Array.isArray(data.days)) return
        this._lastTrend = data.days

        const sessionCsv = data.days.map(d => d.session_count ?? 0).join(',')
        if (this._visitorsMetric) {
          this._visitorsMetric.setAttribute('sparkline-data', sessionCsv)
        }

        const conversionValues = data.days.map(d => d.conversion_count ?? 0)
        const conversionCsv = conversionValues.join(',')
        const conversionTotal = conversionValues.reduce((s, v) => s + v, 0)
        if (this._leadsMetric) {
          this._leadsMetric.setAttribute('value', formatNumber(conversionTotal))
          this._leadsMetric.setAttribute('sparkline-data', conversionCsv)
        }

        if (data.days.length >= 2) {
          const mid = Math.floor(data.days.length / 2)
          const currentSessions = data.days.slice(mid).reduce((s, d) => s + (d.session_count ?? 0), 0)
          const priorSessions = data.days.slice(0, mid).reduce((s, d) => s + (d.session_count ?? 0), 0)
          const sessionDelta = formatDelta(currentSessions, priorSessions)
          if (this._visitorsMetric) {
            this._visitorsMetric.setAttribute('delta', sessionDelta.value)
            this._visitorsMetric.setAttribute('delta-direction', sessionDelta.direction)
          }

          const currentLeads = data.days.slice(mid).reduce((s, d) => s + (d.conversion_count ?? 0), 0)
          const priorLeads = data.days.slice(0, mid).reduce((s, d) => s + (d.conversion_count ?? 0), 0)
          const leadDelta = formatDelta(currentLeads, priorLeads)
          if (this._leadsMetric) {
            this._leadsMetric.setAttribute('delta', leadDelta.value)
            this._leadsMetric.setAttribute('delta-direction', leadDelta.direction)
          }
        }
      },
      () => {} // Hold placeholders on error
    )
  }

  private _updateBars (panel: HTMLElement, items: ReadonlyArray<{ label: string; value: string; percent: string }>): void {
    // Clear existing bars and rebuild from data
    const existing = panel.querySelectorAll('hud-bar')
    for (const bar of existing) bar.remove()

    for (const item of items) {
      const bar = document.createElement('hud-bar')
      bar.setAttribute('label', item.label)
      bar.setAttribute('value', item.value)
      bar.setAttribute('percent', item.percent)
      panel.appendChild(bar)
    }
  }
}

customElements.define('hud-client-dashboard', ClientDashboard)
