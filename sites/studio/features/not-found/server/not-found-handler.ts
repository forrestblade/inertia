import type { RouteHandler } from '../../../server/types.js'
import { isFragmentRequest, sendHtml } from '../../../server/router.js'
import { renderShell, renderFragment } from '../../../server/shell.js'
import { renderNotFound } from '../templates/not-found.js'

export const notFoundHandler: RouteHandler = async (req, res) => {
  const mainContent = renderNotFound()

  if (isFragmentRequest(req)) {
    sendHtml(res, renderFragment(mainContent), 404)
    return
  }

  const html = renderShell({
    title: '404 — Not Found',
    description: 'Page not found.',
    criticalCSS: '',
    deferredCSSPath: '/css/studio.css',
    mainContent,
    currentPath: ''
  })
  sendHtml(res, html, 404)
}
