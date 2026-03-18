import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ValStack } from '../components/val-stack.js'
import { defineTestElement } from './test-helpers.js'

describe('ValStack', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.remove()
  })

  function create (attrs?: Record<string, string>): InstanceType<typeof ValStack> {
    const tag = defineTestElement('val-stack', ValStack)
    const el = document.createElement(tag) as InstanceType<typeof ValStack>
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
    }
    container.appendChild(el)
    return el
  }

  describe('DOM structure', () => {
    it('is light DOM (no shadow root)', () => {
      const el = create()
      expect(el.shadowRoot).toBeNull()
    })

    it('sets display: flex on connect', () => {
      const el = create()
      expect(el.style.display).toBe('flex')
    })
  })

  describe('direction', () => {
    it('defaults to column', () => {
      const el = create()
      expect(el.style.flexDirection).toBe('column')
    })

    it('accepts row direction', () => {
      const el = create({ direction: 'row' })
      expect(el.style.flexDirection).toBe('row')
    })

    it('responds to attribute change', () => {
      const el = create()
      el.setAttribute('direction', 'row')
      expect(el.style.flexDirection).toBe('row')
    })
  })

  describe('gap', () => {
    it('maps numeric gap to spacing token', () => {
      const el = create({ gap: '4' })
      expect(el.style.gap).toBe('var(--val-space-4)')
    })

    it('passes CSS values through', () => {
      const el = create({ gap: '1rem' })
      expect(el.style.gap).toBe('1rem')
    })

    it('clears gap when attribute removed', () => {
      const el = create({ gap: '4' })
      el.removeAttribute('gap')
      expect(el.style.gap).toBe('')
    })
  })

  describe('align', () => {
    it('sets align-items', () => {
      const el = create({ align: 'center' })
      expect(el.style.alignItems).toBe('center')
    })
  })

  describe('justify', () => {
    it('sets justify-content', () => {
      const el = create({ justify: 'between' })
      expect(el.style.justifyContent).toBe('space-between')
    })

    it('passes standard values through', () => {
      const el = create({ justify: 'center' })
      expect(el.style.justifyContent).toBe('center')
    })
  })

  describe('wrap', () => {
    it('sets flex-wrap when present', () => {
      const el = create({ wrap: '' })
      expect(el.style.flexWrap).toBe('wrap')
    })
  })

  describe('telemetry', () => {
    it('does not emit on its own (layout-only)', () => {
      const el = create()
      const listener = vi.fn()
      el.addEventListener('val:interaction', listener)
      el.click()
      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('CMS traceability', () => {
    it('reads data-cms-id', () => {
      const el = create({ 'data-cms-id': 'hero-stack' })
      expect(el.cmsId).toBe('hero-stack')
    })
  })
})
