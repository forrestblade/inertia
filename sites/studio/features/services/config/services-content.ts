export const APPLIANCE_MODEL = {
  headline: 'The Web Appliance Model',
  body: 'We don\'t rent you server space. We build a physical web server, install your website on it, and hand it to you. It sits in your office, connects to the internet, and serves your website to the world through Cloudflare\'s global network.'
} as const

export const SERVICE_TIERS = [
  {
    id: 'build-deploy',
    name: 'Build & Deploy',
    description: 'We design and build your website using the Inertia framework, install it on a micro server, and deliver the hardware. You own everything.',
    includes: [
      'Custom website built on Inertia framework',
      'Raspberry Pi 5 or ZimaBoard hardware',
      'PostgreSQL database, self-hosted',
      'Cloudflare Tunnel setup',
      'First-party analytics dashboard',
      'Source code handover',
      '30-day post-launch support'
    ]
  },
  {
    id: 'managed',
    name: 'Managed Webmaster',
    description: 'Everything in Build & Deploy, plus ongoing content updates, monitoring, and quarterly performance reviews.',
    includes: [
      'Everything in Build & Deploy',
      'Monthly content updates (up to 4 pages)',
      'Uptime monitoring and alerts',
      'Security patches and OS updates',
      'Quarterly performance report',
      'Priority support via email'
    ]
  },
  {
    id: 'analytics',
    name: 'Analytics & Conversion',
    description: 'Deep-dive analytics setup with conversion tracking, custom event telemetry, and actionable reporting.',
    includes: [
      'Custom telemetry event definitions',
      'Conversion funnel tracking',
      'Dynamic Number Insertion (DNI) for call tracking',
      'HUD dashboard customization',
      'Monthly analytics review',
      'A/B test infrastructure'
    ]
  }
] as const

export const OWNERSHIP_LIST = [
  'You own the server hardware',
  'You own the database and all customer data',
  'You own the source code',
  'You own the analytics data',
  'You own the domain and DNS',
  'No monthly hosting fees',
  'No vendor lock-in',
  'Full data portability'
] as const
