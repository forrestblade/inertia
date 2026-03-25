import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const workflow = readFileSync('.github/workflows/update-snapshots.yml', 'utf-8')
const headRepoCheck = 'test "' + '$' + '{{ steps.pr.outputs.head_repo }}' + '" = "' + '$' + '{{ github.repository }}' + '"'
const leasedPush = '--force-with-lease="refs/heads/' + '$' + '{HEAD_REF}:' + '$' + '{HEAD_SHA}"'

describe('Update snapshots workflow security', () => {
  it('captures the immutable PR head sha and same-repo identity', () => {
    expect(workflow).toContain("core.setOutput('head_sha', pr.data.head.sha)")
    expect(workflow).toContain("core.setOutput('head_repo', pr.data.head.repo.full_name)")
    expect(workflow).toContain(headRepoCheck)
  })

  it('pushes snapshot updates with a force-with-lease bound to the reviewed sha', () => {
    expect(workflow).toContain(leasedPush)
    expect(workflow).not.toContain('stefanzweifel/git-auto-commit-action')
  })
})
