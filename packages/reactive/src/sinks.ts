// @valencets/reactive — CMS field sinks and condition bridge.

import type { Signal, ReadonlySignal } from './core.js'
import { signal, computed } from './core.js'

export interface FieldSink<T> {
  readonly value: Signal<T>
  readonly visible: Signal<boolean>
  readonly error: Signal<string | null>
}

/** Create a field sink with value, visible, and error signals. */
export function fieldSink<T> (initial: T): FieldSink<T> {
  return {
    value: signal(initial),
    visible: signal(true),
    error: signal<string | null>(null)
  }
}

/** Bridge a condition config to a computed boolean signal.
 *  Reads all deps inside a computed — auto-tracks them. */
export function condition<T extends readonly Signal<unknown>[]> (
  deps: [...T],
  fn: (...vals: { [K in keyof T]: T[K] extends Signal<infer V> ? V : never }) => boolean
): ReadonlySignal<boolean> {
  return computed(() => {
    const vals = deps.map(d => d.value) as { [K in keyof T]: T[K] extends Signal<infer V> ? V : never }
    return fn(...vals)
  })
}
