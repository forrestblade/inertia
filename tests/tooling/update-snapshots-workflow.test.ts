import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const workflow = readFileSync('.github/workflows/update-snapshots.yml', 'utf-8')
const headRefInput = 'head_ref:\n        description: Branch to update snapshots on'
const headShaInput = 'head_sha:\n        description: Reviewed commit SHA to lease snapshot updates against'
const leasedPush = '--force-with-lease="refs/heads/' + '$' + '{HEAD_REF}:' + '$' + '{HEAD_SHA}"'

describe('Update snapshots workflow security', () => {
  it('uses an explicit manual workflow trigger instead of privileged issue_comment execution', () => {
    expect(workflow).toContain('workflow_dispatch:')
    expect(workflow).not.toContain('issue_comment:')
    expect(workflow).not.toContain("github.event.comment.body == '/update-snapshots'")
    expect(workflow).not.toContain('actions/github-script@')
    expect(workflow).toContain(headRefInput)
    expect(workflow).toContain(headShaInput)
  })

  it('pushes snapshot updates with a force-with-lease bound to the reviewed sha', () => {
    expect(workflow).toContain(leasedPush)
    expect(workflow).not.toContain('stefanzweifel/git-auto-commit-action')
  })
})
