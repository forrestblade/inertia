import { parse as parseQs } from 'node:querystring'
import type { RouteHandler, RouteContext } from '../../../server/types.js'
import { respondWithPage } from '../../../server/page-helpers.js'
import { readBody } from '../../../server/router.js'
import { checkAuth } from './auth-middleware.js'
import { authenticateRequest } from './auth-helpers.js'
import { renderHudPage } from '../templates/hud-page.js'
import { renderLoginForm } from '../templates/login-form.js'

const pageBase = {
  description: 'Admin dashboard',
  deferredCSSPath: '/css/studio.css',
  currentPath: '/admin/hud'
}

function showLogin (req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse, ctx: RouteContext, error?: string): void {
  respondWithPage(req, res, ctx, {
    ...pageBase,
    title: 'Admin Login',
    mainContent: renderLoginForm(error)
  }, 401)
}

export function createHudHandler (adminToken: string): RouteHandler {
  return async (req, res, ctx) => {
    const authResult = authenticateRequest(req.headers, adminToken)

    if (authResult.isErr()) {
      showLogin(req, res, ctx)
      return
    }

    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
    const diagnostics = url.searchParams.get('diagnostics') === '1'

    respondWithPage(req, res, ctx, {
      ...pageBase,
      title: 'Dashboard',
      mainContent: renderHudPage(diagnostics)
    })
  }
}

export function createHudPostHandler (adminToken: string): RouteHandler {
  return async (req, res, ctx) => {
    const body = await readBody(req)
    const parsed = parseQs(body)
    const token = String(parsed['token'] ?? '')

    const authResult = checkAuth(`Bearer ${token}`, adminToken)

    if (authResult.isErr()) {
      showLogin(req, res, ctx, 'Invalid token. Please try again.')
      return
    }

    // Set auth cookie and redirect
    res.writeHead(302, {
      'Set-Cookie': `admin_token=${token}; HttpOnly; SameSite=Strict; Path=/admin`,
      Location: '/admin/hud'
    })
    res.end()
  }
}
