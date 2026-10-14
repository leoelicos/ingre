import type { LibraryIngredient } from '../types/library'
import type { ClientIngredient, ClientRecipe } from '../types/client'
import type { Recipe as ServerRecipe } from '../lib/apollo/graphQL/typedefs'

export function ingredient(
  overrides: Partial<ClientIngredient> = {}
): ClientIngredient {
  return {
    _id: 'ing1',
    name: 'Tomato',
    quantity: 1,
    measure: 'cup',
    category: 'produce',
    ...overrides
  }
}

export function recipe(overrides: Partial<ClientRecipe> = {}): ClientRecipe {
  return {
    _id: 'id1',
    name: 'Pasta',
    portions: 2,
    picture_url: 'http://pic.example/pasta.jpg',
    instructions: 'Boil',
    libraryId: 'ed1',
    ingredients: [ingredient()],
    tags: [],
    ...overrides
  }
}

/** Returns a shallow copy without the given (optional) keys. */
export function omit<T extends object, K extends keyof T>(
  value: T,
  ...keys: K[]
): Omit<T, K> {
  const copy = { ...value }
  for (const key of keys) delete copy[key]
  return copy
}

/** A server-shaped recipe (category objects, nullable fields) matching `recipe()`. */
export function serverRecipe(
  overrides: Partial<ServerRecipe> = {}
): ServerRecipe {
  return {
    _id: 'id1',
    name: 'Pasta',
    portions: 2,
    picture_url: 'http://pic.example/pasta.jpg',
    instructions: 'Boil',
    libraryId: 'ed1',
    ingredients: [
      {
        _id: 'ing1',
        name: 'Tomato',
        quantity: 1,
        measure: 'cup',
        category: { _id: 'cat1', name: 'produce' }
      }
    ],
    ...overrides
  }
}

/** A valid catalogue item for library/shopping tests. */
export function libIngredient(
  overrides: Partial<LibraryIngredient> = {}
): LibraryIngredient {
  return {
    id: 'onion',
    name: 'brown onion',
    category: 'fruit & veg',
    sold: [{ type: 'each', size: { amount: 1, unit: 'count' } }],
    pantry: 'Cupboard',
    ...overrides
  }
}
