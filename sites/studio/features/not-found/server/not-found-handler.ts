import type { RouteHandler } from '../../../server/types.js'
import { respondWithPage } from '../../../server/page-helpers.js'
import { renderNotFound } from '../templates/not-found.js'

export const notFoundHandler: RouteHandler = async (req, res, ctx) => {
  respondWithPage(req, res, ctx, {
    title: '404 - Not Found',
    description: 'Page not found.',
    deferredCSSPath: '/css/studio.css',
    mainContent: renderNotFound(),
    currentPath: ''
  }, 404)
}
