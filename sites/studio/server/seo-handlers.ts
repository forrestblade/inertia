import type { RouteHandler } from './types.js'

const SITE_URL = 'https://inertiawebsolutions.com'

const PUBLIC_PAGES: ReadonlyArray<{ path: string; priority: string }> = [
  { path: '/', priority: '1.0' },
  { path: '/how-it-works', priority: '0.8' },
  { path: '/pricing', priority: '0.9' },
  { path: '/about', priority: '0.8' },
  { path: '/contact', priority: '0.7' },
  { path: '/free-site-audit', priority: '0.9' }
]

function buildSitemap (): string {
  const today = new Date().toISOString().split('T')[0] ?? ''
  const urls = PUBLIC_PAGES.map(p =>
    `  <url>\n    <loc>${SITE_URL}${p.path}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${p.priority}</priority>\n  </url>`
  ).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`
}

const ROBOTS_TXT = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`

export const sitemapHandler: RouteHandler = async (_req, res) => {
  const body = buildSitemap()
  res.writeHead(200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'public, max-age=86400'
  })
  res.end(body)
}

export const robotsHandler: RouteHandler = async (_req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(ROBOTS_TXT),
    'Cache-Control': 'public, max-age=86400'
  })
  res.end(ROBOTS_TXT)
}
