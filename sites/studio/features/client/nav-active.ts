export interface NavActiveHandle {
  destroy: () => void
}

export function initNavActive (): NavActiveHandle {
  const onNavigated = (): void => {
    const links = document.querySelectorAll('nav a[href]:not(.nav-brand)')
    const pathname = window.location.pathname

    for (const link of links) {
      const href = link.getAttribute('href') ?? ''
      if (href === pathname) {
        link.classList.add('nav-active')
        link.setAttribute('aria-current', 'page')
      } else {
        link.classList.remove('nav-active')
        link.removeAttribute('aria-current')
      }
    }
  }

  document.addEventListener('inertia:navigated', onNavigated)

  return {
    destroy () {
      document.removeEventListener('inertia:navigated', onNavigated)
    }
  }
}
