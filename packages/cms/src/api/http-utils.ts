import type { IncomingMessage, ServerResponse } from 'node:http'
import { ResultAsync } from 'neverthrow'
import { CmsErrorCode } from '../schema/types.js'
import type { CmsError } from '../schema/types.js'
import type { DocumentData } from '../db/query-builder.js'

const MAX_BODY_BYTES = 1_048_576

export function sendJson (res: ServerResponse, data: DocumentData | readonly DocumentData[], statusCode: number = 200): void {
  const body = JSON.stringify(data)
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body)
  })
  res.end(body)
}

export function sendErrorJson (res: ServerResponse, message: string, statusCode: number): void {
  const body = JSON.stringify({ error: message })
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body)
  })
  res.end(body)
}

export function safeReadBody (req: IncomingMessage): ResultAsync<string, CmsError> {
  return ResultAsync.fromPromise(
    new Promise<string>((resolve, reject) => {
      const chunks: Buffer[] = []
      let received = 0
      req.on('data', (chunk: Buffer) => {
        received += chunk.length
        if (received > MAX_BODY_BYTES) {
          req.removeAllListeners('data')
          reject(new Error(`Body exceeds ${MAX_BODY_BYTES} bytes`))
          return
        }
        chunks.push(chunk)
      })
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
      req.on('error', (e: Error) => reject(e))
    }),
    (e: unknown): CmsError => ({
      code: CmsErrorCode.INVALID_INPUT,
      message: e instanceof Error ? e.message : 'Failed to read request body'
    })
  )
}

export function safeJsonParse (body: string): ResultAsync<DocumentData, CmsError> {
  return ResultAsync.fromPromise(
    Promise.resolve().then(() => JSON.parse(body) as DocumentData),
    (): CmsError => ({
      code: CmsErrorCode.INVALID_INPUT,
      message: 'Invalid JSON in request body'
    })
  )
}
