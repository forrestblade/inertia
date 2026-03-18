import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ValElement } from '../core/val-element.js'
import { defineTestElement, flushObservers } from './test-helpers.js'

// Minimal test subclass — does not override connectedCallback
class HydrationTestEl extends ValElement {
  protected createTemplate (): HTMLTemplateElement {
    const t = document.createElement('template')
    t.innerHTML = '<span part="inner"><slot></slot></span>'
    return t
  }
}

// Mock IntersectionObserver that captures instances for test control
interface MockIO extends IntersectionObserver {
  _trigger: (entries: Array<Partial<IntersectionObserverEntry>>) => void
}

function captureIntersectionObservers (): { instances: MockIO[]; restore: () => void } {
  const instances: MockIO[] = []
  const OrigIO = globalThis.IntersectionObserver

  globalThis.IntersectionObserver = class {
    private _cb: IntersectionObserverCallback
    root = null
    rootMargin = '0px'
    thresholds = [0] as ReadonlyArray<number>

    constructor (cb: IntersectionObserverCallback) {
      this._cb = cb
      instances.push(this as unknown as MockIO)
    }

    observe (): void {}
    unobserve (): void {}
    disconnect = vi.fn()
    takeRecords (): IntersectionObserverEntry[] { return [] }

    _trigger (entries: Array<Partial<IntersectionObserverEntry>>): void {
      this._cb(entries as IntersectionObserverEntry[], this as unknown as IntersectionObserver)
    }
  } as unknown as typeof IntersectionObserver

  return { instances, restore: () => { globalThis.IntersectionObserver = OrigIO } }
}

