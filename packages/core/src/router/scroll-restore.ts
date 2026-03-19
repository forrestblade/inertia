export interface ScrollRestoreHandle {
  readonly saveCurrentPosition: () => void
  readonly restorePosition: () => void
  readonly scrollToHash: (hash: string) => boolean
  readonly destroy: () => void
}

interface ScrollState {
  readonly scrollX: number
  readonly scrollY: number
}

function hasScrollState (state: unknown): state is ScrollState {
  if (state === null || typeof state !== 'object') return false
  const s = state as Record<string, unknown>
  return typeof s['scrollX'] === 'number' && typeof s['scrollY'] === 'number'
}

export function initScrollRestore (): ScrollRestoreHandle {
  function saveCurrentPosition (): void {
    const currentState = (history.state ?? {}) as Record<string, unknown>
    history.replaceState(
      { ...currentState, scrollX: window.scrollX, scrollY: window.scrollY },
      ''
    )
  }

  function restorePosition (): void {
    const state = history.state as unknown
    if (!hasScrollState(state)) return
    window.scrollTo(state.scrollX, state.scrollY)
  }

  function scrollToHash (hash: string): boolean {
    if (hash === '' || hash === '#') return false
    const id = hash.startsWith('#') ? hash.slice(1) : hash
    const element = document.getElementById(id)
    if (element === null) return false
    element.scrollIntoView()
    return true
  }

  function destroy (): void {
    // No listeners to clean up currently
  }

  return {
    saveCurrentPosition,
    restorePosition,
    scrollToHash,
    destroy
  }
}
