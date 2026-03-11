import { describe, it, expect } from 'vitest'
import { splitCSS } from '../split-css.js'
import { CriticalCSSErrorCode } from '../types.js'
import type { ExtractedSelectors } from '../types.js'

function makeSelectors (
  classNames: string[] = [],
  ids: string[] = [],
  elements: string[] = []
): ExtractedSelectors {
  return {
    classNames: new Set(classNames),
    ids: new Set(ids),
    elements: new Set(elements)
  }
}

describe('splitCSS', () => {
  it('returns EMPTY_CSS error for empty input', () => {
    const result = splitCSS('', makeSelectors())
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.code).toBe(CriticalCSSErrorCode.EMPTY_CSS)
    }
  })

  it('returns CSS_PARSE_FAILED for malformed CSS', () => {
    const result = splitCSS('{{{{not css at all!!!!', makeSelectors())
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.code).toBe(CriticalCSSErrorCode.CSS_PARSE_FAILED)
    }
  })

  it(':root rules are always critical', () => {
    const css = ':root { --primary: #36d7b7; }'
    const result = splitCSS(css, makeSelectors())
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.critical).toContain(':root')
      expect(result.value.critical).toContain('--primary')
      expect(result.value.deferred).toBe('')
    }
  })

  it('.dark rules are always critical', () => {
    const css = '.dark { --background: #0a0a0a; }'
    const result = splitCSS(css, makeSelectors())
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.critical).toContain('.dark')
      expect(result.value.deferred).toBe('')
    }
  })

  it('@custom-variant is always critical', () => {
    const css = '@custom-variant dark (&:is(.dark *));'
    const result = splitCSS(css, makeSelectors())
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.critical).toContain('@custom-variant')
      expect(result.value.deferred).toBe('')
    }
  })

  it('@theme inline is always critical', () => {
    const css = '@theme inline { --color-primary: var(--primary); }'
    const result = splitCSS(css, makeSelectors())
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.critical).toContain('@theme')
      expect(result.value.deferred).toBe('')
    }
  })

  it('@layer base is always critical', () => {
    const css = '@layer base { * { border-color: var(--border); } }'
    const result = splitCSS(css, makeSelectors())
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.critical).toContain('@layer base')
      expect(result.value.deferred).toBe('')
    }
  })

  it('body rules are always critical', () => {
    const css = 'body { letter-spacing: var(--tracking-normal); }'
    const result = splitCSS(css, makeSelectors())
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.critical).toContain('body')
      expect(result.value.deferred).toBe('')
    }
  })

  it('utility class matching HTML selector is critical', () => {
    const css = '.bg-primary { background-color: var(--primary); }'
    const result = splitCSS(css, makeSelectors(['bg-primary']))
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.critical).toContain('.bg-primary')
      expect(result.value.deferred).toBe('')
    }
  })

  it('utility class NOT in HTML selectors is deferred', () => {
    const css = '.bg-primary { background-color: var(--primary); }'
    const result = splitCSS(css, makeSelectors(['text-white']))
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.critical).toBe('')
      expect(result.value.deferred).toContain('.bg-primary')
    }
  })

  it('multiple selectors on one rule: critical if any matches', () => {
    const css = '.bg-primary, .text-white { color: white; }'
    const result = splitCSS(css, makeSelectors(['text-white']))
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.critical).toContain('.bg-primary')
      expect(result.value.critical).toContain('.text-white')
    }
  })

  it('ID selector matching', () => {
    const css = '#hero { min-height: 100vh; }'
    const result = splitCSS(css, makeSelectors([], ['hero']))
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.critical).toContain('#hero')
      expect(result.value.deferred).toBe('')
    }
  })

  it('element selector matching', () => {
    const css = 'h1 { font-size: 2rem; }'
    const result = splitCSS(css, makeSelectors([], [], ['h1']))
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.critical).toContain('h1')
      expect(result.value.deferred).toBe('')
    }
  })

  it('@media containing matched rules is critical', () => {
    const css = '@media (min-width: 768px) { .flex { display: flex; } }'
    const result = splitCSS(css, makeSelectors(['flex']))
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.critical).toContain('@media')
      expect(result.value.critical).toContain('.flex')
      expect(result.value.deferred).toBe('')
    }
  })

  it('critical + deferred preserves all content (no data loss)', () => {
    const css = `
      :root { --primary: #36d7b7; }
      .bg-primary { background: var(--primary); }
      .text-white { color: white; }
      .hidden { display: none; }
    `
    const result = splitCSS(css, makeSelectors(['bg-primary']))
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.critical).toContain(':root')
      expect(result.value.critical).toContain('.bg-primary')
      expect(result.value.deferred).toContain('.text-white')
      expect(result.value.deferred).toContain('.hidden')
    }
  })
})
