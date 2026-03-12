import type { RouteHandler } from '../../../server/types.js'
import { respondWithPage } from '../../../server/page-helpers.js'
import { renderAbout } from '../templates/about.js'
import { PAGE_META } from '../../seo/config/page-meta.js'

export const aboutHandler: RouteHandler = async (req, res, ctx) => {
  respondWithPage(req, res, ctx, {
    title: 'About',
    description: PAGE_META.about.description,
    deferredCSSPath: '/css/studio.css',
    mainContent: renderAbout(),
    currentPath: '/about'
  })
}
