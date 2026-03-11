let idCounter = 0

export class TrackingButton extends HTMLElement {
  static observedAttributes = ['type', 'target', 'persist']

  connectedCallback (): void {
    const type = this.getAttribute('type') ?? 'CLICK'
    this.setAttribute('data-telemetry-type', type)

    const target = this.getAttribute('target')
    if (target !== null) {
      this.setAttribute('data-telemetry-target', target)
    }

    if (this.hasAttribute('persist')) {
      this.setAttribute('data-inertia-persist', '')
      if (this.id === '') {
        this.id = `inertia-button-${String(idCounter++)}`
      }
    }

    this.setAttribute('role', 'group')
  }

  disconnectedCallback (): void {
    // Intentional no-op — cleanup reserved for future use
  }

  connectedMoveCallback (): void {
    // Intentional no-op — signals move-awareness to router
  }

  attributeChangedCallback (name: string, _oldValue: string | null, newValue: string | null): void {
    const attrMap: Record<string, string> = {
      type: 'data-telemetry-type',
      target: 'data-telemetry-target'
    }

    const mapped = attrMap[name]
    if (mapped !== undefined) {
      if (newValue !== null) {
        this.setAttribute(mapped, newValue)
      } else {
        this.removeAttribute(mapped)
      }
      return
    }

    if (name === 'persist') {
      if (newValue !== null) {
        this.setAttribute('data-inertia-persist', '')
        if (this.id === '') {
          this.id = `inertia-button-${String(idCounter++)}`
        }
      } else {
        this.removeAttribute('data-inertia-persist')
      }
    }
  }
}

customElements.define('inertia-button', TrackingButton)
