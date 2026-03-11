import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { HUD_COLORS } from '../tokens/hud-tokens.js'

beforeAll(async () => {
  if (customElements.get('hud-panel') === undefined) {
    await import('../components/HudPanel.js')
  }
})

function createElement (attrs?: Record<string, string>): HTMLElement {
  const el = document.createElement('hud-panel')
  if (attrs !== undefined) {
    for (const [key, value] of Object.entries(attrs)) {
      el.setAttribute(key, value)
    }
  }
  return el
}

function attach (el: HTMLElement): HTMLElement {
  document.body.appendChild(el)
  return el
}

describe('HudPanel', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('registers as custom element hud-panel', () => {
    expect(customElements.get('hud-panel')).toBeDefined()
  })

  it('renders header from label attribute', () => {
    const el = attach(createElement({ label: 'Visitors' }))
    const spans = el.querySelectorAll('span')
    const header = Array.from(spans).find(s => s.textContent === 'Visitors')
    expect(header).toBeDefined()
  })

  it('preserves light DOM children', () => {
    const el = createElement({ label: 'Test' })
    const child = document.createElement('div')
    child.textContent = 'Hello'
    el.appendChild(child)
    attach(el)

    expect(el.textContent).toContain('Hello')
  })

  it('applies surface background color', () => {
    const el = attach(createElement({ label: 'Test' }))
    expect(el.style.backgroundColor).toBe(HUD_COLORS.surface)
  })

  it('has role="region"', () => {
    const el = attach(createElement({ label: 'Visitors' }))
    expect(el.getAttribute('role')).toBe('region')
  })

  it('sets aria-label from label attribute', () => {
    const el = attach(createElement({ label: 'Visitors' }))
    expect(el.getAttribute('aria-label')).toBe('Visitors')
  })

  it('updates label in-place via attribute change', () => {
    const el = attach(createElement({ label: 'Old' }))
    el.setAttribute('label', 'New')
    const spans = el.querySelectorAll('span')
    const header = Array.from(spans).find(s => s.textContent === 'New')
    expect(header).toBeDefined()
    expect(el.getAttribute('aria-label')).toBe('New')
  })

  it('has connectedMoveCallback defined', () => {
    const el = createElement()
    expect(typeof (el as unknown as { connectedMoveCallback: unknown }).connectedMoveCallback).toBe('function')
  })
})
