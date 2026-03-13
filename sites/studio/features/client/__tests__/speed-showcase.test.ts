// @vitest-environment happy-dom
import { describe, it, expect, beforeAll, afterEach } from 'vitest'

function fireNavEvent (source: 'cache' | 'prefetch' | 'network', durationMs: number): void {
  document.dispatchEvent(new CustomEvent('inertia:navigated', {
    bubbles: true,
    detail: { source, durationMs, fromUrl: '/', toUrl: '/about' }
  }))
}

describe('InertiaSpeedShowcase', () => {
  let InertiaSpeedShowcase: typeof import('../components/SpeedShowcase.js').InertiaSpeedShowcase

  beforeAll(async () => {
    const mod = await import('../components/SpeedShowcase.js')
    InertiaSpeedShowcase = mod.InertiaSpeedShowcase
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('is defined as a custom element', () => {
    expect(customElements.get('inertia-speed-showcase')).toBeDefined()
  })

  it('can be created', () => {
    const el = document.createElement('inertia-speed-showcase')
    expect(el).toBeInstanceOf(InertiaSpeedShowcase)
  })

  it('shows default state before any navigation', () => {
    const el = document.createElement('inertia-speed-showcase')
    document.body.appendChild(el)
    expect(el.textContent).toContain('Navigate')
  })

  it('updates counters on navigation events', () => {
    const el = document.createElement('inertia-speed-showcase')
    document.body.appendChild(el)

    fireNavEvent('network', 180)
    expect(el.textContent).toContain('1')
  })

  it('tracks cache hit rate correctly', () => {
    const el = document.createElement('inertia-speed-showcase')
    document.body.appendChild(el)

    fireNavEvent('network', 200)
    fireNavEvent('cache', 2)
    fireNavEvent('cache', 3)

    // 2 cache hits out of 3 total = 67%
    expect(el.textContent).toContain('67%')
  })

  it('calculates average cached time', () => {
    const el = document.createElement('inertia-speed-showcase')
    document.body.appendChild(el)

    fireNavEvent('cache', 2)
    fireNavEvent('cache', 4)

    // Average of 2 and 4 = 3ms
    expect(el.textContent).toContain('3ms')
  })

  it('calculates average network time', () => {
    const el = document.createElement('inertia-speed-showcase')
    document.body.appendChild(el)

    fireNavEvent('network', 100)
    fireNavEvent('network', 200)

    // Average of 100 and 200 = 150ms
    expect(el.textContent).toContain('150ms')
  })

  it('tracks total navigations', () => {
    const el = document.createElement('inertia-speed-showcase')
    document.body.appendChild(el)

    fireNavEvent('network', 100)
    fireNavEvent('cache', 2)
    fireNavEvent('prefetch', 5)
    fireNavEvent('cache', 1)

    expect(el.textContent).toContain('4')
  })
})
