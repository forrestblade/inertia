import { watch } from 'node:fs'
import type { FSWatcher } from 'node:fs'

interface ConfigWatcherOptions {
  readonly configPath: string
  readonly onConfigChange: () => void
  readonly debounceMs?: number
}

export function startConfigWatcher (options: ConfigWatcherOptions): FSWatcher {
  const { configPath, onConfigChange, debounceMs = 500 } = options
  let timer: ReturnType<typeof setTimeout> | null = null

  const watcher = watch(configPath, () => {
    if (timer !== null) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      onConfigChange()
    }, debounceMs)
  })

  watcher.on('error', (err) => {
    console.warn(`  [learn] config watcher error: ${err.message}`)
  })

  return watcher
}
