import type { ClientIngredient, ClientRecipe } from '../types/client'

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
