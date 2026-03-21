import { describe, it, expect } from 'vitest'

describe('barrel import has no side effects', () => {
  it('importing a class from the barrel does not auto-register components', async () => {
    const { ValButton } = await import('../components/val-button.js')
    expect(ValButton).toBeDefined()
    expect(typeof ValButton).toBe('function')
    // The standard tag should NOT be registered just from importing the class
    expect(customElements.get('val-button')).toBeUndefined()
  })

  it('importing from the barrel index does not auto-register components', async () => {
    const mod = await import('../components/index.js')
    expect(mod.ValDialog).toBeDefined()
    expect(customElements.get('val-dialog')).toBeUndefined()
    expect(customElements.get('val-button')).toBeUndefined()
  })

  it('COMPONENT_REGISTRY and registerAll are named exports', async () => {
    const mod = await import('../components/index.js')
    expect(mod.COMPONENT_REGISTRY).toBeDefined()
    expect(typeof mod.registerAll).toBe('function')
  })
})
