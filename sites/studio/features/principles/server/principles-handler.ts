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
    title: 'Principles',
    description: PAGE_META.principles.description,
    criticalCSS: '',
    deferredCSSPath: '/css/studio.css',
    mainContent,
    currentPath: '/principles'
  })
  sendHtml(res, html)
}
