// Shared test utilities for @valencets/ui

/**
 * Flush microtask queue — needed for MutationObserver callbacks
 * which fire asynchronously.
 */
export function flushObservers (): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

/**
 * Register a custom element for testing, appending a unique suffix
 * to avoid "already defined" errors across tests.
 */
let counter = 0
export function defineTestElement<T extends CustomElementConstructor> (
  tag: string,
  ctor: T
): string {
  const unique = `${tag}-t${++counter}`
  customElements.define(unique, ctor)
  return unique
}
