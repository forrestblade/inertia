import { describe, it, expect } from 'vitest'
import type { FieldConfig, TextFieldConfig } from '../schema/field-types.js'
import type { FieldAccess } from '../access/access-types.js'

describe('FieldBaseConfig access property', () => {
  it('accepts access with read, create, update functions', () => {
    const access: FieldAccess = {
      read: () => true,
      create: () => false,
      update: () => true
    }
    const fieldConfig: TextFieldConfig = {
      type: 'text',
      name: 'secret',
      access
    }
    expect(fieldConfig.access).toBeDefined()
    expect(fieldConfig.access?.read).toBeTypeOf('function')
    expect(fieldConfig.access?.create).toBeTypeOf('function')
    expect(fieldConfig.access?.update).toBeTypeOf('function')
  })

  it('works without access (backward compat)', () => {
    const fieldConfig: TextFieldConfig = {
      type: 'text',
      name: 'title'
    }
    expect(fieldConfig.access).toBeUndefined()
  })

  it('accepts partial access (only read)', () => {
    const fieldConfig: FieldConfig = {
      type: 'text',
      name: 'internal',
      access: {
        read: () => false
      }
    }
    expect(fieldConfig.access?.read).toBeTypeOf('function')
    expect(fieldConfig.access?.create).toBeUndefined()
    expect(fieldConfig.access?.update).toBeUndefined()
  })
})
