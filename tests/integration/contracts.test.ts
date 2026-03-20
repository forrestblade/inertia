import { describe, it, expect } from 'vitest'
import { createPool, closePool } from '@valencets/db'
import type { DbPool } from '@valencets/db'
import {
  collection,
  field,
  createCollectionRegistry,
  generateCreateTableSql,
  generateZodSchema,
  createQueryBuilder,
  buildCms,
  hashPassword,
  verifyPassword
} from '@valencets/cms'

// ── 1. db exports ────────────────────────────────────────────────────────────

describe('db package exports', () => {
  it('createPool returns a DbPool with a sql property', () => {
    const pool = createPool({
      host: 'localhost',
      port: 5432,
      database: 'postgres',
      max: 1
    })

    expect(pool).toBeDefined()
    expect(typeof pool.sql).toBe('function')

    // closePool accepts a DbPool and returns a ResultAsync
    const closeResult = closePool(pool)
    expect(typeof closeResult.then).toBe('function')
  })
})

// ── 2. cms uses db correctly ─────────────────────────────────────────────────

describe('cms ↔ db boundary', () => {
  it('createQueryBuilder accepts a DbPool and returns a factory with .query()', () => {
    const pool: DbPool = { sql: (() => {}) as unknown as DbPool['sql'] }
    const registry = createCollectionRegistry()
    const qb = createQueryBuilder(pool, registry)

    expect(qb).toBeDefined()
    expect(typeof qb.query).toBe('function')
  })
})

// ── 3. cms schema exports ────────────────────────────────────────────────────

describe('cms schema exports', () => {
  it('collection() returns a CollectionConfig with required shape', () => {
    const col = collection({
      slug: 'articles',
      fields: [field.text({ name: 'title', required: true })]
    })

    expect(col.slug).toBe('articles')
    expect(Array.isArray(col.fields)).toBe(true)
    expect(typeof col.timestamps).toBe('boolean')
  })

  it('field.text() returns a FieldConfig with type "text"', () => {
    const f = field.text({ name: 'title', required: true })
    expect(f.type).toBe('text')
    expect(f.name).toBe('title')
  })

  it('field.number() returns a FieldConfig with type "number"', () => {
    const f = field.number({ name: 'price' })
    expect(f.type).toBe('number')
  })

  it('field.boolean() returns a FieldConfig with type "boolean"', () => {
    const f = field.boolean({ name: 'published' })
    expect(f.type).toBe('boolean')
  })

  it('field.select() returns a FieldConfig with type "select"', () => {
    const f = field.select({
      name: 'status',
      options: [{ label: 'Draft', value: 'draft' }]
    })
    expect(f.type).toBe('select')
  })
})

// ── 4. buildCms returns Result<CmsInstance> ──────────────────────────────────

describe('buildCms contract', () => {
  it('returns Ok with a CmsInstance containing api, collections, restRoutes, adminRoutes', () => {
    const pool: DbPool = { sql: (() => {}) as unknown as DbPool['sql'] }
    const result = buildCms({
      db: pool,
      collections: [
        collection({
          slug: 'posts',
          fields: [field.text({ name: 'title', required: true })]
        })
      ]
    })

    expect(result.isOk()).toBe(true)
    const cms = result._unsafeUnwrap()
    expect(cms.api).toBeDefined()
    expect(cms.collections).toBeDefined()
    expect(cms.restRoutes instanceof Map).toBe(true)
    expect(cms.adminRoutes instanceof Map).toBe(true)
  })
})

// ── 5. Schema stability: generateCreateTableSql snapshot ────────────────────

