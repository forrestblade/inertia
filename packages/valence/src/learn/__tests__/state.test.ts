import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { join } from 'node:path'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import {
  readLearnProgress,
  writeLearnProgress,
  createInitialProgress,
  ensureLearnDir
} from '../state.js'
import type { LearnProgress } from '../types.js'

describe('ensureLearnDir', () => {
  let dir: string

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'valence-learn-'))
  })

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  it('creates .valence directory if it does not exist', async () => {
    const { existsSync } = await import('node:fs')
    const valenceDir = join(dir, '.valence')
    expect(existsSync(valenceDir)).toBe(false)
    await ensureLearnDir(dir)
    expect(existsSync(valenceDir)).toBe(true)
  })

  it('does not throw if .valence already exists', async () => {
    const { mkdir } = await import('node:fs/promises')
    await mkdir(join(dir, '.valence'), { recursive: true })
    await expect(ensureLearnDir(dir)).resolves.not.toThrow()
  })
})

describe('createInitialProgress', () => {
  it('returns progress with enabled true', () => {
    const progress = createInitialProgress({ posts: 1, users: 0 })
    expect(progress.enabled).toBe(true)
  })

  it('returns progress with startedAt as ISO string', () => {
    const progress = createInitialProgress({ posts: 1, users: 0 })
    expect(() => new Date(progress.startedAt)).not.toThrow()
    expect(new Date(progress.startedAt).toISOString()).toBe(progress.startedAt)
  })

  it('stores initial counts', () => {
    const progress = createInitialProgress({ posts: 3, users: 2 })
    expect(progress.initialCounts.posts).toBe(3)
    expect(progress.initialCounts.users).toBe(2)
  })

  it('initializes all 6 steps as not completed', () => {
    const progress = createInitialProgress({ posts: 0, users: 0 })
    const stepIds = ['visit-admin', 'create-post', 'hit-api', 'add-collection', 'create-user', 'create-file'] as const
    for (const id of stepIds) {
      expect(progress.steps[id].completed).toBe(false)
      expect(progress.steps[id].completedAt).toBeNull()
    }
  })
})

describe('readLearnProgress', () => {
  let dir: string

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'valence-learn-'))
  })

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  it('returns null if .valence/learn.json does not exist', async () => {
    const result = await readLearnProgress(dir)
    expect(result).toBeNull()
  })

  it('returns null if learn.json is corrupted JSON', async () => {
    const { mkdir, writeFile } = await import('node:fs/promises')
    await mkdir(join(dir, '.valence'), { recursive: true })
    await writeFile(join(dir, '.valence', 'learn.json'), '{{{invalid}}}')
    const result = await readLearnProgress(dir)
    expect(result).toBeNull()
  })

  it('reads valid learn.json and returns progress', async () => {
    const { mkdir, writeFile } = await import('node:fs/promises')
    await mkdir(join(dir, '.valence'), { recursive: true })
    const progress = createInitialProgress({ posts: 1, users: 0 })
    await writeFile(join(dir, '.valence', 'learn.json'), JSON.stringify(progress))
    const result = await readLearnProgress(dir)
    expect(result).not.toBeNull()
    expect(result!.enabled).toBe(true)
    expect(result!.initialCounts.posts).toBe(1)
  })
})

describe('writeLearnProgress', () => {
  let dir: string

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'valence-learn-'))
  })

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  it('writes learn.json to .valence directory', async () => {
    const { readFileSync } = await import('node:fs')
    await ensureLearnDir(dir)
    const progress = createInitialProgress({ posts: 0, users: 0 })
    await writeLearnProgress(dir, progress)
    const raw = readFileSync(join(dir, '.valence', 'learn.json'), 'utf-8')
    const parsed = JSON.parse(raw) as LearnProgress
    expect(parsed.enabled).toBe(true)
    expect(parsed.steps['visit-admin'].completed).toBe(false)
  })

  it('overwrites existing learn.json', async () => {
    const { readFileSync } = await import('node:fs')
    await ensureLearnDir(dir)
    const progress1 = createInitialProgress({ posts: 0, users: 0 })
    await writeLearnProgress(dir, progress1)

    const progress2: LearnProgress = {
      ...progress1,
      steps: {
        ...progress1.steps,
        'visit-admin': { completed: true, completedAt: new Date().toISOString() }
      }
    }
    await writeLearnProgress(dir, progress2)

    const raw = readFileSync(join(dir, '.valence', 'learn.json'), 'utf-8')
    const parsed = JSON.parse(raw) as LearnProgress
    expect(parsed.steps['visit-admin'].completed).toBe(true)
  })
})
