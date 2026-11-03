import mongoose, { Types } from 'mongoose'
import { Category } from '../models/Category'
import { Ingredient } from '../models/Ingredient'
import { Recipe } from '../models/Recipe'
import { User } from '../models/User'
import { createMigratedTestDb } from '../test-utils/pg'
import {
  backfill,
  expectedCounts,
  ingredientKey,
  verifyCounts
} from './backfill'
import { readLegacy, type LegacyData } from './legacy'
import { onlyRow, readInt, readString } from './sql'

jest.setTimeout(60000)

const seedMongo = async () => {
  const produce = await Category.create({ name: 'Produce' })
  const dairy = await Category.create({ name: 'Dairy' })
  const onion = await Ingredient.create({
    name: 'Onion',
    quantity: 2,
    measure: 'unit',
    category: produce._id,
    ingredientId: 'onion'
  })
  const onionAgain = await Ingredient.create({
    name: 'Onion',
    quantity: 1,
    measure: 'unit',
    category: produce._id,
    ingredientId: 'onion'
  })
  const milk = await Ingredient.create({
    name: 'Milk',
    quantity: 250,
    measure: 'ml',
    text: 'full cream',
    category: dairy._id
  })
  const soup = await Recipe.create({
    name: 'Soup',
    portions: 4,
    picture_url: 'soup.jpg',
    ingredients: [onion._id, milk._id, onionAgain._id],
    customisations: [{ kind: 'PortionsChange', from: 2, to: 4 }]
  })
  const toast = await Recipe.create({
    name: 'Toast',
    portions: 1,
    picture_url: 'toast.jpg',
    libraryId: 'toast',
    instructions: 'Toast it.',
    ingredients: [milk._id]
  })
  const user = await User.create({
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    password: 'password123',
    pro: true,
    savedRecipes: [toast._id, soup._id, toast._id]
  })
  return { user, soup, toast }
}

const count = async (
  db: Awaited<ReturnType<typeof createMigratedTestDb>>['db'],
  table: string
) => readInt(onlyRow(await db.query(`select count(*) as n from ${table}`)), 'n')

