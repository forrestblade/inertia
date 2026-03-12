import type { RouteHandler } from '../../../server/types.js'
import { respondWithPage } from '../../../server/page-helpers.js'
import { renderHome } from '../templates/home.js'
import { PAGE_META } from '../../seo/config/page-meta.js'

export const homeHandler: RouteHandler = async (req, res, ctx) => {
  respondWithPage(req, res, ctx, {
    title: 'Home',
    description: PAGE_META.home.description,
    deferredCSSPath: '/css/studio.css',
    mainContent: renderHome(),
    currentPath: '/'
  })
}
