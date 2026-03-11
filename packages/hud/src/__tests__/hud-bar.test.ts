import { describe, it, expect, beforeAll, afterEach } from 'vitest'

beforeAll(async () => {
  if (customElements.get('hud-bar') === undefined) {
    await import('../components/HudBar.js')
  }
})

function createElement (attrs?: Record<string, string>): HTMLElement {
  const el = document.createElement('hud-bar')
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

describe('HudBar', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('registers as custom element hud-bar', () => {
    expect(customElements.get('hud-bar')).toBeDefined()
  })

  it('renders label element', () => {
    const el = attach(createElement({ label: 'Phone' }))
    const spans = el.querySelectorAll('span')
    const labelSpan = Array.from(spans).find(s => s.textContent === 'Phone')
    expect(labelSpan).toBeDefined()
  })

  it('renders value element', () => {
    const el = attach(createElement({ value: '18' }))
    const spans = el.querySelectorAll('span')
    const valueSpan = Array.from(spans).find(s => s.textContent === '18')
    expect(valueSpan).toBeDefined()
  })

  it('renders a bar fill element', () => {
    const el = attach(createElement({ percent: '60' }))
    const divs = el.querySelectorAll('div')
    // header div + track div + fill div = 3 inner divs
    expect(divs.length).toBeGreaterThanOrEqual(2)
  })

  it('sets fill width from percent attribute', () => {
    const el = attach(createElement({ percent: '75' }))
    const divs = el.querySelectorAll('div')
    const fill = Array.from(divs).find(d => d.style.width === '75%')
    expect(fill).toBeDefined()
  })

  it('clamps percent to 0-100 range', () => {
    const over = attach(createElement({ percent: '150' }))
    const divs = over.querySelectorAll('div')
    const fill = Array.from(divs).find(d => d.style.width === '100%')
    expect(fill).toBeDefined()

    document.body.innerHTML = ''

    const under = attach(createElement({ percent: '-10' }))
    const divs2 = under.querySelectorAll('div')
    const fill2 = Array.from(divs2).find(d => d.style.width === '0%')
    expect(fill2).toBeDefined()
  })

  it('applies custom color to fill', () => {
    const el = attach(createElement({ percent: '50', color: 'red' }))
    const divs = el.querySelectorAll('div')
    const fill = Array.from(divs).find(d => d.style.width === '50%')
    expect(fill?.style.backgroundColor).toBe('red')
  })

  it('updates fill width in-place via attribute change', () => {
    const el = attach(createElement({ percent: '30' }))
    el.setAttribute('percent', '80')
    const divs = el.querySelectorAll('div')
    const fill = Array.from(divs).find(d => d.style.width === '80%')
    expect(fill).toBeDefined()
  })

  it('updates label in-place via attribute change', () => {
    const el = attach(createElement({ label: 'Old' }))
    el.setAttribute('label', 'New')
    const spans = el.querySelectorAll('span')
    const labelSpan = Array.from(spans).find(s => s.textContent === 'New')
    expect(labelSpan).toBeDefined()
  })

  it('has a fixed DOM structure', () => {
    const el = attach(createElement({ label: 'Test', value: '5', percent: '50' }))
    // header div + track div as direct children
    const directDivs = Array.from(el.children).filter(c => c.tagName === 'DIV')
    expect(directDivs.length).toBe(2)
  })

  it('has connectedMoveCallback defined', () => {
    const el = createElement()
    expect(typeof (el as unknown as { connectedMoveCallback: unknown }).connectedMoveCallback).toBe('function')
  })
})
