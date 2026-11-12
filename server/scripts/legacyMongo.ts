/**
 * The one-off cutover copy's Mongo side (docs/POSTGRES_MIGRATION.md): reads every
 * collection the backfill needs, read-only (`find` only, oldest first, so a re-run sees
 * the same order). The only code left that talks to Mongo; the API does not import it,
 * and `mongodb` is a dev dependency, so production ships no Mongo driver.
 */
import { MongoClient } from 'mongodb'
import { toLegacyData, type LegacyData } from '../src/postgres/legacy'

const COLLECTIONS = [
  'categories',
  'ingredients',
  'recipes',
  'users',
  'webhookevents'
] as const

export const readLegacyMongo = async (uri: string): Promise<LegacyData> => {
  const client = new MongoClient(uri, { readPreference: 'secondaryPreferred' })
  try {
    await client.connect()
    const db = client.db()
    const [categories, ingredients, recipes, users, webhookevents] =
      await Promise.all(
        COLLECTIONS.map((name) =>
          db.collection(name).find().sort({ _id: 1 }).toArray()
        )
      )
    return toLegacyData({
      categories: categories ?? [],
      ingredients: ingredients ?? [],
      recipes: recipes ?? [],
      users: users ?? [],
      webhookevents: webhookevents ?? []
    })
  } finally {
    await client.close()
  }
}
