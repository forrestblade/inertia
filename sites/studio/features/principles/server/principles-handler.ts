import type { RouteHandler } from '../../../server/types.js'
import { respondWithPage } from '../../../server/page-helpers.js'
import { renderPrinciples } from '../templates/principles.js'
import { PAGE_META } from '../../seo/config/page-meta.js'

export const principlesHandler: RouteHandler = async (req, res, ctx) => {
  respondWithPage(req, res, ctx, {
    title: 'How It Works',
    description: PAGE_META['how-it-works'].description,
    deferredCSSPath: '/css/studio.css',
    mainContent: renderPrinciples(),
    currentPath: '/how-it-works'
  })
}
