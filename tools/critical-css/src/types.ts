// Critical CSS error codes — const union pattern (same as TokenErrorCode)
export const CriticalCSSErrorCode = {
  EMPTY_CSS: 'EMPTY_CSS',
  EMPTY_HTML: 'EMPTY_HTML',
  CSS_PARSE_FAILED: 'CSS_PARSE_FAILED',
  COMPRESSION_FAILED: 'COMPRESSION_FAILED'
} as const

export type CriticalCSSErrorCode = typeof CriticalCSSErrorCode[keyof typeof CriticalCSSErrorCode]

export interface CriticalCSSError {
  readonly code: CriticalCSSErrorCode
  readonly message: string
}

export interface ExtractedSelectors {
  readonly classNames: ReadonlySet<string>
  readonly ids: ReadonlySet<string>
  readonly elements: ReadonlySet<string>
}

export interface SplitResult {
  readonly critical: string
  readonly deferred: string
}

export interface BudgetReport {
  readonly totalBytes: number
  readonly compressedBytes: number
  readonly budgetBytes: number
  readonly headerEstimate: number
  readonly withinBudget: boolean
  readonly utilizationPercent: number
}
