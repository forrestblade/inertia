import type { RouteHandler } from '../../../server/types.js'
import { isFragmentRequest, sendHtml } from '../../../server/router.js'
import { renderShell, renderFragment } from '../../../server/shell.js'
import { renderServices } from '../templates/services.js'

export const servicesHandler: RouteHandler = async (req, res) => {
  const mainContent = renderServices()

  if (isFragmentRequest(req)) {
    sendHtml(res, renderFragment(mainContent))
    return
  }

  const html = renderShell({
    title: 'Services',
    description: 'Web development services from Inertia — build & deploy, managed webmaster, and analytics & conversion packages.',
    criticalCSS: '',
    deferredCSSPath: '/css/studio.css',
    mainContent,
    currentPath: '/services'
  })
  sendHtml(res, html)
}
