import type { RouteHandler } from '../../../server/types.js'
import { isFragmentRequest, sendHtml } from '../../../server/router.js'
import { renderShell, renderFragment } from '../../../server/shell.js'
import { renderHome } from '../templates/home.js'
import { PAGE_META } from '../../seo/config/page-meta.js'

export const homeHandler: RouteHandler = async (req, res) => {
  const mainContent = renderHome()

  if (isFragmentRequest(req)) {
    sendHtml(res, renderFragment(mainContent))
    return
  }

  const html = renderShell({
    title: 'Home',
    description: PAGE_META.home.description,
    criticalCSS: '',
    deferredCSSPath: '/css/studio.css',
    mainContent,
    currentPath: '/'
  })
  sendHtml(res, html)
}
