import type { RouteHandler } from '../../../server/types.js'
import { isFragmentRequest, sendHtml } from '../../../server/router.js'
import { renderShell, renderFragment } from '../../../server/shell.js'
import { checkAuth } from './auth-middleware.js'
import { renderFleetPage } from '../templates/fleet-page.js'
import type { FleetPageMode } from '../templates/fleet-page.js'

const SHELL_BASE = {
  description: 'Fleet dashboard',
  criticalCSS: '',
  deferredCSSPath: '/css/studio.css',
  currentPath: '/admin/fleet'
}

function extractTokenFromCookie (cookieHeader: string | undefined): string | undefined {
  if (!cookieHeader) return undefined
  const match = /admin_token=([^;]+)/.exec(cookieHeader)
  return match?.[1]
}

function createFleetPageHandler (adminToken: string, mode: FleetPageMode): RouteHandler {
  return async (req, res) => {
    let authResult = checkAuth(req.headers.authorization, adminToken)

    if (authResult.isErr()) {
      const cookieToken = extractTokenFromCookie(req.headers.cookie)
      if (cookieToken) {
        authResult = checkAuth(`Bearer ${cookieToken}`, adminToken)
      }
    }

    if (authResult.isErr()) {
      sendHtml(res, 'Unauthorized', 401)
      return
    }

    const content = renderFleetPage(mode)

    const html = isFragmentRequest(req)
      ? renderFragment(content)
      : renderShell({ ...SHELL_BASE, title: 'Fleet Dashboard', mainContent: content })
    sendHtml(res, html)
  }
}

export function createFleetOverviewHandler (adminToken: string): RouteHandler {
  return createFleetPageHandler(adminToken, 'overview')
}

export function createFleetCompareHandler (adminToken: string): RouteHandler {
  return createFleetPageHandler(adminToken, 'compare')
}
