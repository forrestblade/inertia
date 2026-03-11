export interface ShellOptions {
  readonly title: string
  readonly description: string
  readonly criticalCSS: string
  readonly deferredCSSPath: string
  readonly mainContent: string
  readonly currentPath: string
}

const NAV_LINKS: ReadonlyArray<{ readonly href: string; readonly label: string }> = [
  { href: '/', label: 'Home' },
  { href: '/principles', label: 'Principles' },
  { href: '/services', label: 'Services' },
  { href: '/audit', label: 'Audit' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' }
]

function renderNav (currentPath: string): string {
  const links = NAV_LINKS.map((link) => {
    const active = link.href === currentPath ? ' aria-current="page" class="nav-active"' : ''
    return `<a href="${link.href}" data-telemetry-type="INTENT_NAVIGATE" data-telemetry-target="nav-${link.label.toLowerCase()}"${active}>${link.label}</a>`
  }).join('\n        ')

  return `<nav aria-label="Main navigation">
      <div class="nav-inner">
        <a href="/" class="nav-brand" aria-label="Inertia Web Solutions home">Inertia</a>
        ${links}
      </div>
    </nav>`
}

export function renderShell (options: ShellOptions): string {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${options.title} | Inertia Web Solutions</title>
  <meta name="description" content="${options.description}">
  <style>${options.criticalCSS}</style>
  <link rel="stylesheet" href="${options.deferredCSSPath}" media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="${options.deferredCSSPath}"></noscript>
</head>
<body>
  <header>
    ${renderNav(options.currentPath)}
  </header>
  <main id="main-content">
    ${options.mainContent}
  </main>
  <footer>
    <div class="footer-inner">
      <p>&copy; ${new Date().getFullYear()} Inertia Web Solutions. All rights reserved.</p>
      <p class="footer-hardware">Served from a Raspberry Pi 5 — your website can too.</p>
    </div>
  </footer>
  <script type="module" src="/js/boot.js" defer></script>
</body>
</html>`
}

export function renderFragment (mainContent: string): string {
  return mainContent
}
