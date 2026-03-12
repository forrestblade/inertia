export type FleetPageMode = 'overview' | 'compare'

export function renderFleetPage (mode: FleetPageMode): string {
  const componentMap: Record<FleetPageMode, string> = {
    overview: '<hud-fleet-dashboard></hud-fleet-dashboard>',
    compare: '<hud-fleet-comparison></hud-fleet-comparison>'
  }

  const component = componentMap[mode]

  return `
    <section class="section">
      <div class="container">
        <h1 class="hero-title">Fleet Dashboard</h1>
        ${component}
      </div>
    </section>
    <script src="/js/admin.js" defer></script>
  `
}
