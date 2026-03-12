import type { IncomingMessage, ServerResponse } from 'node:http'
import { isFragmentRequest, sendHtml } from './router.js'
import { renderShell, renderFragment, BOOT_VERSION } from './shell.js'
import type { RouteContext } from './types.js'

export interface PageOptions {
  readonly title: string
  readonly description: string
  readonly deferredCSSPath: string
  readonly mainContent: string
  readonly currentPath: string
}

function buildPageHeaders (title: string): Record<string, string> {
  return {
    'X-Inertia-Version': BOOT_VERSION,
    'X-Inertia-Title': `${title} | Inertia Web Solutions`
  }
}

export function respondWithPage (
  req: IncomingMessage,
  res: ServerResponse,
  ctx: RouteContext,
  options: PageOptions,
  statusCode?: number
): void {
  const headers = buildPageHeaders(options.title)

  if (isFragmentRequest(req)) {
    sendHtml(res, renderFragment(options.mainContent), statusCode, headers)
    return
  }

  const criticalCSS = ctx.cssPipeline.getCriticalCSS(options.currentPath) ?? ''
  const html = renderShell({
    title: options.title,
    description: options.description,
    criticalCSS,
    deferredCSSPath: options.deferredCSSPath,
    mainContent: options.mainContent,
    currentPath: options.currentPath
  })
  sendHtml(res, html, statusCode, headers)
}
