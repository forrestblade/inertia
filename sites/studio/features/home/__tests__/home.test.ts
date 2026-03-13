import { describe, it, expect } from 'vitest'
import { renderHome } from '../templates/home.js'
import { HERO, PILLARS, ELIMINATES, OWNERSHIP } from '../config/home-content.js'
import { HOME_COPY_MAP } from '../config/home-copy-map.js'

describe('renderHome', () => {
  it('returns non-empty HTML', () => {
    const html = renderHome()
    expect(html.length).toBeGreaterThan(0)
  })

  it('contains hero headline', () => {
    const html = renderHome()
    expect(html).toContain(HERO.headline)
  })

  it('contains hero CTAs with telemetry attributes', () => {
    const html = renderHome()
    expect(html).toContain('data-telemetry-type="INTENT_NAVIGATE"')
    expect(html).toContain('hero-cta-primary')
    expect(html).toContain('hero-cta-secondary')
  })

  it('renders all four pillar cards', () => {
    const html = renderHome()
    for (const pillar of PILLARS) {
      expect(html).toContain(pillar.title)
    }
  })

  it('renders eliminate list', () => {
    const html = renderHome()
    for (const item of ELIMINATES) {
      expect(html).toContain(item)
    }
  })

  it('renders ownership section with proof metrics', () => {
    const html = renderHome()
    expect(html).toContain(OWNERSHIP.headline)
    for (const p of OWNERSHIP.proof) {
      expect(html).toContain(p.metric)
      expect(html).toContain(p.label)
    }
  })

  it('has bottom CTA', () => {
    const html = renderHome()
    expect(html).toContain('bottom-cta')
    expect(html).toContain('Contact Us')
  })

  it('does NOT link to /contact as a separate page', () => {
    const html = renderHome()
    expect(html).not.toContain('href="/contact"')
  })

  it('does NOT claim zero monthly costs when optional tiers exist', () => {
    expect(ELIMINATES).not.toContain('Monthly hosting invoices')
    expect(OWNERSHIP.body).not.toContain('No subscriptions')
  })

  it('does NOT reference hardware brand names in public-facing copy', () => {
    const html = renderHome()
    expect(html).not.toContain(' Pi,')
    expect(html).not.toContain(' Pi.')
    expect(html).not.toContain('Raspberry')
    expect(html).not.toContain('ZimaBoard')
    expect(html).not.toContain('N100')
  })

  it('renders data-copy-technical attributes for dual-layer copy', () => {
    const html = renderHome()
    expect(html).toContain('data-copy-technical=')
    expect(html).toContain('data-copy-default=')
  })

  it('hero text matches copy map default', () => {
    const heroEntry = HOME_COPY_MAP.find(e => e.id === 'hero-headline')
    expect(HERO.headline).toBe(heroEntry?.default)
  })

  it('pillar titles match copy map defaults', () => {
    const pillarTitleEntries = HOME_COPY_MAP.filter(e => e.id.startsWith('pillar-') && e.id.endsWith('-title'))
    expect(pillarTitleEntries.length).toBe(PILLARS.length)
  })

  it('ownership proof labels match copy map defaults', () => {
    for (const p of OWNERSHIP.proof) {
      const match = HOME_COPY_MAP.find(e => e.default === p.label)
      expect(match).toBeDefined()
    }
  })
})

describe('renderHome pillar copy rewrite', () => {
  it('pillar titles use plain-language business outcomes', () => {
    expect(PILLARS[0].title).toBe('Never Stutters Under Load')
    expect(PILLARS[1].title).toBe('Never Crashes Silently')
    expect(PILLARS[2].title).toBe('Nothing Can Hide in the Code')
    expect(PILLARS[3].title).toBe('Loads Before Your Competitor\'s Logo Appears')
  })

  it('pillar titles do not contain engineering jargon', () => {
    for (const pillar of PILLARS) {
      expect(pillar.title).not.toContain('Dynamic Allocation')
      expect(pillar.title).not.toContain('Exceptions')
      expect(pillar.title).not.toContain('Complexity')
      expect(pillar.title).not.toContain('First Paint')
    }
  })
})

describe('renderHome section order', () => {
  it('eliminate + ownership appear before pillars', () => {
    const html = renderHome()
    const eliminatePos = html.indexOf('eliminate-section')
    const ownershipPos = html.indexOf('ownership-section')
    const pillarPos = html.indexOf('pillars-section')
    expect(eliminatePos).toBeGreaterThan(-1)
    expect(ownershipPos).toBeGreaterThan(-1)
    expect(pillarPos).toBeGreaterThan(-1)
    expect(eliminatePos).toBeLessThan(pillarPos)
    expect(ownershipPos).toBeLessThan(pillarPos)
  })

  it('eliminate and ownership are in a side-by-side container', () => {
    const html = renderHome()
    expect(html).toContain('value-proposition')
  })
})

describe('renderHome hero CTA links to new routes', () => {
  it('hero primary CTA links to /how-it-works', () => {
    const html = renderHome()
    expect(html).toContain('href="/how-it-works"')
    expect(html).not.toContain('href="/principles"')
  })
})

describe('renderHome halftone hero', () => {
  it('hero contains halftone SVG element', () => {
    const html = renderHome()
    expect(html).toContain('class="hero-halftone"')
  })

  it('halftone SVG contains organic dot pattern', () => {
    const html = renderHome()
    expect(html).toContain('id="ht-organic"')
    expect(html).toContain('patternTransform="rotate(30)"')
  })

  it('halftone SVG contains grain pattern for depth', () => {
    const html = renderHome()
    expect(html).toContain('id="ht-grain"')
    expect(html).toContain('patternTransform="rotate(-15)"')
  })

  it('halftone SVG contains diagonal fade mask', () => {
    const html = renderHome()
    expect(html).toContain('id="diag-fade"')
    expect(html).toContain('id="fade-mask"')
  })

  it('halftone uses design token for dot color', () => {
    const html = renderHome()
    expect(html).toContain('fill="var(--primary)"')
    expect(html).not.toMatch(/fill="white"/)
  })

  it('halftone SVG appears before hero content', () => {
    const html = renderHome()
    const halftonePos = html.indexOf('hero-halftone')
    const headlinePos = html.indexOf(HERO.headline)
    expect(halftonePos).toBeGreaterThan(-1)
    expect(halftonePos).toBeLessThan(headlinePos)
  })

  it('halftone is non-interactive (pointer-events: none via CSS class)', () => {
    const html = renderHome()
    expect(html).toContain('hero-halftone')
  })
})