describe('postgres backfill', () => {
  beforeEach(async () => {
    mongoose.set('strictQuery', false)
    await mongoose.connect(`${process.env['MONGO_TEST_URI']}test_ingre_pg`)
  })
  afterEach(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.disconnect()
  })

  it('reads Mongo without changing it', async () => {
    await seedMongo()
    const before = await Recipe.countDocuments()
    const data = await readLegacy()
    expect(data.categories.map(({ name }) => name).sort()).toEqual([
      'Dairy',
      'Produce'
    ])
    expect(data.recipes).toHaveLength(2)
    expect(data.users[0]?.savedRecipeMongoIds).toHaveLength(3)
    expect(await Recipe.countDocuments()).toBe(before)
  })

  it('copies users, recipes and lines into Postgres', async () => {
    const { user } = await seedMongo()
    const { db, close } = await createMigratedTestDb()
    const data = await readLegacy()
    const report = await backfill(db, data)

    expect(report.counts).toEqual({
      categories: 2,
      ingredients: 2,
      recipes: 2,
      recipe_ingredients: 4,
      users: 1,
      saved_recipes: 2
    })
    expect(report.skipped).toEqual({ lines: 0, saved: 0 })

    const row = onlyRow(
      await db.query('select first_name, email, password_hash, pro from users')
    )
    expect(readString(row, 'email')).toBe('ada@example.com')
    // bcrypt hash copied as-is, never the plain text
    expect(readString(row, 'password_hash')).toBe(user.password)
    expect(row['pro']).toBe(true)

    const lines = await db.query(
      `select i.key, ri.quantity::text as quantity, ri.measure, ri.text
       from recipe_ingredients ri
       join ingredients i on i.id = ri.ingredient_id
       join recipes r on r.id = ri.recipe_id
       where r.name = 'Soup' order by ri.position`
    )
    expect(lines.map((line) => readString(line, 'key'))).toEqual([
      'onion',
      'name:milk',
      'onion'
    ])
    expect(lines.map((line) => readString(line, 'quantity'))).toEqual([
      '2',
      '250',
      '1'
    ])
    expect(lines[1]?.['text']).toBe('full cream')

    const saved = await db.query(
      `select r.name from saved_recipes s join recipes r on r.id = s.recipe_id
       order by s.position`
    )
    expect(saved.map((s) => readString(s, 'name'))).toEqual(['Toast', 'Soup'])

    const recipe = onlyRow(
      await db.query(
        `select customisations::text as c, created_at from recipes
         where name = 'Soup'`
      )
    )
    expect(JSON.parse(readString(recipe, 'c'))).toEqual([
      { kind: 'PortionsChange', from: 2, to: 4 }
    ])
    expect(recipe['created_at']).toBeInstanceOf(Date)
    await close()
  })

  it('is idempotent: running twice leaves the same rows', async () => {
    await seedMongo()
    const { db, close } = await createMigratedTestDb()
    const data = await readLegacy()
    await backfill(db, data)
    await backfill(db, data)
    expect(await count(db, 'users')).toBe(1)
    expect(await count(db, 'recipes')).toBe(2)
    expect(await count(db, 'recipe_ingredients')).toBe(4)
    expect(await count(db, 'saved_recipes')).toBe(2)
    expect(await verifyCounts(db, data)).toEqual([])
    await close()
  })

  it('picks up a changed recipe on a re-run', async () => {
    const { toast } = await seedMongo()
    const { db, close } = await createMigratedTestDb()
    await backfill(db, await readLegacy())
    await Recipe.findByIdAndUpdate(toast._id, { name: 'Better toast' })
    await backfill(db, await readLegacy())
    const names = await db.query('select name from recipes order by name')
    expect(names.map((n) => readString(n, 'name'))).toEqual([
      'Better toast',
      'Soup'
    ])
    await close()
  })

  it('skips and reports references to documents that no longer exist', async () => {
    const { soup } = await seedMongo()
    await Recipe.findByIdAndUpdate(soup._id, {
      $push: { ingredients: new Types.ObjectId() }
    })
    await User.updateOne({}, { $push: { savedRecipes: new Types.ObjectId() } })
    const { db, close } = await createMigratedTestDb()
    const data = await readLegacy()
    const report = await backfill(db, data)
    expect(report.skipped).toEqual({ lines: 1, saved: 1 })
    expect(await verifyCounts(db, data)).toEqual([])
    await close()
  })

  it('verifyCounts names each table that does not match', async () => {
    await seedMongo()
    const { db, close } = await createMigratedTestDb()
    const data = await readLegacy()
    expect(await verifyCounts(db, data)).toEqual([
      'categories: expected 2, found 0',
      'ingredients: expected 2, found 0',
      'recipes: expected 2, found 0',
      'recipe_ingredients: expected 4, found 0',
      'users: expected 1, found 0',
      'saved_recipes: expected 2, found 0'
    ])
    await close()
  })

  it('keeps an ingredient whose category document is gone', async () => {
    const gone = await Category.create({ name: 'Gone' })
    await Ingredient.create({
      name: 'Salt',
      quantity: 1,
      measure: 'pinch',
      category: gone._id
    })
    await Category.deleteMany()
    const { db, close } = await createMigratedTestDb()
    const data = await readLegacy()
    await backfill(db, data)
    const rows = await db.query('select category_id from ingredients')
    expect(rows[0]?.['category_id']).toBeNull()
    await close()
  })

  it('shares one category row between categories with the same name', async () => {
    await Category.create({ name: 'Produce' })
    await Category.create({ name: 'Produce' })
    const { db, close } = await createMigratedTestDb()
    const data = await readLegacy()
    await backfill(db, data)
    expect(await count(db, 'categories')).toBe(1)
    expect(await verifyCounts(db, data)).toEqual([])
    await close()
  })
})

describe('readLegacy with documents from before the defaults existed', () => {
  beforeEach(async () => {
    await mongoose.connect(`${process.env['MONGO_TEST_URI']}test_ingre_pg_old`)
  })
  afterEach(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.disconnect()
  })

  it('fills in customisations, pro and optional fields', async () => {
    const category = new Types.ObjectId()
    const line = new Types.ObjectId()
    await Category.collection.insertOne({ _id: category, name: 'Pantry' })
    await Ingredient.collection.insertOne({
      _id: line,
      name: 'Rice',
      quantity: 1,
      measure: 'cup',
      category
    })
    await Recipe.collection.insertOne({
      name: 'Rice',
      portions: 2,
      picture_url: 'r.jpg',
      ingredients: [line]
    })
    await User.collection.insertOne({
      firstName: 'Old',
      lastName: 'Timer',
      email: 'old@example.com',
      password: 'hash',
      savedRecipes: []
    })
    const data = await readLegacy()
    expect(data.recipes[0]).toMatchObject({
      customisations: [],
      libraryId: null,
      instructions: null
    })
    expect(data.users[0]?.pro).toBe(false)
    expect(data.ingredients[0]).toMatchObject({
      text: null,
      ingredientId: null
    })
  })
})

describe('ingredientKey', () => {
  it('prefers the catalogue id, else the lower-cased name', () => {
    expect(ingredientKey({ ingredientId: 'onion', name: 'Onion' })).toBe(
      'onion'
    )
    expect(ingredientKey({ ingredientId: null, name: ' Plain Flour ' })).toBe(
      'name:plain flour'
    )
  })
})

describe('expectedCounts', () => {
  it('counts what a backfill would write', () => {
    const empty: LegacyData = {
      categories: [],
      ingredients: [],
      recipes: [],
      users: []
    }
    expect(expectedCounts(empty)).toEqual({
      categories: 0,
      ingredients: 0,
      recipes: 0,
      recipe_ingredients: 0,
      users: 0,
      saved_recipes: 0
    })
  })
})
