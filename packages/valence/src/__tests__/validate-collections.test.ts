import { describe, it, expect } from 'vitest'
import { validateCollections } from '../validate-collections.js'
import type { CollectionConfig } from '@valencets/cms'

const makeCollection = (overrides: Partial<CollectionConfig> = {}): CollectionConfig => ({
  slug: 'posts',
  fields: [
    { type: 'text', name: 'title' }
  ],
  timestamps: true,
  ...overrides
})

describe('validateCollections', () => {
  describe('slug format validation', () => {
    it('accepts a valid lowercase slug', () => {
      const result = validateCollections([makeCollection({ slug: 'posts' })])
      expect(result.isOk()).toBe(true)
    })

    it('accepts a slug with hyphens', () => {
      const result = validateCollections([makeCollection({ slug: 'blog-posts' })])
      expect(result.isOk()).toBe(true)
    })

    it('accepts a slug with numbers after first letter', () => {
      const result = validateCollections([makeCollection({ slug: 'posts2' })])
      expect(result.isOk()).toBe(true)
    })

    it('rejects a slug with uppercase letters', () => {
      const result = validateCollections([makeCollection({ slug: 'Posts' })])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0]?.code).toBe('INVALID_COLLECTION_SLUG')
        expect(result.error[0]?.message).toContain('Posts')
      }
    })

    it('rejects a slug with spaces', () => {
      const result = validateCollections([makeCollection({ slug: 'blog posts' })])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0]?.code).toBe('INVALID_COLLECTION_SLUG')
      }
    })

    it('rejects a slug with special characters', () => {
      const result = validateCollections([makeCollection({ slug: 'blog_posts' })])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0]?.code).toBe('INVALID_COLLECTION_SLUG')
      }
    })

    it('rejects a slug starting with a number', () => {
      const result = validateCollections([makeCollection({ slug: '1posts' })])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0]?.code).toBe('INVALID_COLLECTION_SLUG')
      }
    })

    it('rejects a slug starting with a hyphen', () => {
      const result = validateCollections([makeCollection({ slug: '-posts' })])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0]?.code).toBe('INVALID_COLLECTION_SLUG')
      }
    })

    it('rejects an empty slug', () => {
      const result = validateCollections([makeCollection({ slug: '' })])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0]?.code).toBe('INVALID_COLLECTION_SLUG')
      }
    })
  })

  describe('duplicate slug validation', () => {
    it('accepts multiple collections with unique slugs', () => {
      const result = validateCollections([
        makeCollection({ slug: 'posts' }),
        makeCollection({ slug: 'pages' })
      ])
      expect(result.isOk()).toBe(true)
    })

    it('rejects duplicate slugs across collections', () => {
      const result = validateCollections([
        makeCollection({ slug: 'posts' }),
        makeCollection({ slug: 'posts' })
      ])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0]?.code).toBe('DUPLICATE_COLLECTION_SLUG')
        expect(result.error[0]?.message).toContain('posts')
      }
    })

    it('rejects multiple sets of duplicates and reports the first', () => {
      const result = validateCollections([
        makeCollection({ slug: 'posts' }),
        makeCollection({ slug: 'posts' }),
        makeCollection({ slug: 'pages' }),
        makeCollection({ slug: 'pages' })
      ])
      expect(result.isErr()).toBe(true)
    })
  })

  describe('slugFrom field reference validation', () => {
    it('accepts a slugFrom referencing an existing field name', () => {
      const result = validateCollections([
        makeCollection({
          slug: 'posts',
          fields: [
            { type: 'text', name: 'title' },
            { type: 'slug', name: 'slug', slugFrom: 'title' }
          ]
        })
      ])
      expect(result.isOk()).toBe(true)
    })

    it('accepts a slug field without slugFrom', () => {
      const result = validateCollections([
        makeCollection({
          slug: 'posts',
          fields: [
            { type: 'slug', name: 'slug' }
          ]
        })
      ])
      expect(result.isOk()).toBe(true)
    })

    it('rejects a slugFrom referencing a non-existent field name', () => {
      const result = validateCollections([
        makeCollection({
          slug: 'posts',
          fields: [
            { type: 'text', name: 'title' },
            { type: 'slug', name: 'slug', slugFrom: 'nonexistent' }
          ]
        })
      ])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0]?.code).toBe('INVALID_SLUG_FROM')
        expect(result.error[0]?.message).toContain('nonexistent')
        expect(result.error[0]?.message).toContain('posts')
      }
    })

    it('validates slugFrom across multiple collections independently', () => {
      const result = validateCollections([
        makeCollection({
          slug: 'posts',
          fields: [
            { type: 'text', name: 'title' },
            { type: 'slug', name: 'slug', slugFrom: 'title' }
          ]
        }),
        makeCollection({
          slug: 'pages',
          fields: [
            { type: 'text', name: 'name' },
            { type: 'slug', name: 'slug', slugFrom: 'name' }
          ]
        })
      ])
      expect(result.isOk()).toBe(true)
    })

    it('rejects slugFrom referencing a field from a different collection', () => {
      const result = validateCollections([
        makeCollection({
          slug: 'posts',
          fields: [
            { type: 'text', name: 'title' },
            { type: 'slug', name: 'slug', slugFrom: 'title' }
          ]
        }),
        makeCollection({
          slug: 'pages',
          fields: [
            { type: 'text', name: 'name' },
            { type: 'slug', name: 'slug', slugFrom: 'title' }
          ]
        })
      ])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        const slugFromError = result.error.find((e) => e.code === 'INVALID_SLUG_FROM')
        expect(slugFromError).toBeDefined()
        expect(slugFromError?.message).toContain('pages')
      }
    })
  })

  describe('integration with defineConfig', () => {
    it('returns Ok for empty collections array', () => {
      const result = validateCollections([])
      expect(result.isOk()).toBe(true)
    })

    it('reports format errors for all collections', () => {
      // Two invalid slugs — should report format errors for both
      const result = validateCollections([
        makeCollection({ slug: 'Bad Slug' }),
        makeCollection({ slug: 'Bad Slug' })
      ])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.some((e) => e.code === 'INVALID_COLLECTION_SLUG')).toBe(true)
      }
    })
  })

  describe('reserved field name validation', () => {
    it('rejects a field named "id"', () => {
      const result = validateCollections([
        makeCollection({
          fields: [{ type: 'text', name: 'id' }]
        })
      ])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0]?.code).toBe('RESERVED_FIELD_NAME')
        expect(result.error[0]?.message).toContain('id')
      }
    })

    it('rejects a field named "created_at"', () => {
      const result = validateCollections([
        makeCollection({
          fields: [{ type: 'text', name: 'created_at' }]
        })
      ])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0]?.code).toBe('RESERVED_FIELD_NAME')
        expect(result.error[0]?.message).toContain('created_at')
      }
    })

    it('rejects a field named "updated_at"', () => {
      const result = validateCollections([
        makeCollection({
          fields: [{ type: 'text', name: 'updated_at' }]
        })
      ])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0]?.code).toBe('RESERVED_FIELD_NAME')
      }
    })

    it('rejects a field named "deleted_at"', () => {
      const result = validateCollections([
        makeCollection({
          fields: [{ type: 'text', name: 'deleted_at' }]
        })
      ])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0]?.code).toBe('RESERVED_FIELD_NAME')
      }
    })

    it('rejects a field named "_status"', () => {
      const result = validateCollections([
        makeCollection({
          fields: [{ type: 'text', name: '_status' }]
        })
      ])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0]?.code).toBe('RESERVED_FIELD_NAME')
      }
    })

    it('rejects a field named "publish_at"', () => {
      const result = validateCollections([
        makeCollection({
          fields: [{ type: 'text', name: 'publish_at' }]
        })
      ])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0]?.code).toBe('RESERVED_FIELD_NAME')
      }
    })

    it('accepts fields with non-reserved names', () => {
      const result = validateCollections([
        makeCollection({
          fields: [
            { type: 'text', name: 'title' },
            { type: 'text', name: 'body' }
          ]
        })
      ])
      expect(result.isOk()).toBe(true)
    })

    it('includes the collection slug in the reserved name error message', () => {
      const result = validateCollections([
        makeCollection({
          slug: 'articles',
          fields: [{ type: 'text', name: 'id' }]
        })
      ])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0]?.message).toContain('articles')
        expect(result.error[0]?.message).toContain('id')
      }
    })
  })

  describe('duplicate field name validation', () => {
    it('rejects duplicate field names within a single collection', () => {
      const result = validateCollections([
        makeCollection({
          fields: [
            { type: 'text', name: 'title' },
            { type: 'text', name: 'title' }
          ]
        })
      ])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0]?.code).toBe('DUPLICATE_FIELD_NAME')
        expect(result.error[0]?.message).toContain('title')
      }
    })

    it('rejects duplicate field names with different types', () => {
      const result = validateCollections([
        makeCollection({
          fields: [
            { type: 'text', name: 'summary' },
            { type: 'textarea', name: 'summary' }
          ]
        })
      ])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0]?.code).toBe('DUPLICATE_FIELD_NAME')
        expect(result.error[0]?.message).toContain('summary')
      }
    })

    it('accepts fields with unique names', () => {
      const result = validateCollections([
        makeCollection({
          fields: [
            { type: 'text', name: 'title' },
            { type: 'textarea', name: 'body' },
            { type: 'slug', name: 'slug' }
          ]
        })
      ])
      expect(result.isOk()).toBe(true)
    })

    it('allows the same field name across different collections', () => {
      const result = validateCollections([
        makeCollection({
          slug: 'posts',
          fields: [{ type: 'text', name: 'title' }]
        }),
        makeCollection({
          slug: 'pages',
          fields: [{ type: 'text', name: 'title' }]
        })
      ])
      expect(result.isOk()).toBe(true)
    })

    it('includes the collection slug in the duplicate field error message', () => {
      const result = validateCollections([
        makeCollection({
          slug: 'articles',
          fields: [
            { type: 'text', name: 'name' },
            { type: 'text', name: 'name' }
          ]
        })
      ])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0]?.message).toContain('articles')
        expect(result.error[0]?.message).toContain('name')
      }
    })
  })

  describe('relation field relationTo validation', () => {
    it('accepts a relation field pointing to a valid collection slug', () => {
      const result = validateCollections([
        makeCollection({ slug: 'posts' }),
        makeCollection({
          slug: 'comments',
          fields: [
            { type: 'text', name: 'body' },
            { type: 'relation', name: 'post', relationTo: 'posts' }
          ]
        })
      ])
      expect(result.isOk()).toBe(true)
    })

    it('rejects a relation field pointing to a non-existent collection slug', () => {
      const result = validateCollections([
        makeCollection({
          slug: 'comments',
          fields: [
            { type: 'text', name: 'body' },
            { type: 'relation', name: 'post', relationTo: 'nonexistent' }
          ]
        })
      ])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0]?.code).toBe('INVALID_RELATION_TO')
        expect(result.error[0]?.message).toContain('nonexistent')
        expect(result.error[0]?.message).toContain('comments')
      }
    })

    it('accepts a self-referencing relation', () => {
      const result = validateCollections([
        makeCollection({
          slug: 'categories',
          fields: [
            { type: 'text', name: 'label' },
            { type: 'relation', name: 'parent', relationTo: 'categories' }
          ]
        })
      ])
      expect(result.isOk()).toBe(true)
    })

    it('rejects a relation field in a second collection pointing to a non-existent slug', () => {
      const result = validateCollections([
        makeCollection({ slug: 'posts' }),
        makeCollection({
          slug: 'comments',
          fields: [
            { type: 'relation', name: 'author', relationTo: 'users' }
          ]
        })
      ])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0]?.code).toBe('INVALID_RELATION_TO')
        expect(result.error[0]?.message).toContain('users')
      }
    })

    it('accepts multiple valid relation fields', () => {
      const result = validateCollections([
        makeCollection({ slug: 'users' }),
        makeCollection({ slug: 'posts' }),
        makeCollection({
          slug: 'comments',
          fields: [
            { type: 'text', name: 'body' },
            { type: 'relation', name: 'post', relationTo: 'posts' },
            { type: 'relation', name: 'author', relationTo: 'users' }
          ]
        })
      ])
      expect(result.isOk()).toBe(true)
    })
  })

  describe('Phase 3: multi-error reporting', () => {
    it('returns all errors at once when a config has multiple invalid slugs', () => {
      const result = validateCollections([
        makeCollection({ slug: 'Bad Slug' }),
        makeCollection({ slug: 'Also Bad!' })
      ])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(Array.isArray(result.error)).toBe(true)
        expect(result.error.length).toBeGreaterThanOrEqual(2)
      }
    })

    it('returns both a bad slug error AND a reserved field name error from one config', () => {
      const result = validateCollections([
        makeCollection({
          slug: 'Bad Slug',
          fields: [{ type: 'text', name: 'id' }]
        })
      ])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(Array.isArray(result.error)).toBe(true)
        const codes = result.error.map((e) => e.code)
        expect(codes).toContain('INVALID_COLLECTION_SLUG')
        expect(codes).toContain('RESERVED_FIELD_NAME')
      }
    })

    it('returns errors from multiple collections simultaneously', () => {
      const result = validateCollections([
        makeCollection({
          slug: 'posts',
          fields: [{ type: 'text', name: 'id' }]
        }),
        makeCollection({
          slug: 'pages',
          fields: [{ type: 'text', name: 'created_at' }]
        })
      ])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(Array.isArray(result.error)).toBe(true)
        expect(result.error.length).toBeGreaterThanOrEqual(2)
        const codes = result.error.map((e) => e.code)
        expect(codes.filter((c) => c === 'RESERVED_FIELD_NAME').length).toBeGreaterThanOrEqual(2)
      }
    })

    it('error for invalid slug includes collection slug context', () => {
      const result = validateCollections([
        makeCollection({ slug: 'Bad_Slug' })
      ])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        const slugError = result.error.find((e) => e.code === 'INVALID_COLLECTION_SLUG')
        expect(slugError).toBeDefined()
        expect(slugError?.message).toContain('Bad_Slug')
        expect(slugError?.message).toMatch(/start with a lowercase letter|lowercase/)
      }
    })

    it('error for reserved field name includes collection slug and field name', () => {
      const result = validateCollections([
        makeCollection({
          slug: 'articles',
          fields: [{ type: 'text', name: 'id' }]
        })
      ])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        const reservedError = result.error.find((e) => e.code === 'RESERVED_FIELD_NAME')
        expect(reservedError).toBeDefined()
        expect(reservedError?.message).toContain('articles')
        expect(reservedError?.message).toContain('id')
        expect(reservedError?.message).toMatch(/reserved|auto-generated/)
      }
    })

    it('error for duplicate field name includes collection slug and field name', () => {
      const result = validateCollections([
        makeCollection({
          slug: 'posts',
          fields: [
            { type: 'text', name: 'title' },
            { type: 'text', name: 'title' }
          ]
        })
      ])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        const dupError = result.error.find((e) => e.code === 'DUPLICATE_FIELD_NAME')
        expect(dupError).toBeDefined()
        expect(dupError?.message).toContain('posts')
        expect(dupError?.message).toContain('title')
        expect(dupError?.message).toMatch(/unique|duplicate/i)
      }
    })

    it('error for invalid relationTo includes collection slug, field name, and target slug', () => {
      const result = validateCollections([
        makeCollection({
          slug: 'comments',
          fields: [
            { type: 'relation', name: 'author', relationTo: 'users' }
          ]
        })
      ])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        const relError = result.error.find((e) => e.code === 'INVALID_RELATION_TO')
        expect(relError).toBeDefined()
        expect(relError?.message).toContain('comments')
        expect(relError?.message).toContain('author')
        expect(relError?.message).toContain('users')
        expect(relError?.message).toMatch(/no collection|does not exist|not found/i)
      }
    })

    it('error for invalid slugFrom includes collection slug, field name, and missing field name', () => {
      const result = validateCollections([
        makeCollection({
          slug: 'posts',
          fields: [
            { type: 'slug', name: 'slug', slugFrom: 'missing-field' }
          ]
        })
      ])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        const slugFromError = result.error.find((e) => e.code === 'INVALID_SLUG_FROM')
        expect(slugFromError).toBeDefined()
        expect(slugFromError?.message).toContain('posts')
        expect(slugFromError?.message).toContain('slug')
        expect(slugFromError?.message).toContain('missing-field')
        expect(slugFromError?.message).toMatch(/no field|does not exist|not found/i)
      }
    })

    it('collects duplicate slug errors AND field errors from same config', () => {
      const result = validateCollections([
        makeCollection({ slug: 'posts', fields: [{ type: 'text', name: 'id' }] }),
        makeCollection({ slug: 'posts', fields: [{ type: 'text', name: 'created_at' }] })
      ])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(Array.isArray(result.error)).toBe(true)
        expect(result.error.length).toBeGreaterThanOrEqual(1)
      }
    })
  })
})
