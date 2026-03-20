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
        expect(result.error.code).toBe('INVALID_COLLECTION_SLUG')
        expect(result.error.message).toContain('Posts')
      }
    })

    it('rejects a slug with spaces', () => {
      const result = validateCollections([makeCollection({ slug: 'blog posts' })])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.code).toBe('INVALID_COLLECTION_SLUG')
      }
    })

    it('rejects a slug with special characters', () => {
      const result = validateCollections([makeCollection({ slug: 'blog_posts' })])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.code).toBe('INVALID_COLLECTION_SLUG')
      }
    })

    it('rejects a slug starting with a number', () => {
      const result = validateCollections([makeCollection({ slug: '1posts' })])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.code).toBe('INVALID_COLLECTION_SLUG')
      }
    })

    it('rejects a slug starting with a hyphen', () => {
      const result = validateCollections([makeCollection({ slug: '-posts' })])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.code).toBe('INVALID_COLLECTION_SLUG')
      }
    })

    it('rejects an empty slug', () => {
      const result = validateCollections([makeCollection({ slug: '' })])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.code).toBe('INVALID_COLLECTION_SLUG')
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
        expect(result.error.code).toBe('DUPLICATE_COLLECTION_SLUG')
        expect(result.error.message).toContain('posts')
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
        expect(result.error.code).toBe('INVALID_SLUG_FROM')
        expect(result.error.message).toContain('nonexistent')
        expect(result.error.message).toContain('posts')
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
        expect(result.error.code).toBe('INVALID_SLUG_FROM')
        expect(result.error.message).toContain('pages')
      }
    })
  })

  describe('integration with defineConfig', () => {
    it('returns Ok for empty collections array', () => {
      const result = validateCollections([])
      expect(result.isOk()).toBe(true)
    })

    it('checks format before duplicates', () => {
      // Two invalid slugs — should fail with format error (checked first)
      const result = validateCollections([
        makeCollection({ slug: 'Bad Slug' }),
        makeCollection({ slug: 'Bad Slug' })
      ])
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.code).toBe('INVALID_COLLECTION_SLUG')
      }
    })
  })
})
