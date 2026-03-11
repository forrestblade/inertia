import { describe, it, expect } from 'vitest'
import { renderNotFound } from '../templates/not-found.js'

describe('renderNotFound', () => {
  it('returns HTML with 404', () => {
    const html = renderNotFound()
    expect(html).toContain('404')
  })

  it('has link back to home', () => {
    const html = renderNotFound()
    expect(html).toContain('href="/"')
  })

  it('has telemetry attribute', () => {
    const html = renderNotFound()
    expect(html).toContain('data-telemetry-target="404-home"')
  })
})
