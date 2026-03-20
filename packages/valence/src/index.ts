export { defineConfig } from './define-config.js'
export type {
  ValenceConfig,
  ResolvedValenceConfig,
  ConfigError,
  OnServerContext,
  RouteHandler,
  RouteConfig,
  LoaderContext,
  LoaderResult,
  ActionContext,
  ActionResult,
  JsonValue,
  JsonPrimitive,
  JsonArray,
  JsonObject
} from './define-config.js'

export { generateCollectionRoutes, buildGeneratedRouteMap } from './route-generator.js'
export type { GeneratedRoute } from './route-generator.js'

export { generateRouteTypes, extractParams } from './codegen/route-type-generator.js'

// Re-export CMS schema primitives for convenience
export { collection, field, global } from '@valencets/cms'
