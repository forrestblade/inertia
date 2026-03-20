import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ValBulkBar } from '../components/val-bulk-bar.js'
import { defineTestElement } from './test-helpers.js'

describe('ValBulkBar', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.remove()
  })

  function create (attrs?: Record<string, string>): InstanceType<typeof ValBulkBar> {
    const tag = defineTestElement('val-bulk-bar', ValBulkBar)
    const el = document.createElement(tag) as InstanceType<typeof ValBulkBar>
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
    }
    container.appendChild(el)
    return el
  }

  function addCheckboxes (n: number, selector = 'bulk-row-check'): HTMLInputElement[] {
    const inputs: HTMLInputElement[] = []
    for (let i = 0; i < n; i++) {
      const cb = document.createElement('input')
      cb.type = 'checkbox'
      cb.className = selector
      container.appendChild(cb)
      inputs.push(cb)
    }
    return inputs
  }

  describe('DOM structure', () => {
    it('uses shadow DOM', () => {
      const el = create()
      expect(el.shadowRoot).not.toBeNull()
    })

    it('has count element with aria-live', () => {
      const el = create()
      expect(el.shadowRoot!.querySelector('[aria-live="polite"]')).not.toBeNull()
    })

    it('has slot for action buttons', () => {
      const el = create()
      expect(el.shadowRoot!.querySelector('slot')).not.toBeNull()
    })
  })

  describe('visibility', () => {
    it('is hidden when no checkboxes are checked', () => {
      const el = create()
      addCheckboxes(3)
      el.update()
      expect(el.hasAttribute('visible')).toBe(false)
    })

    it('becomes visible when a checkbox is checked', () => {
      const el = create()
      const [cb] = addCheckboxes(3)
      cb!.checked = true
      el.update()
      expect(el.hasAttribute('visible')).toBe(true)
    })

    it('hides when all checkboxes unchecked', () => {
      const el = create()
      const [cb] = addCheckboxes(3)
      cb!.checked = true
      el.update()
      expect(el.hasAttribute('visible')).toBe(true)

      cb!.checked = false
      el.update()
      expect(el.hasAttribute('visible')).toBe(false)
    })
  })

  describe('count tracking', () => {
    it('reports 0 when none checked', () => {
      const el = create()
      addCheckboxes(3)
      el.update()
      expect(el.count).toBe(0)
    })

    it('counts checked checkboxes', () => {
      const el = create()
      const cbs = addCheckboxes(3)
      cbs[0]!.checked = true
      cbs[2]!.checked = true
      el.update()
      expect(el.count).toBe(2)
    })

    it('displays count text', () => {
      const el = create()
      const cbs = addCheckboxes(3)
      cbs[0]!.checked = true
      cbs[1]!.checked = true
      el.update()
      const countEl = el.shadowRoot!.querySelector('.count')!
      expect(countEl.textContent).toBe('2 selected')
    })
  })

  describe('custom checkbox selector', () => {
    it('uses custom selector', () => {
      const el = create({ 'checkbox-selector': '.my-check' })
      const cb = document.createElement('input')
      cb.type = 'checkbox'
      cb.className = 'my-check'
      cb.checked = true
      container.appendChild(cb)

      el.update()
      expect(el.count).toBe(1)
    })
  })

  describe('event-driven updates', () => {
    it('updates on change event from matching checkbox', () => {
      const el = create()
      const [cb] = addCheckboxes(1)
      cb!.checked = true
      cb!.dispatchEvent(new Event('change', { bubbles: true }))
      expect(el.count).toBe(1)
      expect(el.hasAttribute('visible')).toBe(true)
    })

    it('ignores change events from non-matching elements', () => {
      const el = create()
      addCheckboxes(1)
      const other = document.createElement('input')
      other.type = 'text'
      container.appendChild(other)
      other.dispatchEvent(new Event('change', { bubbles: true }))
      expect(el.count).toBe(0)
    })
  })

  describe('selectAll / deselectAll', () => {
    it('selectAll checks all matching checkboxes', () => {
      const el = create()
      const cbs = addCheckboxes(3)
      el.selectAll()
      expect(cbs.every(cb => cb.checked)).toBe(true)
      expect(el.count).toBe(3)
    })

    it('deselectAll unchecks all matching checkboxes', () => {
      const el = create()
      const cbs = addCheckboxes(3)
      el.selectAll()
      el.deselectAll()
      expect(cbs.every(cb => !cb.checked)).toBe(true)
      expect(el.count).toBe(0)
    })
  })

  describe('telemetry', () => {
    it('emits val:interaction on count change', () => {
      const el = create()
      const [cb] = addCheckboxes(1)
      const listener = vi.fn()
      el.addEventListener('val:interaction', listener)

      cb!.checked = true
      el.update()

      expect(listener).toHaveBeenCalled()
      const detail = (listener.mock.calls[0]![0] as CustomEvent).detail
      expect(detail.action).toBe('count-change')
      expect(detail.count).toBe(1)
    })
  })

  describe('CMS traceability', () => {
    it('reads data-cms-id', () => {
      const el = create({ 'data-cms-id': 'bulk-posts' })
      expect(el.cmsId).toBe('bulk-posts')
    })
  })
})
