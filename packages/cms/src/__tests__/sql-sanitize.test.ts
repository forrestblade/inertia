import { describe, it, expect } from 'vitest'
import { getValidFieldNames, isValidIdentifier, sanitizeIdentifier, isAllowedField, sanitizeOptionValue } from '../db/sql-sanitize.js'
import { collection } from '../schema/collection.js'
import { field } from '../schema/fields.js'

const versionedCol = collection({
  slug: 'posts',
  fields: [
    field.text({ name: 'title', required: true }),
    field.text({ name: 'body' })
  ],
  versions: { drafts: true }
})

const normalCol = collection({
  slug: 'pages',
  fields: [
    field.text({ name: 'title', required: true }),
    field.text({ name: 'content' })
  ]
})

describe('getValidFieldNames()', () => {
  it('always includes system columns', () => {
    const names = getValidFieldNames(normalCol)
    expect(names.has('id')).toBe(true)
    expect(names.has('created_at')).toBe(true)
    expect(names.has('updated_at')).toBe(true)
    expect(names.has('deleted_at')).toBe(true)
  })

  it('includes collection field names', () => {
    const names = getValidFieldNames(normalCol)
    expect(names.has('title')).toBe(true)
    expect(names.has('content')).toBe(true)
  })

  it('includes _status for a versioned collection with drafts: true', () => {
    const names = getValidFieldNames(versionedCol)
    expect(names.has('_status')).toBe(true)
  })

  it('includes publish_at for a versioned collection with drafts: true', () => {
    const names = getValidFieldNames(versionedCol)
    expect(names.has('publish_at')).toBe(true)
  })

  it('does NOT include _status for a non-versioned collection', () => {
    const names = getValidFieldNames(normalCol)
    expect(names.has('_status')).toBe(false)
  })

  it('does NOT include publish_at for a non-versioned collection', () => {
    const names = getValidFieldNames(normalCol)
    expect(names.has('publish_at')).toBe(false)
  })

  it('includes field names from versioned collection alongside _status', () => {
    const names = getValidFieldNames(versionedCol)
    expect(names.has('title')).toBe(true)
    expect(names.has('body')).toBe(true)
    expect(names.has('_status')).toBe(true)
  })
})

describe('isValidIdentifier()', () => {
  it('returns true for valid identifiers', () => {
    expect(isValidIdentifier('title')).toBe(true)
    expect(isValidIdentifier('created_at')).toBe(true)
    expect(isValidIdentifier('_status')).toBe(true)
    expect(isValidIdentifier('field_name_123')).toBe(true)
  })

  it('returns false for identifiers with invalid characters', () => {
    expect(isValidIdentifier('field name')).toBe(false)
    expect(isValidIdentifier('field;drop')).toBe(false)
    expect(isValidIdentifier('1invalid')).toBe(false)
    expect(isValidIdentifier('')).toBe(false)
  })

  it('returns false for identifiers exceeding 63 characters', () => {
    const longName = 'a'.repeat(64)
    expect(isValidIdentifier(longName)).toBe(false)
  })

  it('returns true for identifiers exactly 63 characters', () => {
    const maxName = 'a'.repeat(63)
    expect(isValidIdentifier(maxName)).toBe(true)
  })
})

describe('sanitizeIdentifier()', () => {
  it('wraps valid identifier in double quotes', () => {
    expect(sanitizeIdentifier('title')).toBe('"title"')
    expect(sanitizeIdentifier('_status')).toBe('"_status"')
  })

  it('returns empty string for invalid identifier', () => {
    expect(sanitizeIdentifier('drop table')).toBe('')
    expect(sanitizeIdentifier('')).toBe('')
  })
})

describe('isAllowedField()', () => {
  it('returns true when field is in allowed set and is a valid identifier', () => {
    const allowed = getValidFieldNames(versionedCol)
    expect(isAllowedField('_status', allowed)).toBe(true)
    expect(isAllowedField('title', allowed)).toBe(true)
    expect(isAllowedField('created_at', allowed)).toBe(true)
  })

  it('returns false when field is not in allowed set', () => {
    const allowed = getValidFieldNames(normalCol)
    expect(isAllowedField('_status', allowed)).toBe(false)
    expect(isAllowedField('nonexistent', allowed)).toBe(false)
  })

  it('returns false when field is in allowed set but is not a valid identifier', () => {
    // Manually create a set with invalid identifier
    const allowed = new Set(['drop table', 'title'])
    expect(isAllowedField('drop table', allowed)).toBe(false)
  })
})

describe('sanitizeOptionValue()', () => {
  it('escapes single quotes by doubling them', () => {
    expect(sanitizeOptionValue("it's")).toBe("it''s")
    expect(sanitizeOptionValue("O'Brien")).toBe("O''Brien")
  })

  it('leaves strings without single quotes unchanged', () => {
    expect(sanitizeOptionValue('published')).toBe('published')
    expect(sanitizeOptionValue('draft')).toBe('draft')
  })
})
