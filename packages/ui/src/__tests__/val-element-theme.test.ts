import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ValElement } from '../core/val-element.js'
import { themeManager } from '../tokens/theme-manager.js'
import { ThemeMode } from '../tokens/theme-manager.js'
import { darkTokenSheet } from '../tokens/token-sheets.js'
import { defineTestElement } from './test-helpers.js'

class ShadowThemeElement extends ValElement {
  protected createTemplate (): HTMLTemplateElement {
    const t = document.createElement('template')
    t.innerHTML = '<span>theme test</span>'
    return t
  }
}

class LightThemeElement extends ValElement {
  constructor () {
    super({ shadow: false })
  }

  protected createTemplate (): HTMLTemplateElement {
    const t = document.createElement('template')
    t.innerHTML = '<span>light theme test</span>'
    return t
  }
}

describe('ValElement — Pillar 5: Theme (Constructable Stylesheets)', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    themeManager._reset()
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    themeManager._reset()
    container.remove()
  })

  it('shadow DOM element: connectedCallback adopts active token sheet', () => {
    const tag = defineTestElement('val-theme-adopt', ShadowThemeElement)
    const el = document.createElement(tag)
    container.appendChild(el)

    expect(el.shadowRoot!.adoptedStyleSheets).toContain(themeManager.getActiveSheet())
  })

  it('themeManager.setTheme("dark") updates connected element shadow root', () => {
    const tag = defineTestElement('val-theme-dark', ShadowThemeElement)
    const el = document.createElement(tag)
    container.appendChild(el)

    themeManager.setTheme(ThemeMode.Dark)
    expect(el.shadowRoot!.adoptedStyleSheets).toContain(darkTokenSheet)
  })

  it('light DOM element: no error (shadowRoot is null)', () => {
    const tag = defineTestElement('val-theme-light-dom', LightThemeElement)
    const el = document.createElement(tag)
    expect(() => container.appendChild(el)).not.toThrow()
  })

  it('disconnectedCallback unsubscribes — further theme changes do not affect it', () => {
    const tag = defineTestElement('val-theme-unsub', ShadowThemeElement)
    const el = document.createElement(tag)
    container.appendChild(el)
    const root = el.shadowRoot!
    el.remove()

    themeManager.setTheme(ThemeMode.Dark)
    expect(root.adoptedStyleSheets).not.toContain(darkTokenSheet)
  })

  it('multiple elements share the same sheet reference', () => {
    const tag = defineTestElement('val-theme-shared', ShadowThemeElement)
    const el1 = document.createElement(tag)
    const el2 = document.createElement(tag)
    container.appendChild(el1)
    container.appendChild(el2)

    const sheet1 = el1.shadowRoot!.adoptedStyleSheets.find(s => s === themeManager.getActiveSheet())
    const sheet2 = el2.shadowRoot!.adoptedStyleSheets.find(s => s === themeManager.getActiveSheet())
    expect(sheet1).toBe(sheet2)
  })
})
