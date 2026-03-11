import type { IncomingMessage, ServerResponse } from 'node:http'
import type { RouteEntry, RouteHandler, RouteContext, ServerError } from './types.js'
import { ServerErrorCode } from './types.js'

export interface Router {
  readonly register: (path: string, entry: RouteEntry) => void
  readonly handle: (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => Promise<void>
}

export function createRouter (): Router {
  const routes = new Map<string, RouteEntry>()

  function register (path: string, entry: RouteEntry): void {
    routes.set(path, entry)
  }

  async function handle (req: IncomingMessage, res: ServerResponse, ctx: RouteContext): Promise<void> {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
    const pathname = url.pathname
    const method = req.method ?? 'GET'

    const entry = routes.get(pathname)

    if (!entry) {
      const notFoundEntry = routes.get('/404')
      if (notFoundEntry?.GET) {
        await notFoundEntry.GET(req, res, ctx)
        return
      }
      sendError(res, {
        code: ServerErrorCode.NOT_FOUND,
        message: `Not found: ${pathname}`,
        statusCode: 404
      })
      return
    }

    const handler: RouteHandler | undefined = entry[method as keyof RouteEntry]

    if (!handler) {
      sendError(res, {
        code: ServerErrorCode.METHOD_NOT_ALLOWED,
        message: `Method ${method} not allowed on ${pathname}`,
        statusCode: 405
      })
      return
    }

    await handler(req, res, ctx)
  }

  return { register, handle }
}

export function isFragmentRequest (req: IncomingMessage): boolean {
  return req.headers['x-inertia-fragment'] === '1'
}

export function sendHtml (res: ServerResponse, html: string, statusCode: number = 200): void {
  res.writeHead(statusCode, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': Buffer.byteLength(html)
  })
  res.end(html)
}

export function sendJson (res: ServerResponse, data: unknown, statusCode: number = 200): void {
  const body = JSON.stringify(data)
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body)
  })
  res.end(body)
}

function sendError (res: ServerResponse, error: ServerError): void {
  sendHtml(res, `<h1>${error.statusCode}</h1><p>${error.message}</p>`, error.statusCode)
}

export function readBody (req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
  })
}
