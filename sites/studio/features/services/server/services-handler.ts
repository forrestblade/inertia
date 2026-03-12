import type { RouteHandler } from '../../../server/types.js'
import { respondWithPage } from '../../../server/page-helpers.js'
import { renderServices } from '../templates/services.js'
import { PAGE_META } from '../../seo/config/page-meta.js'

export const servicesHandler: RouteHandler = async (req, res, ctx) => {
  respondWithPage(req, res, ctx, {
    title: 'Pricing',
    description: PAGE_META.pricing.description,
    deferredCSSPath: '/css/studio.css',
    mainContent: renderServices(),
    currentPath: '/pricing'
  })
}
