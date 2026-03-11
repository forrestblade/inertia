import { describe, it, expect } from 'vitest'
import { extractSelectors } from '../extract-selectors.js'
import { CriticalCSSErrorCode } from '../types.js'

describe('extractSelectors', () => {
  it('returns EMPTY_HTML error for empty input', () => {
    const result = extractSelectors('')
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.code).toBe(CriticalCSSErrorCode.EMPTY_HTML)
    }
  })

  it('returns EMPTY_HTML error for whitespace-only input', () => {
    const result = extractSelectors('   \n\t  ')
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.code).toBe(CriticalCSSErrorCode.EMPTY_HTML)
    }
  })

  it('extracts a single class attribute', () => {
    const html = '<div class="bg-primary text-white"></div>'
    const result = extractSelectors(html)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.classNames).toContain('bg-primary')
      expect(result.value.classNames).toContain('text-white')
    }
  })

  it('accumulates multiple class attributes without duplicates', () => {
    const html = `
      <div class="mt-4 p-2"></div>
      <span class="mt-4 text-sm"></span>
    `
    const result = extractSelectors(html)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.classNames.size).toBe(3)
      expect(result.value.classNames).toContain('mt-4')
      expect(result.value.classNames).toContain('p-2')
      expect(result.value.classNames).toContain('text-sm')
    }
  })

  it('handles Tailwind bracket notation', () => {
    const html = '<div class="w-[200px] text-[#333] grid-cols-[1fr_2fr]"></div>'
    const result = extractSelectors(html)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.classNames).toContain('w-[200px]')
      expect(result.value.classNames).toContain('text-[#333]')
      expect(result.value.classNames).toContain('grid-cols-[1fr_2fr]')
    }
  })

  it('handles hyphenated and numeric class names', () => {
    const html = '<div class="mt-4 bg-primary-foreground -translate-x-1/2"></div>'
    const result = extractSelectors(html)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.classNames).toContain('mt-4')
      expect(result.value.classNames).toContain('bg-primary-foreground')
      expect(result.value.classNames).toContain('-translate-x-1/2')
    }
  })

  it('extracts IDs correctly', () => {
    const html = '<section id="hero"><div id="cta-button"></div></section>'
    const result = extractSelectors(html)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.ids).toContain('hero')
      expect(result.value.ids).toContain('cta-button')
    }
  })

  it('extracts element tags including custom elements', () => {
    const html = '<div><span>text</span><inertia-button></inertia-button></div>'
    const result = extractSelectors(html)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.elements).toContain('div')
      expect(result.value.elements).toContain('span')
      expect(result.value.elements).toContain('inertia-button')
    }
  })

  it('handles self-closing tags', () => {
    const html = '<img src="a.png" /><br/><input type="text">'
    const result = extractSelectors(html)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.elements).toContain('img')
      expect(result.value.elements).toContain('br')
      expect(result.value.elements).toContain('input')
    }
  })

  it('handles single-quoted attributes', () => {
    const html = "<div class='flex items-center' id='main'></div>"
    const result = extractSelectors(html)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.classNames).toContain('flex')
      expect(result.value.classNames).toContain('items-center')
      expect(result.value.ids).toContain('main')
    }
  })

  it('normalizes extra whitespace in class values', () => {
    const html = '<div class="  mt-4   p-2   "></div>'
    const result = extractSelectors(html)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.classNames.size).toBe(2)
      expect(result.value.classNames).toContain('mt-4')
      expect(result.value.classNames).toContain('p-2')
    }
  })

  it('extracts classes, IDs, and elements from mixed HTML', () => {
    const html = `
      <header id="top" class="sticky z-50">
        <nav class="flex gap-4">
          <inertia-link class="text-primary"></inertia-link>
        </nav>
      </header>
    `
    const result = extractSelectors(html)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.classNames).toContain('sticky')
      expect(result.value.classNames).toContain('z-50')
      expect(result.value.classNames).toContain('flex')
      expect(result.value.classNames).toContain('gap-4')
      expect(result.value.classNames).toContain('text-primary')
      expect(result.value.ids).toContain('top')
      expect(result.value.elements).toContain('header')
      expect(result.value.elements).toContain('nav')
      expect(result.value.elements).toContain('inertia-link')
    }
  })
})
