import { describe, it, expect, vi } from 'vitest'
import { signal, computed } from '../core.js'

describe('signal()', () => {
  it('returns initial value via .value', () => {
    const s = signal(0)
    expect(s.value).toBe(0)
  })

  it('returns initial value for non-number types', () => {
    const s = signal('hello')
    expect(s.value).toBe('hello')
  })

  it('updates value on write', () => {
    const s = signal(0)
    s.value = 42
    expect(s.value).toBe(42)
  })

  it('returns updated value via peek() without tracking', () => {
    const s = signal(10)
    expect(s.peek()).toBe(10)
    s.value = 20
    expect(s.peek()).toBe(20)
  })

  it('does not notify when setting same value (Object.is)', () => {
    const s = signal(5)
    const spy = vi.fn()
    // Subscribe manually to test notification (internal API)
    s._subscribe(spy)
    s.value = 5
    expect(spy).not.toHaveBeenCalled()
  })

  it('notifies when setting different value', () => {
    const s = signal(5)
    const spy = vi.fn()
    s._subscribe(spy)
    s.value = 10
    expect(spy).toHaveBeenCalledOnce()
  })

  it('supports custom equality function', () => {
    const s = signal(
      { x: 1, y: 2 },
      { equals: (a, b) => a.x === b.x && a.y === b.y }
    )
    const spy = vi.fn()
    s._subscribe(spy)
    s.value = { x: 1, y: 2 }
    expect(spy).not.toHaveBeenCalled()
    s.value = { x: 3, y: 4 }
    expect(spy).toHaveBeenCalledOnce()
  })

  it('unsubscribe stops notifications', () => {
    const s = signal(0)
    const spy = vi.fn()
    const unsub = s._subscribe(spy)
    s.value = 1
    expect(spy).toHaveBeenCalledOnce()
    unsub()
    s.value = 2
    expect(spy).toHaveBeenCalledOnce()
  })
})

describe('computed()', () => {
  it('derives value from a signal', () => {
    const count = signal(3)
    const doubled = computed(() => count.value * 2)
    expect(doubled.value).toBe(6)
  })

  it('updates when source signal changes', () => {
    const count = signal(1)
    const doubled = computed(() => count.value * 2)
    count.value = 5
    expect(doubled.value).toBe(10)
  })

  it('is lazy — does not compute until read', () => {
    const spy = vi.fn(() => 42)
    const c = computed(spy)
    expect(spy).not.toHaveBeenCalled()
    expect(c.value).toBe(42)
    expect(spy).toHaveBeenCalledOnce()
  })

  it('caches value between reads when dependencies unchanged', () => {
    const spy = vi.fn(() => 1)
    const c = computed(spy)
    const _a = c.value
    const _b = c.value
    const _c = c.value
    expect(spy).toHaveBeenCalledOnce()
    expect(_a).toBe(_b)
    expect(_b).toBe(_c)
  })

  it('recomputes only when dependencies actually change', () => {
    const count = signal(1)
    const spy = vi.fn(() => count.value * 2)
    const doubled = computed(spy)
    const _init = doubled.value
    expect(spy).toHaveBeenCalledOnce()
    expect(_init).toBe(2)
    count.value = 1 // same value — no notify
    const _same = doubled.value
    expect(spy).toHaveBeenCalledOnce()
    expect(_same).toBe(2)
    count.value = 2 // different value — recompute
    const _changed = doubled.value
    expect(spy).toHaveBeenCalledTimes(2)
    expect(_changed).toBe(4)
  })

  it('chains through multiple computeds', () => {
    const a = signal(2)
    const b = computed(() => a.value * 3)
    const c = computed(() => b.value + 1)
    expect(c.value).toBe(7)
    a.value = 10
    expect(c.value).toBe(31)
  })

  it('handles diamond dependency without double-fire', () => {
    const a = signal(1)
    const b = computed(() => a.value * 2)
    const c = computed(() => a.value * 3)
    const spy = vi.fn(() => b.value + c.value)
    const d = computed(spy)
    expect(d.value).toBe(5) // 2 + 3
    spy.mockClear()
    a.value = 2
    expect(d.value).toBe(10) // 4 + 6
    expect(spy).toHaveBeenCalledOnce()
  })

  it('is readonly — .value setter does not exist', () => {
    const c = computed(() => 42)
    expect(() => { (c as { value: number }).value = 99 }).toThrow()
  })

  it('peek() reads without tracking', () => {
    const count = signal(1)
    const c = computed(() => count.value)
    expect(c.peek()).toBe(1)
  })
})
