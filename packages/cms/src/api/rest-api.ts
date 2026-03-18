import type { IncomingMessage, ServerResponse } from 'node:http'
import type { DbPool } from '@valencets/db'
import type { CollectionRegistry, GlobalRegistry } from '../schema/registry.js'
import { createLocalApi } from './local-api.js'
import { sendJson, sendErrorJson, safeReadBody, safeJsonParse } from './http-utils.js'
import type { DocumentData } from '../db/query-builder.js'
import { generateZodSchema, generatePartialSchema } from '../validation/zod-generator.js'

export type RestRouteHandler = (req: IncomingMessage, res: ServerResponse, ctx: Record<string, string>) => Promise<void>

export interface RestRouteEntry {
  readonly GET?: RestRouteHandler | undefined
  readonly POST?: RestRouteHandler | undefined
  readonly PATCH?: RestRouteHandler | undefined
  readonly DELETE?: RestRouteHandler | undefined
}

export function createRestRoutes (
  pool: DbPool,
  collections: CollectionRegistry,
  globals: GlobalRegistry
): Map<string, RestRouteEntry> {
  const api = createLocalApi(pool, collections, globals)
  const routes = new Map<string, RestRouteEntry>()

  for (const col of collections.getAll()) {
    const slug = col.slug
    const zodSchema = generateZodSchema(col.fields)

    routes.set(`/api/${slug}`, {
      GET: async (_req, res) => {
        const result = await api.find({ collection: slug })
        result.match(
          (docs) => sendJson(res, docs as DocumentData[]),
          (err) => sendErrorJson(res, err.message, 500)
        )
      },
      POST: async (req, res) => {
        const bodyResult = await safeReadBody(req)
        if (bodyResult.isErr()) { sendErrorJson(res, bodyResult.error.message, 400); return }
        const parseResult = await safeJsonParse(bodyResult.value)
        if (parseResult.isErr()) { sendErrorJson(res, parseResult.error.message, 400); return }
        const validation = zodSchema.safeParse(parseResult.value)
        if (!validation.success) {
          const issues = validation.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')
          sendErrorJson(res, `Validation failed: ${issues}`, 400)
          return
        }
        const result = await api.create({ collection: slug, data: parseResult.value })
        result.match(
          (doc) => sendJson(res, doc as DocumentData, 201),
          (err) => sendErrorJson(res, err.message, 400)
        )
      }
    })

    routes.set(`/api/${slug}/:id`, {
      GET: async (req, res) => {
        const id = req.url?.split('/').pop() ?? ''
        const result = await api.findByID({ collection: slug, id })
        result.match(
          (doc) => doc ? sendJson(res, doc as DocumentData) : sendErrorJson(res, 'Not found', 404),
          (err) => sendErrorJson(res, err.message, 500)
        )
      },
      PATCH: async (req, res) => {
        const id = req.url?.split('/').pop() ?? ''
        const bodyResult = await safeReadBody(req)
        if (bodyResult.isErr()) { sendErrorJson(res, bodyResult.error.message, 400); return }
        const parseResult = await safeJsonParse(bodyResult.value)
        if (parseResult.isErr()) { sendErrorJson(res, parseResult.error.message, 400); return }
        const partialSchema = generatePartialSchema(col.fields)
        const validation = partialSchema.safeParse(parseResult.value)
        if (!validation.success) {
          const issues = validation.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')
          sendErrorJson(res, `Validation failed: ${issues}`, 400)
          return
        }
        const result = await api.update({ collection: slug, id, data: parseResult.value })
        result.match(
          (doc) => sendJson(res, doc as DocumentData),
          (err) => sendErrorJson(res, err.message, 400)
        )
      },
      DELETE: async (req, res) => {
        const id = req.url?.split('/').pop() ?? ''
        const result = await api.delete({ collection: slug, id })
        result.match(
          (doc) => sendJson(res, doc as DocumentData),
          (err) => sendErrorJson(res, err.message, 500)
        )
      }
    })
  }

  return routes
}
