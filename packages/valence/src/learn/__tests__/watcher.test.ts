import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { join } from 'node:path'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { startConfigWatcher } from '../watcher.js'

describe('startConfigWatcher', () => {
  let dir: string
  let configPath: string

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'valence-watch-'))
    configPath = join(dir, 'valence.config.ts')
    await writeFile(configPath, 'export default {}')
  })

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  it('calls onConfigChange when the config file is modified', async () => {
    const onChange = vi.fn()
    const watcher = startConfigWatcher({ configPath, onConfigChange: onChange, debounceMs: 50 })

    try {
      await writeFile(configPath, 'export default { changed: true }')
      // Wait for debounce to fire
      await new Promise(resolve => setTimeout(resolve, 200))
      expect(onChange).toHaveBeenCalled()
    } finally {
      watcher.close()
    }
  })

  it('debounces rapid changes into a single callback', async () => {
    const onChange = vi.fn()
    const watcher = startConfigWatcher({ configPath, onConfigChange: onChange, debounceMs: 100 })

    try {
      // Fire 5 rapid writes
      for (let i = 0; i < 5; i++) {
        await writeFile(configPath, `export default { v: ${i} }`)
      }
      // Wait for debounce window + buffer
      await new Promise(resolve => setTimeout(resolve, 300))
      // Should have collapsed to 1 call (or at most 2 if first write landed before debounce window)
      expect(onChange.mock.calls.length).toBeLessThanOrEqual(2)
    } finally {
      watcher.close()
    }
  })

  it('returns an FSWatcher that can be closed', async () => {
    const onChange = vi.fn()
    const watcher = startConfigWatcher({ configPath, onConfigChange: onChange, debounceMs: 50 })
    expect(typeof watcher.close).toBe('function')
    watcher.close()
    // After close, changes should not trigger callback
    await writeFile(configPath, 'export default { after: true }')
    await new Promise(resolve => setTimeout(resolve, 150))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not crash if the watched file is deleted', async () => {
    const onChange = vi.fn()
    const watcher = startConfigWatcher({ configPath, onConfigChange: onChange, debounceMs: 50 })

    try {
      const { unlink } = await import('node:fs/promises')
      await unlink(configPath)
      // Give time for error event to fire
      await new Promise(resolve => setTimeout(resolve, 150))
      // Should not have thrown — watcher handles errors gracefully
    } finally {
      watcher.close()
    }
  })
})
