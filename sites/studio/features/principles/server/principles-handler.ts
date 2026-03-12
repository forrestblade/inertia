import type { RouteHandler } from '../../../server/types.js'
import { isFragmentRequest, sendHtml } from '../../../server/router.js'
import { renderShell, renderFragment } from '../../../server/shell.js'
import { renderPrinciples } from '../templates/principles.js'
import { PAGE_META } from '../../seo/config/page-meta.js'

export const principlesHandler: RouteHandler = async (req, res) => {
  const mainContent = renderPrinciples()

  if (isFragmentRequest(req)) {
    sendHtml(res, renderFragment(mainContent))
    return
  }

  const html = renderShell({
    title: 'How It Works',
    description: PAGE_META['how-it-works'].description,
    criticalCSS: '',
    deferredCSSPath: '/css/studio.css',
    mainContent,
    currentPath: '/how-it-works'
  })
  sendHtml(res, html)
}
