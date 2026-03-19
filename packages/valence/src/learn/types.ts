export type LearnStepId =
  | 'visit-admin'
  | 'create-post'
  | 'hit-api'
  | 'add-collection'
  | 'create-user'
  | 'create-file'

export interface LearnStepState {
  readonly completed: boolean
  readonly completedAt: string | null
}

export interface LearnProgress {
  readonly enabled: boolean
  readonly startedAt: string
  readonly steps: Readonly<Record<LearnStepId, LearnStepState>>
  readonly initialCounts: {
    readonly posts: number
    readonly users: number
  }
}

export interface LearnSignals {
  adminPageViews: number
  apiGetRequests: number
  configChangeDetected: boolean
}

export interface LearnCheckDeps {
  readonly pool: {
    readonly query: (text: string, values?: ReadonlyArray<string | boolean | null>) => Promise<{ readonly rows: ReadonlyArray<Record<string, string | number>> }>
  }
  readonly signals: LearnSignals
  readonly configSlugs: ReadonlyArray<string>
  readonly projectDir: string
}

export interface LearnStepDefinition {
  readonly id: LearnStepId
  readonly title: string
  readonly description: string
  readonly hint: string
}
