// @vitest-environment happy-dom
import { describe, it, expect, beforeAll, afterEach } from 'vitest'

describe('InertiaCacheIndicator', () => {
  let InertiaCacheIndicator: typeof import('../components/CacheIndicator.js').InertiaCacheIndicator

  beforeAll(async () => {
    const mod = await import('../components/CacheIndicator.js')
    InertiaCacheIndicator = mod.InertiaCacheIndicator
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('is defined as a custom element', () => {
    expect(customElements.get('inertia-cache-indicator')).toBeDefined()
  })

  it('can be created', () => {
    const el = document.createElement('inertia-cache-indicator')
    expect(el).toBeInstanceOf(InertiaCacheIndicator)
  })

  it('sets role=status on connect', () => {
    const el = document.createElement('inertia-cache-indicator')
    document.body.appendChild(el)
    expect(el.getAttribute('role')).toBe('status')
  })

  it('renders empty initially (no navigation yet)', () => {
    const el = document.createElement('inertia-cache-indicator')
    document.body.appendChild(el)
    expect(el.textContent?.trim()).toBe('')
  })

  it('updates display on inertia:navigated event with cache source', () => {
    const el = document.createElement('inertia-cache-indicator')
    document.body.appendChild(el)

    document.dispatchEvent(new CustomEvent('inertia:navigated', {
      bubbles: true,
      detail: { source: 'cache', durationMs: 2, fromUrl: '/', toUrl: '/about' }
    }))

    expect(el.textContent).toContain('2ms')
    expect(el.textContent).toContain('cache')
  })

  it('updates display on inertia:navigated event with network source', () => {
    const el = document.createElement('inertia-cache-indicator')
    document.body.appendChild(el)

    document.dispatchEvent(new CustomEvent('inertia:navigated', {
      bubbles: true,
      detail: { source: 'network', durationMs: 180, fromUrl: '/', toUrl: '/about' }
    }))

    expect(el.textContent).toContain('180ms')
    expect(el.textContent).toContain('network')
  })

  it('updates display on inertia:navigated event with prefetch source', () => {
    const el = document.createElement('inertia-cache-indicator')
    document.body.appendChild(el)

    document.dispatchEvent(new CustomEvent('inertia:navigated', {
      bubbles: true,
      detail: { source: 'prefetch', durationMs: 3, fromUrl: '/', toUrl: '/about' }
    }))

    expect(el.textContent).toContain('3ms')
    expect(el.textContent).toContain('prefetch')
  })

  it('applies fixed positioning', () => {
    const el = document.createElement('inertia-cache-indicator')
    document.body.appendChild(el)
    expect(el.style.position).toBe('fixed')
  })
})
