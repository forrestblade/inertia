// Build-time script: copies km-deferred.css to dist/client/admin.css.
// Called by: node dist/admin/build-css.js (after tsc)

import { copyFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const thisDir = dirname(fileURLToPath(import.meta.url))
const srcFile = resolve(thisDir, 'styles', 'km-deferred.css')
const outDir = resolve(thisDir, '..', 'client')
mkdirSync(outDir, { recursive: true })

const outPath = resolve(outDir, 'admin.css')
copyFileSync(srcFile, outPath)
console.log('  admin.css copied from km-deferred.css')
