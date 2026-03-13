interface NavigationDetail {
  readonly source: 'cache' | 'prefetch' | 'network'
  readonly durationMs: number
  readonly fromUrl: string
  readonly toUrl: string
}

// Pre-allocated counters (AV Rule 206)
interface NavCounters {
  totalNavigations: number
  cacheHits: number
  networkFetches: number
  prefetchHits: number
  cacheTotalMs: number
  networkTotalMs: number
}

export class InertiaSpeedShowcase extends HTMLElement {
  private _initialized = false
  private _counters: NavCounters = {
    totalNavigations: 0,
    cacheHits: 0,
    networkFetches: 0,
    prefetchHits: 0,
    cacheTotalMs: 0,
    networkTotalMs: 0
  }

  private _totalEl: HTMLSpanElement | null = null
  private _hitRateEl: HTMLSpanElement | null = null
  private _avgCacheEl: HTMLSpanElement | null = null
  private _avgNetworkEl: HTMLSpanElement | null = null
  private _promptEl: HTMLElement | null = null
  private _statsEl: HTMLElement | null = null
  private _onNavigated: ((e: Event) => void) | null = null

  connectedCallback (): void {
    if (this._initialized) return
    this._initialized = true

    this.innerHTML = `
      <div class="speed-showcase-inner" style="font-family:monospace;padding:24px;border:1px solid hsl(215,15%,20%);border-radius:8px;background:hsl(220,13%,8%);">
        <p class="speed-prompt" style="color:hsl(215,20%,60%);margin:0 0 16px;">Navigate between pages. Watch the difference.</p>
        <div class="speed-stats" style="display:none;gap:16px;">
          <div style="display:flex;flex-wrap:wrap;gap:24px;justify-content:space-between;">
            <div><span class="speed-label" style="color:hsl(215,20%,50%);font-size:12px;">Cache hits</span><br><span data-stat="hitRate" style="color:hsl(215,60%,55%);font-size:18px;font-weight:bold;">0%</span></div>
            <div><span class="speed-label" style="color:hsl(215,20%,50%);font-size:12px;">Avg cached</span><br><span data-stat="avgCache" style="color:hsl(160,60%,45%);font-size:18px;font-weight:bold;">0ms</span></div>
            <div><span class="speed-label" style="color:hsl(215,20%,50%);font-size:12px;">Avg network</span><br><span data-stat="avgNetwork" style="color:hsl(200,60%,50%);font-size:18px;font-weight:bold;">0ms</span></div>
            <div><span class="speed-label" style="color:hsl(215,20%,50%);font-size:12px;">Total navigations</span><br><span data-stat="total" style="color:hsl(215,20%,70%);font-size:18px;font-weight:bold;">0</span></div>
          </div>
        </div>
      </div>
    `

    this._promptEl = this.querySelector('.speed-prompt')
    this._statsEl = this.querySelector('.speed-stats')
    this._totalEl = this.querySelector('[data-stat="total"]')
    this._hitRateEl = this.querySelector('[data-stat="hitRate"]')
    this._avgCacheEl = this.querySelector('[data-stat="avgCache"]')
    this._avgNetworkEl = this.querySelector('[data-stat="avgNetwork"]')

    this._onNavigated = (e: Event) => {
      const detail = (e as CustomEvent).detail as NavigationDetail | undefined
      if (detail === undefined) return
      this._recordNavigation(detail)
    }
    document.addEventListener('inertia:navigated', this._onNavigated)
  }

  connectedMoveCallback (): void {
    // No-op — preserve state across moveBefore()
  }

  disconnectedCallback (): void {
    if (this._onNavigated !== null) {
      document.removeEventListener('inertia:navigated', this._onNavigated)
      this._onNavigated = null
    }
  }

  private _recordNavigation (detail: NavigationDetail): void {
    const c = this._counters
    c.totalNavigations++

    const handlers: Record<string, () => void> = {
      cache: () => { c.cacheHits++; c.cacheTotalMs += detail.durationMs },
      prefetch: () => { c.prefetchHits++; c.cacheTotalMs += detail.durationMs },
      network: () => { c.networkFetches++; c.networkTotalMs += detail.durationMs }
    }
    handlers[detail.source]?.()

    this._updateDisplay()
  }

  private _updateDisplay (): void {
    const c = this._counters

    // Show stats, hide prompt
    if (this._promptEl !== null) this._promptEl.style.display = 'none'
    if (this._statsEl !== null) this._statsEl.style.display = 'block'

    if (this._totalEl !== null) {
      this._totalEl.textContent = String(c.totalNavigations)
    }

    if (this._hitRateEl !== null) {
      const cachedTotal = c.cacheHits + c.prefetchHits
      const rate = c.totalNavigations > 0
        ? Math.round((cachedTotal / c.totalNavigations) * 100)
        : 0
      this._hitRateEl.textContent = `${String(rate)}%`
    }

    if (this._avgCacheEl !== null) {
      const cachedCount = c.cacheHits + c.prefetchHits
      const avg = cachedCount > 0 ? Math.round(c.cacheTotalMs / cachedCount) : 0
      this._avgCacheEl.textContent = `${String(avg)}ms`
    }

    if (this._avgNetworkEl !== null) {
      const avg = c.networkFetches > 0 ? Math.round(c.networkTotalMs / c.networkFetches) : 0
      this._avgNetworkEl.textContent = `${String(avg)}ms`
    }
  }
}

customElements.define('inertia-speed-showcase', InertiaSpeedShowcase)