describe('Hydration Directives', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.remove()
  })

  describe('hydrate:idle', () => {
    it('does not clone template immediately when hydrate:idle is set', () => {
      const tag = defineTestElement('hydration-test', HydrationTestEl)
      const el = document.createElement(tag) as InstanceType<typeof HydrationTestEl>
      el.setAttribute('hydrate:idle', '')
      container.appendChild(el)

      expect(el.shadowRoot!.querySelector('span')).toBeNull()
      expect(el.hydrated).toBe(false)
    })

    it('hydrates after idle callback fires', async () => {
      const tag = defineTestElement('hydration-test', HydrationTestEl)
      const el = document.createElement(tag) as InstanceType<typeof HydrationTestEl>
      el.setAttribute('hydrate:idle', '')
      container.appendChild(el)

      expect(el.shadowRoot!.querySelector('span')).toBeNull()

      // Flush — requestIdleCallback polyfill uses setTimeout(0)
      await flushObservers()

      expect(el.shadowRoot!.querySelector('span')).not.toBeNull()
      expect(el.hydrated).toBe(true)
    })

    it('without directive, initializes immediately (backward compat)', () => {
      const tag = defineTestElement('hydration-test', HydrationTestEl)
      const el = document.createElement(tag) as InstanceType<typeof HydrationTestEl>
      container.appendChild(el)

      expect(el.shadowRoot!.querySelector('span')).not.toBeNull()
      expect(el.hydrated).toBe(true)
    })
  })

  describe('hydrate:visible', () => {
    it('does not clone template until element is visible', () => {
      const { instances, restore } = captureIntersectionObservers()

      const tag = defineTestElement('hydration-test', HydrationTestEl)
      const el = document.createElement(tag) as InstanceType<typeof HydrationTestEl>
      el.setAttribute('hydrate:visible', '')
      container.appendChild(el)

      expect(el.shadowRoot!.querySelector('span')).toBeNull()
      expect(el.hydrated).toBe(false)
      expect(instances).toHaveLength(1)

      // Simulate element entering viewport
      instances[0]!._trigger([{ isIntersecting: true, target: el }])

      expect(el.shadowRoot!.querySelector('span')).not.toBeNull()
      expect(el.hydrated).toBe(true)

      restore()
    })

    it('ignores non-intersecting entries', () => {
      const { instances, restore } = captureIntersectionObservers()

      const tag = defineTestElement('hydration-test', HydrationTestEl)
      const el = document.createElement(tag) as InstanceType<typeof HydrationTestEl>
      el.setAttribute('hydrate:visible', '')
      container.appendChild(el)

      // Non-intersecting should NOT trigger hydration
      instances[0]!._trigger([{ isIntersecting: false, target: el }])

      expect(el.shadowRoot!.querySelector('span')).toBeNull()
      expect(el.hydrated).toBe(false)

      restore()
    })

    it('disconnects observer after hydration', () => {
      const { instances, restore } = captureIntersectionObservers()

      const tag = defineTestElement('hydration-test', HydrationTestEl)
      const el = document.createElement(tag) as InstanceType<typeof HydrationTestEl>
      el.setAttribute('hydrate:visible', '')
      container.appendChild(el)

      instances[0]!._trigger([{ isIntersecting: true, target: el }])

      expect(instances[0]!.disconnect).toHaveBeenCalled()

      restore()
    })
  })

  describe('hydrate:media', () => {
    it('does not clone template when media query does not match', () => {
      const tag = defineTestElement('hydration-test', HydrationTestEl)
      const el = document.createElement(tag) as InstanceType<typeof HydrationTestEl>
      el.setAttribute('hydrate:media', '(max-width: 768px)')
      container.appendChild(el)

      // matchMedia polyfill defaults to matches: false
      expect(el.shadowRoot!.querySelector('span')).toBeNull()
      expect(el.hydrated).toBe(false)
    })

    it('hydrates immediately if media query already matches', () => {
      const origMM = globalThis.matchMedia
      globalThis.matchMedia = (query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false
      }) as MediaQueryList

      const tag = defineTestElement('hydration-test', HydrationTestEl)
      const el = document.createElement(tag) as InstanceType<typeof HydrationTestEl>
      el.setAttribute('hydrate:media', '(max-width: 768px)')
      container.appendChild(el)

      expect(el.shadowRoot!.querySelector('span')).not.toBeNull()
      expect(el.hydrated).toBe(true)

      globalThis.matchMedia = origMM
    })

    it('hydrates when media query starts matching', () => {
      let changeHandler: ((e: Partial<MediaQueryListEvent>) => void) | null = null
      const origMM = globalThis.matchMedia
      globalThis.matchMedia = (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: (_event: string, handler: EventListenerOrEventListenerObject) => {
          changeHandler = handler as (e: Partial<MediaQueryListEvent>) => void
        },
        removeEventListener: () => {},
        dispatchEvent: () => false
      }) as MediaQueryList

      const tag = defineTestElement('hydration-test', HydrationTestEl)
      const el = document.createElement(tag) as InstanceType<typeof HydrationTestEl>
      el.setAttribute('hydrate:media', '(max-width: 768px)')
      container.appendChild(el)

      expect(el.shadowRoot!.querySelector('span')).toBeNull()

      // Simulate media query matching
      changeHandler!({ matches: true } as Partial<MediaQueryListEvent>)

      expect(el.shadowRoot!.querySelector('span')).not.toBeNull()
      expect(el.hydrated).toBe(true)

      globalThis.matchMedia = origMM
    })
  })

  describe('hydrate:load', () => {
    it('initializes immediately (explicit)', () => {
      const tag = defineTestElement('hydration-test', HydrationTestEl)
      const el = document.createElement(tag) as InstanceType<typeof HydrationTestEl>
      el.setAttribute('hydrate:load', '')
      container.appendChild(el)

      expect(el.shadowRoot!.querySelector('span')).not.toBeNull()
      expect(el.hydrated).toBe(true)
    })
  })

  describe('disconnect before hydration', () => {
    it('cancels idle callback on disconnect', async () => {
      const spy = vi.spyOn(globalThis, 'cancelIdleCallback')

      const tag = defineTestElement('hydration-test', HydrationTestEl)
      const el = document.createElement(tag) as InstanceType<typeof HydrationTestEl>
      el.setAttribute('hydrate:idle', '')
      container.appendChild(el)

      expect(el.hydrated).toBe(false)

      // Remove before idle fires
      el.remove()

      expect(spy).toHaveBeenCalled()

      // Even after flush, template should NOT be cloned (callback was cancelled)
      await flushObservers()
      expect(el.shadowRoot!.querySelector('span')).toBeNull()

      spy.mockRestore()
    })

    it('disconnects IntersectionObserver on element removal', () => {
      const { instances, restore } = captureIntersectionObservers()

      const tag = defineTestElement('hydration-test', HydrationTestEl)
      const el = document.createElement(tag) as InstanceType<typeof HydrationTestEl>
      el.setAttribute('hydrate:visible', '')
      container.appendChild(el)

      expect(instances).toHaveLength(1)

      el.remove()

      expect(instances[0]!.disconnect).toHaveBeenCalled()

      restore()
    })
  })

  describe('reconnect after disconnect', () => {
    it('does not re-clone template when reconnected after hydration', async () => {
      const tag = defineTestElement('hydration-test', HydrationTestEl)
      const el = document.createElement(tag) as InstanceType<typeof HydrationTestEl>
      el.setAttribute('hydrate:idle', '')
      container.appendChild(el)

      await flushObservers()
      expect(el.shadowRoot!.querySelector('span')).not.toBeNull()

      const childCount = el.shadowRoot!.childNodes.length

      el.remove()
      container.appendChild(el)

      expect(el.shadowRoot!.childNodes.length).toBe(childCount)
    })
  })
})
