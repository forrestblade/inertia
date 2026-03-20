import type { FieldConfig } from './field-types.js'
import type { SearchConfig } from '../db/query-types.js'
import type { UploadConfig } from '../media/media-config.js'

export interface CollectionLabels {
  readonly singular: string
  readonly plural: string
}

export interface CollectionConfig {
  readonly slug: string
  readonly labels?: CollectionLabels | undefined
  readonly fields: readonly FieldConfig[]
  readonly timestamps: boolean
  readonly auth?: boolean | undefined
  readonly upload?: boolean | UploadConfig | undefined
  readonly search?: SearchConfig | undefined
}

type CollectionInput = Omit<CollectionConfig, 'timestamps'> & {
  readonly timestamps?: boolean | undefined
}

export function collection (input: CollectionInput): CollectionConfig {
  return {
    ...input,
    timestamps: input.timestamps ?? true
  }
}
