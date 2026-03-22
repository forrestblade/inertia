// @valencets/reactive — DOM hydration bindings.
// Attaches signals to server-rendered markup. Not a template engine.

import type { Signal, ReadonlySignal } from './core.js'

export interface BindingMap {
  readonly text?: ReadonlySignal<string>
  readonly value?: Signal<string>
  readonly checked?: Signal<boolean>
  readonly visible?: ReadonlySignal<boolean>
  readonly class?: Readonly<Record<string, ReadonlySignal<boolean>>>
  readonly attr?: Readonly<Record<string, ReadonlySignal<string | null>>>
  readonly disabled?: ReadonlySignal<boolean>
}

// Placeholder — bind() not yet implemented
export function bind (_el: Element, _bindings: BindingMap): () => void {
  return () => {}
}
