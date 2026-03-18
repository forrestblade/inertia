// Dispatches val:interaction CustomEvents for telemetry.
// Always fires. If nobody listens, events vanish — zero cost.
// @valencets/telemetry registers a document listener when installed.

export interface InteractionBase {
  component: string
  action: string
  timestamp: number
}

export type InteractionDetail = InteractionBase & Record<string, string | number | boolean>

export function emitInteraction (
  element: HTMLElement,
  action: string,
  detail?: Record<string, string | number | boolean>
): void {
  element.dispatchEvent(new CustomEvent<InteractionDetail>('val:interaction', {
    bubbles: true,
    composed: true,
    detail: {
      ...detail,
      component: element.tagName,
      action,
      timestamp: Date.now()
    }
  }))
}
