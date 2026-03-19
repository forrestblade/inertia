import type { CollectionConfig } from '@valencets/cms'

function pascalCase (slug: string): string {
  return slug
    .split(/[-_]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

function singularize (slug: string): string {
  if (slug.endsWith('ies')) return slug.slice(0, -3) + 'y'
  if (slug.endsWith('ses')) return slug.slice(0, -2)
  if (slug.endsWith('s')) return slug.slice(0, -1)
  return slug
}

export function generateApiClient (collection: CollectionConfig): string {
  const typeName = pascalCase(singularize(collection.slug))

  return `// @generated — regenerated from valence.config.ts. DO NOT EDIT.

import type { ${typeName} } from '../model/types.js'
import { apiClient } from '../../../shared/api/base-client.js'

const client = apiClient<${typeName}>('/api/${collection.slug}')

export const ${collection.slug} = {
  list: client.list,
  get: client.get,
  create: client.create,
  update: client.update,
  remove: client.remove
}
`
}
