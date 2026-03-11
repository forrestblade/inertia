import type { Router } from './router.js'
import { homeHandler } from '../features/home/server/home-handler.js'
import { principlesHandler } from '../features/principles/server/principles-handler.js'
import { aboutHandler } from '../features/about/server/about-handler.js'
import { servicesHandler } from '../features/services/server/services-handler.js'
import { contactGetHandler, contactPostHandler } from '../features/contact/server/contact-handler.js'
import { notFoundHandler } from '../features/not-found/server/not-found-handler.js'
import { telemetryHandler } from '../features/telemetry/server/telemetry-handler.js'
import { sessionHandler } from '../features/telemetry/server/session-handler.js'

export function registerRoutes (router: Router): void {
  // Content pages
  router.register('/', { GET: homeHandler })
  router.register('/principles', { GET: principlesHandler })
  router.register('/about', { GET: aboutHandler })
  router.register('/services', { GET: servicesHandler })
  router.register('/contact', { GET: contactGetHandler, POST: contactPostHandler })

  // Telemetry API
  router.register('/api/telemetry', { POST: telemetryHandler })
  router.register('/api/session', { POST: sessionHandler })

  // 404 fallback
  router.register('/404', { GET: notFoundHandler })
}
