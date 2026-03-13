export function initMobileTabs (): void {
  document.body.addEventListener('click', (e: Event) => {
    const target = (e.target as Element).closest('.mobile-tab') as HTMLElement | null
    if (!target) return

    const container = target.closest('.mobile-comparison') as HTMLElement | null
    if (!container) return

    const tabKey = target.dataset.tab
    if (!tabKey) return

    const tabs = container.querySelectorAll('.mobile-tab')
    const panels = container.querySelectorAll('.mobile-panel')

    for (const tab of tabs) {
      tab.classList.remove('active')
    }
    target.classList.add('active')

    for (const panel of panels) {
      if ((panel as HTMLElement).dataset.panel === tabKey) {
        panel.classList.add('active')
      } else {
        panel.classList.remove('active')
      }
    }
  })
}
