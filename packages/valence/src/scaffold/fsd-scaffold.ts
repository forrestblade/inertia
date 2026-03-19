import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import type { CollectionConfig } from '@valencets/cms'
import { generateEntityInterface } from '../codegen/type-generator.js'
import { generateApiClient } from '../codegen/api-client-generator.js'
import { generateBaseClient } from '../codegen/base-client-generator.js'
import { generateHomePage } from './home-page.js'
import { generateAppStyles } from './app-styles.js'

interface ScaffoldOptions {
  readonly projectDir: string
  readonly collections: readonly CollectionConfig[]
}

export async function scaffoldFsd (options: ScaffoldOptions): Promise<void> {
  const { projectDir, collections } = options
  const srcDir = join(projectDir, 'src')

  // Create FSD directory structure
  await mkdir(join(srcDir, 'app'), { recursive: true })
  await mkdir(join(srcDir, 'pages', 'home', 'ui'), { recursive: true })
  await mkdir(join(srcDir, 'features'), { recursive: true })
  await mkdir(join(srcDir, 'shared', 'api'), { recursive: true })
  await mkdir(join(srcDir, 'shared', 'ui'), { recursive: true })

  // Create entity slices for non-auth collections
  const entityCollections = collections.filter(c => !c.auth)
  for (const col of entityCollections) {
    await mkdir(join(srcDir, 'entities', col.slug, 'api'), { recursive: true })
    await mkdir(join(srcDir, 'entities', col.slug, 'model'), { recursive: true })

    // Generate types
    const typesContent = generateEntityInterface(col)
    await writeFile(join(srcDir, 'entities', col.slug, 'model', 'types.ts'), typesContent)

    // Generate API client
    const clientContent = generateApiClient(col)
    await writeFile(join(srcDir, 'entities', col.slug, 'api', 'client.ts'), clientContent)
  }

  // Generate shared base client
  const baseClientContent = generateBaseClient()
  await writeFile(join(srcDir, 'shared', 'api', 'base-client.ts'), baseClientContent)

  // Generate app styles
  const stylesContent = generateAppStyles()
  await writeFile(join(srcDir, 'app', 'styles.css'), stylesContent)

  // Generate home page
  const homeContent = generateHomePage()
  await writeFile(join(srcDir, 'pages', 'home', 'ui', 'index.html'), homeContent)
}