describe('generateCreateTableSql stability', () => {
  it('produces deterministic SQL for a standard collection', () => {
    const col = collection({
      slug: 'posts',
      fields: [
        field.text({ name: 'title', required: true }),
        field.boolean({ name: 'published' })
      ]
    })

    const sql = generateCreateTableSql(col)

    expect(sql).toContain('CREATE TABLE IF NOT EXISTS "posts"')
    expect(sql).toContain('"id" UUID PRIMARY KEY DEFAULT gen_random_uuid()')
    expect(sql).toContain('"title" TEXT NOT NULL')
    expect(sql).toContain('"published" BOOLEAN')
    expect(sql).toContain('"created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()')
    expect(sql).toContain('"updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()')
    expect(sql).toContain('"deleted_at" TIMESTAMPTZ')
  })
})

// ── 6. Zod schema stability ──────────────────────────────────────────────────

describe('generateZodSchema stability', () => {
  it('validates a valid document against the generated schema', () => {
    const fields = [
      field.text({ name: 'title', required: true }),
      field.number({ name: 'count' }),
      field.boolean({ name: 'active' })
    ]
    const schema = generateZodSchema(fields)
    const result = schema.safeParse({ title: 'Hello', count: 5, active: true })
    expect(result.success).toBe(true)
  })

  it('rejects a document missing a required field', () => {
    const fields = [field.text({ name: 'title', required: true })]
    const schema = generateZodSchema(fields)
    const result = schema.safeParse({})
    expect(result.success).toBe(false)
  })
})

// ── 7. Auth contract ─────────────────────────────────────────────────────────

describe('auth contract', () => {
  it('hashPassword returns ResultAsync resolving to Ok<string>', async () => {
    const result = await hashPassword('secret123')
    expect(result.isOk()).toBe(true)
    expect(typeof result._unsafeUnwrap()).toBe('string')
    expect(result._unsafeUnwrap().length).toBeGreaterThan(0)
  })

  it('verifyPassword returns ResultAsync resolving to Ok<boolean>', async () => {
    const hashResult = await hashPassword('secret123')
    expect(hashResult.isOk()).toBe(true)
    const hash = hashResult._unsafeUnwrap()

    const verifyResult = await verifyPassword('secret123', hash)
    expect(verifyResult.isOk()).toBe(true)
    expect(verifyResult._unsafeUnwrap()).toBe(true)
  })

  it('verifyPassword returns Ok<false> for wrong password', async () => {
    const hashResult = await hashPassword('secret123')
    const hash = hashResult._unsafeUnwrap()

    const verifyResult = await verifyPassword('wrong', hash)
    expect(verifyResult.isOk()).toBe(true)
    expect(verifyResult._unsafeUnwrap()).toBe(false)
  })
})

// ── 8. Registry contract ─────────────────────────────────────────────────────

describe('createCollectionRegistry contract', () => {
  it('register() returns Ok<CollectionConfig>', () => {
    const registry = createCollectionRegistry()
    const col = collection({
      slug: 'items',
      fields: [field.text({ name: 'name' })]
    })
    const result = registry.register(col)
    expect(result.isOk()).toBe(true)
    expect(result._unsafeUnwrap().slug).toBe('items')
  })

  it('register() returns Err on duplicate slug', () => {
    const registry = createCollectionRegistry()
    const col = collection({ slug: 'items', fields: [] })
    registry.register(col)
    const result = registry.register(col)
    expect(result.isErr()).toBe(true)
  })

  it('get() returns Ok<CollectionConfig> for a registered slug', () => {
    const registry = createCollectionRegistry()
    const col = collection({ slug: 'items', fields: [] })
    registry.register(col)
    const result = registry.get('items')
    expect(result.isOk()).toBe(true)
    expect(result._unsafeUnwrap().slug).toBe('items')
  })

  it('get() returns Err for an unknown slug', () => {
    const registry = createCollectionRegistry()
    const result = registry.get('does-not-exist')
    expect(result.isErr()).toBe(true)
  })

  it('getAll() returns an array of registered collections', () => {
    const registry = createCollectionRegistry()
    registry.register(collection({ slug: 'a', fields: [] }))
    registry.register(collection({ slug: 'b', fields: [] }))
    const all = registry.getAll()
    expect(Array.isArray(all)).toBe(true)
    expect(all.length).toBe(2)
  })
})
