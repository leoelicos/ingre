import type { LibraryIngredient, LibraryRecipe } from '../types/library'
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
    allergens: [],
    ...overrides
  }
}

/** A valid library recipe for library/allergen tests. */
export function libRecipe(overrides: Partial<LibraryRecipe>): LibraryRecipe {
  return {
    id: 'r',
    name: 'Recipe',
    portions: 1,
    ingredients: [],
    method: [],
    ...overrides
  }
}
