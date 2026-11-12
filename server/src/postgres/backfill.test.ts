/*
 * The cutover copy, on Mongo documents shaped as the driver returns them (real
 * ObjectIds from the `mongodb` dev dependency; scripts/legacyMongo.ts does the read).
 */
import { ObjectId } from 'mongodb'
import { UserApi } from '../datasources/user'
import { EntitlementApi } from '../datasources/entitlement'
import { createMigratedTestDb } from '../test-utils/pg'
import {
  backfill,
  expectedCounts,
  ingredientKey,
  verifyCounts
} from './backfill'
import { setDb } from './db'
import { toLegacyData, type LegacyDocuments } from './legacy'
import { onlyRow, readInt, readString, type SqlClient } from './sql'

jest.setTimeout(60000)

const HASH = '$2b$10$abcdefghijklmnopqrstuuJ7zRrQy8x0m7w9cA6Gm2xWQnUyzV1r2'

const documents = () => {
  const produce = { _id: new ObjectId(), name: 'Produce' }
  const dairy = { _id: new ObjectId(), name: 'Dairy' }
  const onion = {
    _id: new ObjectId(),
    name: 'Onion',
    quantity: 2,
    measure: 'unit',
    category: produce._id,
    ingredientId: 'onion'
  }
  const onionAgain = { ...onion, _id: new ObjectId(), name: 'Red onion' }
  const milk = {
    _id: new ObjectId(),
    name: 'Milk',
    quantity: 250,
    measure: 'ml',
    text: 'full cream',
    ingredientId: null,
    category: dairy._id
  }
  const soup = {
    _id: new ObjectId(),
    name: 'Soup',
    portions: 4,
    picture_url: 'soup.jpg',
    ingredients: [onion._id, milk._id, onionAgain._id],
    customisations: [{ kind: 'PortionsChange', from: 2, to: 4 }]
  }
  const toast = {
    _id: new ObjectId(),
    name: 'Toast',
    portions: 1,
    picture_url: 'toast.jpg',
    libraryId: 'toast',
    instructions: 'Toast it.',
    ingredients: [milk._id]
  }
  const user = {
    _id: new ObjectId(),
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    password: HASH,
    pro: true,
    savedRecipes: [toast._id, soup._id, toast._id],
    tier: 'MANAGER',
    stripeCustomerId: 'cus_1',
    stripeSubscriptionId: null,
    subscriptionStatus: 'active',
    active: true,
    storePlatform: 'GOOGLE',
    storeProductId: 'ingre_manager_monthly',
    storeId: 'tok-1',
    storeExpiresAt: new Date('2026-12-11T00:00:00Z'),
    entitlementSource: 'PADDLE',
    entitlementSubscriptionId: 'sub_1',
    entitlementProductId: 'pri_1',
    entitlementInterval: 'year',
    entitlementExpiresAt: new Date('2027-11-12T00:00:00Z'),
    entitlementUpdatedAt: new Date('2026-11-12T00:00:00Z'),
    paddleCustomerId: 'ctm_1'
  }
  const docs: LegacyDocuments = {
    categories: [produce, dairy],
    ingredients: [onion, milk, onionAgain],
    recipes: [soup, toast],
    users: [user],
    webhookevents: [
      { _id: 'paddle:evt_1', receivedAt: new Date('2026-11-12T00:00:00Z') }
    ]
  }
  return { docs, user, soup, toast }
}

const count = async (db: SqlClient, table: string) =>
  readInt(onlyRow(await db.query(`select count(*) as n from ${table}`)), 'n')

let test: Awaited<ReturnType<typeof createMigratedTestDb>>
beforeEach(async () => {
  test = await createMigratedTestDb()
})
afterEach(() => test.close())

