import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ValPreviewPane } from '../components/val-preview-pane.js'
import { defineTestElement } from './test-helpers.js'

describe('ValPreviewPane', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.remove()
    vi.restoreAllMocks()
  })

  function create (attrs?: Record<string, string>): InstanceType<typeof ValPreviewPane> {
    const tag = defineTestElement('val-preview-pane', ValPreviewPane)
    const el = document.createElement(tag) as InstanceType<typeof ValPreviewPane>
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
    }
    container.appendChild(el)
    return el
  }

  describe('DOM structure', () => {
    it('uses shadow DOM', () => {
      const el = create()
      expect(el.shadowRoot).not.toBeNull()
    })

    it('has an iframe', () => {
      const el = create()
      expect(el.shadowRoot!.querySelector('iframe')).not.toBeNull()
    })

    it('has viewport buttons', () => {
      const el = create()
      const buttons = el.shadowRoot!.querySelectorAll('[data-viewport]')
      expect(buttons.length).toBe(3)
    })

    it('has a refresh button', () => {
      const el = create()
      expect(el.shadowRoot!.querySelector('.refresh')).not.toBeNull()
    })

    it('iframe has sandbox attribute', () => {
      const el = create()
      const iframe = el.shadowRoot!.querySelector('iframe')!
      expect(iframe.getAttribute('sandbox')).toBe('allow-scripts allow-same-origin')
    })
  })

  describe('src attribute', () => {
    it('sets iframe src on connect', () => {
      const el = create({ src: '/preview' })
      const iframe = el.shadowRoot!.querySelector('iframe')!
      expect(iframe.src).toContain('/preview')
    })

    it('updates iframe src on attribute change', () => {
      const el = create({ src: '/preview' })
      el.setAttribute('src', '/other')
      const iframe = el.shadowRoot!.querySelector('iframe')!
      expect(iframe.src).toContain('/other')
    })
  })

  describe('viewport switching', () => {
    it('starts at desktop viewport', () => {
      const el = create()
      expect(el.viewport).toBe('desktop')
    })

    it('switches to tablet viewport', () => {
      const el = create()
      el.setViewport('tablet')
      expect(el.viewport).toBe('tablet')
      const iframe = el.shadowRoot!.querySelector('iframe')!
      expect(iframe.style.width).toBe('768px')
    })

    it('switches to mobile viewport', () => {
      const el = create()
      el.setViewport('mobile')
      expect(el.viewport).toBe('mobile')
      const iframe = el.shadowRoot!.querySelector('iframe')!
      expect(iframe.style.width).toBe('375px')
    })

    it('switches back to desktop viewport', () => {
      const el = create()
      el.setViewport('mobile')
      el.setViewport('desktop')
      expect(el.viewport).toBe('desktop')
      const iframe = el.shadowRoot!.querySelector('iframe')!
      expect(iframe.style.width).toBe('100%')
    })

    it('ignores unknown viewport', () => {
      const el = create()
      el.setViewport('unknown')
      expect(el.viewport).toBe('desktop')
    })

    it('updates aria-pressed on viewport buttons', () => {
      const el = create()
      el.setViewport('tablet')
      const buttons = el.shadowRoot!.querySelectorAll<HTMLButtonElement>('[data-viewport]')
      const pressed: Record<string, string> = {}
      for (const btn of buttons) {
        pressed[btn.dataset['viewport']!] = btn.getAttribute('aria-pressed')!
      }
      expect(pressed['desktop']).toBe('false')
      expect(pressed['tablet']).toBe('true')
      expect(pressed['mobile']).toBe('false')
    })

    it('switches viewport via button click', () => {
      const el = create()
      const tabletBtn = el.shadowRoot!.querySelector('[data-viewport="tablet"]') as HTMLButtonElement
      tabletBtn.click()
      expect(el.viewport).toBe('tablet')
    })
  })

  describe('refresh', () => {
    it('resets iframe src on refresh', () => {
      const el = create({ src: '/preview' })
      const iframe = el.shadowRoot!.querySelector('iframe')!
      const originalSrc = iframe.src
      el.refresh()
      expect(iframe.src).toBe(originalSrc)
    })

    it('refreshes via button click', () => {
      const el = create({ src: '/preview' })
      const refreshBtn = el.shadowRoot!.querySelector('.refresh') as HTMLButtonElement
      refreshBtn.click()
      // Should not throw, and iframe still has src
      const iframe = el.shadowRoot!.querySelector('iframe')!
      expect(iframe.src).toContain('/preview')
    })
  })

  describe('form postMessage', () => {
    it('sends postMessage to iframe on form input after debounce', () => {
      vi.useFakeTimers()
      const form = document.createElement('form')
      form.className = 'preview-form'
      container.appendChild(form)

      const el = create({ 'form-selector': '.preview-form', src: '/preview' })
      const iframe = el.shadowRoot!.querySelector('iframe')!

      const postMessageSpy = vi.fn()
      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: postMessageSpy },
        configurable: true
      })

      form.dispatchEvent(new Event('input', { bubbles: true }))
      vi.advanceTimersByTime(300)

      expect(postMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'valence:preview-update' }),
        window.location.origin
      )

      vi.useRealTimers()
    })

    it('debounces rapid input events', () => {
      vi.useFakeTimers()
      const form = document.createElement('form')
      form.className = 'preview-form'
      container.appendChild(form)

      const el = create({ 'form-selector': '.preview-form', src: '/preview' })
      const iframe = el.shadowRoot!.querySelector('iframe')!

      const postMessageSpy = vi.fn()
      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: postMessageSpy },
        configurable: true
      })

      form.dispatchEvent(new Event('input', { bubbles: true }))
      form.dispatchEvent(new Event('input', { bubbles: true }))
      form.dispatchEvent(new Event('input', { bubbles: true }))
      vi.advanceTimersByTime(300)

      expect(postMessageSpy).toHaveBeenCalledTimes(1)

      vi.useRealTimers()
    })
  })

  describe('telemetry', () => {
    it('emits val:interaction on viewport change', () => {
      const el = create()
      const listener = vi.fn()
      el.addEventListener('val:interaction', listener)

      el.setViewport('tablet')

      expect(listener).toHaveBeenCalledOnce()
      const detail = (listener.mock.calls[0]![0] as CustomEvent).detail
      expect(detail.action).toBe('viewport-change')
      expect(detail.viewport).toBe('tablet')
    })

    it('emits val:interaction on refresh', () => {
      const el = create({ src: '/preview' })
      const listener = vi.fn()
      el.addEventListener('val:interaction', listener)

      el.refresh()

      expect(listener).toHaveBeenCalledOnce()
      expect((listener.mock.calls[0]![0] as CustomEvent).detail.action).toBe('refresh')
    })
  })

  describe('CMS traceability', () => {
    it('reads data-cms-id', () => {
      const el = create({ 'data-cms-id': 'preview-posts' })
      expect(el.cmsId).toBe('preview-posts')
    })
  })
})
