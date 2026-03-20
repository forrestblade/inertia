import { describe, it, expect } from 'vitest'
import { FieldType } from '../schema/field-types.js'
import type {
  FieldConfig,
  TabDefinition,
  TabsFieldConfig,
  RowFieldConfig,
  CollapsibleFieldConfig
} from '../schema/field-types.js'
import { field } from '../schema/fields.js'

// --- FieldType constants ---

describe('FieldType — layout types', () => {
  it('has TABS constant', () => {
    expect(FieldType.TABS).toBe('tabs')
  })

  it('has ROW constant', () => {
    expect(FieldType.ROW).toBe('row')
  })

  it('has COLLAPSIBLE constant', () => {
    expect(FieldType.COLLAPSIBLE).toBe('collapsible')
  })

  it('has exactly 22 types total', () => {
    expect(Object.keys(FieldType)).toHaveLength(22)
  })
})

// --- TabDefinition ---

describe('TabDefinition', () => {
  it('requires label and fields', () => {
    const tab: TabDefinition = {
      label: 'Content',
      fields: [{ type: 'text', name: 'title' }]
    }
    expect(tab.label).toBe('Content')
    expect(tab.fields).toHaveLength(1)
  })

  it('accepts an empty fields array', () => {
    const tab: TabDefinition = { label: 'Empty Tab', fields: [] }
    expect(tab.fields).toHaveLength(0)
  })
})

// --- TabsFieldConfig ---

describe('TabsFieldConfig', () => {
  it('requires type tabs and name', () => {
    const f: TabsFieldConfig = {
      type: 'tabs',
      name: 'content_tabs',
      tabs: [
        { label: 'Content', fields: [{ type: 'text', name: 'title' }] },
        { label: 'SEO', fields: [{ type: 'text', name: 'metaTitle' }] }
      ]
    }
    expect(f.type).toBe('tabs')
    expect(f.name).toBe('content_tabs')
    expect(f.tabs).toHaveLength(2)
  })

  it('tabs array entries contain label and fields', () => {
    const f: TabsFieldConfig = {
      type: 'tabs',
      name: 'tabs',
      tabs: [
        {
          label: 'Main',
          fields: [
            { type: 'text', name: 'title' },
            { type: 'richtext', name: 'body' }
          ]
        }
      ]
    }
    const tab = f.tabs[0]
    expect(tab?.label).toBe('Main')
    expect(tab?.fields).toHaveLength(2)
  })
})

// --- RowFieldConfig ---

describe('RowFieldConfig', () => {
  it('requires type row and name', () => {
    const f: RowFieldConfig = {
      type: 'row',
      name: 'name_row',
      fields: [
        { type: 'text', name: 'firstName' },
        { type: 'text', name: 'lastName' }
      ]
    }
    expect(f.type).toBe('row')
    expect(f.name).toBe('name_row')
    expect(f.fields).toHaveLength(2)
  })

  it('accepts an empty fields array', () => {
    const f: RowFieldConfig = { type: 'row', name: 'empty_row', fields: [] }
    expect(f.fields).toHaveLength(0)
  })
})

// --- CollapsibleFieldConfig ---

describe('CollapsibleFieldConfig', () => {
  it('requires type collapsible, name, label, and fields', () => {
    const f: CollapsibleFieldConfig = {
      type: 'collapsible',
      name: 'advanced',
      label: 'Advanced Settings',
      fields: [{ type: 'text', name: 'internalNotes' }]
    }
    expect(f.type).toBe('collapsible')
    expect(f.name).toBe('advanced')
    expect(f.label).toBe('Advanced Settings')
    expect(f.fields).toHaveLength(1)
  })

  it('accepts optional collapsed property', () => {
    const f: CollapsibleFieldConfig = {
      type: 'collapsible',
      name: 'advanced',
      label: 'Advanced',
      fields: [],
      collapsed: true
    }
    expect(f.collapsed).toBe(true)
  })

  it('collapsed is optional — omitting it is valid', () => {
    const f: CollapsibleFieldConfig = {
      type: 'collapsible',
      name: 'advanced',
      label: 'Advanced',
      fields: []
    }
    expect(f.collapsed).toBeUndefined()
  })
})

// --- Factory functions ---