describe('postgres backfill', () => {
  it('copies users, recipes, lines, billing and payment events', async () => {
    const { docs, user, toast } = documents()
    const data = toLegacyData(docs)
    const report = await backfill(test.db, data)
    expect(report.counts).toEqual({
      categories: 2,
      ingredients: 2,
      recipes: 2,
      recipe_ingredients: 4,
      users: 1,
      saved_recipes: 2,
      webhook_events: 1
    })
    expect(report.skipped).toEqual({ lines: 0, saved: 0 })

    // the API finds the user by their Mongo id, with everything the payments wrote
    setDb(test.db)
    const users = new UserApi()
    const found = await users.findOneUserById({ id: user._id.toHexString() })
    expect(found).toMatchObject({
      _id: user._id.toHexString(),
      email: 'ada@example.com',
      // bcrypt hash copied as-is, never the plain text
      passwordHash: HASH,
      firebaseUid: null,
      pro: true,
      tier: 'MANAGER',
      stripeCustomerId: 'cus_1',
      stripeSubscriptionId: null,
      subscriptionStatus: 'active',
      active: true,
      storePlatform: 'GOOGLE',
      storeId: 'tok-1',
      storeExpiresAt: new Date('2026-12-11T00:00:00Z'),
      entitlementSource: 'PADDLE',
      entitlementSubscriptionId: 'sub_1',
      entitlementInterval: 'year',
      entitlementUpdatedAt: new Date('2026-11-12T00:00:00Z'),
      paddleCustomerId: 'ctm_1',
      numSavedRecipes: 2
    })
    expect(found?.savedRecipes.map(({ name }) => name)).toEqual([
      'Toast',
      'Soup'
    ])
    expect(found?.savedRecipes[0]?._id).toBe(toast._id.toHexString())
    // each line keeps its own name and section
    expect(found?.savedRecipes[1]?.ingredients).toMatchObject([
      { name: 'Onion', quantity: 2, category: { name: 'Produce' } },
      { name: 'Milk', quantity: 250, measure: 'ml', ingredientId: null },
      { name: 'Red onion', ingredientId: 'onion' }
    ])
    expect(found?.savedRecipes[1]?.customisations).toEqual([
      { kind: 'PortionsChange', from: 2, to: 4 }
    ])
    // a payment event already taken is still skipped after the move
    expect(await new EntitlementApi().claim('paddle:evt_1')).toBe(false)
    setDb(null)

    const line = onlyRow(
      await test.db.query(
        `select ri.text from recipe_ingredients ri
         join recipes r on r.id = ri.recipe_id
         where r.name = 'Soup' and ri.position = 1`
      )
    )
    expect(readString(line, 'text')).toBe('full cream')
    const recipe = onlyRow(
      await test.db.query(
        'select created_at from recipes where public_id = $1',
        [toast._id.toHexString()]
      )
    )
    expect(recipe['created_at']).toEqual(toast._id.getTimestamp())
  })

  it('is idempotent and picks up changes on a re-run', async () => {
    const { docs, toast } = documents()
    await backfill(test.db, toLegacyData(docs))
    const renamed = {
      ...docs,
      recipes: docs.recipes.map((doc) =>
        doc === docs.recipes[1] ? { ...toast, name: 'Better toast' } : doc
      )
    }
    const data = toLegacyData(renamed)
    await backfill(test.db, data)
    expect(await count(test.db, 'users')).toBe(1)
    expect(await count(test.db, 'recipes')).toBe(2)
    expect(await count(test.db, 'recipe_ingredients')).toBe(4)
    expect(await count(test.db, 'saved_recipes')).toBe(2)
    expect(await count(test.db, 'webhook_events')).toBe(1)
    expect(await verifyCounts(test.db, data)).toEqual([])
    const names = await test.db.query('select name from recipes order by name')
    expect(names.map((n) => readString(n, 'name'))).toEqual([
      'Better toast',
      'Soup'
    ])
  })

  it('skips and reports references to documents that no longer exist', async () => {
    const { docs, soup, user } = documents()
    const data = toLegacyData({
      ...docs,
      recipes: [
        { ...soup, ingredients: [...soup.ingredients, new ObjectId()] },
        ...docs.recipes.slice(1)
      ],
      users: [{ ...user, savedRecipes: [...user.savedRecipes, new ObjectId()] }]
    })
    const report = await backfill(test.db, data)
    expect(report.skipped).toEqual({ lines: 1, saved: 1 })
    expect(await verifyCounts(test.db, data)).toEqual([])
  })

  it('verifyCounts names each table that does not match', async () => {
    expect(await verifyCounts(test.db, toLegacyData(documents().docs))).toEqual(
      [
        'categories: expected 2, found 0',
        'ingredients: expected 2, found 0',
        'recipes: expected 2, found 0',
        'recipe_ingredients: expected 4, found 0',
        'users: expected 1, found 0',
        'saved_recipes: expected 2, found 0',
        'webhook_events: expected 1, found 0'
      ]
    )
  })

  it('keeps an ingredient whose category is gone, or never had one', async () => {
    const data = toLegacyData({
      categories: [],
      ingredients: [
        {
          _id: new ObjectId(),
          name: 'Salt',
          quantity: 1,
          measure: 'pinch',
          category: new ObjectId()
        },
        { _id: new ObjectId(), name: 'Pepper' }
      ],
      recipes: [],
      users: [],
      webhookevents: []
    })
    await backfill(test.db, data)
    const rows = await test.db.query(
      'select category_id from ingredients order by id'
    )
    expect(rows).toEqual([{ category_id: null }, { category_id: null }])
  })

  it('shares one category row between categories with the same name', async () => {
    const data = toLegacyData({
      categories: [
        { _id: new ObjectId(), name: 'Produce' },
        { _id: new ObjectId(), name: 'Produce' }
      ],
      ingredients: [],
      recipes: [],
      users: [],
      webhookevents: []
    })
    await backfill(test.db, data)
    expect(await count(test.db, 'categories')).toBe(1)
    expect(await verifyCounts(test.db, data)).toEqual([])
  })
})

