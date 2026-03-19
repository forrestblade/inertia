import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { join } from 'node:path'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import {
  createInitialProgress,
  readLearnProgress,
  writeLearnProgress,
  ensureLearnDir
} from '../state.js'
import type { LearnProgress } from '../types.js'

describe('learn command operations', () => {
  let dir: string

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'valence-learn-cmd-'))
    await ensureLearnDir(dir)
    const progress = createInitialProgress({ posts: 1, users: 0 })
    await writeLearnProgress(dir, progress)
  })

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  it('--status reads current progress', async () => {
    const progress = await readLearnProgress(dir)
    expect(progress).not.toBeNull()
    expect(progress!.enabled).toBe(true)
    const completedCount = Object.values(progress!.steps).filter(s => s.completed).length
    expect(completedCount).toBe(0)
  })

  it('--off sets enabled to false', async () => {
    const progress = await readLearnProgress(dir)
    expect(progress).not.toBeNull()
    const updated: LearnProgress = { ...progress!, enabled: false }
    await writeLearnProgress(dir, updated)

    const reread = await readLearnProgress(dir)
    expect(reread!.enabled).toBe(false)
  })

  it('--reset resets all steps to incomplete', async () => {
    // First mark a step as complete
    const progress = await readLearnProgress(dir)
    expect(progress).not.toBeNull()
    const withComplete: LearnProgress = {
      ...progress!,
      steps: {
        ...progress!.steps,
        'visit-admin': { completed: true, completedAt: new Date().toISOString() }
      }
    }
    await writeLearnProgress(dir, withComplete)

    // Verify it was marked
    const before = await readLearnProgress(dir)
    expect(before!.steps['visit-admin'].completed).toBe(true)

    // Reset: create fresh progress preserving initial counts
    const reset = createInitialProgress(before!.initialCounts)
    await writeLearnProgress(dir, reset)

    const after = await readLearnProgress(dir)
    expect(after!.steps['visit-admin'].completed).toBe(false)
    expect(after!.enabled).toBe(true)
  })

  it('--status on non-existent learn.json returns null', async () => {
    const emptyDir = await mkdtemp(join(tmpdir(), 'valence-learn-empty-'))
    const progress = await readLearnProgress(emptyDir)
    expect(progress).toBeNull()
    await rm(emptyDir, { recursive: true, force: true })
  })
})
