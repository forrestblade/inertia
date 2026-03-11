import { describe, it, expect, beforeAll, afterEach } from 'vitest'

beforeAll(async () => {
  if (customElements.get('hud-sparkline') === undefined) {
    await import('../components/HudSparkline.js')
  }
  if (customElements.get('hud-metric') === undefined) {
    await import('../components/HudMetric.js')
  }
})

function createElement (attrs?: Record<string, string>): HTMLElement {
  const el = document.createElement('hud-metric')
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

describe('HudMetric', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('registers as custom element hud-metric', () => {
    expect(customElements.get('hud-metric')).toBeDefined()
  })

  it('renders label element', () => {
    const el = attach(createElement({ label: 'Visitors' }))
    const spans = el.querySelectorAll('span')
    const labelSpan = Array.from(spans).find(s => s.textContent === 'Visitors')
    expect(labelSpan).toBeDefined()
  })

  it('renders value element', () => {
    const el = attach(createElement({ value: '1,247' }))
    const spans = el.querySelectorAll('span')
    const valueSpan = Array.from(spans).find(s => s.textContent === '1,247')
    expect(valueSpan).toBeDefined()
  })

  it('renders default value as -- when not set', () => {
    const el = attach(createElement())
    const spans = el.querySelectorAll('span')
    const valueSpan = Array.from(spans).find(s => s.textContent === '--')
    expect(valueSpan).toBeDefined()
  })

  it('renders delta element with direction class', () => {
    const el = attach(createElement({ delta: '+12%', 'delta-direction': 'up' }))
    const spans = el.querySelectorAll('span')
    const deltaSpan = Array.from(spans).find(s => s.textContent === '+12%')
    expect(deltaSpan).toBeDefined()
    expect(deltaSpan?.classList.contains('positive')).toBe(true)
  })

  it('applies negative class for down direction', () => {
    const el = attach(createElement({ delta: '-5%', 'delta-direction': 'down' }))
    const spans = el.querySelectorAll('span')
    const deltaSpan = Array.from(spans).find(s => s.textContent === '-5%')
    expect(deltaSpan?.classList.contains('negative')).toBe(true)
  })

  it('applies flat class for flat direction', () => {
    const el = attach(createElement({ delta: '0%', 'delta-direction': 'flat' }))
    const spans = el.querySelectorAll('span')
    const deltaSpan = Array.from(spans).find(s => s.textContent === '0%')
    expect(deltaSpan?.classList.contains('flat')).toBe(true)
  })

  it('contains a hud-sparkline child', () => {
    const el = attach(createElement())
    expect(el.querySelector('hud-sparkline')).not.toBeNull()
  })

  it('passes sparkline-data through to child sparkline', () => {
    const el = attach(createElement({ 'sparkline-data': '10,20,30,40' }))
    const sparkline = el.querySelector('hud-sparkline')
    expect(sparkline?.getAttribute('data')).toBe('10,20,30,40')
  })

  it('uses monospace and tabular-nums on value', () => {
    const el = attach(createElement({ value: '999' }))
    const spans = el.querySelectorAll('span')
    const valueSpan = Array.from(spans).find(s => s.textContent === '999')
    expect(valueSpan?.style.fontVariantNumeric).toBe('tabular-nums')
  })

  it('updates label in-place via attribute change', () => {
    const el = attach(createElement({ label: 'Old' }))
    el.setAttribute('label', 'New')
    const spans = el.querySelectorAll('span')
    const labelSpan = Array.from(spans).find(s => s.textContent === 'New')
    expect(labelSpan).toBeDefined()
  })

  it('updates value in-place via attribute change', () => {
    const el = attach(createElement({ value: '100' }))
    el.setAttribute('value', '200')
    const spans = el.querySelectorAll('span')
    const valueSpan = Array.from(spans).find(s => s.textContent === '200')
    expect(valueSpan).toBeDefined()
  })

  it('has a fixed DOM structure with 4 children', () => {
    const el = attach(createElement({ label: 'Test', value: '42', delta: '+1%', 'delta-direction': 'up' }))
    // label span + value span + sparkline + delta span
    expect(el.children.length).toBe(4)
  })

  it('has connectedMoveCallback defined', () => {
    const el = createElement()
    expect(typeof (el as unknown as { connectedMoveCallback: unknown }).connectedMoveCallback).toBe('function')
  })

  it('updates sparkline data in-place', () => {
    const el = attach(createElement({ 'sparkline-data': '1,2,3' }))
    el.setAttribute('sparkline-data', '4,5,6')
    const sparkline = el.querySelector('hud-sparkline')
    expect(sparkline?.getAttribute('data')).toBe('4,5,6')
  })
})
