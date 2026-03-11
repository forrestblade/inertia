import { describe, it, expect } from 'vitest'
import { renderShell, renderFragment } from '../shell.js'

const defaultOptions = {
  title: 'Test',
  description: 'Test description',
  criticalCSS: 'body{margin:0}',
  deferredCSSPath: '/css/studio.css',
  mainContent: '<h1>Hello</h1>',
  currentPath: '/'
}

describe('renderShell', () => {
  it('returns a complete HTML document', () => {
    const html = renderShell(defaultOptions)
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('</html>')
  })

  it('includes the title', () => {
    const html = renderShell(defaultOptions)
    expect(html).toContain('<title>Test | Inertia Web Solutions</title>')
  })

  it('includes critical CSS inline', () => {
    const html = renderShell(defaultOptions)
    expect(html).toContain('<style>body{margin:0}</style>')
  })

  it('includes deferred CSS with print media trick', () => {
    const html = renderShell(defaultOptions)
    expect(html).toContain('media="print"')
    expect(html).toContain("onload=\"this.media='all'\"")
  })

  it('includes main content', () => {
    const html = renderShell(defaultOptions)
    expect(html).toContain('<main id="main-content">')
    expect(html).toContain('<h1>Hello</h1>')
  })

  it('includes navigation with 6 links', () => {
    const html = renderShell(defaultOptions)
    expect(html).toContain('aria-label="Main navigation"')
    const navLinks = html.match(/data-telemetry-type="INTENT_NAVIGATE"/g)
    expect(navLinks).toHaveLength(6)
  })

  it('marks current page as active', () => {
    const html = renderShell(defaultOptions)
    expect(html).toContain('aria-current="page"')
  })

  it('includes footer with hardware message', () => {
    const html = renderShell(defaultOptions)
    expect(html).toContain('Raspberry Pi 5')
  })

  it('includes deferred boot script', () => {
    const html = renderShell(defaultOptions)
    expect(html).toContain('src="/js/boot.js"')
  })

  it('uses dark class on html element', () => {
    const html = renderShell(defaultOptions)
    expect(html).toContain('class="dark"')
  })

  it('includes meta description', () => {
    const html = renderShell(defaultOptions)
    expect(html).toContain('content="Test description"')
  })
})

describe('renderFragment', () => {
  it('returns just the main content', () => {
    const fragment = renderFragment('<h1>Hello</h1>')
    expect(fragment).toBe('<h1>Hello</h1>')
    expect(fragment).not.toContain('<!DOCTYPE')
  })
})
