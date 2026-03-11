export const APPLIANCE_MODEL = {
  headline: 'The Web Appliance Model',
  body: 'Your website actually lives on a computer inside your business. The internet just needs a doorway so visitors can reach it. That doorway costs about five dollars a month and it\'s registered in your name. If you ever want to switch providers, your website is still sitting in your office — we just move the doorway.'
} as const

export const SERVICE_TIERS = [
  {
    id: 'build-deploy',
    name: 'Build & Deploy',
    description: 'We design and build your website using the Inertia framework, install it on a dedicated server appliance, and deliver the hardware. You own everything.',
    includes: [
      'Custom website built on Inertia framework',
      'Dedicated server appliance hardware',
      'PostgreSQL database, self-hosted',
      'Secure tunnel to disposable relay (~$5/mo)',
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
