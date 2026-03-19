import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { writeFile } from 'node:fs/promises'
import { run } from '../cli.js'

vi.mock('node:fs/promises', () => ({
  writeFile: vi.fn(async () => {}),
  mkdir: vi.fn(async () => undefined)
}))

vi.mock('node:child_process', () => ({
  execSync: vi.fn(() => Buffer.from(''))
}))

const mockedWriteFile = vi.mocked(writeFile)

function getWrittenFile (filename: string): string {
  const call = mockedWriteFile.mock.calls.find(c => String(c[0]).endsWith(filename))
  if (!call) throw new Error(`File ${filename} was not written`)
  return String(call[1])
}

describe('init template collections', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('valence.config.ts includes categories collection', async () => {
    await run(['init', 'test-app', '-y'])
    const config = getWrittenFile('valence.config.ts')
    expect(config).toContain("slug: 'categories'")
    expect(config).toContain('field.select')
    expect(config).toContain("'blue'")
  })

  it('valence.config.ts includes pages collection with richtext', async () => {
    await run(['init', 'test-app', '-y'])
    const config = getWrittenFile('valence.config.ts')
    expect(config).toContain("slug: 'pages'")
    expect(config).toContain('field.richtext')
    expect(config).toContain("'content'")
  })

  it('valence.config.ts posts collection uses richtext for body', async () => {
    await run(['init', 'test-app', '-y'])
    const config = getWrittenFile('valence.config.ts')
    expect(config).toContain("field.richtext({ name: 'body'")
  })

  it('valence.config.ts posts collection has category relation', async () => {
    await run(['init', 'test-app', '-y'])
    const config = getWrittenFile('valence.config.ts')
    expect(config).toContain("field.relation({ name: 'category', relationTo: 'categories'")
  })

  it('valence.config.ts pages collection has SEO group', async () => {
    await run(['init', 'test-app', '-y'])
    const config = getWrittenFile('valence.config.ts')
    expect(config).toContain("name: 'seo'")
    expect(config).toContain("'metaTitle'")
    expect(config).toContain("'metaDescription'")
  })

  it('valence.config.ts pages collection has status select', async () => {
    await run(['init', 'test-app', '-y'])
    const config = getWrittenFile('valence.config.ts')
    expect(config).toContain("'draft'")
    expect(config).toContain("'published'")
    expect(config).toContain("'archived'")
  })
})

describe('init migration SQL', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('migration includes all 4 tables', async () => {
    await run(['init', 'test-app', '-y'])
    const sql = getWrittenFile('001-init.sql')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS "categories"')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS "posts"')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS "pages"')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS "users"')
  })

  it('categories table appears before posts (FK dependency)', async () => {
    await run(['init', 'test-app', '-y'])
    const sql = getWrittenFile('001-init.sql')
    const catIdx = sql.indexOf('"categories"')
    const postsIdx = sql.indexOf('"posts"')
    expect(catIdx).toBeLessThan(postsIdx)
  })

  it('posts table has category UUID column', async () => {
    await run(['init', 'test-app', '-y'])
    const sql = getWrittenFile('001-init.sql')
    expect(sql).toContain('"category" UUID')
  })

  it('pages table has content, status, and publishedAt columns', async () => {
    await run(['init', 'test-app', '-y'])
    const sql = getWrittenFile('001-init.sql')
    expect(sql).toContain('"content" TEXT')
    expect(sql).toContain('"status" TEXT')
    expect(sql).toContain('"publishedAt" TIMESTAMPTZ')
  })

  it('pages table has seo JSONB column', async () => {
    await run(['init', 'test-app', '-y'])
    const sql = getWrittenFile('001-init.sql')
    expect(sql).toContain('"seo" JSONB')
  })
})