describe('toLegacyData with documents from before the defaults existed', () => {
  it('fills in missing fields, and maps a Firebase-only user without a hash', () => {
    const data = toLegacyData({
      categories: [],
      ingredients: [
        {
          _id: new ObjectId(),
          name: 'Rice',
          category: new ObjectId()
        }
      ],
      recipes: [
        {
          _id: new ObjectId(),
          name: 'Rice',
          picture_url: 'r.jpg'
        }
      ],
      users: [
        {
          _id: new ObjectId('65A1B2C3D4E5F60718293A4B'),
          firstName: 'Grace',
          email: 'grace@example.com',
          firebaseUid: 'uid-grace'
        }
      ],
      webhookevents: []
    })
    expect(data.recipes[0]).toMatchObject({
      portions: 2,
      customisations: [],
      ingredientMongoIds: [],
      libraryId: null,
      instructions: null
    })
    expect(data.users[0]).toMatchObject({
      mongoId: '65a1b2c3d4e5f60718293a4b',
      lastName: '',
      pro: false,
      passwordHash: null,
      firebaseUid: 'uid-grace',
      savedRecipeMongoIds: [],
      tier: null,
      active: false,
      storeExpiresAt: null,
      entitlementSource: null
    })
    expect(data.ingredients[0]).toMatchObject({
      quantity: 0,
      measure: 'unit',
      text: null,
      ingredientId: null
    })
  })

  it('refuses a document it cannot copy faithfully', () => {
    const empty = {
      categories: [],
      ingredients: [],
      recipes: [],
      webhookevents: []
    }
    expect(() =>
      toLegacyData({
        ...empty,
        users: [{ _id: 'not-an-object-id', firstName: 'A', email: 'a@b.c' }]
      })
    ).toThrow('not an ObjectId')
    expect(() =>
      toLegacyData({
        ...empty,
        users: [
          {
            _id: new ObjectId(),
            firstName: 'A',
            email: 'a@b.c',
            tier: 'PLATINUM'
          }
        ]
      })
    ).toThrow()
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
    expect(ingredientKey({ ingredientId: '', name: 'Salt' })).toBe('name:salt')
  })
})

describe('expectedCounts', () => {
  it('counts what a backfill would write', () => {
    expect(
      expectedCounts({
        categories: [],
        ingredients: [],
        recipes: [],
        users: [],
        webhookEvents: []
      })
    ).toEqual({
      categories: 0,
      ingredients: 0,
      recipes: 0,
      recipe_ingredients: 0,
      users: 0,
      saved_recipes: 0,
      webhook_events: 0
    })
  })
})
