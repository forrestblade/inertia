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
  collections: CollectionRegistry
): Map<string, RestRouteEntry> {
  const routes = new Map<string, RestRouteEntry>()
  const allCollections = collections.getAll()
  const globals = createGlobalRegistry()
  const api = createLocalApi(pool, collections, globals)

  routes.set('/admin', {
    GET: async (_req, res) => {
      const content = renderDashboard(allCollections)
      const html = renderLayout({ title: 'Dashboard', content, collections: allCollections })
      sendHtml(res, html)
    }
  })

  for (const col of allCollections) {
    routes.set(`/admin/${col.slug}`, {
      GET: async (_req, res) => {
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
      }
    })

    routes.set(`/admin/${col.slug}/new`, {
      GET: async (_req, res) => {
        const content = renderEditView(col, null)
        const html = renderLayout({
          title: `New ${col.labels?.singular ?? col.slug}`,
          content,
          collections: allCollections
        })
        sendHtml(res, html)
      },
      POST: async (req, res) => {
        const bodyResult = await safeReadFormBody(req)
        if (bodyResult.isErr()) { sendHtml(res, 'Bad request', 400); return }
        const result = await api.create({ collection: col.slug, data: bodyResult.value })
        result.match(
          () => {
            res.writeHead(302, { Location: `/admin/${col.slug}` })
            res.end()
          },
          (err) => sendHtml(res, `Error: ${err.message}`, 400)
        )
      }
    })
  }

  return routes
}
