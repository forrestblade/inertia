import { describe, it, expect } from 'vitest'
import { renderServices } from '../templates/services.js'
import { SERVICE_TIERS, OWNERSHIP_LIST } from '../config/services-content.js'

describe('renderServices', () => {
  it('returns non-empty HTML', () => {
    const html = renderServices()
    expect(html.length).toBeGreaterThan(0)
  })

  it('renders all three service tiers', () => {
    const html = renderServices()
    for (const tier of SERVICE_TIERS) {
      expect(html).toContain(tier.name)
    }
  })

  it('renders ownership list', () => {
    const html = renderServices()
    for (const item of OWNERSHIP_LIST) {
      expect(html).toContain(item)
    }
  })

  it('has telemetry attributes on tiers', () => {
    const html = renderServices()
    expect(html).toContain('data-telemetry-target="tier-build-deploy"')
    expect(html).toContain('data-telemetry-target="tier-managed"')
  })

  it('has CTA at bottom', () => {
    const html = renderServices()
    expect(html).toContain('services-contact-cta')
  })
})
