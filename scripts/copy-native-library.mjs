/**
 * Copies the web catalogue into the native apps (#195).
 * One source: client/src/data. Never hand-edit the copies.
 */
import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const names = ['ingredients.json', 'recipes.json']
const destinations = ['ios/Ingre/Resources', 'android/app/src/main/assets']

for (const dest of destinations) {
  const dir = join(root, dest)
  mkdirSync(dir, { recursive: true })
  for (const name of names) {
    copyFileSync(join(root, 'client/src/data', name), join(dir, name))
  }
}

console.log('Copied ingredients.json and recipes.json into ios/ and android/.')
