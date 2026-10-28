#!/usr/bin/env node
/**
 * Builds catalogue/recipes.db from client/src/data/*.json
 * Uses sql.js (pure WASM/JS) so no native sqlite3 is required.
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import initSqlJs from '../node_modules/sql.js/dist/sql-wasm.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const schema = readFileSync(join(root, 'catalogue/schema.sql'), 'utf8')
const ingredientsData = JSON.parse(readFileSync(join(root, 'client/src/data/ingredients.json'), 'utf8'))
const recipesData = JSON.parse(readFileSync(join(root, 'client/src/data/recipes.json'), 'utf8'))

const SQL = await initSqlJs({
  locateFile: file => join(root, 'node_modules/sql.js/dist', file)
})
const db = new SQL.Database()
db.run(schema)

const ingredients = ingredientsData.ingredients || []
for (const ing of ingredients) {
  db.run(
    `INSERT OR REPLACE INTO ingredients (id, name, category, pantry, approx_grams, allergens) VALUES (?, ?, ?, ?, ?, ?)`,
    [ing.id, ing.name, ing.category, ing.pantry ?? null, ing.approxGrams ?? null, JSON.stringify(ing.allergens || [])]
  )
  if (ing.measureGrams && typeof ing.measureGrams === 'object') {
    for (const [measure, grams] of Object.entries(ing.measureGrams)) {
      db.run(
        `INSERT OR REPLACE INTO ingredient_measures (ingredient_id, measure, grams) VALUES (?, ?, ?)`,
        [ing.id, measure, grams]
      )
    }
  }
}

const recipes = recipesData.recipes || []
for (const rec of recipes) {
  db.run(
    `INSERT OR REPLACE INTO recipes (id, name, portions, method) VALUES (?, ?, ?, ?)`,
    [rec.id, rec.name, rec.portions ?? 1, JSON.stringify(rec.method || [])]
  )
  for (const line of rec.ingredients || []) {
    db.run(
      `INSERT OR REPLACE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, measure) VALUES (?, ?, ?, ?)`,
      [rec.id, line.ingredientId, line.quantity, line.measure]
    )
  }
}

db.run(`INSERT OR REPLACE INTO meta (key, value) VALUES ('version', '1')`)
db.run(`INSERT OR REPLACE INTO meta (key, value) VALUES ('generated_at', ?)`, [new Date().toISOString()])

const outDir = join(root, 'catalogue')
mkdirSync(outDir, { recursive: true })
const data = db.export()
const dbPath = join(outDir, 'recipes.db')
writeFileSync(dbPath, Buffer.from(data))
db.close()

console.log(`Built ${dbPath} (${ingredients.length} ingredients, ${recipes.length} recipes)`)