describe('field.tabs()', () => {
  it('creates TabsFieldConfig with type tabs', () => {
    const f = field.tabs({
      name: 'main_tabs',
      tabs: [
        { label: 'Content', fields: [{ type: 'text', name: 'title' }] }
      ]
    })
    expect(f.type).toBe('tabs')
    expect(f.name).toBe('main_tabs')
    expect(f.tabs).toHaveLength(1)
  })

  it('preserves tabs array structure', () => {
    const tabs: readonly TabDefinition[] = [
      { label: 'A', fields: [{ type: 'text', name: 'a' }] },
      { label: 'B', fields: [{ type: 'number', name: 'b' }] }
    ]
    const f = field.tabs({ name: 't', tabs })
    expect(f.tabs[0]?.label).toBe('A')
    expect(f.tabs[1]?.label).toBe('B')
  })
})

describe('field.row()', () => {
  it('creates RowFieldConfig with type row', () => {
    const f = field.row({
      name: 'name_row',
      fields: [
        { type: 'text', name: 'first' },
        { type: 'text', name: 'last' }
      ]
    })
    expect(f.type).toBe('row')
    expect(f.name).toBe('name_row')
    expect(f.fields).toHaveLength(2)
  })

  it('fields array is preserved', () => {
    const f = field.row({ name: 'r', fields: [{ type: 'boolean', name: 'active' }] })
    expect(f.fields[0]?.name).toBe('active')
  })
})

describe('field.collapsible()', () => {
  it('creates CollapsibleFieldConfig with type collapsible', () => {
    const f = field.collapsible({
      name: 'advanced',
      label: 'Advanced Settings',
      fields: [{ type: 'text', name: 'notes' }]
    })
    expect(f.type).toBe('collapsible')
    expect(f.name).toBe('advanced')
    expect(f.label).toBe('Advanced Settings')
    expect(f.fields).toHaveLength(1)
  })

  it('passes through collapsed flag when true', () => {
    const f = field.collapsible({
      name: 'c',
      label: 'Section',
      fields: [],
      collapsed: true
    })
    expect(f.collapsed).toBe(true)
  })

  it('passes through collapsed flag when false', () => {
    const f = field.collapsible({
      name: 'c',
      label: 'Section',
      fields: [],
      collapsed: false
    })
    expect(f.collapsed).toBe(false)
  })

  it('collapsed is undefined when not provided', () => {
    const f = field.collapsible({ name: 'c', label: 'Section', fields: [] })
    expect(f.collapsed).toBeUndefined()
  })
})

// --- FieldConfig union includes layout types ---

describe('FieldConfig union — layout types', () => {
  it('accepts tabs, row, and collapsible as valid FieldConfig members', () => {
    const fields: FieldConfig[] = [
      {
        type: 'tabs',
        name: 'main_tabs',
        tabs: [{ label: 'Content', fields: [{ type: 'text', name: 'title' }] }]
      },
      {
        type: 'row',
        name: 'name_row',
        fields: [{ type: 'text', name: 'first' }]
      },
      {
        type: 'collapsible',
        name: 'advanced',
        label: 'Advanced',
        fields: [{ type: 'text', name: 'notes' }]
      }
    ]
    expect(fields).toHaveLength(3)
    expect(new Set(fields.map(f => f.type)).size).toBe(3)
  })
})

// --- Backward compatibility ---

describe('Backward compatibility — existing field factories still work', () => {
  it('field.text() still works', () => {
    const f = field.text({ name: 'title' })
    expect(f.type).toBe('text')
  })

  it('field.number() still works', () => {
    const f = field.number({ name: 'price' })
    expect(f.type).toBe('number')
  })

  it('field.boolean() still works', () => {
    const f = field.boolean({ name: 'active' })
    expect(f.type).toBe('boolean')
  })

  it('field.group() still works', () => {
    const f = field.group({ name: 'seo', fields: [{ type: 'text', name: 'metaTitle' }] })
    expect(f.type).toBe('group')
  })

  it('field.blocks() still works', () => {
    const f = field.blocks({
      name: 'content',
      blocks: [{ slug: 'hero', fields: [{ type: 'text', name: 'heading' }] }]
    })
    expect(f.type).toBe('blocks')
  })
})
