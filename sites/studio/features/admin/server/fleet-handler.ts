import type { RouteHandler, RouteContext } from '../../../server/types.js'
import { respondWithPage } from '../../../server/page-helpers.js'
import { authenticateRequest } from './auth-helpers.js'
import { renderFleetPage } from '../templates/fleet-page.js'
import type { FleetPageMode } from '../templates/fleet-page.js'
import { renderLoginForm } from '../templates/login-form.js'

const pageBase = {
  description: 'Fleet dashboard',
  deferredCSSPath: '/css/studio.css',
  currentPath: '/admin/fleet'
}

function showLogin (req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse, ctx: RouteContext, error?: string): void {
  respondWithPage(req, res, ctx, {
    ...pageBase,
    title: 'Admin Login',
    mainContent: renderLoginForm(error)
  }, 401)
}

function createFleetPageHandler (adminToken: string, mode: FleetPageMode): RouteHandler {
  return async (req, res, ctx) => {
    const authResult = authenticateRequest(req.headers, adminToken)

    if (authResult.isErr()) {
      showLogin(req, res, ctx)
      return
    }

    respondWithPage(req, res, ctx, {
      ...pageBase,
      title: 'Fleet Dashboard',
      mainContent: renderFleetPage(mode)
    })
  }
}

export function createFleetOverviewHandler (adminToken: string): RouteHandler {
  return createFleetPageHandler(adminToken, 'overview')
}

export function createFleetCompareHandler (adminToken: string): RouteHandler {
  return createFleetPageHandler(adminToken, 'compare')
}
