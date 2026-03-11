import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { HUD_COLORS } from '../tokens/hud-tokens.js'

beforeAll(async () => {
  if (customElements.get('hud-status') === undefined) {
    await import('../components/HudStatus.js')
  }
})

function createElement (attrs?: Record<string, string>): HTMLElement {
  const el = document.createElement('hud-status')
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

describe('HudStatus', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('registers as custom element hud-status', () => {
    expect(customElements.get('hud-status')).toBeDefined()
  })

  it('renders nominal state with positive color', () => {
    const el = attach(createElement({ state: 'nominal' }))
    const dot = el.querySelector('span')
    expect(dot?.style.backgroundColor).toBe(HUD_COLORS.positive)
  })

  it('renders degraded state with warning color', () => {
    const el = attach(createElement({ state: 'degraded' }))
    const dot = el.querySelector('span')
    expect(dot?.style.backgroundColor).toBe(HUD_COLORS.warning)
  })

  it('renders offline state with negative color', () => {
    const el = attach(createElement({ state: 'offline' }))
    const dot = el.querySelector('span')
    expect(dot?.style.backgroundColor).toBe(HUD_COLORS.negative)
  })

  it('defaults to nominal for invalid state', () => {
    const el = attach(createElement({ state: 'bogus' }))
    const dot = el.querySelector('span')
    expect(dot?.style.backgroundColor).toBe(HUD_COLORS.positive)
  })

  it('renders label text', () => {
    const el = attach(createElement({ label: 'nominal', state: 'nominal' }))
    const spans = el.querySelectorAll('span')
    const labelSpan = Array.from(spans).find(s => s.textContent === 'nominal')
    expect(labelSpan).toBeDefined()
  })

  it('has dot + label DOM structure', () => {
    const el = attach(createElement({ state: 'nominal', label: 'ok' }))
    const spans = el.querySelectorAll('span')
    expect(spans.length).toBe(2)
    // First is dot (has border-radius), second is label
    expect(spans[0]?.style.borderRadius).toBe('50%')
  })

  it('updates state in-place via attribute change', () => {
    const el = attach(createElement({ state: 'nominal' }))
    const dot = el.querySelector('span')
    expect(dot?.style.backgroundColor).toBe(HUD_COLORS.positive)

    el.setAttribute('state', 'offline')
    expect(dot?.style.backgroundColor).toBe(HUD_COLORS.negative)
  })

  it('has connectedMoveCallback defined', () => {
    const el = createElement()
    expect(typeof (el as unknown as { connectedMoveCallback: unknown }).connectedMoveCallback).toBe('function')
  })
})
