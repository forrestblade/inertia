import { createIngestionPipeline, createAsyncIngestionPipeline } from './pipeline.js'
import type { PersistFn, AsyncPersistFn, IngestionError } from './pipeline.js'

export interface IngestionResponse {
  readonly status: 200
  readonly body: string
}

export interface AuditEntry {
  readonly timestamp: number
  readonly code: string
  readonly message: string
  readonly raw: string | undefined
}

export type AuditFn = (entry: AuditEntry) => void

function auditFailure (audit: AuditFn, failure: IngestionError): void {
  audit({
    timestamp: Date.now(),
    code: failure.code,
    message: failure.message,
    raw: failure.code === 'PARSE_FAILURE' ? failure.raw : undefined
  })
}

const successResponse = (persisted: number): IngestionResponse => ({
  status: 200,
  body: JSON.stringify({ ok: true, persisted })
})

const errorResponse: IngestionResponse = {
  status: 200,
  body: JSON.stringify({ ok: true })
}

export function createIngestionHandler (
  persist: PersistFn,
  audit: AuditFn
): (requestBody: string) => IngestionResponse {
  const pipeline = createIngestionPipeline(persist)

  return (requestBody: string): IngestionResponse => {
    const result = pipeline(requestBody)

    return result.match(
      (pipelineResult): IngestionResponse => successResponse(pipelineResult.persisted),
      (failure): IngestionResponse => {
        auditFailure(audit, failure)
        return errorResponse
      }
    )
  }
}

export function createAsyncIngestionHandler (
  persist: AsyncPersistFn,
  audit: AuditFn
): (requestBody: string) => Promise<IngestionResponse> {
  const pipeline = createAsyncIngestionPipeline(persist)

  return async (requestBody: string): Promise<IngestionResponse> => {
    const result = await pipeline(requestBody)

    return result.match(
      (pipelineResult): IngestionResponse => successResponse(pipelineResult.persisted),
      (failure): IngestionResponse => {
        auditFailure(audit, failure)
        return errorResponse
      }
    )
  }
}
