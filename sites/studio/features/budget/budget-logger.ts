import { auditBudget } from '@inertia/critical-css'
import { renderShell } from '../../server/shell.js'
import type { CriticalCSSCache } from './critical-css-pipeline.js'

const ROUTES = ['/', '/how-it-works', '/pricing', '/about', '/contact']

export function logBudgetReport (pipeline: CriticalCSSCache): void {
  for (const route of ROUTES) {
    const css = pipeline.getCriticalCSS(route)
    if (!css) {
      console.warn(`[budget] no critical CSS for ${route}`)
      continue
    }

    const shell = renderShell({
      title: 'Budget Audit',
      description: '',
      criticalCSS: css,
      deferredCSSPath: '/css/studio.css',
      mainContent: '',
      currentPath: route
    })

    const report = auditBudget(shell, css)
    if (report.isOk()) {
      const r = report.value
      const pct = Math.round(r.utilizationPercent)
      const status = r.withinBudget ? 'OK' : 'OVER'
      console.log(`[budget] ${route}: ${r.compressedBytes + r.headerEstimate}B / ${r.budgetBytes}B (${pct}%) ${status}`)
    }
  }
}
