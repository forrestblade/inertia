import { describe, it, expect } from 'vitest'
import { renderShell, renderFragment, BOOT_VERSION } from '../shell.js'

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

  it('loads deferred CSS without inline event handlers (CSP-safe)', () => {
    const html = renderShell(defaultOptions)
    expect(html).toContain('/css/studio.css')
    // Must NOT use onload inline handler — blocked by script-src 'self' CSP
    expect(html).not.toContain('onload=')
    expect(html).not.toContain('media="print"')
  })

  it('appends cache-busting query param to CSS path', () => {
    const html = renderShell(defaultOptions)
    // CSS link should have ?v= param to bust browser cache on content change
    expect(html).toMatch(/\/css\/studio\.css\?v=/)
  })

  it('includes main content', () => {
    const html = renderShell(defaultOptions)
    expect(html).toContain('<main id="main-content">')
    expect(html).toContain('<h1>Hello</h1>')
  })

  it('includes navigation with 5 links plus footer github', () => {
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
    expect(html).toContain('dedicated server appliance')
    expect(html).not.toContain('Raspberry Pi')
  })

  it('includes favicon link', () => {
    const html = renderShell(defaultOptions)
    expect(html).toContain('<link rel="icon" type="image/svg+xml" href="/favicon.svg">')
  })

  it('includes mark SVG in nav brand', () => {
    const html = renderShell(defaultOptions)
    expect(html).toContain('mark-light.svg')
    expect(html).toContain('class="nav-mark"')
  })

  it('has uppercase INERTIA brand text', () => {
    const html = renderShell(defaultOptions)
    expect(html).toContain('INERTIA')
  })

  it('includes deferred boot script', () => {
    const html = renderShell(defaultOptions)
    expect(html).toMatch(/\/js\/boot\.js\?v=/)
    expect(html).toMatch(/<script[^>]*defer/)
  })

  it('does not use inline event handlers on script', () => {
    const html = renderShell(defaultOptions)
    expect(html).not.toContain('onload=')
  })

  it('includes Glass Box elements before closing body', () => {
    const html = renderShell(defaultOptions)
    expect(html).toContain('<inertia-buffer-strip')
    expect(html).toContain('<inertia-telemetry-infobox')
  })

  it('uses dark class on html element', () => {
    const html = renderShell(defaultOptions)
    expect(html).toContain('class="dark"')
  })

  it('includes meta description', () => {
    const html = renderShell(defaultOptions)
    expect(html).toContain('content="Test description"')
  })

  it('includes Open Graph meta tags', () => {
    const html = renderShell(defaultOptions)
    expect(html).toContain('og:type')
    expect(html).toContain('og:site_name')
    expect(html).toContain('og:title')
    expect(html).toContain('og:description')
    expect(html).toContain('og:image')
    expect(html).toContain('og:url')
  })

  it('includes Twitter Card meta tags', () => {
    const html = renderShell(defaultOptions)
    expect(html).toContain('twitter:card')
    expect(html).toContain('summary_large_image')
    expect(html).toContain('twitter:title')
    expect(html).toContain('twitter:description')
    expect(html).toContain('twitter:image')
  })

  it('uses page title and description in OG tags', () => {
    const html = renderShell(defaultOptions)
    expect(html).toContain('content="Test | Inertia Web Solutions"')
    expect(html).toContain('content="Test description"')
  })
})

describe('renderShell hamburger nav', () => {
  it('has a hamburger toggle button hidden on desktop', () => {
    const html = renderShell(defaultOptions)
    expect(html).toContain('nav-hamburger')
    expect(html).toContain('aria-label="Toggle menu"')
    expect(html).toContain('aria-expanded="false"')
  })

  it('wraps nav links in a nav-links container', () => {
    const html = renderShell(defaultOptions)
    expect(html).toContain('class="nav-links"')
  })

  it('nav links container holds all 4 page links plus CTA', () => {
    const html = renderShell(defaultOptions)
    const navLinksMatch = html.match(/class="nav-links"[\s\S]*?<\/div>/)
    expect(navLinksMatch).not.toBeNull()
    const navLinksHtml = navLinksMatch![0]
    expect(navLinksHtml).toContain('Home')
    expect(navLinksHtml).toContain('How It Works')
    expect(navLinksHtml).toContain('Pricing')
    expect(navLinksHtml).toContain('About')
    expect(navLinksHtml).toContain('Free Site Audit')
  })
})

describe('renderShell nav route renames', () => {
  it('nav links use new route paths', () => {
    const html = renderShell(defaultOptions)
    expect(html).toContain('href="/how-it-works"')
    expect(html).toContain('href="/pricing"')
    expect(html).toContain('href="/about"')
    expect(html).not.toContain('href="/principles"')
    expect(html).not.toContain('href="/services"')
  })

  it('audit link is a CTA button in nav, not a text link', () => {
    const html = renderShell(defaultOptions)
    expect(html).toContain('nav-cta')
    expect(html).toContain('href="/free-site-audit"')
    expect(html).not.toContain('href="/audit"')
  })

  it('nav labels match new names', () => {
    const html = renderShell(defaultOptions)
    expect(html).toContain('How It Works')
    expect(html).toContain('Pricing')
    expect(html).toContain('Free Site Audit')
    expect(html).not.toContain('>Principles<')
    expect(html).not.toContain('>Services<')
  })
})

describe('renderShell canonical URL', () => {
  it('includes canonical link tag', () => {
    const html = renderShell(defaultOptions)
    expect(html).toContain('<link rel="canonical"')
  })

  it('canonical URL uses currentPath', () => {
    const html = renderShell({ ...defaultOptions, currentPath: '/about' })
    expect(html).toContain('href="https://inertiawebsolutions.com/about"')
  })
})

describe('BOOT_VERSION', () => {
  it('is a non-empty string', () => {
    expect(typeof BOOT_VERSION).toBe('string')
    expect(BOOT_VERSION.length).toBeGreaterThan(0)
  })
})

describe('renderShell data-inertia-version', () => {
  it('includes data-inertia-version on html element', () => {
    const html = renderShell(defaultOptions)
    expect(html).toContain(`data-inertia-version="${BOOT_VERSION}"`)
  })
})

describe('renderFragment', () => {
  it('returns just the main content', () => {
    const fragment = renderFragment('<h1>Hello</h1>')
    expect(fragment).toBe('<h1>Hello</h1>')
    expect(fragment).not.toContain('<!DOCTYPE')
  })
})
