import type { CollectionConfig } from '@valencets/cms'
import type { RouteConfig } from './define-config.js'

export interface GeneratedRoute {
  readonly path: string
  readonly method: string
  readonly collection: string
  readonly type: 'list' | 'detail'
}

const customPathSet = (customRoutes: readonly RouteConfig[] | undefined): ReadonlySet<string> => {
  if (customRoutes === undefined) return new Set()
  return new Set(customRoutes.map((r) => r.path))
}

export function generateCollectionRoutes (
  collections: readonly CollectionConfig[],
  customRoutes?: readonly RouteConfig[] | undefined
): readonly GeneratedRoute[] {
  const overriddenPaths = customPathSet(customRoutes)
  const routes: GeneratedRoute[] = []

  for (const col of collections) {
    const listPath = `/${col.slug}`
    const detailPath = `/${col.slug}/:id`

    if (!overriddenPaths.has(listPath)) {
      routes.push({ path: listPath, method: 'GET', collection: col.slug, type: 'list' })
    }

    if (!overriddenPaths.has(detailPath)) {
      routes.push({ path: detailPath, method: 'GET', collection: col.slug, type: 'detail' })
    }
  }

  return routes
}
