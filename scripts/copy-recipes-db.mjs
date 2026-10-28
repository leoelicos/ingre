#!/usr/bin/env node
/**
 * Copies the generated catalogue/recipes.db into web, iOS, and Android asset locations.
 * Extends the pattern from scripts/copy-native-library.mjs.
 */
import { copyFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'catalogue/recipes.db')

if (!existsSync(src)) {
  console.error('catalogue/recipes.db not found. Run: node scripts/build-recipes-db.mjs')
  process.exit(1)
}

const destinations = [
  'client/public',
  'ios/Ingre/Resources',
  'android/app/src/main/assets'
]

for (const dest of destinations) {
  const dir = join(root, dest)
  mkdirSync(dir, { recursive: true })
  copyFileSync(src, join(dir, 'recipes.db'))
  console.log(`Copied recipes.db → ${dest}/`)
}
