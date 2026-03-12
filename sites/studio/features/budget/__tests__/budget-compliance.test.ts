import { describe, it, expect } from 'vitest'
import { extractCriticalCSS, auditBudget } from '@inertia/critical-css'
import { renderShell } from '../../../server/shell.js'
import { renderHome } from '../../home/templates/home.js'
import { renderPrinciples } from '../../principles/templates/principles.js'
import { renderServices } from '../../services/templates/services.js'
import { renderAbout } from '../../about/templates/about.js'
import { getStudioCSS } from '../../theme/config/studio-css.js'
import { createCriticalCSSPipeline } from '../critical-css-pipeline.js'

function makeShell (content: string, path: string): string {
  return renderShell({
    title: 'Test',
    description: '',
    criticalCSS: '',
    deferredCSSPath: '/css/studio.css',
    mainContent: content,
    currentPath: path
  })
}

const pages: Record<string, () => string> = {
  '/': renderHome,
  '/how-it-works': renderPrinciples,
  '/pricing': renderServices,
  '/about': renderAbout,
  '/contact': () => '<p>Redirecting to <a href="/about#contact">/about#contact</a>...</p>'
}

describe('14kB budget compliance', () => {
  const fullCSS = getStudioCSS()

  for (const [path, render] of Object.entries(pages)) {
    it(`${path} critical shell fits in 14,600 bytes compressed`, () => {
      const content = render()
      const shell = makeShell(content, path)

      const critResult = extractCriticalCSS(fullCSS, shell)
      expect(critResult.isOk()).toBe(true)

      const { critical } = critResult._unsafeUnwrap()
      const auditResult = auditBudget(shell, critical)
      expect(auditResult.isOk()).toBe(true)

      const report = auditResult._unsafeUnwrap()
      expect(report.withinBudget, `${path} exceeds 14kB compressed (${report.compressedBytes + 500} bytes effective)`).toBe(true)
    })
  }
})

describe('createCriticalCSSPipeline', () => {
  it('returns cached critical CSS for each route', () => {
    const pipeline = createCriticalCSSPipeline()
    expect(pipeline.getCriticalCSS('/')).toBeDefined()
    expect(pipeline.getDeferredCSS('/')).toBeDefined()
  })

  it('caches results across calls', () => {
    const pipeline = createCriticalCSSPipeline()
    const first = pipeline.getCriticalCSS('/')
    const second = pipeline.getCriticalCSS('/')
    expect(first).toBe(second)
  })
})
