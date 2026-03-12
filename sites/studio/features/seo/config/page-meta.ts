export interface PageMeta {
  readonly description: string
}

export type PageKey = 'home' | 'principles' | 'services' | 'audit' | 'about'

export const PAGE_META: Record<PageKey, PageMeta> = {
  home: {
    description: 'Inertia builds deterministic websites on dedicated hardware you own. No shared hosting. No bloated frameworks. McKinney, TX web studio.'
  },
  principles: {
    description: 'Engineering principles borrowed from aerospace: pre-allocated memory, explicit error handling, low complexity, and 14kB first-paint budgets.'
  },
  services: {
    description: 'Website built on the Inertia framework, installed on a server we deliver to your business. You own the hardware, the code, and the data.'
  },
  audit: {
    description: 'Free Lighthouse performance audit run on our own hardware. Enter any URL and see your site\'s performance, accessibility, and SEO scores.'
  },
  about: {
    description: 'Inertia Web Solutions is a solo web studio in McKinney, TX building aerospace-grade websites on hardware you physically own.'
  }
}
