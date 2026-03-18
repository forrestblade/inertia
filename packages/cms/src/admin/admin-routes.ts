import type { IncomingMessage, ServerResponse } from 'node:http'
import { ResultAsync } from 'neverthrow'
import { CmsErrorCode } from '../schema/types.js'
import type { CmsError } from '../schema/types.js'
import type { DbPool } from '@valencets/db'
import type { CollectionRegistry } from '../schema/registry.js'
import type { RestRouteEntry } from '../api/rest-api.js'
import { renderLayout } from './layout.js'
import { renderDashboard } from './dashboard.js'
import { renderListView } from './list-view.js'
import { renderEditView } from './edit-view.js'
import { createLocalApi } from '../api/local-api.js'
import { createGlobalRegistry } from '../schema/registry.js'
import { validateSession } from '../auth/session.js'
import { parseCookie } from '../auth/cookie.js'
import { generateCsrfToken } from '../auth/csrf.js'
import { escapeHtml } from './escape.js'

type AdminRouteHandler = (req: IncomingMessage, res: ServerResponse, ctx: Record<string, string>) => Promise<void>

interface AdminOptions {
  readonly requireAuth?: boolean | undefined
}

function wrapWithAuth (pool: DbPool, handler: AdminRouteHandler): AdminRouteHandler {
  return async (req, res, ctx) => {
    const cookieHeader = req.headers.cookie ?? ''
    const sessionId = parseCookie(cookieHeader, 'cms_session')
    if (!sessionId) {
      res.writeHead(401, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Unauthorized' }))
      return
    }
    const result = await validateSession(sessionId, pool)
    if (result.isErr()) {
      res.writeHead(401, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Unauthorized' }))
      return
    }
    return handler(req, res, ctx)
  }
}

import type { DocumentData } from '../db/query-builder.js'

function safeReadFormBody (req: IncomingMessage): ResultAsync<DocumentData, CmsError> {
  return ResultAsync.fromPromise(
    new Promise<string>((resolve, reject) => {
      const chunks: Buffer[] = []
      let received = 0
      req.on('data', (chunk: Buffer) => {
        received += chunk.length
        if (received > 1_048_576) { req.removeAllListeners('data'); reject(new Error('Body too large')); return }
        chunks.push(chunk)
      })
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
      req.on('error', (e: Error) => reject(e))
    }),
    (e: unknown): CmsError => ({
      code: CmsErrorCode.INVALID_INPUT,
      message: e instanceof Error ? e.message : 'Failed to read body'
    })
  ).map((body) => {
    const params = new URLSearchParams(body)
    const data: Record<string, string> = {}
    for (const [key, value] of params.entries()) {
      data[key] = value
    }
    return data as DocumentData
  })
}

function sendHtml (res: ServerResponse, html: string, statusCode: number = 200): void {
  res.writeHead(statusCode, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': Buffer.byteLength(html)
  })
  res.end(html)
}

export function createAdminRoutes (
  pool: DbPool,
  collections: CollectionRegistry,
  options: AdminOptions = {}
): Map<string, RestRouteEntry> {
  const wrap = options.requireAuth
    ? (handler: AdminRouteHandler): AdminRouteHandler => wrapWithAuth(pool, handler)
    : (handler: AdminRouteHandler): AdminRouteHandler => handler
  const routes = new Map<string, RestRouteEntry>()
  const allCollections = collections.getAll()
  const globals = createGlobalRegistry()
  const api = createLocalApi(pool, collections, globals)
  const csrfTokens = new Map<string, number>()

  routes.set('/admin', {
    GET: wrap(async (_req, res) => {
      const content = renderDashboard(allCollections)
      const html = renderLayout({ title: 'Dashboard', content, collections: allCollections })
      sendHtml(res, html)
    })
  })

  for (const col of allCollections) {
    routes.set(`/admin/${col.slug}`, {
      GET: wrap(async (_req, res) => {
        const result = await api.find({ collection: col.slug })
        const docs = result.match(
          (rows) => rows as Array<{ id: string, [key: string]: string | number | boolean | null }>,
          () => []
        )
        const content = renderListView(col, docs)
        const html = renderLayout({
          title: col.labels?.plural ?? col.slug,
          content,
          collections: allCollections
        })
        sendHtml(res, html)
      })
    })

    routes.set(`/admin/${col.slug}/new`, {
      GET: wrap(async (_req, res) => {
        const token = generateCsrfToken()
        csrfTokens.set(token, Date.now())
        const content = renderEditView(col, null, token)
        const html = renderLayout({
          title: `New ${col.labels?.singular ?? col.slug}`,
          content,
          collections: allCollections
        })
        sendHtml(res, html)
      }),
      POST: wrap(async (req, res) => {
        const bodyResult = await safeReadFormBody(req)
        if (bodyResult.isErr()) { sendHtml(res, 'Bad request', 400); return }
        const formData = bodyResult.value
        const submittedToken = String(formData._csrf ?? '')
        if (!submittedToken || !csrfTokens.has(submittedToken)) {
          res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' })
          res.end('Forbidden: invalid CSRF token')
          return
        }
        csrfTokens.delete(submittedToken)
        const { _csrf, ...data } = formData
        const result = await api.create({ collection: col.slug, data })
        result.match(
          () => {
            res.writeHead(302, { Location: `/admin/${col.slug}` })
            res.end()
          },
          (err) => sendHtml(res, `Error: ${escapeHtml(err.message)}`, 400)
        )
      })
    })
  }

  return routes
}
