import type { RouteHandler } from '../../../server/types.js'
import { isFragmentRequest, sendHtml } from '../../../server/router.js'
import { renderShell, renderFragment } from '../../../server/shell.js'
import { renderAbout } from '../templates/about.js'
import { PAGE_META } from '../../seo/config/page-meta.js'

export const aboutHandler: RouteHandler = async (req, res) => {
  const mainContent = renderAbout()

  if (isFragmentRequest(req)) {
    sendHtml(res, renderFragment(mainContent))
    return
  }

  const html = renderShell({
    title: 'About',
    description: PAGE_META.about.description,
    criticalCSS: '',
    deferredCSSPath: '/css/studio.css',
    mainContent,
    currentPath: '/about'
  })
  sendHtml(res, html)
}
