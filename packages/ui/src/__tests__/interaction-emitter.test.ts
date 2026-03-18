import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { emitInteraction } from '../core/interaction-emitter.js'

describe('emitInteraction', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.remove()
  })

  it('dispatches a val:interaction CustomEvent', () => {
    const listener = vi.fn()
    container.addEventListener('val:interaction', listener)

    emitInteraction(container, 'click')

    expect(listener).toHaveBeenCalledOnce()
    const event = listener.mock.calls[0]![0] as CustomEvent
    expect(event.type).toBe('val:interaction')
  })

  it('includes component tagName, action, and timestamp in detail', () => {
    const listener = vi.fn()
    container.addEventListener('val:interaction', listener)

    const before = Date.now()
    emitInteraction(container, 'click')
    const after = Date.now()

    const detail = (listener.mock.calls[0]![0] as CustomEvent).detail
    expect(detail.component).toBe('DIV')
    expect(detail.action).toBe('click')
    expect(detail.timestamp).toBeGreaterThanOrEqual(before)
    expect(detail.timestamp).toBeLessThanOrEqual(after)
  })

  it('merges extra detail properties', () => {
    const listener = vi.fn()
    container.addEventListener('val:interaction', listener)

    emitInteraction(container, 'change', { field: 'email', valid: true })

    const detail = (listener.mock.calls[0]![0] as CustomEvent).detail
    expect(detail.field).toBe('email')
    expect(detail.valid).toBe(true)
  })

  it('bubbles through the DOM', () => {
    const child = document.createElement('span')
    container.appendChild(child)

    const listener = vi.fn()
    container.addEventListener('val:interaction', listener)

    emitInteraction(child, 'click')

    expect(listener).toHaveBeenCalledOnce()
  })

  it('is composed (crosses shadow DOM boundaries)', () => {
    const host = document.createElement('div')
    const shadow = host.attachShadow({ mode: 'open' })
    const inner = document.createElement('button')
    shadow.appendChild(inner)
    container.appendChild(host)

    const listener = vi.fn()
    container.addEventListener('val:interaction', listener)

    emitInteraction(inner, 'click')

    expect(listener).toHaveBeenCalledOnce()
  })

  it('fires without listeners — no error', () => {
    expect(() => emitInteraction(container, 'click')).not.toThrow()
  })
})
