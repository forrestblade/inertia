import { describe, it, expect, beforeAll, afterEach } from 'vitest'

beforeAll(async () => {
  if (customElements.get('hud-sparkline') === undefined) {
    await import('../components/HudSparkline.js')
  }
  if (customElements.get('hud-metric') === undefined) {
    await import('../components/HudMetric.js')
  }
  if (customElements.get('hud-status') === undefined) {
    await import('../components/HudStatus.js')
  }
  if (customElements.get('hud-panel') === undefined) {
    await import('../components/HudPanel.js')
  }
  if (customElements.get('hud-diagnostic-dashboard') === undefined) {
    await import('../layouts/DiagnosticDashboard.js')
  }
})

function createElement (attrs?: Record<string, string>): HTMLElement {
  const el = document.createElement('hud-diagnostic-dashboard')
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

describe('DiagnosticDashboard', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('registers as custom element hud-diagnostic-dashboard', () => {
    expect(customElements.get('hud-diagnostic-dashboard')).toBeDefined()
  })

  it('contains 6 hud-panel children', () => {
    const el = attach(createElement({ gate: 'open' }))
    const panels = el.querySelectorAll('hud-panel')
    expect(panels.length).toBe(6)
  })

  it('has panels with correct labels', () => {
    const el = attach(createElement({ gate: 'open' }))
    const panels = el.querySelectorAll('hud-panel')
    const labels = Array.from(panels).map(p => p.getAttribute('label'))
    expect(labels).toContain('Ingestion')
    expect(labels).toContain('Rejection')
    expect(labels).toContain('Pipeline Latency')
    expect(labels).toContain('Buffer Sat')
    expect(labels).toContain('DB Size')
    expect(labels).toContain('Aggregation Lag')
  })

  it('each panel contains a hud-metric', () => {
    const el = attach(createElement({ gate: 'open' }))
    const panels = el.querySelectorAll('hud-panel')
    for (const panel of panels) {
      expect(panel.querySelector('hud-metric')).not.toBeNull()
    }
  })

  it('each panel contains a hud-status', () => {
    const el = attach(createElement({ gate: 'open' }))
    const panels = el.querySelectorAll('hud-panel')
    for (const panel of panels) {
      expect(panel.querySelector('hud-status')).not.toBeNull()
    }
  })

  it('is hidden by default when gate is not open', () => {
    const el = attach(createElement())
    expect(el.style.display).toBe('none')
  })

  it('is visible when gate="open"', () => {
    const el = attach(createElement({ gate: 'open' }))
    expect(el.style.display).not.toBe('none')
  })

  it('toggles visibility on gate attribute change', () => {
    const el = attach(createElement())
    expect(el.style.display).toBe('none')

    el.setAttribute('gate', 'open')
    expect(el.style.display).not.toBe('none')
  })

  it('has connectedMoveCallback defined', () => {
    const el = createElement()
    expect(typeof (el as unknown as { connectedMoveCallback: unknown }).connectedMoveCallback).toBe('function')
  })

  it('hides again when gate removed', () => {
    const el = attach(createElement({ gate: 'open' }))
    expect(el.style.display).not.toBe('none')

    el.removeAttribute('gate')
    expect(el.style.display).toBe('none')
  })
})
