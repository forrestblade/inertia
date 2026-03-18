import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ValSection } from '../components/val-section.js'
import { defineTestElement } from './test-helpers.js'

describe('ValSection', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.remove()
  })

  function create (attrs?: Record<string, string>): InstanceType<typeof ValSection> {
    const tag = defineTestElement('val-section', ValSection)
    const el = document.createElement(tag) as InstanceType<typeof ValSection>
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
    }
    container.appendChild(el)
    return el
  }

  describe('DOM structure', () => {
    it('is light DOM', () => {
      const el = create()
      expect(el.shadowRoot).toBeNull()
    })

    it('sets display: block on connect', () => {
      const el = create()
      expect(el.style.display).toBe('block')
    })

    it('has role=region', () => {
      const el = create()
      expect(el.getAttribute('role')).toBe('region')
    })
  })

  describe('max-width', () => {
    it('defaults to none', () => {
      const el = create()
      expect(el.style.maxWidth).toBe('')
    })

    it('sets max-width from attribute', () => {
      const el = create({ 'max-width': '64rem' })
      expect(el.style.maxWidth).toBe('64rem')
    })

    it('responds to attribute change', () => {
      const el = create()
      el.setAttribute('max-width', '48rem')
      expect(el.style.maxWidth).toBe('48rem')
    })
  })

  describe('padding', () => {
    it('maps numeric padding to spacing token', () => {
      const el = create({ padding: '6' })
      expect(el.style.padding).toBe('var(--val-space-6)')
    })

    it('passes CSS value through', () => {
      const el = create({ padding: '2rem 1rem' })
      expect(el.style.padding).toBe('2rem 1rem')
    })
  })

  describe('center', () => {
    it('centers with auto margins when present', () => {
      const el = create({ center: '' })
      expect(el.style.marginLeft).toBe('auto')
      expect(el.style.marginRight).toBe('auto')
    })

    it('removes centering when attribute removed', () => {
      const el = create({ center: '' })
      el.removeAttribute('center')
      expect(el.style.marginLeft).toBe('')
      expect(el.style.marginRight).toBe('')
    })
  })

  describe('telemetry', () => {
    it('does not emit on its own', () => {
      const el = create()
      const listener = vi.fn()
      el.addEventListener('val:interaction', listener)
      el.click()
      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('CMS traceability', () => {
    it('reads data-cms-id', () => {
      const el = create({ 'data-cms-id': 'about-section' })
      expect(el.cmsId).toBe('about-section')
    })
  })
})
