import { auditBudget, BUDGET_BYTES } from '@inertia/critical-css'
import { createCriticalCSSPipeline } from '../features/budget/critical-css-pipeline.js'
import { renderShell } from '../server/shell.js'

const ROUTES = ['/', '/how-it-works', '/pricing', '/about', '/contact']

const pipeline = createCriticalCSSPipeline()

console.log('\n14kB Budget Audit')
console.log('─'.repeat(60))
console.log(`${'Route'.padEnd(20)} ${'Compressed'.padStart(12)} ${'Budget'.padStart(10)} ${'%'.padStart(6)}   Status`)
console.log('─'.repeat(60))

let allWithinBudget = true

for (const route of ROUTES) {
  const css = pipeline.getCriticalCSS(route)
  if (!css) {
    console.log(`${route.padEnd(20)} ${'—'.padStart(12)} ${'—'.padStart(10)} ${'—'.padStart(6)}   ${'MISSING'}`)
    allWithinBudget = false
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
    const effective = r.compressedBytes + r.headerEstimate
    const pct = Math.round(r.utilizationPercent)
    const status = r.withinBudget ? 'OK' : 'OVER'
    if (!r.withinBudget) allWithinBudget = false
    console.log(
      `${route.padEnd(20)} ${String(effective).padStart(10)}B ${String(BUDGET_BYTES).padStart(8)}B ${String(pct).padStart(5)}%   ${status}`
    )
  }
}

console.log('─'.repeat(60))

if (allWithinBudget) {
  console.log('All routes within budget.\n')
} else {
  console.error('WARNING: Some routes exceed the 14kB budget!\n')
  process.exit(1)
}
