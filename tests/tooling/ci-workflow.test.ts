import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const workflow = readFileSync('.github/workflows/ci.yml', 'utf-8')

describe('CI workflow contract', () => {
  const e2eEnvBinding = 'E2E: $' + '{{ needs.e2e.result }}'

  it('runs contract tests through the dedicated contracts config', () => {
    expect(workflow).toContain('pnpm exec vitest run --config vitest.contracts.config.ts')
  })

  it('makes the CI gate depend on the actual e2e shard job', () => {
    expect(workflow).toContain('needs: [unit, integration, e2e, e2e-merge-report, contracts, coverage, security]')
    expect(workflow).toContain(e2eEnvBinding)
  })
})
