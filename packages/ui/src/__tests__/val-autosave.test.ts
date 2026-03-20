import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ValAutosave } from '../components/val-autosave.js'
import { defineTestElement } from './test-helpers.js'

describe('ValAutosave', () => {
  let container: HTMLDivElement
  let form: HTMLFormElement

  beforeEach(() => {
    container = document.createElement('div')
    form = document.createElement('form')
    container.appendChild(form)
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.remove()
    vi.restoreAllMocks()
  })

  function create (attrs?: Record<string, string>): InstanceType<typeof ValAutosave> {
    const tag = defineTestElement('val-autosave', ValAutosave)
    const el = document.createElement(tag) as InstanceType<typeof ValAutosave>
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
    }
    form.appendChild(el)
    return el
  }

  describe('DOM structure', () => {
    it('uses shadow DOM', () => {
      const el = create()
      expect(el.shadowRoot).not.toBeNull()
    })

    it('has status element with role="status"', () => {
      const el = create()
      expect(el.shadowRoot!.querySelector('[role="status"]')).not.toBeNull()
    })

    it('has aria-live="polite"', () => {
      const el = create()
      expect(el.shadowRoot!.querySelector('[aria-live="polite"]')).not.toBeNull()
    })
  })

  describe('attributes', () => {
    it('reads endpoint attribute', () => {
      const el = create({ endpoint: '/api/save' })
      expect(el.endpoint).toBe('/api/save')
    })

    it('reads csrf-token attribute', () => {
      const el = create({ 'csrf-token': 'abc123' })
      expect(el.csrfToken).toBe('abc123')
    })

    it('reads debounce-ms with default 800', () => {
      const el = create()
      expect(el.debounceMs).toBe(800)
    })

    it('reads custom debounce-ms', () => {
      const el = create({ 'debounce-ms': '500' })
      expect(el.debounceMs).toBe(500)
    })

    it('falls back to 800 for invalid debounce-ms', () => {
      const el = create({ 'debounce-ms': 'abc' })
      expect(el.debounceMs).toBe(800)
    })
  })

  describe('initial state', () => {
    it('starts in saved state', () => {
      const el = create()
      expect(el.state).toBe('saved')
    })

    it('shows "Saved" text', () => {
      const el = create()
      const status = el.shadowRoot!.querySelector('.status')!
      expect(status.textContent).toBe('Saved')
    })

    it('sets data-state attribute', () => {
      const el = create()
      expect(el.getAttribute('data-state')).toBe('saved')
    })
  })

  describe('debounce on input', () => {
    it('transitions to unsaved on form input', () => {
      const el = create({ endpoint: '/api/save' })
      form.dispatchEvent(new Event('input', { bubbles: true }))
      expect(el.state).toBe('unsaved')
    })

    it('shows "Unsaved changes" text on input', () => {
      const el = create({ endpoint: '/api/save' })
      form.dispatchEvent(new Event('input', { bubbles: true }))
      const status = el.shadowRoot!.querySelector('.status')!
      expect(status.textContent).toBe('Unsaved changes')
    })

    it('transitions to saving after debounce', () => {
      vi.useFakeTimers()
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, savedAt: '2026-01-01T00:00:00Z' })
      })
      vi.stubGlobal('fetch', mockFetch)

      const el = create({ endpoint: '/api/save', 'debounce-ms': '100' })
      form.dispatchEvent(new Event('input', { bubbles: true }))
      vi.advanceTimersByTime(100)
      expect(el.state).toBe('saving')

      vi.useRealTimers()
    })

    it('sends POST to endpoint after debounce', () => {
      vi.useFakeTimers()
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
      vi.stubGlobal('fetch', mockFetch)

      create({ endpoint: '/api/save', 'csrf-token': 'tok', 'debounce-ms': '100' })
      form.dispatchEvent(new Event('input', { bubbles: true }))
      vi.advanceTimersByTime(100)

      expect(mockFetch).toHaveBeenCalledWith('/api/save', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }))

      vi.useRealTimers()
    })

    it('includes csrf token in POST body', () => {
      vi.useFakeTimers()
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
      vi.stubGlobal('fetch', mockFetch)

      create({ endpoint: '/api/save', 'csrf-token': 'my-csrf', 'debounce-ms': '100' })
      form.dispatchEvent(new Event('input', { bubbles: true }))
      vi.advanceTimersByTime(100)

      const body = mockFetch.mock.calls[0]![1].body as string
      expect(body).toContain('_csrf=my-csrf')

      vi.useRealTimers()
    })
  })

  describe('state transitions on response', () => {
    it('transitions to saved on success', async () => {
      vi.useFakeTimers()
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, savedAt: '2026-01-01T12:00:00Z' })
      })
      vi.stubGlobal('fetch', mockFetch)

      const el = create({ endpoint: '/api/save', 'debounce-ms': '50' })
      form.dispatchEvent(new Event('input', { bubbles: true }))
      vi.advanceTimersByTime(50)

      await vi.advanceTimersByTimeAsync(0)
      await vi.advanceTimersByTimeAsync(0)

      expect(el.state).toBe('saved')
      vi.useRealTimers()
    })

    it('transitions to error on fetch failure', async () => {
      vi.useFakeTimers()
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network'))
      vi.stubGlobal('fetch', mockFetch)

      const el = create({ endpoint: '/api/save', 'debounce-ms': '50' })
      form.dispatchEvent(new Event('input', { bubbles: true }))
      vi.advanceTimersByTime(50)

      await vi.advanceTimersByTimeAsync(0)
      await vi.advanceTimersByTimeAsync(0)

      expect(el.state).toBe('error')
      vi.useRealTimers()
    })

    it('transitions to error on non-ok response', async () => {
      vi.useFakeTimers()
      const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 500 })
      vi.stubGlobal('fetch', mockFetch)

      const el = create({ endpoint: '/api/save', 'debounce-ms': '50' })
      form.dispatchEvent(new Event('input', { bubbles: true }))
      vi.advanceTimersByTime(50)

      await vi.advanceTimersByTimeAsync(0)
      await vi.advanceTimersByTimeAsync(0)

      expect(el.state).toBe('error')
      vi.useRealTimers()
    })
  })

  describe('telemetry', () => {
    it('emits val:interaction on state change', () => {
      const el = create({ endpoint: '/api/save' })
      const listener = vi.fn()
      el.addEventListener('val:interaction', listener)

      form.dispatchEvent(new Event('input', { bubbles: true }))

      expect(listener).toHaveBeenCalled()
      const detail = (listener.mock.calls[0]![0] as CustomEvent).detail
      expect(detail.action).toBe('state-change')
      expect(detail.state).toBe('unsaved')
    })
  })

  describe('CMS traceability', () => {
    it('reads data-cms-id', () => {
      const el = create({ 'data-cms-id': 'autosave-posts' })
      expect(el.cmsId).toBe('autosave-posts')
    })
  })
})
